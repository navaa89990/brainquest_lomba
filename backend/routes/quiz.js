import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Submit quiz score
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { materialId, score, totalQuestions, timeSpent } = req.body;

    if (!materialId || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'Material ID, score, and total questions are required' });
    }

    // Calculate points earned (1 point per correct answer)
    const pointsEarned = score;

    // Update user points and level
    const user = await req.db.get('SELECT points, level FROM users WHERE id = ?', [req.user.id]);
    let newLevel = user.level;

    // Level up every 100 points
    if (user.points + pointsEarned >= newLevel * 100) {
      newLevel = Math.floor((user.points + pointsEarned) / 100) + 1;
    }

    await req.db.run(
      'UPDATE users SET points = points + ?, level = ? WHERE id = ?',
      [pointsEarned, newLevel, req.user.id]
    );

    // Record the quiz
    const result = await req.db.run(
      `INSERT INTO quiz_records (user_id, material_id, score, total_questions, time_spent)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, materialId, score, totalQuestions, timeSpent]
    );

    const updatedUser = await req.db.get('SELECT points, level FROM users WHERE id = ?', [
      req.user.id,
    ]);

    res.json({
      message: 'Quiz submitted successfully',
      pointsEarned,
      userPoints: updatedUser.points,
      userLevel: updatedUser.level,
      leveledUp: newLevel > user.level,
      recordId: result.lastID,
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user quiz history
router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const records = await req.db.all(
      `SELECT r.id, r.material_id, r.score, r.total_questions, r.time_spent, r.completed_at, m.title
       FROM quiz_records r
       LEFT JOIN materials m ON r.material_id = m.id
       WHERE r.user_id = ?
       ORDER BY r.completed_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    const total = await req.db.get(
      'SELECT COUNT(*) as count FROM quiz_records WHERE user_id = ?',
      [req.user.id]
    );

    const stats = await req.db.get(
      `SELECT COUNT(*) as totalQuizzes, AVG(score * 100 / total_questions) as averageScore
       FROM quiz_records WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      records,
      stats: {
        totalQuizzes: stats.totalQuizzes,
        averageScore: Math.round(stats.averageScore || 0),
      },
      total: total.count,
      limit,
      offset,
    });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to get quiz history' });
  }
});

// Get quiz statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await req.db.all(
      `SELECT m.id, m.title, COUNT(*) as attempts, AVG(r.score * 100 / r.total_questions) as averageScore
       FROM quiz_records r
       JOIN materials m ON r.material_id = m.id
       WHERE r.user_id = ?
       GROUP BY m.id
       ORDER BY m.title`,
      [req.user.id]
    );

    res.json({ stats });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to get quiz statistics' });
  }
});

// Get arena progress for current user
router.get('/arena', authenticate, async (req, res) => {
  try {
    const progress = await req.db.all(
      'SELECT lesson_id, level_id, completed, completed_at FROM arena_progress WHERE user_id = ? ORDER BY lesson_id, level_id',
      [req.user.id]
    );

    res.json({
      progress: progress.map((item) => ({
        lessonId: item.lesson_id,
        levelId: item.level_id,
        completed: Boolean(item.completed),
        completedAt: item.completed_at,
      })),
    });
  } catch (err) {
    console.error('Get arena progress error:', err);
    res.status(500).json({ error: 'Failed to get arena progress' });
  }
});

// Update arena progress for current user
router.post('/arena/progress', authenticate, async (req, res) => {
  try {
    const { lessonId, levelId, completed = false } = req.body;

    if (!lessonId || levelId === undefined) {
      return res.status(400).json({ error: 'Lesson ID and level ID are required' });
    }

    const completedAt = completed ? new Date().toISOString() : null;

    await req.db.run(
      `INSERT INTO arena_progress (user_id, lesson_id, level_id, completed, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, lesson_id, level_id) DO UPDATE SET
         completed = excluded.completed,
         completed_at = excluded.completed_at,
         updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, lessonId, levelId, completed ? 1 : 0, completedAt]
    );

    const progress = await req.db.all(
      'SELECT lesson_id, level_id, completed, completed_at FROM arena_progress WHERE user_id = ? ORDER BY lesson_id, level_id',
      [req.user.id]
    );

    res.json({
      message: 'Arena progress updated successfully',
      progress: progress.map((item) => ({
        lessonId: item.lesson_id,
        levelId: item.level_id,
        completed: Boolean(item.completed),
        completedAt: item.completed_at,
      })),
    });
  } catch (err) {
    console.error('Update arena progress error:', err);
    res.status(500).json({ error: 'Failed to update arena progress' });
  }
});

export const quizRoutes = router;
