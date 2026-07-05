import { Router } from 'express';
import {
  addOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
  getOrdersByPhone,
} from '../../../controllers/orders/index.js';
import roleAccess from '../../../middlewares/role-access.js';
import { Role } from '../../../lib/constants.js';
import guard from '../../../middlewares/guard.js';

const router = new Router();

router.post('/', addOrder);
router.get('/', [guard, roleAccess(Role.ADMIN)], getAllOrders);
router.get('/user/:id', guard, getOrdersByUserId);
router.get('/phone/:phone', guard, getOrdersByPhone);
router.get('/:id', [guard, roleAccess(Role.ADMIN)], getOrderById);
router.put('/:id', [guard, roleAccess(Role.ADMIN)], updateOrder);
router.delete('/:id', [guard, roleAccess(Role.ADMIN)], deleteOrder);

export default router;
