import {
  getAllUsers,
  getUserById,
  createUser,
  replaceUserById,
  updateUserById,
  deleteUserById
} from "./user.repository.js";

function userNotFoundError() {
  const error = new Error("User not found");
  error.name = "NotFound";
  error.status = 404;
  return error;
}

export async function listUsers() {
  return await getAllUsers();
}

export async function findUserById(id) {
  const user = await getUserById(id);

  if (!user) {
    throw userNotFoundError();
  }

  return user;
}

export async function addUser(userData) {
  return await createUser(userData);
}

export async function replaceUser(id, userData) {
  const user = await replaceUserById(id, userData);

  if (!user) {
    throw userNotFoundError();
  }

  return user;
}

export async function updateUser(id, userData) {
  const user = await updateUserById(id, userData);

  if (!user) {
    throw userNotFoundError();
  }

  return user;
}

export async function removeUser(id) {
  const user = await deleteUserById(id);

  if (!user) {
    throw userNotFoundError();
  }

  return user;
}