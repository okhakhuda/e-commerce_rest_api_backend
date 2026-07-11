import repositoryOrder from '../../repository/order.js';
import { HttpCode } from '../../lib/constants.js';
import { sendTelegramNotification } from '../../service/telegram/index.js';
import catchAsync from '../../lib/catchAsync.js';
import sendResponse from '../../lib/response.js';

const addOrder = catchAsync(async (req, res) => {
  const { user, products, totalPrice, totalQuantity, address, userId = null } = req.body;

  const order = await repositoryOrder.addOrder({
    products: products.map(({ productId, size, name, color, image, quantity, price }) => ({
      productId,
      size,
      name,
      color,
      image,
      quantity,
      price,
    })),
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
    address: {
      department: address.department,
      city: address.city,
      region: address.region,
      provider: address.provider,
    },
    totalPrice,
    totalQuantity,
    isGuest: !userId,
    userId,
  });

  // Fire-and-forget: Telegram failure must not break the order response
  sendTelegramNotification(order).catch(err =>
    console.error('Telegram notification failed:', err.message),
  );

  return sendResponse(res, HttpCode.CREATED, { message: 'Замовлення успішно відправлено', order });
});

const getAllOrders = catchAsync(async (req, res) => {
  const orders = await repositoryOrder.getAllOrders(req.query.limit || 15, req.query.skip || 0);
  return sendResponse(res, HttpCode.OK, { orders });
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await repositoryOrder.getOrderById(req.params.id);
  return sendResponse(res, HttpCode.OK, { order });
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await repositoryOrder.updateOrder(req.params.id, req.body);
  return sendResponse(res, HttpCode.OK, { order });
});

const deleteOrder = catchAsync(async (req, res) => {
  const order = await repositoryOrder.deleteOrder(req.params.id);
  return sendResponse(res, HttpCode.OK, { order });
});

const getOrdersByUserId = catchAsync(async (req, res) => {
  const orders = await repositoryOrder.getOrdersByUserId(req.params.id);
  return sendResponse(res, HttpCode.OK, { orders });
});

const getOrdersByPhone = catchAsync(async (req, res) => {
  const orders = await repositoryOrder.getOrdersByPhone(req.params.phone);
  return sendResponse(res, HttpCode.OK, { orders });
});

export {
  addOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
  getOrdersByPhone,
};
