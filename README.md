# USC Housing Software Suite

A comprehensive software solution for USC Housing operations, including package auditing and guest card management. Built with React, Node.js, MongoDB, and modern web technologies.

## Features

### USC Package Auditor
- **Client-side Processing**: All Excel processing happens in your browser - no data leaves your device
- **File Support**: Supports Excel (.xlsx, .xls) and CSV (.csv) files
- **Automated Processing**:
  - Removes columns A, E, and G from the original file
  - Filters out rows where the first column equals "RTS Troy CSC"
  - Adds a new "Bin number" column (initially empty)
  - Sorts all data rows alphabetically by the first column
- **Export & Print**: Download processed files as Excel or print directly from browser
- **Drag & Drop**: Easy file upload with drag and drop support

### USC Guest Card Management
- **Request Management**: Handle guest card requests with contact information
- **Card Assignment**: Assign cards to users with magnetic stripe support
- **Return Processing**: Track card returns and availability
- **Complete Audit Trail**: Full logging of all card activities
- **Card Status Management**: Activate/deactivate cards as needed
- **Real-time Tracking**: Monitor card assignments and returns

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
usc-housing-software-suite/
├── src/
│   ├── components/
│   │   ├── FileUploader.jsx    # File upload with drag & drop
│   │   ├── DataTable.jsx       # Table display with pagination
│   │   ├── Toolbar.jsx         # Download, print, and action buttons
│   │   ├── Home.jsx            # Main dashboard
│   │   └── guestCard/          # Guest card management components
│   │       ├── Navbar.jsx      # Navigation bar
│   │       └── pages/          # Guest card pages
│   ├── pages/guestCard/        # Guest card management pages
│   ├── api/                    # API client functions
│   ├── utils/
│   │   ├── excelUtils.js       # Excel processing logic
│   │   └── cardUtils.js        # Card processing utilities
│   ├── main.jsx               # React entry point
│   └── index.css              # TailwindCSS styles
├── api/                       # Backend API routes
│   ├── mongo.js              # MongoDB connection
│   ├── requests.js           # Request handling
│   ├── cards.js              # Card management
│   └── logs.js               # Activity logging
├── App.jsx                    # Main application component
├── dev-server.js             # Development API server
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # TailwindCSS configuration
└── vercel.json               # Vercel deployment config
```

## Usage

### USC Package Auditor
1. **Upload File**: Drag and drop or click to select an Excel/CSV file
2. **Processing**: The app automatically processes the file according to USC Housing requirements
3. **Review**: View the processed data in a paginated table
4. **Export**: Download the processed file as Excel or print the table

### USC Guest Card Management
1. **Request Cards**: Users can request guest cards with contact information
2. **Manage Requests**: View and process pending card requests
3. **Assign Cards**: Assign cards to users with magnetic stripe support
4. **Track Returns**: Process card returns and monitor availability
5. **Audit Trail**: View complete activity logs and card history

## Processing Logic

### USC Package Auditor
The application performs the following transformations:

1. **Column Removal**: Deletes columns A, E, and G from the original file
2. **Row Filtering**: Removes any rows where the first column contains "RTS Troy CSC"
3. **Column Addition**: Adds a new "Bin number" column after the first column
4. **Sorting**: Sorts all data rows alphabetically by the first column (excluding header)

### USC Guest Card Management
The system provides comprehensive card management:

1. **Request Processing**: Handles guest card requests with full contact information
2. **Card Assignment**: Tracks card assignments with unique user identification
3. **Status Management**: Manages card active/inactive status
4. **Audit Logging**: Records all card activities with timestamps
5. **Return Processing**: Handles card returns and availability updates

## Technologies

- **React 18**: Modern React with hooks and routing
- **Node.js**: Backend API server
- **MongoDB**: Database for guest card management
- **Express**: API server framework
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework with USC branding
- **SheetJS (xlsx)**: Excel file processing
- **React Router**: Client-side routing
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
