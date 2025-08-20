const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, Long } = require('mongodb');
require('dotenv').config();

// Config (MVP: allow env, fallback to provided values to ease local testing)
const PORT = process.env.RESULTS_PORT || 3002;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;
const COLL_QUIZZES = process.env.MONGO_COLL_QUIZZES;
const COLL_ATTEMPTS = process.env.MONGO_COLL_ATTEMPTS;

// Helpers
function toLowerSafe(s) { return (s || '').toString().trim().toLowerCase(); }
function escapeRegex(s) { return (s || '').toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function asNumberOrLong(v) {
  if (v == null) return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
  if (typeof v === 'object') {
    // Handle BSON Long-like objects
    if (typeof v.toNumber === 'function') {
      try { return v.toNumber(); } catch (_) {}
    }
    if (v.low != null && v.high != null) {
      try { return Long.isLong(v) ? v.toNumber() : Number(v); } catch (_) {}
    }
    // Handle {$numberLong: "15"}
    if (v.$numberLong) {
      const n = Number(v.$numberLong);
      if (!isNaN(n)) return n;
    }
  }
  return v; // last resort
}

function minutesBetween(isoStart, isoEnd) {
  try {
    const s = new Date(isoStart).getTime();
    const e = new Date(isoEnd).getTime();
    if (isNaN(s) || isNaN(e)) return null;
    return Math.round((e - s) / 60000);
  } catch {
    return null;
  }
}

function buildDetailDTO(attempt, quiz) {
  const answersByQ = new Map();
  for (const a of attempt.answers || []) {
    const qid = asNumberOrLong(a.questionId);
    const selectedUnique = Array.from(new Set((a.selectedOptionIds || []).map(asNumberOrLong)));
    answersByQ.set(qid, selectedUnique);
  }

  // Determine displayed question order from the attempt record, preferring displayedQuestions if present
  // 1) attempt.displayedQuestions may be a JSON string or an array of {questionId, displayOrder|originalOrder}
  // 2) fallback to attempt.displayOrder (legacy array of qids)
  // 3) fallback to answered questions order (older attempts)
  let displayOrderQids = [];
  if (attempt.displayedQuestions) {
    let dq = attempt.displayedQuestions;
    if (typeof dq === 'string') {
      try { dq = JSON.parse(dq); } catch (_) { dq = []; }
    }
    if (Array.isArray(dq)) {
      const normalized = dq
        .map(item => {
          if (item && typeof item === 'object') {
            const qid = asNumberOrLong(item.questionId);
            const order = asNumberOrLong(item.displayOrder ?? item.originalOrder ?? 0);
            return qid != null ? { qid, order } : null;
          }
          const qid = asNumberOrLong(item);
          return qid != null ? { qid, order: 0 } : null;
        })
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      displayOrderQids = normalized.map(x => x.qid);
    }
  }

  if (!displayOrderQids.length) {
    if (Array.isArray(attempt.displayOrder)) {
      displayOrderQids = attempt.displayOrder.map(asNumberOrLong);
    } else {
      displayOrderQids = [];
    }
  }

  // Fallback: if displayOrder is missing/empty (older attempts), infer from answered questions order
  if (!displayOrderQids.length) {
    const answeredOrder = Array.from(new Set((attempt.answers || []).map(a => asNumberOrLong(a.questionId)).filter(v => v != null)));
    displayOrderQids = answeredOrder;
  }

  const qById = new Map((quiz.questions || []).map(q => [asNumberOrLong(q.id), q]));

  const questions = displayOrderQids
    .map((qid, idx) => {
      const q = qById.get(qid);
      if (!q) return null;
      const selected = answersByQ.get(qid) || [];
      const correctIds = (q.options || []).filter(o => o.correct).map(o => asNumberOrLong(o.id));
      const hasWrongSelected = selected.some(id => !correctIds.includes(id));
      const isCorrect = !hasWrongSelected && selected.length === correctIds.length && selected.every(id => correctIds.includes(id));

      return {
        index: idx + 1,
        questionId: qid,
        questionText: q.questionText,
        imageUrl: q.imageUrl || null,
        points: q.points ?? 1,
        difficulty: q.difficulty || null,
        topic: q.topic || null,
        subject: q.subject || quiz.subject || null,
        options: (q.options || []).map(o => {
          const oid = asNumberOrLong(o.id);
          return {
            id: oid,
            text: o.optionText,
            isCorrect: !!o.correct,
            isSelected: selected.includes(oid),
          };
        }),
        isCorrect,
        selectedOptionIds: selected,
        correctOptionIds: correctIds,
      };
    })
    .filter(Boolean);

  const percentage = (attempt.totalMarks && attempt.totalMarks > 0)
    ? Math.round((attempt.marksObtained / attempt.totalMarks) * 10000) / 100
    : null;

  return {
    summary: {
      quizId: asNumberOrLong(quiz.quizId),
      quizName: quiz.quizName,
      quizCode: quiz.quizCode,
      subject: quiz.subject,
      subjectCode: quiz.subjectCode,
      course: quiz.course,
      instructorName: quiz.instructorName,
      academicYear: quiz.academicYear,
      courseYear: quiz.courseYear,
      numDisplayedQuestions: quiz.numDisplayedQuestions ?? null,
      student: {
        name: attempt.studentName,
        email: attempt.studentEmail,
        enrollmentNumber: attempt.enrollmentNumber,
        section: attempt.section,
      },
      timing: {
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        durationMinutes: minutesBetween(attempt.startTime, attempt.endTime),
      },
      scoring: {
        marksObtained: attempt.marksObtained,
        totalMarks: attempt.totalMarks,
        percentage,
        // Difficulty-wise breakdown (nullable to be backward compatible)
        easyCorrect: attempt.easyQuestionsCorrect ?? null,
        mediumCorrect: attempt.mediumQuestionsCorrect ?? null,
        highCorrect: attempt.highQuestionsCorrect ?? null,
        easyTotal: quiz.numEasyQuestions ?? null,
        mediumTotal: quiz.numMediumQuestions ?? null,
        highTotal: quiz.numHighQuestions ?? null,
      },
      meta: {
        systemName: attempt.systemName,
        fullScreenFaults: attempt.fullScreenFaults,
        status: attempt.status,
        showDetailedResult: typeof quiz.showDetailedResult === 'boolean' ? quiz.showDetailedResult : true,
      }
    },
    questions,
  };
}

async function main() {
  const app = express();
  // Allow all origins (same as emailService.cjs)
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  const attemptsCol = db.collection(COLL_ATTEMPTS);
  const quizzesCol = db.collection(COLL_QUIZZES);
  const userSyncCol = db.collection('user_sync');
  // Ensure index on emailLower for fast lookups and uniqueness
  try {
    await userSyncCol.createIndex({ emailLower: 1 }, { unique: true, name: 'emailLower_unique' });
  } catch (e) {
    console.warn('user_sync index ensure warning:', e?.message || e);
  }

  // GET /api/quizzes/suggest?query=... -> top 10 quiz suggestions by name (case-insensitive)
  app.get('/api/quizzes/suggest', async (req, res) => {
    try {
      const q = (req.query.query || '').toString().trim();
      if (q.length < 2) return res.json({ quizzes: [] });
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const results = await quizzesCol
        .find({ quizName: { $regex: regex } }, { projection: { quizId: 1, quizName: 1, quizCode: 1 }, limit: 10 })
        .limit(10)
        .toArray();
      res.json({ quizzes: results.map(r => ({ quizId: asNumberOrLong(r.quizId), quizName: r.quizName, quizCode: r.quizCode })) });
    } catch (err) {
      console.error('Suggest error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/auth/isTrusted -> check if an email exists in user_sync via emailLower
  app.post('/api/auth/isTrusted', async (req, res) => {
    try {
      const { email } = req.body || {};
      const e = (email || '').toString().trim();
      if (!e) return res.json({ isTrusted: false });
      let doc = await userSyncCol.findOne({ emailLower: toLowerSafe(e) });
      if (!doc) {
        // fallback for older records without emailLower
        const regex = new RegExp(`^${escapeRegex(e)}$`, 'i');
        doc = await userSyncCol.findOne({ email: { $regex: regex } });
      }
      res.json({ isTrusted: !!doc });
    } catch (err) {
      console.error('isTrusted error:', err);
      res.status(500).json({ isTrusted: false });
    }
  });

  // POST /api/results/searchByQuiz -> instructor view: validate password unless trusted and list attempts for quizId
  app.post('/api/results/searchByQuiz', async (req, res) => {
    try {
      const { quizId: quizIdRaw, quizName, password, email } = req.body || {};

      let quiz = null;
      if (quizIdRaw != null) {
        const qid = asNumberOrLong(quizIdRaw);
        quiz = await quizzesCol.findOne({ quizId: qid });
      } else if (quizName) {
        const name = quizName.toString().trim();
        const matches = await quizzesCol.find({ quizName: name }).limit(2).toArray();
        if (matches.length === 0) {
          return res.status(404).json({ error: 'Quiz not found' });
        }
        if (matches.length > 1) {
          return res.status(400).json({ error: 'Multiple quizzes found with the same name. Please select from suggestions to disambiguate.' });
        }
        quiz = matches[0];
      } else {
        return res.status(400).json({ error: 'quizId or quizName is required' });
      }

      if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

      // Determine trust based on provided email existing in user_sync (emailLower)
      let isTrusted = false;
      const e = (email || '').toString().trim();
      if (e) {
        try {
          let found = await userSyncCol.findOne({ emailLower: toLowerSafe(e) });
          if (!found) {
            const regex = new RegExp(`^${escapeRegex(e)}$`, 'i');
            found = await userSyncCol.findOne({ email: { $regex: regex } });
          }
          isTrusted = !!found;
        } catch (_) { /* ignore */ }
      }

      if (!isTrusted) {
        // Password check with normalization to avoid trivial mismatches (trim/case/format)
        const normalizePwd = (p) => (p == null ? '' : String(p))
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 6);

        if (!password || (typeof password !== 'string')) {
          return res.status(400).json({ error: 'password is required' });
        }
        const storedPwdNorm = normalizePwd(quiz.password);
        const enteredPwdNorm = normalizePwd(password);
        if (!storedPwdNorm || storedPwdNorm !== enteredPwdNorm) {
          return res.status(401).json({ error: 'Invalid password' });
        }
      }

      const qid = asNumberOrLong(quiz.quizId);
      const attempts = await attemptsCol.find({ quizId: qid }).toArray();

      if (!attempts.length) return res.json({ results: [] });

      // Dedupe latest per enrollmentNumber
      const latestByEnroll = new Map();
      for (const a of attempts) {
        const key = (a.enrollmentNumber || '').toString();
        const prev = latestByEnroll.get(key);
        const t = new Date(a.endTime || a.startTime || 0).getTime();
        const pt = prev ? new Date(prev.endTime || prev.startTime || 0).getTime() : -Infinity;
        if (!prev || t >= pt) latestByEnroll.set(key, a);
      }

      const latestAttempts = Array.from(latestByEnroll.values());

      const results = latestAttempts.map(a => {
        const durationMinutes = minutesBetween(a.startTime, a.endTime);
        return {
          _id: a._id?.toString?.() || null,
          attemptId: asNumberOrLong(a.attemptId),
          quizId: qid,
          quizName: quiz.quizName || null,
          quizCode: quiz.quizCode || null,
          subject: quiz.subject || null,
          numDisplayedQuestions: quiz.numDisplayedQuestions ?? null,
          instructorName: quiz.instructorName || null,
          course: quiz.course || null,
          startTime: a.startTime,
          endTime: a.endTime,
          durationMinutes,
          marksObtained: a.marksObtained,
          totalMarks: a.totalMarks,
          status: a.status,
          // extra identity fields (not used in current table but useful)
          studentName: a.studentName || null,
          studentEmail: a.studentEmail || null,
          enrollmentNumber: a.enrollmentNumber || null,
        };
      });

      res.json({ results });
    } catch (err) {
      console.error('searchByQuiz error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/results/search -> list attempts across quizzes
  app.post('/api/results/search', async (req, res) => {
    try {
      const { enrollmentNumber, email } = req.body || {};
      if (!enrollmentNumber || !email) {
        return res.status(400).json({ error: 'enrollmentNumber and email are required' });
      }
      const emailLower = toLowerSafe(email);

      // Case-insensitive email match, exact enrollmentNumber match
      const cursor = attemptsCol.find({
        enrollmentNumber: enrollmentNumber.toString(),
        studentEmail: { $regex: `^${emailLower}$`, $options: 'i' },
      });
      const attempts = await cursor.toArray();

      if (!attempts.length) return res.json({ results: [] });

      // Deduplicate by quizId: keep latest attempt per quiz (by endTime, fallback startTime)
      const latestByQuiz = new Map();
      for (const a of attempts) {
        const qid = asNumberOrLong(a.quizId);
        const prev = latestByQuiz.get(qid);
        const t = new Date(a.endTime || a.startTime || 0).getTime();
        const pt = prev ? new Date(prev.endTime || prev.startTime || 0).getTime() : -Infinity;
        if (!prev || t >= pt) latestByQuiz.set(qid, a);
      }
      const latestAttempts = Array.from(latestByQuiz.values());

      // Load related quizzes
      const quizIds = Array.from(new Set(latestAttempts.map(a => asNumberOrLong(a.quizId))));
      const quizzes = await quizzesCol.find({ quizId: { $in: quizIds } }).toArray();
      const quizById = new Map(quizzes.map(q => [asNumberOrLong(q.quizId), q]));

      const results = latestAttempts.map(a => {
        const quiz = quizById.get(asNumberOrLong(a.quizId));
        const durationMinutes = minutesBetween(a.startTime, a.endTime);
        return {
          _id: a._id?.toString?.() || null,
          attemptId: asNumberOrLong(a.attemptId),
          quizId: asNumberOrLong(a.quizId),
          quizName: quiz?.quizName || null,
          quizCode: quiz?.quizCode || null,
          subject: quiz?.subject || null,
          numDisplayedQuestions: quiz?.numDisplayedQuestions ?? null,
          instructorName: quiz?.instructorName || null,
          course: quiz?.course || null,
          startTime: a.startTime,
          endTime: a.endTime,
          durationMinutes,
          marksObtained: a.marksObtained,
          totalMarks: a.totalMarks,
          status: a.status,
        };
      });

      res.json({ results });
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/results/:attemptId -> detailed result for a single attempt
  app.get('/api/results/:attemptId', async (req, res) => {
    try {
      const attemptIdRaw = req.params.attemptId;
      const attemptId = Number(attemptIdRaw);
      if (Number.isNaN(attemptId)) {
        return res.status(400).json({ error: 'attemptId must be a number' });
      }
      // attemptId may be stored as Number, Long, or String depending on data history
      const candidates = [attemptId];
      try { candidates.push(Long.fromNumber(attemptId)); } catch (_) {}
      candidates.push(attemptIdRaw);

      const attempt = await attemptsCol.findOne({ attemptId: { $in: candidates } });
      if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

      const quiz = await quizzesCol.findOne({ quizId: asNumberOrLong(attempt.quizId) });
      if (!quiz) return res.status(404).json({ error: 'Related quiz not found' });

      const dto = buildDetailDTO(attempt, quiz);
      res.json(dto);
    } catch (err) {
      console.error('Detail error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.listen(PORT, () => {
    console.log(`Results service running on port ${PORT}`);
  });
}

main().catch(err => {
  console.error('Fatal start error:', err);
  process.exit(1);
});
