import React, { useState } from "react";
import { processExcel, exportExcel } from "../utils/excelUtils";

export default function FileUploader() {
  const [tableData, setTableData] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processExcel(file, setTableData);
  };

  const handleDownload = () => {
    if (tableData.length) exportExcel(tableData, "processed.xlsx");
  };

  return (
    <div className="p-4 border rounded-lg">
      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
      {tableData.length > 0 && (
        <>
          <table className="mt-4 border-collapse border border-gray-400">
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-gray-300 p-1">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4 p-2 bg-blue-500 text-white" onClick={handleDownload}>
            Download Excel
          </button>
          <button className="mt-4 ml-2 p-2 bg-green-500 text-white" onClick={() => window.print()}>
            Print
          </button>
        </>
      )}
    </div>
  );
}
