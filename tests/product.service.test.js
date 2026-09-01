import { jest } from "@jest/globals";

const mockGetProductById = jest.fn();
const mockCreateProduct = jest.fn();

jest.unstable_mockModule(
  "../src/products/product.repository.js",
  () => ({
    getAllProducts: jest.fn(),
    getProductById: mockGetProductById,
    createProduct: mockCreateProduct,
    replaceProductById: jest.fn(),
    updateProductById: jest.fn(),
    deleteProductById: jest.fn()
  })
);

const {
  findProductById,
  addProduct
} = await import(
  "../src/products/product.service.js"
);

describe("Product Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findProductById returns a product", async () => {
    const fakeProduct = {
      product_id: 1,
      album_name: "Rumours",
      artist: "Fleetwood Mac"
    };

    mockGetProductById.mockResolvedValue(fakeProduct);

    const result = await findProductById(1);

    expect(result).toEqual(fakeProduct);
    expect(mockGetProductById).toHaveBeenCalledWith(1);
  });

  test("findProductById throws NotFound when product does not exist", async () => {
    mockGetProductById.mockResolvedValue(undefined);

    await expect(
      findProductById(999)
    ).rejects.toMatchObject({
      name: "NotFound",
      message: "Product not found",
      status: 404
    });
  });

  test("addProduct creates and returns a product", async () => {
    const productData = {
      discogs_release_id: 999001,
      album_name: "Back in Black",
      artist: "AC/DC",
      format: "Vinyl",
      price: 49,
      stock_quantity: 6
    };

    const createdProduct = {
      product_id: 3,
      ...productData
    };

    mockCreateProduct.mockResolvedValue(createdProduct);

    const result = await addProduct(productData);

    expect(result).toEqual(createdProduct);
    expect(mockCreateProduct).toHaveBeenCalledWith(productData);
  });
});