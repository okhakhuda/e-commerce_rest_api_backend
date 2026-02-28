import GenderCategory from '../model/genderCategory.js';
import Product from '../model/product.js';
import Category from '../model/category.js';

const getAllProducts = async () => {
  const total = await Product.find().countDocuments();
  const data = await Product.find()
    .sort({ createdAt: -1 })
    .populate([
      {
        path: 'genderCategory',
        select: 'slug title',
      },
      {
        path: 'category',
        select: 'slug title',
      },
    ]);

  return { total, data };
};

const getNewProducts = async () => {
  const data = await Product.find()
    .sort({ createdAt: -1 })
    .populate([
      {
        path: 'genderCategory',
        select: 'slug title',
      },
      {
        path: 'category',
        select: 'slug title',
      },
    ]);
  if (data.length > 10) {
    data.length = 10;
  }

  return data;
};

const listProducts = async ({ sortBy, sortByDesc, filter, limit = 10, skip = 0 }) => {
  const total = await Product.find().countDocuments();
  let result = Product.find().sort({ updatedAt: 1 });

  const sortCriteria = sort(sortBy, sortByDesc);

  if (filter) {
    result = result.select(filter.split('|').join(' '));
  }

  result = await result
    .sort(sortCriteria || { createdAt: -1 })
    .limit(Number(limit))
    .skip(Number(skip));

  return { total, limit, products: result };
};

const listProductsByCategory = async (
  mainSlug,
  slug,
  { sortBy, sortByDesc, filter, limit = 10, skip = 0 },
) => {
  // console.log(mainSlug);
  const category = await Category.find({ slug: slug });
  const genderCat = await GenderCategory.find({ slug: mainSlug });
  console.log(genderCat);
  

  const total = await Product.find({
    genderCategory: genderCat[0].id,
    category: category[0].id,
  }).countDocuments();
  let result = Product.find({ genderCategory: genderCat[0].id, category: category[0].id })
    .sort({ updatedAt: 1 })
    .populate([
      {
        path: 'genderCategory',
        select: 'slug title',
      },
      {
        path: 'category',
        select: 'slug title',
      },
    ]);

  const sortCriteria = sort(sortBy, sortByDesc);

  if (filter) {
    result = result.select(filter.split('|').join(' '));
  }

  result = await result
    .sort(sortCriteria || { createdAt: -1 })
    .limit(Number(limit))
    .skip(Number(skip));

  return { total, limit, products: result };
};

const listProductsByGenderCategory = async (
  slug,
  { sortBy, sortByDesc, filter, limit = 10, skip = 0 },
) => {
  // console.log('ID', slug);

  const genderCat = await GenderCategory.find({ slug: slug });
  // console.log('ID', genderCat[0].id);
  const total = await Product.find({ genderCategory: genderCat[0].id }).countDocuments();
  // console.log(total);

  let result = Product.find({ genderCategory: genderCat[0].id })
    .sort({ updatedAt: 1 })
    .populate([
      {
        path: 'genderCategory',
        select: 'slug title',
      },
      {
        path: 'category',
        select: 'slug title',
      },
    ]);

  const sortCriteria = sort(sortBy, sortByDesc);

  if (filter) {
    result = result.select(filter.split('|').join(' '));
  }

  result = await result
    .sort(sortCriteria || { createdAt: -1 })
    .limit(Number(limit))
    .skip(Number(skip));

  // console.log('result', result);

  return { total, limit, products: result };
};

const sort = (sortBy, sortByDesc) => {
  // const sortCriteria = sortBy ? { [sortBy]: sortByDesc ? -1 : 1 } : null;
  let sortCriteria = null;
  if (sortBy) {
    sortCriteria = { [`${sortBy}`]: 1 };
  }
  if (sortByDesc) {
    sortCriteria = { [`${sortByDesc}`]: -1 };
  }
  return sortCriteria;
};

const addProduct = async body => {
  // console.log('body', body);

  const product = await Product.create(body);
  return product;
};

const getProductById = async productId => {
  const product = await Product.findOne({ _id: productId }).populate([
    {
      path: 'genderCategory',
      select: 'slug title',
    },
    {
      path: 'category',
      select: 'slug title',
    },
  ]);
  return product;
};

const updateFile = async (id, url, idFileCloud = null) => {
  return await Product.findByIdAndUpdate({ _id: id }, { $push: { image: { url, idFileCloud } } });
};

const removeProduct = async productId => {
  const result = await Product.findOneAndDelete({ _id: productId });
  return result;
};

const updateProduct = async (productId, body) => {
  const result = await Product.findByIdAndUpdate(productId, { ...body }, { new: true });
  return result;
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
