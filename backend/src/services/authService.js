/**
 * 认证服务 — 处理注册/登录业务逻辑
 * 负责数据校验、密码加密、JWT 签发、数据库操作
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const jwtConfig = require('../config/jwt');

const SALT_ROUNDS = 10;
const MAX_USERNAME_LENGTH = 50;

function normalizeUsername(username) {
  return String(username || '')
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * 用户注册
 */
async function register(username, password, confirmPassword) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    throw Object.assign(new Error('用户名不能为空'), { status: 400 });
  }
  if (normalizedUsername.length > MAX_USERNAME_LENGTH) {
    throw Object.assign(new Error('用户名不能超过 50 个字符'), { status: 400 });
  }
  if (!password || password === '') {
    throw Object.assign(new Error('密码不能为空'), { status: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error('密码长度不能少于 6 位'), { status: 400 });
  }
  if (password !== confirmPassword) {
    throw Object.assign(new Error('两次密码输入不一致'), { status: 400 });
  }

  const [rows] = await pool.query(
    'SELECT id FROM users WHERE username = ?',
    [normalizedUsername]
  );
  if (rows.length > 0) {
    throw Object.assign(new Error('用户名已存在'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await pool.query(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [normalizedUsername, passwordHash]
  );

  return { message: '注册成功' };
}

/**
 * 用户登录
 * @returns {object} { token, user: { id, username, role } }
 */
async function login(username, password) {
  const normalizedUsername = normalizeUsername(username);

  // 查询用户
  const [rows] = await pool.query(
    'SELECT id, username, nickname, avatar, password_hash, role FROM users WHERE username = ?',
    [normalizedUsername]
  );

  if (rows.length === 0) {
    throw Object.assign(new Error('用户名或密码错误'), { status: 401 });
  }

  const user = rows[0];

  // 对比密码
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('用户名或密码错误'), { status: 401 });
  }

  // 签发 JWT
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };
  const token = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
    },
  };
}

/**
 * 修改个人信息（用户名 + 密码）
 * @param {number} userId - 当前用户 ID
 * @param {string} [username] - 新用户名
 * @param {string} [password] - 新密码（可选）
 * @param {string} [confirmPassword] - 确认密码（填写密码时必填）
 * @returns {object} 更新后的用户信息（不含密码）
 */
async function updateProfile(userId, username, password, confirmPassword) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    throw Object.assign(new Error('用户名不能为空'), { status: 400 });
  }
  if (normalizedUsername.length > MAX_USERNAME_LENGTH) {
    throw Object.assign(new Error('用户名不能超过 50 个字符'), { status: 400 });
  }

  // 检查新用户名是否被其他用户占用
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE username = ? AND id != ?',
    [normalizedUsername, userId]
  );
  if (existing.length > 0) {
    throw Object.assign(new Error('用户名已被占用'), { status: 409 });
  }

  if (password) {
    if (password.length < 6) {
      throw Object.assign(new Error('密码长度不能少于 6 位'), { status: 400 });
    }
    if (password !== confirmPassword) {
      throw Object.assign(new Error('两次密码输入不一致'), { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET username = ?, password_hash = ? WHERE id = ?',
      [normalizedUsername, passwordHash, userId]
    );
  } else {
    await pool.query(
      'UPDATE users SET username = ? WHERE id = ?',
      [normalizedUsername, userId]
    );
  }

  const [rows] = await pool.query(
    'SELECT id, username, nickname, avatar, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  return { user: rows[0] };
}

module.exports = { register, login, updateProfile };
