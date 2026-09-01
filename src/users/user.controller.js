import {
  listUsers,
  findUserById,
  addUser,
  replaceUser,
  updateUser,
  removeUser
} from "./user.service.js";

export async function getUsers(req, res, next) {
  try {
    const users = await listUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await findUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function postUser(req, res, next) {
  try {
    const user = await addUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function putUser(req, res, next) {
  try {
    const user = await replaceUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function patchUser(req, res, next) {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await removeUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}