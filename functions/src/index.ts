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
    const ref = await db.collection('matches').add({ userA, userB, score, status: status ?? 'pending' });
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

// University Verification Functions
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
