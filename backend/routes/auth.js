import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import {
  hashPassword,
  comparePassword,
  generateToken,
  validateEmail,
  validatePassword,
} from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Passport Local Strategy
passport.use(
  new LocalStrategy.Strategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await router.db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Passport Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy.Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await router.db.get('SELECT * FROM users WHERE google_id = ?', [profile.id]);

          if (!user) {
            // Create new user from Google profile
            const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;
            const username = profile.displayName?.replace(/\s+/g, '_').toLowerCase() || profile.id;

            const result = await router.db.run(
              `INSERT INTO users (google_id, email, username, full_name, profile_picture, points, level)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [profile.id, email, username, profile.displayName, profile.photos?.[0]?.value, 0, 1]
            );

            user = await router.db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await router.db.get('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await req.db.get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const result = await req.db.run(
      `INSERT INTO users (username, email, password, full_name, points, level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, fullName || username, 0, 1]
    );

    const user = await req.db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);

    const token = generateToken(user.id, user.email, user.username, user.role);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        points: user.points,
        level: user.level,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await req.db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await comparePassword(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email, user.username, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        points: user.points,
        level: user.level,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    const token = generateToken(req.user.id, req.user.email, req.user.username);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// Verify Token
router.get('/verify', authenticate, async (req, res) => {
  try {
    const user = await req.db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        profilePicture: user.profile_picture,
        role: user.role,
        points: user.points,
        level: user.level,
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export const registerRoutes = router;
