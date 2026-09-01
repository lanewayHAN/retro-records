import jwt from "jsonwebtoken";

export function createTestToken(role = "staff") {
  return jwt.sign(
    {
      user_id: 2,
      email: "test@retrorecords.com",
      role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );
}