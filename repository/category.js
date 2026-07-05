import Category from '../model/category.js';
import GenderCategory from '../model/genderCategory.js';
import AppError from '../lib/AppError.js';

const POPULATE_GENDER = { path: 'genderCategory', select: 'slug title' };

const addCategory = async (genderCategoryId, body) => {
  return Category.create({ ...body, genderCategory: genderCategoryId });
};

const getCategoryById = async id => {
  const category = await Category.findById(id).populate(POPULATE_GENDER);
  if (!category) throw AppError.notFound(`Category with id "${id}" not found`);
  return category;
};

const updateFile = async (id, image, idFileCloud = null) => {
  return Category.findByIdAndUpdate(id, { image, idFileCloud }, { new: true });
};

const removeCategory = async id => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw AppError.notFound(`Category with id "${id}" not found`);
  return category;
};

const updateCategory = async (id, body) => {
  const category = await Category.findByIdAndUpdate(id, body, { new: true });
  if (!category) throw AppError.notFound(`Category with id "${id}" not found`);
  return category;
};

const getCategories = async () => {
  return Category.find().sort({ updatedAt: 1 }).populate(POPULATE_GENDER);
};

const getCategoryBySlugGenderCat = async slug => {
  const genderCat = await GenderCategory.findOne({ slug });
  if (!genderCat) throw AppError.notFound(`Gender category with slug "${slug}" not found`);

  const [total, items] = await Promise.all([
    Category.countDocuments({ genderCategory: genderCat.id }),
    Category.find({ genderCategory: genderCat.id }).populate(POPULATE_GENDER),
  ]);

  return { total, items };
};

export default {
  addCategory,
  getCategoryById,
  removeCategory,
  updateCategory,
  getCategories,
  updateFile,
  getCategoryBySlugGenderCat,
};
