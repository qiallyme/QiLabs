# Paid In Full (formerly Pole to Power)

**A Memoir & Strategic Curriculum by Lisa English**

Welcome to the official repository for **"Paid In Full,"** a project that bridges the gap between the visceral reality of survival in the nightlife industry and the high-concept strategies of modern business and empowerment.

## 🚀 Project Vision
This project is built on the **"Grit & Polish"** methodology. Unlike traditional memoirs that sanitize the past or business books that lack a heartbeat, Paid In Full uses raw, gut-wrenching survival details (The Grit) to validate and anchor powerful metaphors for agency and economic control (The Polish).

### Core Features:
*   **De-Sanitized Narrative**: Interactive memoir sections that restore specific, haunting details—from the "chain-link steering wheel" of a monster to the "horror movie logic" of a life-or-death struggle.
*   **Strategic Curriculum**: Each chapter serves as a masterclass in the *Economics of Desire* and *The Exit Strategy*.
*   **Interactive Engagement**: A "Ask Lisa" community portal and discussion forum for unapologetic power-seekers.

## 🛠 Tech Stack
*   **Frontend**: Vanilla HTML5, CSS3, and TailwindCSS (via CDN).
*   **Typography**: Montserrat (Modern/Corporate) & Playfair Display (Serif/Premium).
*   **Integration**: Supabase (Backend/CRM), FontAwesome (Icons).
*   **Branding**: Custom-generated high-contrast minimal assets for professional link previews and identity.

## 📂 Project Structure
*   `/book`: Source files for the individual memoir chapters and strategic modules.
*   `/assets`: Branding assets including icons, favicons, manual/guide videos (GIFs), and social media previews.
*   `index.html`: The main interactive landing page and project hub.
*   `/interactive`: The immersive reading experience web application.

## 📈 Social & Previews
The site includes full **Open Graph (OG)** and **Twitter Card** support. Sharing the link will generate a premium, high-end "Dangerous Business" style preview with the custom branding.

## 🔐 Security & Deployment
**CRITICAL**: The Interactive Reader (`/interactive`) contains premium audiobook content and must be protected.

### Cloudflare Zero Trust Configuration:
1.  **Application Name**: Paid In Full Interactive Reader
2.  **Protected Path**: `pole-to-power.com/interactive/*`
3.  **Identity Provider**: Email OTP or Social Login (Google/LinkedIn)
4.  **Access Policy**: Restrict to `Purchased Members` group.

*Do not deploy the `/interactive` folder to a public URL without this protection layer active.*

---
© 2026 Lisa English | **Paid In Full**