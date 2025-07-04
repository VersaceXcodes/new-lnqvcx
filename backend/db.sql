-- Create Users Table
CREATE TABLE users (
  user_uid TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create BlogPosts Table
CREATE TABLE blog_posts (
  post_uid TEXT PRIMARY KEY,
  author_uid TEXT NOT NULL REFERENCES users(user_uid),
  title TEXT NOT NULL,
  body_content TEXT NOT NULL,
  tags TEXT,
  categories TEXT,
  status TEXT NOT NULL,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

-- Create Comments Table
CREATE TABLE comments (
  comment_uid TEXT PRIMARY KEY,
  post_uid TEXT NOT NULL REFERENCES blog_posts(post_uid),
  commenter_uid TEXT NOT NULL REFERENCES users(user_uid),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Likes Table
CREATE TABLE likes (
  like_uid TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL REFERENCES users(user_uid),
  entity_type TEXT NOT NULL,
  entity_uid TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Admins Table
CREATE TABLE admins (
  admin_uid TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL REFERENCES users(user_uid),
  role TEXT NOT NULL
);

-- Create Reports Table
CREATE TABLE reports (
  report_uid TEXT PRIMARY KEY,
  reporter_uid TEXT NOT NULL REFERENCES users(user_uid),
  entity_type TEXT NOT NULL,
  entity_uid TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Notifications Table
CREATE TABLE notifications (
  notification_uid TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL REFERENCES users(user_uid),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Feedback Table
CREATE TABLE feedback (
  feedback_uid TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL REFERENCES users(user_uid),
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Seed Data for Users
INSERT INTO users (user_uid, email, password_hash, username, bio, profile_picture_url)
VALUES
  ('user1', 'user1@example.com', 'hash1', 'userone', 'Bio of user one', 'https://picsum.photos/seed/pic1/200'),
  ('user2', 'user2@example.com', 'hash2', 'usertwo', 'Bio of user two', 'https://picsum.photos/seed/pic2/200'),
  ('user3', 'user3@example.com', 'hash3', 'userthree', NULL, 'https://picsum.photos/seed/pic3/200');

-- Seed Data for BlogPosts
INSERT INTO blog_posts (post_uid, author_uid, title, body_content, tags, categories, status, published_at)
VALUES
  ('post1', 'user1', 'First Post', 'This is the content of the first post', 'intro,beginner', 'general,tech', 'published', '2023-01-01 10:00:00'),
  ('post2', 'user2', 'Second Post', 'Content of the second post', 'advanced,tech', 'tech', 'draft', NULL),
  ('post3', 'user3', 'Third Post', 'This is the third post content', NULL, 'life', 'scheduled', '2023-11-01 12:00:00');

-- Seed Data for Comments
INSERT INTO comments (comment_uid, post_uid, commenter_uid, comment_text)
VALUES
  ('comment1', 'post1', 'user2', 'Great first post!'),
  ('comment2', 'post1', 'user3', 'Very informative, thanks.'),
  ('comment3', 'post2', 'user1', 'Looking forward to it.');

-- Seed Data for Likes
INSERT INTO likes (like_uid, user_uid, entity_type, entity_uid)
VALUES
  ('like1', 'user1', 'post', 'post1'),
  ('like2', 'user2', 'comment', 'comment1'),
  ('like3', 'user3', 'post', 'post2');

-- Seed Data for Admins
INSERT INTO admins (admin_uid, user_uid, role)
VALUES
  ('admin1', 'user1', 'superadmin');

-- Seed Data for Reports
INSERT INTO reports (report_uid, reporter_uid, entity_type, entity_uid, reason, status)
VALUES
  ('report1', 'user2', 'post', 'post1', 'Inappropriate content', 'pending'),
  ('report2', 'user3', 'comment', 'comment2', 'Spam', 'reviewed');

-- Seed Data for Notifications
INSERT INTO notifications (notification_uid, user_uid, message, is_read)
VALUES
  ('notif1', 'user1', 'You have a new follower!', FALSE),
  ('notif2', 'user2', 'Your comment got a like!', TRUE);

-- Seed Data for Feedback
INSERT INTO feedback (feedback_uid, user_uid, feedback_text)
VALUES
  ('feedback1', 'user2', 'Loving the platform!'),
  ('feedback2', 'user3', 'Could use some new features.');