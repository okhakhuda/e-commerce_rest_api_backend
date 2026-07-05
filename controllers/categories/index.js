import repositoryCategories from '../../repository/category.js';
import { HttpCode, CLOUD_CATEGORY_FOLDER } from '../../lib/constants.js';
import cloudStorage from '../../service/file-storage/cloud-storage.js';
import AppError from '../../lib/AppError.js';
import catchAsync from '../../lib/catchAsync.js';
import sendResponse from '../../lib/response.js';
import { slugify } from '../../lib/slugify.js';

const addCategory = catchAsync(async (req, res) => {
  const file = req.file;
  if (!file) throw AppError.badRequest('Image file is required');

  const slug = slugify(req.body.title);

  const newCategory = await repositoryCategories.addCategory(req.body.genderCategory, {
    ...req.body,
    slug,
    image: file.path,
  });

  const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
    CLOUD_CATEGORY_FOLDER,
    file.buffer,
    file.originalname,
    newCategory.id,
  );
  await repositoryCategories.updateFile(newCategory.id, fileUrl, returnedIdFileCloud);

  const result = await repositoryCategories.getCategoryById(newCategory.id);
  return sendResponse(res, HttpCode.CREATED, { message: 'Категорію успішно додано', result });
});

const getCategoryById = catchAsync(async (req, res) => {
  const category = await repositoryCategories.getCategoryById(req.params.id);
  return sendResponse(res, HttpCode.OK, { category });
});

const removeCategory = catchAsync(async (req, res) => {
  const category = await repositoryCategories.removeCategory(req.params.id);
  await cloudStorage.removeFiles(category.idFileCloud);
  await cloudStorage.removeFolder(CLOUD_CATEGORY_FOLDER, category.id);
  return sendResponse(res, HttpCode.OK, { message: 'Категорію успішно видалено', category });
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const slug = slugify(req.body.title);

  if (file) {
    const existing = await repositoryCategories.getCategoryById(id);
    await cloudStorage.removeFiles(existing.idFileCloud);
    const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
      CLOUD_CATEGORY_FOLDER,
      file.buffer,
      file.originalname,
      existing.id,
    );
    await repositoryCategories.updateFile(existing.id, fileUrl, returnedIdFileCloud);
  }

  const updateCategory = await repositoryCategories.updateCategory(id, {
    ...req.body,
    slug,
    ...(file ? { image: req.file.path } : {}),
  });
  return sendResponse(res, HttpCode.OK, { message: 'Категорію успішно оновлено', updateCategory });
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await repositoryCategories.getCategories();
  return sendResponse(res, HttpCode.OK, { categories });
});

const getCategoryBySlugGenderCat = catchAsync(async (req, res) => {
  const result = await repositoryCategories.getCategoryBySlugGenderCat(req.params.slug);
  return sendResponse(res, HttpCode.OK, { result });
});

export {
  addCategory,
  getCategoryById,
  removeCategory,
  updateCategory,
  getCategories,
  getCategoryBySlugGenderCat,
};
