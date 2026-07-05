import authService from '../../service/auth/index.js';
import { EmailService, SenderNodemailer } from '../../service/email/index.js';
import { HttpCode } from '../../lib/constants.js';
import Order from '../../model/orders.js';
import repositoryOrder from '../../repository/order.js';
import AppError from '../../lib/AppError.js';
import catchAsync from '../../lib/catchAsync.js';
import sendResponse from '../../lib/response.js';

const registration = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  const isUserExist = await authService.isUserExist(email, phone);
  if (isUserExist) {
    throw AppError.conflict('Користувач з таким телефоном або email вже існує');
  }

  const userData = await authService.create(req.body);
  const token = authService.getToken(userData);
  await authService.setToken(userData.id, token);

  // Bind any guest orders placed with the same phone before registration
  const guestOrders = await Order.find({ 'user.phone': phone, isGuest: true, userId: null });
  if (guestOrders.length > 0) {
    await repositoryOrder.bindOrderByUserId(guestOrders, userData.id);
  }

  const emailService = new EmailService(process.env.NODE_ENV, new SenderNodemailer());

  const isSendEmailVerify = await emailService.sendVerifyEmail(
    email,
    userData.firstName,
    userData.verificationToken,
  );

  delete userData.verificationToken;

  return sendResponse(res, HttpCode.CREATED, {
    data: { ...userData, token, isSendEmailVerify },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.getUser(email, password);

  if (!user) {
    throw AppError.unauthorized('Invalid credentials');
  }
  const token = authService.getToken(user);
  await authService.setToken(user.id, token);

  return sendResponse(res, HttpCode.OK, { data: { token } });
});

const logout = catchAsync(async (req, res, next) => {
  await authService.setToken(req.user.id, null);
  return sendResponse(res, HttpCode.NO_CONTENT, {});
});

const currentUser = catchAsync(async (req, res, next) => {
  const { email, phone, firstName, lastName, avatarUrl, role, id } = req.user;
  // console.log('currentUser', req.user);

  const guestOrders = await Order.find({
    'user.phone': phone,
    isGuest: true,
    userId: null,
  });

  if (guestOrders.length > 0) {
    await repositoryOrder.bindOrderByUserId(guestOrders, id);
  }

  return sendResponse(res, HttpCode.OK, {
    data: { email, phone, firstName, lastName, avatarUrl, role, id },
  });
});

export { registration, login, logout, currentUser };
