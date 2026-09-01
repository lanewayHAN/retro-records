import { jest } from "@jest/globals";

const mockGetOrderById = jest.fn();
const mockCreateOrder = jest.fn();
const mockPublishOrderCreated = jest.fn();

jest.unstable_mockModule(
  "../src/orders/order.repository.js",
  () => ({
    getAllOrders: jest.fn(),
    getOrderById: mockGetOrderById,
    createOrder: mockCreateOrder,
    replaceOrderById: jest.fn(),
    updateOrderById: jest.fn(),
    deleteOrderById: jest.fn()
  })
);

jest.unstable_mockModule(
  "../src/orders/order.events.js",
  () => ({
    publishOrderCreated: mockPublishOrderCreated
  })
);

const {
  findOrderById,
  addOrder
} = await import(
  "../src/orders/order.service.js"
);

describe("Order Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPublishOrderCreated.mockResolvedValue({
      event_type: "order.created"
    });
  });

  test("findOrderById returns an order", async () => {
    const fakeOrder = {
      order_id: 1,
      customer_id: 1,
      created_by: 2,
      product_id: 1,
      quantity: 1,
      status: "completed",
      total_amount: "50.00"
    };

    mockGetOrderById.mockResolvedValue(fakeOrder);

    const result = await findOrderById(1);

    expect(result).toEqual(fakeOrder);
    expect(mockGetOrderById).toHaveBeenCalledWith(1);
  });

  test("findOrderById throws NotFound when order does not exist", async () => {
    mockGetOrderById.mockResolvedValue(undefined);

    await expect(
      findOrderById(999)
    ).rejects.toMatchObject({
      name: "NotFound",
      message: "Order not found",
      status: 404
    });
  });

  test("addOrder creates an order and publishes order.created", async () => {
    const orderData = {
      customer_id: 1,
      created_by: 2,
      product_id: 2,
      quantity: 2,
      status: "pending",
      total_amount: 110
    };

    const createdOrder = {
      order_id: 3,
      ...orderData,
      total_amount: "110.00"
    };

    mockCreateOrder.mockResolvedValue(createdOrder);

    const result = await addOrder(orderData);

    expect(result).toEqual(createdOrder);
    expect(mockCreateOrder).toHaveBeenCalledWith(orderData);

    expect(
      mockPublishOrderCreated
    ).toHaveBeenCalledWith(createdOrder);
  });
});