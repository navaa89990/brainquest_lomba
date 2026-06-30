import express from 'express';
import { authenticate, ensureAdmin } from '../middleware/auth.js';
import { hashPassword } from '../utils/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await req.db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      profilePicture: user.profile_picture,
      points: user.points,
      level: user.level,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { fullName, profilePicture } = req.body;

    const result = await req.db.run(
      'UPDATE users SET full_name = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [fullName, profilePicture, req.user.id]
    );

    const user = await req.db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        profilePicture: user.profile_picture,
        points: user.points,
        level: user.level,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await req.db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    // For Google OAuth users, password won't be set
    if (!user.password) {
      return res.status(400).json({ error: 'Cannot change password for OAuth users' });
    }

    const { comparePassword } = await import('../utils/auth.js');
    const validPassword = await comparePassword(oldPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await req.db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;

    const users = await req.db.all(
      `SELECT id, username, full_name, points, level, profile_picture, role, created_at
       FROM users
       ORDER BY points DESC, level DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const total = await req.db.get('SELECT COUNT(*) as count FROM users');

    res.json({
      leaderboard: users.map((user, index) => ({
        rank: offset + index + 1,
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        points: user.points,
        level: user.level,
        profilePicture: user.profile_picture,
      })),
      total: total.count,
      limit,
      offset,
    });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Admin: list all users
router.get('/all', authenticate, ensureAdmin, async (req, res) => {
  try {
    const users = await req.db.all(
      `SELECT id, username, email, full_name, role, points, level, profile_picture, created_at
       FROM users
       ORDER BY role DESC, points DESC, level DESC`
    );

    res.json({
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        points: user.points,
        level: user.level,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
      })),
    });
  } catch (err) {
    console.error('Get admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user rank
router.get('/rank/:userId', async (req, res) => {
  try {
    const user = await req.db.get('SELECT points, level FROM users WHERE id = ?', [
      req.params.userId,
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rank = await req.db.get(
      `SELECT COUNT(*) as rank FROM users WHERE points > ? OR (points = ? AND level > ?)`,
      [user.points, user.points, user.level]
    );

    res.json({
      userId: req.params.userId,
      rank: rank.rank + 1,
      points: user.points,
      level: user.level,
    });
  } catch (err) {
    console.error('Get rank error:', err);
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

export const userRoutes = router;
