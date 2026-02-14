import repositoryProducts from '../../repository/product.js';
import { HttpCode } from '../../lib/constants.js';
import convert from '../../convert.json' with { type: 'json' };
import { CLOUD_PRODUCT_FOLDER } from '../../lib/constants.js';
import cloudStorage from '../../service/file-storage/cloud-storage.js';

const getAllProducts = async (req, res) => {
  try {
    const products = await repositoryProducts.getAllProducts();
    if (products) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        products,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const getNewProducts = async (req, res) => {
  try {
    const products = await repositoryProducts.getNewProducts();
    // console.log('newproducts', products);
    if (products) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        products,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await repositoryProducts.listProducts(req.query);
    if (products) {
      res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: products,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { mainslug, slug } = req.params;

    const products = await repositoryProducts.listProductsByCategory(mainslug, slug, req.query);
    // console.log(products);
    if (products) {
      res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: products,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const getProductsByGenderCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    // console.log('req.params', req.params);

    const products = await repositoryProducts.listProductsByGenderCategory(slug, req.query);
    // console.log(products);
    if (products) {
      res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: products,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const files = req.files;
    const text = req.body.name;
    const str = text.replace(/[\s-]/g, '_').toLowerCase();
    const newName = str
      .split('')
      .map(char => convert[char] || char)
      .join('');

    const newProduct = await repositoryProducts.addProduct({
      ...req.body,
      slug: newName,
    });
    if (newProduct) {
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
      if (result) {
        return res.status(HttpCode.CREATED).json({
          status: 'success',
          message: 'Продукт успішно додано',
          code: HttpCode.OK,
          result,
        });
      }
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await repositoryProducts.getProductById(id);
    // console.log(product);
    if (product) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        product,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const removeProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);

    const product = await repositoryProducts.removeProduct(id);
    if (product) {
      const images = product.image;
      for (let image of images) {
        await cloudStorage.removeFiles(image.idFileCloud);
      }
      await cloudStorage.removeFolder(CLOUD_PRODUCT_FOLDER, product.id);
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Продукт успішно видалено',
        product,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const text = req.body.name;
    console.log(req.body);
    const str = text.replace(/[\s-]/g, '_').toLowerCase();
    const newName = str
      .split('')
      .map(char => convert[char] || char)
      .join('');

    const product = await repositoryProducts.getProductById(id);

    if (files && product) {
      const updateProduct = await repositoryProducts.updateProduct(id, {
        ...req.body,
        slug: newName,
      });
      if (updateProduct) {
        for (const file of files) {
          const { fileUrl, returnedIdFileCloud } = await cloudStorage.save(
            CLOUD_PRODUCT_FOLDER,
            file.buffer,
            file.originalname,
            product.id,
          );
          await repositoryProducts.updateFile(product.id, fileUrl, returnedIdFileCloud);
        }
        const updateProduct = await repositoryProducts.getProductById(id);
        return res.status(HttpCode.OK).json({
          status: 'success',
          code: HttpCode.OK,
          message: 'Продукт успішно оновлено',
          updateProduct,
        });
      }
    }

    const updateProduct = await repositoryProducts.updateProduct(id, {
      ...req.body,
      slug: newName,
    });
    if (updateProduct) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Продукт успішно оновлено',
        updateProduct,
      });
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

const removeProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { public_id: idFileCloud } = req.query;

    const deleteImage = await cloudStorage.removeFiles(idFileCloud);
    if (deleteImage) {
      const product = await repositoryProducts.getProductById(id);
      const productImage = product.image;
      const updatedImageArray = productImage.filter(file => file.idFileCloud !== idFileCloud);
      const updateProduct = await repositoryProducts.updateProduct(id, {
        ...req.body,
        image: updatedImageArray,
      });
      if (updateProduct) {
        return res.status(HttpCode.OK).json({
          status: 'success',
          code: HttpCode.OK,
          message: 'Зображення успішно видалено',
          updateProduct,
        });
      }
    }
  } catch (error) {
    res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: error.message,
    });
  }
};

export {
  getProducts,
  getNewProducts,
  getProductsByCategory,
  getProductsByGenderCategory,
  getAllProducts,
  addProduct,
  getProductById,
  removeProduct,
  updateProduct,
  removeProductImage,
};
