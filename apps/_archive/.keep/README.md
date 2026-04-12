# QiAlly Flows Info Site

This is the static marketing and legal website for **QiAlly Flows**, hosted at [flows-info.qially.com](https://flows-info.qially.com).

## Purpose
- Provide a professional overview of the Flows product.
- Host mandatory legal documents (Privacy Policy, Terms of Service).
- Provide a public entry point and contact information.

## Tech Stack
- **Plain HTML/CSS/JS**: No build step required.
- **Vanilla CSS**: Custom design system in `assets/styles.css`.
- **Responsive Design**: Optimized for mobile and desktop.
- **SEO Friendly**: Semantic HTML and meta tags.

## Project Structure
- `index.html`: Homepage (Hero, Product Info).
- `privacy.html`: Privacy Policy.
- `terms.html`: Terms of Service.
- `assets/`:
  - `styles.css`: Main stylesheet.
  - `logo.svg`: Site logo and favicon.

## Cloudflare Pages Deployment
To deploy this site to Cloudflare Pages:

1. **Create a new project** in the Cloudflare Pages dashboard.
2. **Connect your repository** (or upload the folder).
3. **Build Settings**:
   - **Framework preset**: `None`
   - **Build command**: Leave empty (none)
   - **Build output directory**: `/` (root)
4. **Environment Variables**: None required.
5. **Custom Domain**: 
   - Add `flows-info.qially.com` in the "Custom domains" tab.
   - Follow instructions to add a CNAME record in your DNS provider (Cloudflare DNS recommended).

## Contact
Email: [hello@qially.com](mailto:hello@qially.com)
Main App: [flows.qially.com](https://flows.qially.com)
