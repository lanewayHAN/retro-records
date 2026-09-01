import express from "express";

import {
  getUsers,
  getUser,
  postUser,
  putUser,
  patchUser,
  deleteUser
} from "./user.controller.js";

import { validate } from "../middleware/validate.js";

import {
  createUserSchema,
  replaceUserSchema,
  updateUserSchema
} from "./user.validation.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);

router.post(
  "/",
  validate(createUserSchema),
  postUser
);

router.put(
  "/:id",
  validate(replaceUserSchema),
  putUser
);

router.patch(
  "/:id",
  validate(updateUserSchema),
  patchUser
);

router.delete("/:id", deleteUser);

export default router;