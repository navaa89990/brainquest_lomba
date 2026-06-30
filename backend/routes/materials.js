import express from 'express';
import { optional } from '../middleware/auth.js';

const router = express.Router();

// Get all materials
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

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM materials';
    const countParams = [];
    if (category) {
      countQuery += ' WHERE category = ?';
      countParams.push(category);
    }

    const total = await req.db.get(countQuery, countParams);

    // If user is logged in, get their quiz attempts for each material
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

// Get single material with questions
router.get('/:materialId', async (req, res) => {
  try {
    const material = await req.db.get('SELECT * FROM materials WHERE id = ?', [
      req.params.materialId,
    ]);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const questions = await req.db.all(
      'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE material_id = ?',
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

// Verify quiz answers
router.post('/:materialId/verify', async (req, res) => {
  try {
    const { answers } = req.body; // answers should be array of { questionId, answer }

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

// Get categories
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
