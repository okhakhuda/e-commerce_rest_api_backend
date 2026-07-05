import express from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { HttpCode, LIMIT_JSON } from './lib/constants.js';
import AppError from './lib/AppError.js';

import genderCategotriesRouter from './routes/api/genderCategory/index.js';
import categoriesRouter from './routes/api/category/index.js';
import productsRouter from './routes/api/product/index.js';
import authRouter from './routes/api/auth/index.js';
import usersRouter from './routes/api/user/index.js';
import orderRouter from './routes/api/order/index.js';

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(helmet());
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json({ limit: LIMIT_JSON }));
// app.use(express.static(process.env.UPLOAD_DIR));

app.use('/api/gendercategories', genderCategotriesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', orderRouter);

app.use((_req, res) => {
  res.status(HttpCode.NOT_FOUND).json({
    status: 'error',
    code: HttpCode.NOT_FOUND,
    message: 'Route not found',
  });
});

app.use((err, _req, res, _next) => {
  // Mongoose validation / cast errors
  console.log('💥 Error:', err);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message: messages.join('; '),
    });
  }
  if (err.name === 'CastError') {
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message: `Invalid value for field "${err.path}": ${err.value}`,
    });
  }
  // Mongoose unique index violation
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return res.status(HttpCode.CONFLICT).json({
      status: 'error',
      code: HttpCode.CONFLICT,
      message: `Duplicate value for ${field}`,
    });
  }

  const statusCode = err.statusCode ?? err.status ?? HttpCode.INTERNAL_SERVER_ERROR;
  const isOperational = err instanceof AppError;

  if (!isOperational) {
    console.error('💥 Unexpected error:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: isOperational ? err.message : 'Internal server error',
  });
});

export default app;
