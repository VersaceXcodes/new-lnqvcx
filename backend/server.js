import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

dotenv.config();
const { Pool } = pkg;

const {
  DATABASE_URL,
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGPORT = 5432,
  JWT_SECRET,
  PORT = 3000,
} = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false },
      }
);

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ESM workaround for __dirname
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Schema validation with Joi
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const blogPostSchema = Joi.object({
  title: Joi.string().required(),
  body_content: Joi.string().required(),
  tags: Joi.string().optional(),
  categories: Joi.string().optional(),
  status: Joi.string().valid('draft', 'published', 'scheduled').required(),
});

const commentSchema = Joi.object({
  post_uid: Joi.string().required(),
  comment_text: Joi.string().required(),
});

// Register User
app.post('/api/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { email, password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO users (user_uid, email, password_hash, username, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING user_uid',
      [uuidv4(), email, hashedPassword, username]
    );
    client.release();
    res.json({ success: true, message: 'User registered successfully', user_uid: result.rows[0].user_uid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { email, password } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();
  
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: 'Email not found' });
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = jwt.sign({ sub: user.user_uid }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ auth_token: accessToken, message: 'Login successful' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Blog Post
app.post('/api/blog_posts', authenticateToken, async (req, res) => {
  const { error } = blogPostSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { title, body_content, tags, categories, status } = req.body;
  const author_uid = req.user.sub;
  
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO blog_posts (post_uid, author_uid, title, body_content, tags, categories, status, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING post_uid',
      [author_uid, title, body_content, tags, categories, status]
    );
    client.release();
    
    res.json({ success: true, message: 'Blog post created successfully', post_uid: result.rows[0].post_uid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch Blog Posts
app.get('/api/blog_posts', async (req, res) => {
  const { tags, categories } = req.query;
  let query = 'SELECT * FROM blog_posts';
  const params = [];
  
  if (tags) {
    params.push(`%${tags}%`);
    query += ` WHERE tags ILIKE $${params.length}`;
  }
  
  if (categories) {
    params.push(`%${categories}%`);
    query += `${params.length > 1 ? ' AND' : ' WHERE'} categories ILIKE $${params.length}`;
  }

  try {
    const client = await pool.connect();
    const result = await client.query(query, params);
    client.release();
    res.json({ posts: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Comment on Post
app.post('/api/comments', authenticateToken, async (req, res) => {
  const { error } = commentSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { post_uid, comment_text } = req.body;
  const commenter_uid = req.user.sub;
  
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO comments (comment_uid, post_uid, commenter_uid, comment_text, created_at) VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP) RETURNING comment_uid',
      [post_uid, commenter_uid, comment_text]
    );
    client.release();
    res.json({ success: true, message: 'Comment added successfully', comment_uid: result.rows[0].comment_uid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});