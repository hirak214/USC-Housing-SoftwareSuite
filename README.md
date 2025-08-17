# Troy CSC Auto

A fully client-side React web application for automated Excel file processing. Built with Vite, React, TailwindCSS, and SheetJS.

## Features

- **Client-side Processing**: All Excel processing happens in your browser - no data leaves your device
- **File Support**: Supports Excel (.xlsx, .xls) and CSV (.csv) files
- **Automated Processing**:
  - Removes columns A, E, and G from the original file
  - Filters out rows where the first column equals "RTS Troy CSC"
  - Adds a new "Bin number" column (initially empty)
  - Sorts all data rows alphabetically by the first column
- **Modern UI**: Clean, responsive design with Troy CSC branding
- **Export & Print**: Download processed files as Excel or print directly from browser
- **Drag & Drop**: Easy file upload with drag and drop support

## Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone or download the project
cd troy-csc-auto

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to Vercel
vercel deploy

# For production deployment
vercel --prod
```

## Project Structure

```
troy-csc-auto/
├── src/
│   ├── components/
│   │   ├── FileUploader.jsx    # File upload with drag & drop
│   │   ├── DataTable.jsx       # Table display with pagination
│   │   └── Toolbar.jsx         # Download, print, and action buttons
│   ├── utils/
│   │   └── excelUtils.js       # Excel processing logic
│   ├── main.jsx               # React entry point
│   └── index.css              # TailwindCSS styles
├── App.jsx                    # Main application component
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # TailwindCSS configuration
└── vercel.json               # Vercel deployment config
```

## Usage

1. **Upload File**: Drag and drop or click to select an Excel/CSV file
2. **Processing**: The app automatically processes the file according to Troy CSC requirements
3. **Review**: View the processed data in a paginated table
4. **Export**: Download the processed file as Excel or print the table

## Processing Logic

The application performs the following transformations:

1. **Column Removal**: Deletes columns A, E, and G from the original file
2. **Row Filtering**: Removes any rows where the first column contains "RTS Troy CSC"
3. **Column Addition**: Adds a new "Bin number" column after the first column
4. **Sorting**: Sorts all data rows alphabetically by the first column (excluding header)

## Technologies

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **SheetJS (xlsx)**: Excel file processing
- **Vercel**: Deployment platform

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Security & Privacy

- All file processing happens entirely in your browser
- No data is uploaded to any server
- Files are processed locally using JavaScript
- Secure deployment with proper headers via Vercel

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Customization

The application can be easily customized:

- **Styling**: Modify `tailwind.config.js` and `src/index.css`
- **Processing Logic**: Update `src/utils/excelUtils.js`
- **UI Components**: Modify components in `src/components/`
- **Branding**: Update colors and text in the configuration files

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please create an issue in the project repository.