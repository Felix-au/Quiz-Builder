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
      },
      meta: {
        systemName: attempt.systemName,
        fullScreenFaults: attempt.fullScreenFaults,
        status: attempt.status,
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
