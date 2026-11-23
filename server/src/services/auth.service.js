const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpiresIn, bcryptSaltRounds } = require('../config/env');

// Fields safe to return to clients — never include the password hash
const publicUserSelect = { id: true, name: true, email: true, createdAt: true };

// Compared against when the email is unknown so login takes similar time
// whether or not the account exists (avoids user enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync('sweety-timing-guard', bcryptSaltRounds);

function signToken(userId) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: jwtExpiresIn, algorithm: 'HS256' });
}

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new AppError(409, 'An account with this email already exists.', 'email');

  const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
  try {
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
      select: publicUserSelect,
    });
    return { user, token: signToken(user.id) };
  } catch (err) {
    // Two simultaneous registrations with the same email
    if (err.code === 'P2002') throw new AppError(409, 'An account with this email already exists.', 'email');
    throw err;
  }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordMatches) throw new AppError(401, 'Invalid email or password.');

  const { password: _hash, ...publicUser } = user;
  return { user: publicUser, token: signToken(user.id) };
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
}

module.exports = { register, login, getUserById, verifyToken };
