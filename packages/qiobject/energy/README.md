# Home Energy Tracker

A simple, single-page Energy Usage Tracker that runs entirely in your browser with no backend required.

## Features

- **Track Appliances**: Add devices with wattage and estimated hours per day
- **Track Bills**: Log your actual energy bills with detailed breakdowns
- **Compare Estimates**: See how your appliance-based estimates compare to actual bills
- **Dashboard**: View monthly usage estimates, costs, and AES-style breakdowns
- **Local Storage**: All data persists in your browser's localStorage (no server needed)

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No Node.js, npm, or backend required

## How to Run

1. **Open the app**:
   - Simply open `index.html` in your web browser
   - Or serve it with any static file server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (if you have it)
     npx serve .
     
     # Then open http://localhost:8000
     ```

2. **Start tracking**:
   - The app will seed with 5 default appliances on first load
   - Adjust wattage and hours to match your usage
   - Add your actual bills to compare estimates vs reality

## Data Storage

All data is stored in your browser's localStorage:
- `energyTracker_appliances` - Your appliances/devices
- `energyTracker_bills` - Your energy bills
- `energyTrackerRate` - Your electric rate per kWh

**Note**: Data is stored locally in your browser. If you clear browser data, you'll lose your entries. Consider exporting important data periodically.

## Usage Tips

1. **Set your electric rate**: Update the rate in the top summary card (default: $0.12/kWh)

2. **Add appliances**: 
   - Enter name, room, wattage (W), and hours per day
   - The app calculates daily/monthly kWh and estimated cost

3. **Add bills**:
   - Enter period start/end dates
   - Fill in billed kWh and charges
   - Optionally add estimated kWh/amount to compare
   - Use "Use current estimate" button to auto-fill estimates

4. **Compare**:
   - The dashboard shows estimated vs actual usage
   - Bills table shows differences with color-coded chips
   - Latest bill summary appears in the top summary card

## Importing Historical Data

If you have historical bills in CSV format (like `data.csv`), you can:
1. Manually enter them through the UI, or
2. Use browser DevTools console to import:
   ```javascript
   // Example: Import a bill
   const bill = {
     id: app.generateId(),
     period_start: '2024-01-01',
     period_end: '2024-01-31',
     billed_kwh: 2500,
     total_billed: 300.00,
     // ... other fields
   };
   app.bills.push(bill);
   app.saveBills();
   app.renderBillsTable();
   ```

## Troubleshooting

- **Data not saving**: Check if your browser allows localStorage (some privacy modes block it)
- **Calculations seem off**: Verify your electric rate is set correctly
- **UI not loading**: Make sure you're opening the file via `http://` or `file://` (some browsers block local file access for security)

## Future Enhancements

This MVP uses localStorage. Future versions could:
- Export/import data as JSON
- Connect to Supabase for cloud sync
- Add charts and visualizations
- Support multiple properties/homes
