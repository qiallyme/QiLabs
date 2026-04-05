const fs = require('fs');
const path = require('path');

// Define unused imports to remove
const unusedImports = {
  'AIAssistantPanel.tsx': ['Button', 'ListItemText', 'Divider', 'Minimize'],
  'CollaborationPanel.tsx': ['Divider', 'Badge', 'Dialog', 'DialogTitle', 'DialogContent', 'DialogActions', 'NotificationsOff', 'Group', 'FormatQuote', 'LinkIcon', 'ImageIcon', 'Close', 'Search', 'FilterList'],
  'Permissions.tsx': ['Alert', 'FormControlLabel', 'Switch', 'Divider', 'IconButton', 'Tooltip', 'Security', 'Lock', 'LockOpen'],
  'Settings.tsx': ['FormControlLabel', 'IconButton', 'Email', 'Sms', 'DesktopWindows', 'Language'],
  'System.tsx': ['Error'],
  'Tasks.tsx': ['Menu', 'AccessTime', 'Flag', 'CalendarToday'],
  'Users.tsx': ['Add', 'CheckCircle', 'Block', 'Phone']
};

function removeUnusedImports(filePath, unusedList) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    unusedList.forEach(unusedImport => {
      // Remove from multi-line import statements
      const regex = new RegExp(, 'g');
      content = content.replace(regex, '');
      
      // Clean up any trailing commas
      content = content.replace(/,\s*}/g, '\n}');
      content = content.replace(/,\s*\]/g, '\n]');
    });
    
    fs.writeFileSync(filePath, content);
    console.log();
  } catch (error) {
    console.error(, error.message);
  }
}

// Process files
Object.entries(unusedImports).forEach(([filename, imports]) => {
  const componentsPath = path.join(__dirname, 'src', 'components', filename);
  const pagesPath = path.join(__dirname, 'src', 'pages', filename);
  
  if (fs.existsSync(componentsPath)) {
    removeUnusedImports(componentsPath, imports);
  } else if (fs.existsSync(pagesPath)) {
    removeUnusedImports(pagesPath, imports);
  }
});

console.log('Import cleanup completed\!');
