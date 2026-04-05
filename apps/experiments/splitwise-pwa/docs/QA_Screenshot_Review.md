# QA Screenshot Review Checklist

## Overview

This checklist guides testers through capturing screenshots of key features in the Splitwise MVP to verify that rounding logic, multi-currency FX, settle plans, offline sync (outbox), and PWA wiring are working correctly. Please follow each step in order, capture the requested screenshots, and attach them using the provided markdown code blocks. Use the test data provided below to ensure expected numbers match precisely.

**Important:** Use the exact test data specified in the "Test Data" section so that the rounding, FX conversions, and balance calculations can be verified against known-good values.

---

## Screenshot Checklist

### 1. [01-Home] Home Screen

**What to capture:**
- Show the space list and "New Space" button
- On mobile view, show the FAB "+" button

**Expected:**
- Clean UI with all spaces listed
- Navigation elements visible and accessible

```md
[Paste screenshot link(s)]
```

---

### 2. [02-Space-Settings] Create/Join Space

**What to capture:**
- Space creation or settings view
- Show base currency selection
- Show members list with avatars/chips (Alice, Bob, You)

**Expected:**
- Base currency is clearly displayed
- Member chips/avatars are visible and legible

```md
[Paste screenshot link(s)]
```

---

### 3. [03-Dashboard] Space Dashboard

**What to capture:**
- Balances panel showing net balances for each member
- Recent Activity section with expense list

**Expected:**
- Sum of all net balances ≈ $0.00 (within ±$0.01 due to rounding)
- Recent expenses are visible with amounts and descriptions

```md
[Paste screenshot link(s)]
```

---

### 4. [04-Add-Equal] Add Expense — Equal Split

**What to capture:**
- Add expense form with amount **$10.00**
- Split type: **Equal**
- Participants: **Alice, Bob, You**
- Show the per-person split amounts

**Expected per-person (fair rounding):**
- Alice: **$3.34**
- Bob: **$3.33**
- You: **$3.33**

(Extra cent goes to the first tiebreak participant)

```md
[Paste screenshot link(s)]
```

---

### 5. [05-Add-Percent] Add Expense — Percent Split

**What to capture:**
- Add expense form with amount **$100.00**
- Split type: **Percent**
- Alice: **34%**, Bob: **33%**, You: **33%**
- Show the calculated amounts

**Expected amounts:**
- Alice: **$34.00**
- Bob: **$33.00**
- You: **$33.00**

```md
[Paste screenshot link(s)]
```

---

### 6. [06-Add-Shares] Add Expense — Shares Split

**What to capture:**
- Add expense form with amount **$10.00**
- Split type: **Shares**
- Alice: **1 share**, Bob: **2 shares**, You: **3 shares**
- Show the calculated amounts

**Expected amounts:**
- Alice: **$1.67**
- Bob: **$3.33**
- You: **$5.00**

```md
[Paste screenshot link(s)]
```

---

### 7. [07-Itemized] Itemized (OCR) View

**What to capture:**
- Receipt scanner/itemized view
- Items list with assignment UI
- "Apply to split" button or similar action
- If OCR fails, show the graceful fallback message

**Expected:**
- Items can be parsed/entered manually
- Assignment interface is clear and usable
- Fallback messaging is helpful if OCR is unavailable

```md
[Paste screenshot link(s)]
```

---

### 8. [08-Multi-Currency] Multi-Currency Expense

**What to capture:**
- Add expense with amount **INR 1,000**
- Base currency: **USD**
- FX rate locked at **0.012 USD/INR**
- Show the converted amount and "FX locked" indicator

**Expected conversion:**
- INR 1,000 × 0.012 = **USD 12.00**
- Visible note/badge indicating "FX locked" or "Exchange rate: 0.012"

```md
[Paste screenshot link(s)]
```

---

### 9. [09-Settle-Plan] Settle Plan

