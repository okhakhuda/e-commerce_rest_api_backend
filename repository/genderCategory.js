import GenderCategory from '../model/genderCategory.js';
import AppError from '../lib/AppError.js';

// BUG FIX: was GenderCategories.find({_id}) everywhere — same array-vs-document bug
// as in category repository. Replaced with findById / findOne throughout.

const addGenderCategory = async body => {
  return GenderCategory.create(body);
};

const getGenderCategories = async () => {
  return GenderCategory.find().sort({ updatedAt: 1 });
};

const getGenderCategoryById = async id => {
  const category = await GenderCategory.findById(id);
  if (!category) throw AppError.notFound(`Gender category with id "${id}" not found`);
  return category;
};

const removeGenderCategory = async id => {
  const category = await GenderCategory.findByIdAndDelete(id);
  if (!category) throw AppError.notFound(`Gender category with id "${id}" not found`);
  return category;
};

const updateGenderCategory = async (id, body) => {
  const category = await GenderCategory.findByIdAndUpdate(id, body, { new: true });
  if (!category) throw AppError.notFound(`Gender category with id "${id}" not found`);
  return category;
};

const updateFile = async (id, image, idFileCloud = null) => {
  return GenderCategory.findByIdAndUpdate(id, { image, idFileCloud }, { new: true });
};

export default {
  addGenderCategory,
  getGenderCategories,
  getGenderCategoryById,
  removeGenderCategory,
  updateGenderCategory,
  updateFile,
};
