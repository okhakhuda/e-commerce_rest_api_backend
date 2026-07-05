import repositoryUsers from '../repository/user.js';
import jwt from 'jsonwebtoken';
import { HttpCode } from '../lib/constants.js';

const unauthorizedResponse = res =>
  res.status(HttpCode.UNAUTHORIZED).json({
    status: 'error',
    code: HttpCode.UNAUTHORIZED,
    message: 'Not authorized',
  });

const guard = async (req, res, next) => {
  try {
    // Support both standard Bearer header and the non-standard body.headers pattern
    const authHeader = req.get('Authorization') ?? req.body?.headers?.Authorization;
    const token = authHeader?.split(' ')[1];
    console.log('token:', token);

    if (!token) return unauthorizedResponse(res);

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await repositoryUsers.findById(payload.id);
    if (!user || user.token !== token) return unauthorizedResponse(res);

    req.user = user;
    next();
  } catch {
    // jwt.verify throws on invalid/expired tokens
    return unauthorizedResponse(res);
  }
};

export default guard;
