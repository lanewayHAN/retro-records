import { loginUser } from "./auth.service.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}