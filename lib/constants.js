export const HttpCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SE: 503,
};

export const LIMIT_JSON = 5000;

export const CLOUD_GENDER_FOLDER = 'Gender_images';
export const CLOUD_CATEGORY_FOLDER = 'Category_images';
export const CLOUD_PRODUCT_FOLDER = 'Product_files';
export const CLOUD_AVATAR_FOLDER = 'Avatars';

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_PRODUCT_IMAGES = 10;
export const BCRYPT_SALT_ROUNDS = 6;

export const Role = {
  ADMIN: 'administrator',
  USER: 'user',
};
