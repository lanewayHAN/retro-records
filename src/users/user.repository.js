import pool from "../db.js";

export async function getAllUsers() {
  const result = await pool.query(
    `SELECT user_id, name, email, phone, role
     FROM users
     ORDER BY user_id`
  );

  return result.rows;
}

export async function getUserById(id) {
  const result = await pool.query(
    `SELECT user_id, name, email, phone, role
     FROM users
     WHERE user_id = $1`,
    [id]
  );

  return result.rows[0];
}

export async function getUserByEmail(email) {
  const result = await pool.query(
    `SELECT *
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0];
}

export async function createUser(user) {
  const {
    name,
    email,
    phone,
    password_hash,
    role
  } = user;

  const result = await pool.query(
    `INSERT INTO users
      (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, name, email, phone, role`,
    [
      name,
      email,
      phone,
      password_hash,
      role
    ]
  );

  return result.rows[0];
}

export async function replaceUserById(id, user) {
  const {
    name,
    email,
    phone,
    password_hash,
    role
  } = user;

  const result = await pool.query(
    `UPDATE users
     SET name = $1,
         email = $2,
         phone = $3,
         password_hash = $4,
         role = $5
     WHERE user_id = $6
     RETURNING user_id, name, email, phone, role`,
    [
      name,
      email,
      phone,
      password_hash,
      role,
      id
    ]
  );

  return result.rows[0];
}

export async function updateUserById(id, user) {
  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         password_hash = COALESCE($4, password_hash),
         role = COALESCE($5, role)
     WHERE user_id = $6
     RETURNING user_id, name, email, phone, role`,
    [
      user.name,
      user.email,
      user.phone,
      user.password_hash,
      user.role,
      id
    ]
  );

  return result.rows[0];
}

export async function deleteUserById(id) {
  const result = await pool.query(
    `DELETE FROM users
     WHERE user_id = $1
     RETURNING user_id, name, email, phone, role`,
    [id]
  );

  return result.rows[0];
}