**What to capture:**
- Initial settle plan showing all required transfers
- Mark one transfer as "Paid"
- Capture the updated state after marking paid

**Expected:**
- Helper text states something like "balances will reach ±$0.01"
- After marking paid, the transfer is visually distinguished (checked/greyed out)
- Remaining balances update accordingly

```md
[Paste screenshot link(s)]
```

---

### 10. [10-Offline-Outbox] Offline / Outbox

**What to capture:**
1. Open DevTools → Network tab → Set to **Offline**
2. Save an expense (any amount/split)
3. Show the **"Pending sync"** banner or outbox indicator
4. Set Network back to **Online**
5. Show the banner disappearing and the expense appearing in Recent Activity

**Expected:**
- While offline, a clear "Pending sync" or similar banner is visible
- After going online, sync completes automatically
- Expense appears in the activity feed without data loss

```md
[Paste screenshot link(s)]
```

---

### 11. [11-PWA-Wiring] PWA Manifest & Service Worker

**What to capture:**
- DevTools → **Application** tab → **Manifest** section
  - Show installable status, name, icons (192×192, 512×512)
- DevTools → **Application** tab → **Service Workers** section
  - Show registered and active service worker

**Expected:**
- Manifest loads correctly with valid icons
- Service worker is registered and status is "activated"

```md
[Paste screenshot link(s)]
```

---

### 12. [12-Responsive] Responsive Layout

**What to capture:**
- Space Dashboard in narrow mobile view (~375–430px width)
- Space Dashboard in desktop view (>1024px width)

**Expected:**
- Mobile: Stacked layout, touch-friendly controls, FAB visible
- Desktop: Multi-column layout, wider cards, no horizontal scroll

```md
[Paste screenshot link(s)]
```

---

## Test Data

Use the following data when adding expenses to ensure expected rounding and FX conversions match:

### Participants
- **Alice**
- **Bob**
- **You** (the logged-in user)

### Equal Split Example
- Amount: **$10.00**
- Split: **Equal** among 3 people
- **Expected:** Alice $3.34, Bob $3.33, You $3.33

### Percent Split Example
- Amount: **$100.00**
- Split: **34% / 33% / 33%**
- **Expected:** Alice $34.00, Bob $33.00, You $33.00

### Shares Split Example
- Amount: **$10.00**
- Shares: **1 / 2 / 3** (Alice/Bob/You)
- **Expected:** Alice $1.67, Bob $3.33, You $5.00

### Multi-Currency Example
- Currency: **INR** (Indian Rupee)
- Amount: **1,000 INR**
- Base currency: **USD**
- FX rate (locked): **0.012 USD/INR**
- **Expected converted amount:** USD $12.00
- **Note:** "FX locked" badge or similar should be visible

---

## Bonus (Optional)

### CSV Export Sample
If CSV export is available, paste the first 5 lines of an exported ledger for sanity-checking:

```csv
[Paste first 5 lines of CSV export]
```

### Toasts/Banners Text
Copy any toast messages or banners you encounter during testing for a quick wording review:

```
[Paste toast/banner messages here]
```

---

## Submit

### Option A: GitHub Issue
1. Go to the repository Issues page
2. Click "New issue"
3. Select the **"QA Screenshot Review"** template
4. Fill in each section with your screenshots
5. Submit the issue with title: `QA: Screenshot Review — {Date}`

### Option B: Direct Commit
1. Paste all screenshots/links directly into this markdown file
2. Commit the file in a new branch
3. Open a PR titled: **"QA: Screenshot Review (MVP)"**
4. Tag relevant reviewers for sign-off

---

## Quick Reference: Running the Checklist

To open this checklist from the terminal:

```bash
pnpm -C apps/web qa:open-checklist
```

Or from the workspace root:

```bash
cd apps/web && pnpm qa:open-checklist
```

---

**End of Checklist** — Thank you for ensuring the MVP is rock-solid! 🎉




