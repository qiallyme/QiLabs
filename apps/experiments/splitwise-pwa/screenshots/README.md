# Splitwise PWA Screenshots

Browser test screenshots captured on October 5, 2025

## Screenshots Overview

### 1. **login-page.png** (49KB)
- **Page**: Login / Magic Link Authentication
- **Description**: Shows the clean, modern login interface with email input and "Send Magic Link" button
- **Features Visible**: 
  - Welcome message
  - Email input field with placeholder
  - Primary action button (indigo blue)
  - Clean, minimal design

### 2. **home-page.png** (56KB)
- **Page**: Home Dashboard (logged in as Alice)
- **Description**: User's home page showing their spaces
- **Features Visible**:
  - Header with user name (Alice) and Sign Out button
  - "Your Spaces" heading
  - "New Space" button
  - Weekend Trip space card with icon ✈️, base currency (USD), and 4 members

### 3. **space-dashboard.png** (116KB)
- **Page**: Space Detail Page
- **Description**: Weekend Trip space showing balances and activity
- **Features Visible**:
  - Space header with icon and name
  - Download and "Add Expense" buttons
  - **Balances card** showing:
    - Alice: -$180.00 (red, owes)
    - Bob, Charlie, Diana: +$60.00 each (green, owed)
    - "Settle Up" button
  - **Recent Activity** showing Hotel booking for $240.00
  - **Members** section with all 4 member chips

### 4. **add-expense.png** (98KB)
- **Page**: Add Expense Form
- **Description**: Form for creating a new expense
- **Features Visible**:
  - Paid by dropdown (Alice selected)
  - Amount and Currency fields
  - Description: "Dinner at restaurant"
  - Category: "Food"
  - Date picker
  - Split Method dropdown (Equal, Exact Amounts, Percentages, Shares)
  - Live calculation showing "Each person owes: $0.00"
  - Save/Cancel buttons at bottom

### 5. **settle-plan.png** (87KB)
- **Page**: Settle Plan (Minimal Transfers Algorithm)
- **Description**: Shows the optimal payment plan to settle all balances
- **Features Visible**:
  - **3 minimal transfers** (instead of 6 possible):
    1. Alice → Bob: $60.00
    2. Alice → Charlie: $60.00
    3. Alice → Diana: $60.00
  - Member chips with avatars
  - Arrow indicators showing payment direction
  - Green amount badges
  - "Mark Paid" buttons for each transfer

### 6. **login-success-charlie.png** (56KB)
- **Page**: Home Dashboard (logged in as Charlie)
- **Description**: Successful login as Charlie, showing the same Weekend Trip space
- **Features Visible**:
  - Header showing "Charlie" (different user)
  - Same space visible with 4 members
  - Demonstrates multi-user support

## Key Features Demonstrated

### ✅ Beautiful UI Design
- Clean, modern interface with Inter font
- Consistent color scheme (indigo primary, green/red for balances)
- Professional spacing and typography
- Smooth shadows and rounded corners

### ✅ Working Features
1. **Magic Link Authentication** - Secure, passwordless login
2. **Multi-User Support** - Different users can access shared spaces
3. **Fair Rounding Algorithm** - $240 split 4 ways = Alice paid, others owe $60 each
4. **Minimal Transfer Algorithm** - 3 payments instead of 6 to settle balances
5. **Responsive Layout** - Mobile-first design
6. **Member Management** - Avatar chips, user identification

### ✅ Technical Highlights
- React 18 + TypeScript
- TailwindCSS + shadcn/ui components
- Color-coded balances (red = owing, green = owed)
- Real-time calculations
- Clean routing (React Router)

## How to View

Simply open any PNG file in this directory:
```bash
cd screenshots
open login-page.png
# or
open .
```

Or in your browser, drag and drop any image.

## Testing Date
October 5, 2025 at 4:30 PM PST

All screenshots taken during automated browser testing with Playwright.



