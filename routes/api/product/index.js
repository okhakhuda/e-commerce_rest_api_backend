import { Router } from 'express';
import {
  addProduct,
  getNewProducts,
  getAllProducts,
  getProducts,
  getProductById,
  removeProduct,
  updateProduct,
  removeProductImage,
  getProductsByCategory,
  getProductsByGenderCategory,
} from '../../../controllers/products/index.js';
import { upload } from '../../../middlewares/upload.js';
import roleAccess from '../../../middlewares/role-access.js';
import { Role } from '../../../lib/constants.js';
import guard from '../../../middlewares/guard.js';

const router = new Router();

router.get('/allProducts', getAllProducts);
router.get('/newproducts', getNewProducts);
router.get('/list/', getProducts);
router.get('/category/:mainslug/:slug', getProductsByCategory);
router.get('/genderCategory/:slug', getProductsByGenderCategory);
router.post('/', [guard, roleAccess(Role.ADMIN)], upload.array('image', 10), addProduct);
router.get('/:id', getProductById);
router.delete('/delete/:id', [guard, roleAccess(Role.ADMIN)], removeProduct);
router.put('/deleteImage/:id', [guard, roleAccess(Role.ADMIN)], removeProductImage);
router.put(
  '/update/:id',
  [guard, roleAccess(Role.ADMIN)],
  upload.array('image', 10),
  updateProduct,
);

export default router;
