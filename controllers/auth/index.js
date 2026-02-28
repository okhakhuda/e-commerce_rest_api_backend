import authService from '../../service/auth/index.js';
import { EmailService, SenderNodemailer } from '../../service/email/index.js';
import { HttpCode } from '../../lib/constants.js';
import Order from '../../model/orders.js';
import User from '../../model/user.js';
import repositoryOrder from '../../repository/order.js';

const registration = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    // console.log('req.body', req.body);
    const isUserExist = await authService.isUserExist(email, phone);
    // console.log('isUserExist', isUserExist);
    if (isUserExist) {
      res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        message: '!!!! Користувач з таким телефоном або email вже існує',
      });
    }

    const userData = await authService.create(req.body);
    // console.log('userData', userData);

    if (userData) {
      const token = authService.getToken(userData);
      await authService.setToken(userData.id, token);

      const guestOrders = await Order.find({
        'user.phone': phone,
        isGuest: true,
        userId: null, // Щоб не взяти вже прив’язані замовлення
      });
      // console.log('guestOrders', guestOrders);
      if (guestOrders.length > 0) {
        // Прив’язуємо замовлення до користувача
        repositoryOrder.bindOrderByUserId(guestOrders, userData.id);
        // await Order.updateMany(
        //   { id: { $in: guestOrders.map(order => order.id) } },
        //   { $set: { userId: userData.id, isGuest: false } },
        // );
        // // Оновлюємо масив замовлень у користувача
        // await User.findByIdAndUpdate(userData.id, {
        //   $push: { orders: { $each: guestOrders.map(order => order.id) } },
        // });
      }

      const emailService = new EmailService(process.env.NODE_ENV, new SenderNodemailer());

      const isSend = await emailService.sendVerifyEmail(
        email,
        userData.firstName,
        userData.verificationToken,
      );

      delete userData.verificationToken;

      console.log('userData', userData);
      res.status(HttpCode.CREATED).json({
        status: 'success',
        code: HttpCode.CREATED,
        data: { ...userData, token: token, isSendEmailVerify: isSend },
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: 'Invalid data',
    });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.getUser(email, password);

  if (!user) {
    res.status(HttpCode.UNAUTHORIZED).json({
      status: 'error',
      code: HttpCode.UNAUTHORIZED,
      message: 'Invalid credentials',
    });
  } else {
    const token = authService.getToken(user);
    await authService.setToken(user.id, token);

    res.status(HttpCode.OK).json({ status: 'success', code: HttpCode.OK, data: { token } });
  }
};

const logout = async (req, res, next) => {
  await authService.setToken(req.user.id, null);
  res.status(HttpCode.NO_CONTENT).json({ status: 'success', code: HttpCode.OK, data: {} });
};

const currentUser = async (req, res, next) => {
  const { email, phone, firstName, lastName, avatarUrl, role, id } = req.user;

  const guestOrders = await Order.find({
    'user.phone': phone,
    isGuest: true,
    userId: null, // Щоб не взяти вже прив’язані замовлення
  });

  if (guestOrders.length > 0) {
    // Прив’язуємо замовлення до користувача
    repositoryOrder.bindOrderByUserId(guestOrders, id);
  }

  res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: { email, phone, firstName, lastName, avatarUrl, role, id },
  });
};

export { registration, login, logout, currentUser };
