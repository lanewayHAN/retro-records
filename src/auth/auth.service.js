import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { getUserByEmail } from "../users/user.repository.js";

function invalidCredentialsError() {
  const error = new Error("Invalid email or password");
  error.name = "Unauthorized";
  error.status = 401;
  return error;
}

export async function loginUser(email, password) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw invalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw invalidCredentialsError();
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}