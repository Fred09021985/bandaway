// Couche de données : Firestore si configuré, sinon localStorage.
// Un voyage = un document. Les mises à jour se font par "chemins" (a.b.c)
// pour que plusieurs amis puissent écrire en même temps sans s'écraser.
import { firebaseConfig } from './config.js';

const LS = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

export const local = LS;

function setPath(obj, path, value) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof o[parts[i]] !== 'object' || o[parts[i]] === null) o[parts[i]] = {};
    o = o[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (value === null || value === undefined) delete o[last]; else o[last] = value;
}

/* ---------- Mode local ---------- */
function localStore() {
  const listeners = new Map();
  const key = (c) => `bw:trip:${c}`;
  const emit = (code) => (listeners.get(code) || []).forEach((cb) => cb(LS.get(key(code))));
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('bw:trip:')) emit(e.key.slice(8));
  });
  return {
    mode: 'local',
    async create(trip) { LS.set(key(trip.code), trip); emit(trip.code); },
    async get(code) { return LS.get(key(code)); },
    async update(code, patch) {
      const t = LS.get(key(code));
      if (!t) throw new Error('Voyage introuvable');
      for (const [p, v] of Object.entries(patch)) setPath(t, p, v);
      LS.set(key(code), t); emit(code);
    },
    subscribe(code, cb) {
      if (!listeners.has(code)) listeners.set(code, []);
      listeners.get(code).push(cb);
      cb(LS.get(key(code)));
      return () => listeners.set(code, listeners.get(code).filter((x) => x !== cb));
    },
  };
}

/* ---------- Mode cloud (Firestore) ---------- */
async function cloudStore() {
  const fb = await import('../vendor/firebase.js');
  const app = fb.initializeApp(firebaseConfig);
  const db = fb.getFirestore(app);
  const ref = (c) => fb.doc(db, 'trips', c);
  return {
    mode: 'cloud',
    async create(trip) { await fb.setDoc(ref(trip.code), trip); },
    async get(code) { const s = await fb.getDoc(ref(code)); return s.exists() ? s.data() : null; },
    async update(code, patch) {
      const p = {};
      for (const [k, v] of Object.entries(patch)) p[k] = (v === null || v === undefined) ? fb.deleteField() : v;
      await fb.updateDoc(ref(code), p);
    },
    subscribe(code, cb) {
      return fb.onSnapshot(ref(code), (s) => cb(s.exists() ? s.data() : null), (err) => { console.error(err); cb(LS.get(`bw:cache:${code}`)); });
    },
  };
}

export async function createStore() {
  if (firebaseConfig) {
    try { return await cloudStore(); } catch (e) { console.warn('Firebase indisponible, mode local', e); }
  }
  return localStore();
}
