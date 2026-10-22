# SFL Concrete Restoration

Lead-funnel landing page for sflconcreterestoration.com. Static HTML/CSS/JS with one Vercel serverless function (`api/lead.js`) that emails each form submission.

## Files
- `index.html`: page content (phone number, copy, services)
- `styles.css`: styling
- `main.js`: two-step quote form
- `api/lead.js`: sends leads by email via Resend

## Lead email setup (Vercel → Project → Settings → Environment Variables)
- `RESEND_API_KEY`: API key from resend.com
- `LEAD_TO_EMAIL`: where leads go (comma-separate for multiple)
- `LEAD_FROM_EMAIL`: verified sender, e.g. `SFL Leads <leads@sflconcreterestoration.com>`

Until these are set, the form shows a "please call us" message and the lead is written to the Vercel function logs.
