import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

export const health = functions.https.onRequest((_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export const createUser = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { userId, profile } = req.body;
    if (!userId || !profile) {
      res.status(400).json({ error: 'userId and profile required' });
      return;
    }
    await db.collection('users').doc(userId).set(profile, { merge: true });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export const listRooms = functions.https.onRequest(async (_req, res) => {
  try {
    const snapshot = await db.collection('rooms').limit(50).get();
    const rooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.status(200).json({ rooms });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export const createMatch = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { userA, userB, score, status } = req.body;
    if (!userA || !userB) {
      res.status(400).json({ error: 'userA and userB required' });
      return;
    }
    const ref = await db.collection('matches').add({ userA, userB, score, status: status ?? 'pending', createdAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(201).json({ id: ref.id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export const postMessage = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { conversationId, sender, text, timestamp } = req.body;
    if (!conversationId || !sender || !text) {
      res.status(400).json({ error: 'conversationId, sender, text required' });
      return;
    }
    const message = { sender, text, timestamp: timestamp ?? admin.firestore.FieldValue.serverTimestamp() };
    await db.collection('messages').doc(conversationId).set(
      { messages: admin.firestore.FieldValue.arrayUnion(message) },
      { merge: true }
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

function extractDomain(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at === -1) return null;
  return email.slice(at + 1).toLowerCase();
}

function isEduDomain(domain: string): boolean {
  return domain.endsWith('.edu');
}

export const requestUniversityVerification = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { userId, email, university } = req.body as { userId?: string; email?: string; university?: string };
    if (!userId || !email) {
      res.status(400).json({ error: 'userId and email required' });
      return;
    }
    const domain = extractDomain(email);
    if (!domain) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }
    const eduLike = isEduDomain(domain);

    const verification = {
      status: 'pending',
      email,
      domain,
      eduDomain: eduLike,
      university: university ?? null,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userId).set({ verification }, { merge: true });
    res.status(200).json({ ok: true, eduDomain: eduLike });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export const confirmUniversityVerification = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const verification = userDoc.get('verification') || {};

    await db.collection('users').doc(userId).set(
      {
        verification: {
          ...verification,
          status: 'verified',
          verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        badges: {
          universityVerified: true,
        },
      },
      { merge: true }
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export const submitStudentId = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { userId, storagePath } = req.body as { userId?: string; storagePath?: string };
    if (!userId || !storagePath) {
      res.status(400).json({ error: 'userId and storagePath required' });
      return;
    }

    await db.collection('users').doc(userId).set(
      {
        verification: {
          studentId: {
            storagePath,
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'under_review',
          },
        },
      },
      { merge: true }
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

function toNumber(value: any, def: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : def;
}

function lifestyleScore(a: any, b: any): number {
  if (!a || !b) return 0;
  const keys = Object.keys(a);
  if (keys.length === 0) return 0;
  let match = 0;
  for (const k of keys) {
    if (b.hasOwnProperty(k) && a[k] === b[k]) match += 1;
  }
  return match / keys.length;
}

function computeCompatibility(user: any, candidate: any): number {
  const wBudget = 0.35;
  const wLocation = 0.25;
  const wLifestyle = 0.30;
  const wLease = 0.10;

  const userBudget = toNumber(user?.budget, 0);
  const candBudget = toNumber(candidate?.budget, 0);
  const maxBudgetSpan = Math.max(userBudget, candBudget, 1);
  const budgetDiff = Math.abs(userBudget - candBudget);
  const budgetScore = 1 - Math.min(budgetDiff / maxBudgetSpan, 1);

  const locationScore = user?.location && candidate?.location && user.location === candidate.location ? 1 : 0;

  const lifestylePrefsA = user?.lifestylePreferences || {};
  const lifestylePrefsB = candidate?.lifestylePreferences || {};
  const lifeScore = lifestyleScore(lifestylePrefsA, lifestylePrefsB);

  const leaseScore = user?.leaseDuration && candidate?.leaseDuration && user.leaseDuration === candidate.leaseDuration ? 1 : 0;

  const total = wBudget * budgetScore + wLocation * locationScore + wLifestyle * lifeScore + wLease * leaseScore;
  return Math.round(total * 100);
}

export const getTopCandidates = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { userId, limit } = req.body as { userId?: string; limit?: number };
    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const me = userSnap.data();

    const likedDocs = await db.collection('likes').where('fromUserId', '==', userId).get();
    const passedDocs = await db.collection('passes').where('fromUserId', '==', userId).get();
    const excluded = new Set<string>();
    likedDocs.forEach((d) => excluded.add(d.get('toUserId')));
    passedDocs.forEach((d) => excluded.add(d.get('toUserId')));
    excluded.add(userId);

    const candidatesSnap = await db.collection('users').limit(200).get();
    const scored: Array<{ id: string; score: number; profile: any }> = [];
    candidatesSnap.forEach((doc) => {
      const id = doc.id;
      if (excluded.has(id)) return;
      const profile = doc.data();
      const score = computeCompatibility(me, profile);
      scored.push({ id, score, profile });
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.max(1, Math.min(toNumber(limit, 20), 50)));
    res.status(200).json({ candidates: top });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

async function hasReciprocalLike(fromUserId: string, toUserId: string): Promise<boolean> {
  const q = await db.collection('likes').where('fromUserId', '==', toUserId).where('toUserId', '==', fromUserId).limit(1).get();
  return !q.empty;
}

export const likeUser = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { fromUserId, toUserId } = req.body as { fromUserId?: string; toUserId?: string };
    if (!fromUserId || !toUserId || fromUserId === toUserId) {
      res.status(400).json({ error: 'fromUserId and toUserId required' });
      return;
    }
    await db.collection('likes').add({ fromUserId, toUserId, createdAt: admin.firestore.FieldValue.serverTimestamp() });

    if (await hasReciprocalLike(fromUserId, toUserId)) {
      const aSnap = await db.collection('users').doc(fromUserId).get();
      const bSnap = await db.collection('users').doc(toUserId).get();
      const score = computeCompatibility(aSnap.data(), bSnap.data());
      await db.collection('matches').add({ userA: fromUserId, userB: toUserId, score, status: 'matched', createdAt: admin.firestore.FieldValue.serverTimestamp() });
      res.status(200).json({ matched: true, score });
      return;
    }

    res.status(200).json({ matched: false });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export const passUser = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { fromUserId, toUserId } = req.body as { fromUserId?: string; toUserId?: string };
    if (!fromUserId || !toUserId || fromUserId === toUserId) {
      res.status(400).json({ error: 'fromUserId and toUserId required' });
      return;
    }
    await db.collection('passes').add({ fromUserId, toUserId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
