import repositoryGenderCategories from '../../repository/genderCategory.js';
import { HttpCode, CLOUD_GENDER_FOLDER } from '../../lib/constants.js';
import cloudStorage from '../../service/file-storage/cloud-storage.js';
import AppError from '../../lib/AppError.js';
import catchAsync from '../../lib/catchAsync.js';
import sendResponse from '../../lib/response.js';
import { slugify } from '../../lib/slugify.js';

const addGenderCategory = catchAsync(async (req, res) => {
  const file = req.file;
  if (!file) throw AppError.badRequest('Image file is required');

  const slug = slugify(req.body.title);

  const newCategory = await repositoryGenderCategories.addGenderCategory({
    ...req.body,
    slug,
    image: file.path,
  });

  const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
    CLOUD_GENDER_FOLDER,
    file.buffer,
    file.originalname,
    newCategory.id,
  );
  await repositoryGenderCategories.updateFile(newCategory.id, fileUrl, returnedIdFileCloud);

  const result = await repositoryGenderCategories.getGenderCategoryById(newCategory.id);
  return sendResponse(res, HttpCode.CREATED, { message: 'Категорію успішно додано', result });
});

const getGenderCategories = catchAsync(async (req, res) => {
  const categories = await repositoryGenderCategories.getGenderCategories();
  return sendResponse(res, HttpCode.OK, { categories });
});

const getGenderCategoryById = catchAsync(async (req, res) => {
  const category = await repositoryGenderCategories.getGenderCategoryById(req.params.id);
  return sendResponse(res, HttpCode.OK, { category });
});

const removeGenderCategory = catchAsync(async (req, res) => {
  const category = await repositoryGenderCategories.removeGenderCategory(req.params.id);
  await cloudStorage.removeFiles(category.idFileCloud);
  await cloudStorage.removeFolder(CLOUD_GENDER_FOLDER, category.id);
  return sendResponse(res, HttpCode.OK, { message: 'Категорію успішно видалено', category });
});

const updateGenderCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const slug = slugify(req.body.title);

  if (file) {
    const existing = await repositoryGenderCategories.getGenderCategoryById(id);
    await cloudStorage.removeFiles(existing.idFileCloud);
    const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
      CLOUD_GENDER_FOLDER,
      file.buffer,
      file.originalname,
      existing.id,
    );
    await repositoryGenderCategories.updateFile(existing.id, fileUrl, returnedIdFileCloud);
  }

  const updateCategory = await repositoryGenderCategories.updateGenderCategory(id, {
    ...req.body,
    slug,
  });
  return sendResponse(res, HttpCode.OK, { message: 'Категорію успішно оновлено', updateCategory });
});

export {
  addGenderCategory,
  getGenderCategories,
  getGenderCategoryById,
  removeGenderCategory,
  updateGenderCategory,
};
