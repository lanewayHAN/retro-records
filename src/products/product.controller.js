import {
  listProducts,
  findProductById,
  addProduct,
  replaceProduct,
  updateProduct,
  removeProduct
} from "./product.service.js";

export async function getProducts(req, res, next) {
  try {
    const products = await listProducts();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await findProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

export async function postProduct(req, res, next) {
  try {
    const product = await addProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function putProduct(req, res, next) {
  try {
    const product = await replaceProduct(
      req.params.id,
      req.body
    );

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

export async function patchProduct(req, res, next) {
  try {
    const product = await updateProduct(
      req.params.id,
      req.body
    );

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await removeProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}