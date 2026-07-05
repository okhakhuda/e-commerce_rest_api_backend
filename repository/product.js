import GenderCategory from '../model/genderCategory.js';
import Product from '../model/product.js';
import Category from '../model/category.js';
import AppError from '../lib/AppError.js';

const POPULATE_CATS = [
  { path: 'genderCategory', select: 'slug title' },
  { path: 'category', select: 'slug title' },
];

// Builds sort object from query params {sortBy, sortByDesc}
const buildSort = (sortBy, sortByDesc) => {
  if (sortByDesc) return { [sortByDesc]: -1 };
  if (sortBy) return { [sortBy]: 1 };
  return { createdAt: -1 };
};

const getAllProducts = async () => {
  const [total, data] = await Promise.all([
    Product.countDocuments(),
    Product.find().sort({ createdAt: -1 }).populate(POPULATE_CATS),
  ]);
  return { total, data };
};

const getNewProducts = async (count = 10) => {
  return Product.find().sort({ createdAt: -1 }).limit(count).populate(POPULATE_CATS);
};

const listProducts = async ({ sortBy, sortByDesc, filter, limit = 10, skip = 0 }) => {
  const sort = buildSort(sortBy, sortByDesc);
  let query = Product.find()
    .sort(sort)
    .limit(Number(limit))
    .skip(Number(skip))
    .populate(POPULATE_CATS);

  if (filter) query = query.select(filter.split('|').join(' '));

  const [total, products] = await Promise.all([Product.countDocuments(), query]);
  return { total, limit: Number(limit), products };
};

const listProductsByCategory = async (
  mainSlug,
  slug,
  { sortBy, sortByDesc, filter, limit = 10, skip = 0 },
) => {
  const [genderCat, category] = await Promise.all([
    GenderCategory.findOne({ slug: mainSlug }),
    Category.findOne({ slug }),
  ]);

  if (!genderCat) throw AppError.notFound(`Gender category "${mainSlug}" not found`);
  if (!category) throw AppError.notFound(`Category "${slug}" not found`);

  const filter_ = { genderCategory: genderCat.id, category: category.id };
  const sort = buildSort(sortBy, sortByDesc);

  let query = Product.find(filter_)
    .sort(sort)
    .limit(Number(limit))
    .skip(Number(skip))
    .populate(POPULATE_CATS);
  if (filter) query = query.select(filter.split('|').join(' '));

  const [total, products] = await Promise.all([Product.countDocuments(filter_), query]);
  return { total, limit: Number(limit), products };
};

const listProductsByGenderCategory = async (
  slug,
  { sortBy, sortByDesc, filter, limit = 10, skip = 0 },
) => {
  const genderCat = await GenderCategory.findOne({ slug });
  if (!genderCat) throw AppError.notFound(`Gender category "${slug}" not found`);

  const filter_ = { genderCategory: genderCat.id };
  const sort = buildSort(sortBy, sortByDesc);

  let query = Product.find(filter_)
    .sort(sort)
    .limit(Number(limit))
    .skip(Number(skip))
    .populate(POPULATE_CATS);
  if (filter) query = query.select(filter.split('|').join(' '));

  const [total, products] = await Promise.all([Product.countDocuments(filter_), query]);
  return { total, limit: Number(limit), products };
};

const addProduct = async body => {
  return Product.create(body);
};

const getProductById = async id => {
  const product = await Product.findById(id).populate(POPULATE_CATS);
  if (!product) throw AppError.notFound(`Product with id "${id}" not found`);
  return product;
};

const updateFile = async (id, url, idFileCloud = null) => {
  return Product.findByIdAndUpdate(id, { $push: { image: { url, idFileCloud } } });
};

const removeProduct = async id => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw AppError.notFound(`Product with id "${id}" not found`);
  return product;
};

const updateProduct = async (id, body) => {
  const product = await Product.findByIdAndUpdate(id, body, { new: true });
  if (!product) throw AppError.notFound(`Product with id "${id}" not found`);
  return product;
};

export default {
  listProducts,
  getNewProducts,
  listProductsByCategory,
  listProductsByGenderCategory,
  getAllProducts,
  addProduct,
  getProductById,
  updateFile,
  removeProduct,
  updateProduct,
};
