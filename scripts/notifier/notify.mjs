// Notificateur Tripizi — lancé toutes les 10 min par GitHub Actions (.github/workflows/notify.yml).
// Lit le journal « feed » des escapades modifiées et envoie une notification push (FCM)
// aux autres membres de chaque escapade. Ne garde aucun état hors de Firestore (meta/notifier).
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) { console.log('Secret FIREBASE_SERVICE_ACCOUNT absent : rien à faire.'); process.exit(0); }
initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();
const fcm = getMessaging();
const DRY = process.env.DRY_RUN === '1';

const now = Date.now();
const metaRef = db.doc('meta/notifier');
const meta = (await metaRef.get()).data() || {};
const seen = meta.seen || {};                       // { CODE: horodatage du dernier évènement traité }
const lookback = (meta.lastRun || now) - 60 * 60e3;  // marge d'1 h pour les horloges de téléphone décalées

const trips = await db.collection('trips').where('feedAt', '>', lookback).get();
console.log(`${trips.size} escapade(s) modifiée(s)`);
if (trips.empty) { if (!DRY) await metaRef.set({ lastRun: now, seen }, { merge: true }); process.exit(0); }

const devices = (await db.collection('devices').get()).docs.map((d) => ({ id: d.id, ...d.data() }));
const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;
let sent = 0;
const dead = new Set();

for (const doc of trips.docs) {
  const t = doc.data(); const code = doc.id;
  const events = Object.values(t.feed || {}).filter((e) => e && e.at > (seen[code] ?? now - 15 * 60e3) && e.at <= now);
  if (!events.length) continue;
  seen[code] = Math.max(...events.map((e) => e.at));
  events.sort((a, b) => a.at - b.at);
  for (const dev of devices) {
    if (!dev.trips?.includes(code) || !t.members?.[dev.uid] || dead.has(dev.id)) continue;
    const mine = events.filter((e) => e.by !== dev.uid);
    if (!mine.length) continue;
    const last = mine[mine.length - 1];
    const body = mine.length === 1 ? `${last.name} ${last.text}`
      : `${plural(mine.length, 'nouveauté')} : ${mine.slice(-2).map((e) => `${e.name} ${e.text}`).join(' · ')}`;
    const message = {
      token: dev.token,
      notification: { title: `${t.emoji || '🌍'} ${t.name}`, body: body.slice(0, 230) },
      data: { code },
      android: { priority: 'high', notification: { icon: 'ic_stat_tripizi', color: '#ff2e97', tag: code, channelId: 'tripizi' } },
    };
    if (DRY) { console.log('[test]', dev.uid, message.notification); continue; }
    try { await fcm.send(message); sent++; }
    catch (e) {
      console.warn('échec', dev.id, e.code);
      if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/invalid-argument'].includes(e.code)) dead.add(dev.id);
    }
  }
  // Ménage : on ne garde que 14 jours de journal
  const old = Object.entries(t.feed || {}).filter(([, e]) => !e?.at || e.at < now - 14 * 864e5).map(([k]) => k);
  if (old.length && !DRY) await doc.ref.update(Object.fromEntries(old.map((k) => [`feed.${k}`, FieldValue.delete()])));
}

for (const id of dead) await db.doc(`devices/${id}`).delete();
if (!DRY) await metaRef.set({ lastRun: now, seen }, { merge: true });
console.log(`${sent} notification(s) envoyée(s), ${dead.size} appareil(s) retiré(s)`);
