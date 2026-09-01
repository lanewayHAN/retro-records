import { jest } from "@jest/globals";

const mockGetUserById = jest.fn();
const mockCreateUser = jest.fn();

jest.unstable_mockModule(
  "../src/users/user.repository.js",
  () => ({
    getAllUsers: jest.fn(),
    getUserById: mockGetUserById,
    getUserByEmail: jest.fn(),
    createUser: mockCreateUser,
    replaceUserById: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn()
  })
);

const {
  findUserById,
  addUser
} = await import(
  "../src/users/user.service.js"
);

describe("User Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findUserById returns a user", async () => {
    const fakeUser = {
      user_id: 1,
      name: "John Customer",
      email: "john@example.com",
      role: "customer"
    };

    mockGetUserById.mockResolvedValue(fakeUser);

    const result = await findUserById(1);

    expect(result).toEqual(fakeUser);
    expect(mockGetUserById).toHaveBeenCalledWith(1);
  });

  test("findUserById throws NotFound when user does not exist", async () => {
    mockGetUserById.mockResolvedValue(undefined);

    await expect(
      findUserById(999)
    ).rejects.toMatchObject({
      name: "NotFound",
      message: "User not found",
      status: 404
    });
  });

  test("addUser creates and returns a user", async () => {
    const userData = {
      name: "Test Customer",
      email: "testcustomer@example.com",
      phone: "0400000099",
      password_hash: "temporary_hash",
      role: "customer"
    };

    const createdUser = {
      user_id: 4,
      name: "Test Customer",
      email: "testcustomer@example.com",
      phone: "0400000099",
      role: "customer"
    };

    mockCreateUser.mockResolvedValue(createdUser);

    const result = await addUser(userData);

    expect(result).toEqual(createdUser);
    expect(mockCreateUser).toHaveBeenCalledWith(userData);
  });
});