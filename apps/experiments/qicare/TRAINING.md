# Mom Care: Operation & Family Training Manual v1.0

This manual is designed for the primary caregiver and family members managing a patient with COPD and chronic care needs.

---

## 🚀 1. The Core Console (Dashboard)

The **"Right Now"** screen is your operations center. It is designed to tell you exactly four things at a glance:
1. **Current Status**: Is Mom stable? (Check the "Right Now" glass card).
2. **Active Timers**: When is the next Ice or Breathing treatment due?
3. **Safety Warnings**: Is there a medication conflict? (Look for the GOLD caution card).
4. **Quick Actions**: One-tap buttons for common pills (Tylenol, Gabapentin, etc.) and Treatments.

### 📋 Action: Quick Logging
- **Medications**: Tap the pill icon. The app logs the dose and checks for safety interaction automatically.
- **Pain Check**: Opens a slider. Record the 1-10 level and breathing status.
- **Treatment (Neubilizer)**: Starts a focus timer.

---

## 🎤 2. Hands-Free Voice Commands

For stressful moments when your hands are busy:
1. Tap the **🎤 Microphone** icon.
2. Wait for the ring to glow.
3. **Speak Naturally**: 
   - *"I gave Mom her Tylenol"*
   - *"Starting breathing treatment"*
   - *"Pain is at a 7"*
4. The AI parses the command and updates the timeline instantly.

---

## 🛡️ 3. Safety & Decision Engine

The app is built with a **Safety Engine** specifically for COPD risks:
- **Sedation Stacking**: It will alert you if too many CNS depressants are given too close together.
- **Dose Frequency**: It prevents duplicate Acetaminophen (Tylenol) entries within a 4-hour window.
- **Breathing Guard**: Labored breathing results in an immediate "MONITOR" or "ESCALATE" instruction.

---

## 👤 4. Profiles & Roles

### Mom's Profile (User View)
- Focused on the **Quick Actions** and **Voice Commands**.
- Large buttons and high contrast.
- Audible alerts for timers.

### Admin Profile (Caregiver Management)
- Go to **Settings > Access Control > Admin Mode**.
- Once Active, you can **DELETE** erroneous entries from the History tab.
- Access detailed **Care Plan** adjustments.

---

## 📚 5. Knowledge Base (KB)
Access the **Learn** tab for:
- Clinical articles on COPD management.
- Quick-start videos (via NotebookLM).
- Troubleshooting voice commands.

---

## ⚙️ 6. Deployment & Supabase
- **Data Sync**: Your data is stored in a secure QiOS Supabase cloud instance.
- **Architecture**: Multi-tenant isolation ensures your family data is private and forensically auditable.
- **FastAPI**: The backend provides semantic search for the KB articles.

---

*Manual prepared for NotebookLM Ingestion. Use these titles for video segment headers.*
