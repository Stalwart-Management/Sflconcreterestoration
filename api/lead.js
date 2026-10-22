// Vercel serverless function: emails each lead via Resend.
// Required env vars: RESEND_API_KEY, LEAD_TO_EMAIL, LEAD_FROM_EMAIL
const FIELDS = [
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['propertyType', 'Property type'],
  ['service', 'Service'],
  ['location', 'Location'],
  ['message', 'Details'],
  ['page', 'Page'],
];

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (body.website) return res.status(200).json({ ok: true });

  const lead = Object.fromEntries(FIELDS.map(([k]) => [k, String(body[k] ?? '').trim().slice(0, 2000)]));
  if (!lead.name || !lead.phone || !/^\S+@\S+\.\S+$/.test(lead.email)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { RESEND_API_KEY, LEAD_TO_EMAIL, LEAD_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !LEAD_TO_EMAIL || !LEAD_FROM_EMAIL) {
    console.error('Lead email not configured. Lead received:', JSON.stringify(lead));
    return res.status(503).json({ error: 'Lead delivery not configured' });
  }

  const rows = FIELDS.filter(([k]) => lead[k])
    .map(([k, label]) => `<tr><td style="padding:6px 12px;font-weight:600">${label}</td><td style="padding:6px 12px">${escape(lead[k])}</td></tr>`)
    .join('');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: LEAD_FROM_EMAIL,
      to: LEAD_TO_EMAIL.split(',').map((s) => s.trim()),
      reply_to: lead.email,
      subject: `New estimate request: ${lead.service || 'General'} (${lead.location || 'N/A'})`,
      html: `<h2>New lead from South Florida Concrete Restoration website</h2><table>${rows}</table>`,
    }),
  });

  if (!r.ok) {
    console.error('Resend error', r.status, await r.text(), JSON.stringify(lead));
    return res.status(502).json({ error: 'Failed to send' });
  }
  return res.status(200).json({ ok: true });
}
