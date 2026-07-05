import { randomBytes } from 'crypto';

export const generateCode = (length = 6) =>
  randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
