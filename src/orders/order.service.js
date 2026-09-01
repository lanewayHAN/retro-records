import {
  getAllOrders,
  getOrderById,
  createOrder,
  replaceOrderById,
  updateOrderById,
  deleteOrderById
} from "./order.repository.js";

import { publishOrderCreated } from "./order.events.js";

function orderNotFoundError() {
  const error = new Error("Order not found");
  error.name = "NotFound";
  error.status = 404;
  return error;
}

export async function listOrders() {
  return await getAllOrders();
}

export async function findOrderById(id) {
  const order = await getOrderById(id);

  if (!order) {
    throw orderNotFoundError();
  }

  return order;
}

export async function addOrder(orderData) {
  // First save the order in PostgreSQL
  const order = await createOrder(orderData);

  // Then publish an event to RabbitMQ
  try {
    await publishOrderCreated(order);
  } catch (error) {
    // The order has already been saved.
    // RabbitMQ failure should not delete or lose the order.
    if (process.env.NODE_ENV !== "test") {
      console.error(
        "Failed to publish order.created event:",
        error.message
      );
    }
  }

  return order;
}

export async function replaceOrder(id, orderData) {
  const order = await replaceOrderById(id, orderData);

  if (!order) {
    throw orderNotFoundError();
  }

  return order;
}

export async function updateOrder(id, orderData) {
  const order = await updateOrderById(id, orderData);

  if (!order) {
    throw orderNotFoundError();
  }

  return order;
}

export async function removeOrder(id) {
  const order = await deleteOrderById(id);

  if (!order) {
    throw orderNotFoundError();
  }

  return order;
}