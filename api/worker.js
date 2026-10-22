/* Maison Angie : réception des demandes (contact et devis).
   Enregistre la demande dans la base D1, envoie un e-mail à Angie et une confirmation au client (via Brevo).
   Réglages à créer dans Cloudflare (voir LISEZ-MOI) :
   - Base de données D1, nom de variable : DB
   - Secret : BREVO_API_KEY
   - Variables : SENDER_EMAIL (adresse validée dans Brevo), NOTIFY_EMAIL (adresse qui reçoit les demandes)
   - Optionnel : ALLOWED_ORIGINS (adresses du site, séparées par des virgules) */

const DEFAULT_ORIGINS = ['https://mypersonalapp-fr.github.io'];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

function corsHeaders(origin, allowed) {
  const h = { 'Vary': 'Origin' };
  if (allowed.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}
const json = (obj, status, extra) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...extra } });

async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sendMail(env, { to, subject, html, replyTo }) {
  const body = {
    sender: { name: env.SENDER_NAME || 'Maison Angie', email: env.SENDER_EMAIL },
    to: [to],
    subject,
    htmlContent: html,
  };
  if (replyTo) body.replyTo = replyTo;
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const txt = (await r.text()).slice(0, 300);
  if (!r.ok) throw new Error('Brevo ' + r.status + ' ' + txt);
  return 'Brevo ' + r.status + ' ' + txt;
}

const row = (label, value) => value ? `<tr><td style="padding:6px 14px 6px 0;color:#6b6460;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#1f1b1a">${esc(value).replace(/\n/g, '<br>')}</td></tr>` : '';
const wrap = (inner) => `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1f1b1a">${inner}</div>`;

function adminMail(type, d) {
  const titre = type === 'devis' ? 'Nouvelle demande de devis' : 'Nouveau message';
  const rows = type === 'devis'
    ? row('Nom', d.nom) + row('E-mail', d.email) + row('Prestation', d.prestation) + row("Date de l'événement", d.date_evenement) + row('Parts', d.parts) + row('Livraison', d.livraison) + row('Saveurs', d.saveurs) + row('Étages', d.etages) + row('Thème', d.theme)
    : row('Nom', d.nom) + row('E-mail', d.email) + row('Sujet', d.sujet) + row("Date de l'événement", d.date_evenement) + row('Message', d.message);
  return {
    subject: `${titre} : ${d.nom}`,
    html: wrap(`<h2 style="font-weight:400;margin:0 0 16px">${titre}</h2><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">${rows}</table><p style="font-family:Arial,sans-serif;font-size:13px;color:#6b6460;margin-top:20px">Répondez directement à cet e-mail pour écrire au client.</p>`),
  };
}

function clientMail(type, d) {
  const intro = type === 'devis'
    ? 'Merci pour votre demande de devis. Je l\'ai bien reçue et je reviens vers vous très vite avec une proposition.'
    : 'Merci pour votre message. Je l\'ai bien reçu et je vous réponds très vite.';
  const recap = type === 'devis'
    ? '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">' + row('Prestation', d.prestation) + row("Date de l'événement", d.date_evenement) + row('Parts', d.parts) + row('Livraison', d.livraison) + row('Saveurs', d.saveurs) + row('Étages', d.etages) + row('Thème', d.theme) + '</table><p style="font-family:Arial,sans-serif;font-size:14px;color:#6b6460">Vous avez une photo d\'inspiration ? Répondez simplement à cet e-mail en la joignant.</p>'
    : '';
  return {
    subject: 'Maison Angie : votre ' + (type === 'devis' ? 'demande est bien reçue' : 'message est bien reçu'),
    html: wrap(`<p style="font-size:18px">Bonjour ${esc(d.nom)},</p><p>${intro}</p>${recap}<p>À très bientôt,<br><em>Maison Angie</em></p>`),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : DEFAULT_ORIGINS;
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'GET' && url.pathname === '/') return json({ ok: true, service: 'maison-angie' }, 200);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const type = url.pathname === '/contact' ? 'contact' : url.pathname === '/devis' ? 'devis' : null;
    if (request.method !== 'POST' || !type) return json({ ok: false, error: 'Introuvable' }, 404, cors);
    if (!allowed.includes(origin)) return json({ ok: false, error: 'Origine non autorisée' }, 403);

    let raw;
    try {
      const txt = await request.text();
      if (txt.length > 20000) return json({ ok: false, error: 'Demande trop volumineuse' }, 413, cors);
      raw = JSON.parse(txt);
    } catch (e) {
      return json({ ok: false, error: 'Demande illisible' }, 400, cors);
    }
    if (raw.website) return json({ ok: true }, 200, cors); /* champ piège : robots */

    const d = {
      nom: clean(raw.nom, 100), email: clean(raw.email, 150).toLowerCase(),
      sujet: clean(raw.sujet, 60), date_evenement: clean(raw.date_evenement, 20),
      prestation: clean(raw.prestation, 80), parts: clean(raw.parts, 30), livraison: clean(raw.livraison, 60),
      saveurs: clean(raw.saveurs, 300), etages: clean(raw.etages, 30),
      theme: clean(raw.theme, 3000), message: clean(raw.message, 3000),
    };
    if (!d.nom || !EMAIL.test(d.email)) return json({ ok: false, error: 'Nom ou e-mail invalide' }, 400, cors);
    if (type === 'devis' && (!d.prestation || !d.date_evenement || !d.theme)) return json({ ok: false, error: 'Champs manquants' }, 400, cors);
    if (type === 'contact' && !d.message) return json({ ok: false, error: 'Message manquant' }, 400, cors);

    const ipHash = await sha256((request.headers.get('CF-Connecting-IP') || 'inconnu') + ':maison-angie');
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM demandes WHERE ip_hash = ? AND cree_le > datetime('now','-1 hour')").bind(ipHash).first();
    if (recent && recent.n >= 5) return json({ ok: false, error: 'Trop de demandes, réessayez plus tard' }, 429, cors);

    const res = await env.DB.prepare(
      'INSERT INTO demandes (type, nom, email, sujet, date_evenement, prestation, parts, livraison, saveurs, etages, theme, message, ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).bind(type, d.nom, d.email, d.sujet, d.date_evenement, d.prestation, d.parts, d.livraison, d.saveurs, d.etages, d.theme, d.message, ipHash).run();
    const id = res.meta && res.meta.last_row_id;

    let statut = 'Nouveau';
    const journal = [];
    try {
      const a = adminMail(type, d);
      journal.push('Angie -> ' + env.NOTIFY_EMAIL + ' : ' + (await sendMail(env, { to: { email: env.NOTIFY_EMAIL }, subject: a.subject, html: a.html, replyTo: { email: d.email, name: d.nom } })));
    } catch (e) {
      console.error('Notification', e.message);
      journal.push('Angie ECHEC : ' + e.message);
      statut = 'Notification non envoyée';
    }
    try {
      const c = clientMail(type, d);
      journal.push('Client -> ' + d.email + ' : ' + (await sendMail(env, { to: { email: d.email, name: d.nom }, subject: c.subject, html: c.html, replyTo: { email: env.NOTIFY_EMAIL } })));
    } catch (e) {
      console.error('Confirmation', e.message);
      journal.push('Client ECHEC : ' + e.message);
    }
    if (id) await env.DB.prepare('UPDATE demandes SET statut = ?, journal = ? WHERE id = ?').bind(statut, journal.join(' | ').slice(0, 1000), id).run();

    return json({ ok: true }, 200, cors);
  },
};
