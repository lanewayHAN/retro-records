import {
  getAllProducts,
  getProductById,
  createProduct,
  replaceProductById,
  updateProductById,
  deleteProductById
} from "./product.repository.js";

function productNotFoundError() {
  const error = new Error("Product not found");
  error.name = "NotFound";
  error.status = 404;

  return error;
}

export async function listProducts() {
  return await getAllProducts();
}

export async function findProductById(id) {
  const product = await getProductById(id);

  if (!product) {
    throw productNotFoundError();
  }

  return product;
}

export async function addProduct(productData) {
  return await createProduct(productData);
}

export async function replaceProduct(id, productData) {
  const product = await replaceProductById(id, productData);

  if (!product) {
    throw productNotFoundError();
  }

  return product;
}

export async function updateProduct(id, productData) {
  const product = await updateProductById(id, productData);

  if (!product) {
    throw productNotFoundError();
  }

  return product;
}

export async function removeProduct(id) {
  const product = await deleteProductById(id);

  if (!product) {
    throw productNotFoundError();
  }

  return product;
}