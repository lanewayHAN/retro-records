import {
  listOrders,
  findOrderById,
  addOrder,
  replaceOrder,
  updateOrder,
  removeOrder
} from "./order.service.js";

export async function getOrders(req, res, next) {
  try {
    const orders = await listOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await findOrderById(req.params.id);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export async function postOrder(req, res, next) {
  try {
    const order = await addOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function putOrder(req, res, next) {
  try {
    const order = await replaceOrder(req.params.id, req.body);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export async function patchOrder(req, res, next) {
  try {
    const order = await updateOrder(req.params.id, req.body);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    await removeOrder(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}