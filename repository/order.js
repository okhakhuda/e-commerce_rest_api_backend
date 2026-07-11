import Order from '../model/orders.js';
import AppError from '../lib/AppError.js';

const USER_POPULATE = { path: 'userId', select: 'email firstName lastName phone avatarUrl' };

const addOrder = async body => {
  return Order.create(body);
};

const bindOrderByUserId = async (guestOrders, userId) => {
  return Order.updateMany(
    { _id: { $in: guestOrders.map(o => o._id) } },
    { $set: { userId, isGuest: false } },
  );
};

const getAllOrders = async (limit, skip = 0) => {
  const [total, data] = await Promise.all([
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(Number(limit)).skip(Number(skip)),
  ]);
  return { total, limit: Number(limit), data };
};

const getOrderById = async id => {
  const order = await Order.findById(id).populate(USER_POPULATE);
  if (!order) throw AppError.notFound(`Order with id "${id}" not found`);
  return order;
};

const updateOrder = async (id, body) => {
  const order = await Order.findByIdAndUpdate(id, body, { new: true }).populate(USER_POPULATE);
  if (!order) throw AppError.notFound(`Order with id "${id}" not found`);
  return order;
};

const deleteOrder = async id => {
  const order = await Order.findByIdAndDelete(id).populate(USER_POPULATE);
  if (!order) throw AppError.notFound(`Order with id "${id}" not found`);
  return order;
};

const getOrdersByUserId = async userId => {
  return Order.find({ userId }).sort({ createdAt: -1 });
};

const getOrdersByPhone = async phone => {
  return Order.find({ 'user.phone': phone }).sort({ createdAt: -1 });
};

export default {
  addOrder,
  bindOrderByUserId,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
  getOrdersByPhone,
};
