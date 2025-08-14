import * as XLSX from "xlsx";

// Utility to process Excel
export function processExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    // Assume first sheet
    const sheetName = workbook.SheetNames[0];
    let worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    // Delete columns A (0), E (4), G (6)
    worksheet = worksheet.map(row => row.filter((_, idx) => ![0, 4, 6].includes(idx)));

    // Remove rows where first column equals "RTS Troy CSC"
    worksheet = worksheet.filter(row => row[0] !== "RTS Troy CSC");

    // Add new column "Bin number" at index 1
    worksheet[0].splice(1, 0, "Bin number");
    for (let i = 1; i < worksheet.length; i++) {
      worksheet[i].splice(1, 0, ""); // empty value for now
    }

    // Sort by column A (after modifications)
    worksheet = [worksheet[0], ...worksheet.slice(1).sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    })];

    callback(worksheet);
  };
  reader.readAsArrayBuffer(file);
}

// Export Excel
export function exportExcel(data, filename) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Processed");
  XLSX.writeFile(wb, filename);
}
