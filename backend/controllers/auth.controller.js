import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export async function signup(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'password must be at least 8 characters' });
  }
  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  const token = signToken(user.id);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function me(req, res) {
  const user = await User.findByPk(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      unreadNotifications: user.unreadNotifications
    }
  });
}
