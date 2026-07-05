import convert from '../convert.json' with { type: 'json' };
import AppError from './AppError.js';

export const slugify = text => {
  if (typeof text !== 'string' || !text.trim()) {
    throw AppError.badRequest('A non-empty "name"/"title" string is required to build a slug');
  }

  return text
    .trim()
    .replace(/[\s-]/g, '_')
    .toLowerCase()
    .split('')
    .map(char => convert[char] || char)
    .join('');
};
