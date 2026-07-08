import express from 'express';
import { optional } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optional, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    const category = req.query.category;

    let query = 'SELECT * FROM materials';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const materials = await req.db.all(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM materials';
    const countParams = [];
    if (category) {
      countQuery += ' WHERE category = ?';
      countParams.push(category);
    }

    const total = await req.db.get(countQuery, countParams);

    let userStats = {};
    if (req.user) {
      const stats = await req.db.all(
        `SELECT material_id, COUNT(*) as attempts, AVG(score * 100 / total_questions) as averageScore
         FROM quiz_records
         WHERE user_id = ?
         GROUP BY material_id`,
        [req.user.id]
      );

      stats.forEach((stat) => {
        userStats[stat.material_id] = stat;
      });
    }

    res.json({
      materials: materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        content: m.content,
        category: m.category,
        difficultyLevel: m.difficulty_level,
        status: m.status,
        img: m.img,
        parent_id: m.parent_id,
        userStats: userStats[m.id],
      })),
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit),
      },
    });
  } catch (err) {
    console.error('Get materials error:', err);
    res.status(500).json({ error: 'Failed to get materials' });
  }
});

router.post('/', optional, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });
    }

    const { title, content, category, status, parent_id } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan konten materi harus diisi' });
    }

    const result = await req.db.run(
      'INSERT INTO materials (title, content, category, status, parent_id) VALUES (?, ?, ?, ?, ?)',
      [title, content, category || 'Umum', status || 'Gratis', parent_id || null]
    );

    res.status(201).json({
      id: result.lastID,
      material: {
        id: result.lastID,
        title,
        content,
        category,
        status,
        parent_id,
      },
      message: 'Materi berhasil ditambahkan',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan materi baru' });
  }
});

router.put('/:materialId', optional, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });
    }

    const { title, content, category, status, parent_id } = req.body;

    await req.db.run(
      'UPDATE materials SET title = ?, content = ?, category = ?, status = ?, parent_id = ? WHERE id = ?',
      [title, content, category, status, parent_id || null, req.params.materialId]
    );

    res.json({ message: 'Materi berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui materi' });
  }
});

router.delete('/:materialId', optional, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });
    }

    await req.db.run('DELETE FROM questions WHERE material_id = ?', [req.params.materialId]);
    await req.db.run('DELETE FROM materials WHERE id = ?', [req.params.materialId]);

    res.json({ message: 'Materi beserta kuis berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus materi' });
  }
});

router.post('/:materialId/questions', optional, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });
    }

    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;

    if (!question_text || !option_a || !option_b || !option_c || !correct_answer) {
      return res.status(400).json({ error: 'Pertanyaan, pilihan A-C, dan jawaban benar harus diisi' });
    }

    const result = await req.db.run(
      'INSERT INTO questions (material_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.materialId, question_text, option_a, option_b, option_c, option_d || null, correct_answer]
    );

    res.status(201).json({ id: result.lastID, message: 'Pertanyaan kuis berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan pertanyaan kuis' });
  }
});

router.put('/questions/:questionId', optional, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });
    }

    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;

    await req.db.run(
      'UPDATE questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ? WHERE id = ?',
      [question_text, option_a, option_b, option_c, option_d || null, correct_answer, req.params.questionId]
    );

    res.json({ message: 'Pertanyaan kuis berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui pertanyaan kuis' });
  }
});

router.get('/:materialId', async (req, res) => {
  try {
    const material = await req.db.get('SELECT * FROM materials WHERE id = ?', [
      req.params.materialId,
    ]);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const questions = await req.db.all(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM questions WHERE material_id = ?',
      [req.params.materialId]
    );

    res.json({
      id: material.id,
      title: material.title,
      description: material.description,
      category: material.category,
      difficultyLevel: material.difficulty_level,
      content: material.content,
      status: material.status,
      img: material.img,
      parent_id: material.parent_id,
      questions,
    });
  } catch (err) {
    console.error('Get material error:', err);
    res.status(500).json({ error: 'Failed to get material' });
  }
});

router.post('/:materialId/verify', async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }

    const correctAnswers = await req.db.all(
      'SELECT id, correct_answer, explanation FROM questions WHERE material_id = ?',
      [req.params.materialId]
    );

    const answerMap = {};
    correctAnswers.forEach((q) => {
      answerMap[q.id] = { correct_answer: q.correct_answer, explanation: q.explanation };
    });

    let score = 0;
    const results = answers.map((ans) => {
      const isCorrect = answerMap[ans.questionId]?.correct_answer === ans.answer;
      if (isCorrect) score++;

      return {
        questionId: ans.questionId,
        isCorrect,
        correctAnswer: answerMap[ans.questionId]?.correct_answer,
        explanation: answerMap[ans.questionId]?.explanation,
      };
    });

    res.json({
      score,
      totalQuestions: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      results,
    });
  } catch (err) {
    console.error('Verify answers error:', err);
    res.status(500).json({ error: 'Failed to verify answers' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await req.db.all(
      'SELECT DISTINCT category FROM materials WHERE category IS NOT NULL ORDER BY category'
    );

    res.json({
      categories: categories.map((c) => c.category),
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

export const materialRoutes = router;