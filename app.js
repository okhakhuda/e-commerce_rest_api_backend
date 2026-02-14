import express from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { HttpCode, LIMIT_JSON } from './lib/constants.js';

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
app.use(express.static(process.env.UPLOAD_DIR));

app.use('/api/gendercategories', genderCategotriesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', orderRouter);

app.use((req, res) => {
  res
    .status(HttpCode.NOT_FOUND)
    .json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  const statusCode = err.status || HttpCode.INTERNAL_SERVER_ERROR;
  const status = statusCode === HttpCode.INTERNAL_SERVER_ERROR ? 'fail' : 'error';
  res.status().json({
    status: status,
    code: statusCode,
    message: err.message,
  });
});

export default app;
