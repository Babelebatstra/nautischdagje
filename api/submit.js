export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { naam, email, telefoon, wensen, eventType, aantalPersonen, wensen3, dagdeel } = req.body;

  if (!naam || !email || !telefoon) {
    return res.status(400).json({ error: 'Naam, e-mail en telefoon zijn verplicht.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuratiefout.' });
  }

  const html = `
    <h2>Nieuwe offerte-aanvraag via NautischDagje.nl</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;width:180px">Naam</td><td style="padding:8px">${escHtml(naam)}</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">E-mail</td><td style="padding:8px">${escHtml(email)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Telefoon</td><td style="padding:8px">${escHtml(telefoon)}</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Type event</td><td style="padding:8px">${escHtml(eventType || '-')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Aantal personen</td><td style="padding:8px">${escHtml(aantalPersonen || '-')}</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Wensen (stap 3)</td><td style="padding:8px">${escHtml(wensen3 || '-')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Dagdeel</td><td style="padding:8px">${escHtml(dagdeel || '-')}</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Toelichting</td><td style="padding:8px">${escHtml(wensen || '-')}</td></tr>
    </table>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NautischDagje.nl <noreply@nautischdagje.nl>',
      to: ['info@nautischdagje.nl'],
      reply_to: email,
      subject: `Nieuwe offerte-aanvraag van ${naam}`,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Verzenden mislukt, probeer het opnieuw.' });
  }

  return res.status(200).json({ ok: true });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
