# Gemini Prompts for Tax Prep 2025 Site Generation

## Prompt A — Build hub landing page

Create a clean Tailwind HTML landing page for QiAlly:
Title: "2025 Tax Intake — Next Steps / Próximos Pasos"
Include 5 cards linking to:

- /next-steps/simple-w2
- /next-steps/self-employed
- /next-steps/complex
- /next-steps/itin
- /next-steps/business
  Style: glass panels, green #1AB16D, Inter + Playfair vibe, Spanglish. Include a "Book Review Call" button linking to the booking URL.
  Output: one HTML file.

## Prompt B — Build checklist pages (printable)

Create a Tailwind HTML checklist page for QiAlly named:
"2025 Tax Checklist — [TYPE] / Lista de Documentos"
Must include:

- Print button (window.print)
- Back link to hub (/next-steps/)
- Button: "Upload + Organizer Form" linking to [ORGANIZER_FORM_URL]
- Button: "Book Review Call" linking to booking URL
  Include sections: Core docs, If applicable, Timeline, FAQs. Spanglish throughout.
  Output only HTML.

## Prompt C — Build all pages in one run

Create 6 Tailwind HTML pages:

1. /next-steps/index.html (hub)
2. simple-w2.html
3. self-employed.html
4. complex.html
5. itin.html
6. business.html
   Each checklist page has print button + links + Spanglish + QiAlly styling (#1AB16D).
   Output each file separately.
