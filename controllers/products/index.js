import repositoryProducts from '../../repository/product.js';
import { HttpCode, CLOUD_PRODUCT_FOLDER } from '../../lib/constants.js';
import cloudStorage from '../../service/file-storage/cloud-storage.js';
import AppError from '../../lib/AppError.js';
import catchAsync from '../../lib/catchAsync.js';
import sendResponse from '../../lib/response.js';
import { slugify } from '../../lib/slugify.js';

const getListProducts = catchAsync(async (req, res) => {
  const products = await repositoryProducts.listProducts(req.query);
  return sendResponse(res, HttpCode.OK, { products });
});

const getNewProducts = catchAsync(async (req, res) => {
  const products = await repositoryProducts.getNewProducts();
  return sendResponse(res, HttpCode.OK, { products });
});

const getProductsByCategory = catchAsync(async (req, res) => {
  const { mainslug, slug } = req.params;
  const data = await repositoryProducts.listProductsByCategory(mainslug, slug, req.query);
  return sendResponse(res, HttpCode.OK, { data });
});

const getProductsByGenderCategory = catchAsync(async (req, res) => {
  const data = await repositoryProducts.listProductsByGenderCategory(req.params.slug, req.query);
  return sendResponse(res, HttpCode.OK, { data });
});

const addProduct = catchAsync(async (req, res) => {
  const files = req.files;
  const slug = slugify(req.body.name);

  const newProduct = await repositoryProducts.addProduct({ ...req.body, slug });

  // Upload images sequentially to preserve order
  for (const file of files) {
    const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
      CLOUD_PRODUCT_FOLDER,
      file.buffer,
      file.originalname,
      newProduct.id,
    );
    await repositoryProducts.updateFile(newProduct.id, fileUrl, returnedIdFileCloud);
  }

  const result = await repositoryProducts.getProductById(newProduct.id);
  return sendResponse(res, HttpCode.CREATED, { result });
});

const getProductById = catchAsync(async (req, res) => {
  const product = await repositoryProducts.getProductById(req.params.id);
  return sendResponse(res, HttpCode.OK, { product });
});

const removeProduct = catchAsync(async (req, res) => {
  const product = await repositoryProducts.removeProduct(req.params.id);

  // Clean up cloud storage — do not block response on individual image errors
  await Promise.allSettled(product.image.map(img => cloudStorage.removeFiles(img.idFileCloud)));
  await cloudStorage.removeFolder(CLOUD_PRODUCT_FOLDER, product.id);

  return sendResponse(res, HttpCode.OK, { message: 'Продукт успішно видалено', product });
});

const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const files = req.files ?? [];
  const slug = slugify(req.body.name);

  for (const file of files) {
    const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
      CLOUD_PRODUCT_FOLDER,
      file.buffer,
      file.originalname,
      id,
    );
    await repositoryProducts.updateFile(id, fileUrl, returnedIdFileCloud);
  }

  const updateProduct = await repositoryProducts.updateProduct(id, { ...req.body, slug });
  return sendResponse(res, HttpCode.OK, { message: 'Продукт успішно оновлено', updateProduct });
});

const removeProductImage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { public_id: idFileCloud } = req.query;

  if (!idFileCloud) {
    throw AppError.badRequest('Query param "public_id" is required');
  }

  await cloudStorage.removeFiles(idFileCloud);

  const product = await repositoryProducts.getProductById(id);
  const updatedImages = product.image.filter(f => f.idFileCloud !== idFileCloud);
  const updateProduct = await repositoryProducts.updateProduct(id, { image: updatedImages });

  return sendResponse(res, HttpCode.OK, { message: 'Зображення успішно видалено', updateProduct });
});

export {
  getNewProducts,
  getProductsByCategory,
  getProductsByGenderCategory,
  getListProducts,
  addProduct,
  getProductById,
  removeProduct,
  updateProduct,
  removeProductImage,
};
