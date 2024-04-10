const { getUserDetails } = require('../controller/userController');
const db_con = require("../connections");

jest.mock("../connections", () => ({
  promise: jest.fn().mockReturnThis(),
  query: jest.fn()
}));

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    req = { userId: '1' }; // Simulate the userId being set by the authMiddleware
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    db_con.promise.mockClear();
    db_con.query.mockClear();
  });

  it('should return user details for a valid user ID', async () => {

    const mockUserDetails = [
      [{ username: 'testUser', email: 'test@example.com', name: 'Test User' }]
    ];
    db_con.query.mockResolvedValueOnce(mockUserDetails);

    await getUserDetails(req, res);

    expect(db_con.query).toHaveBeenCalledWith(expect.any(String), [req.userId]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      userId: req.userId,
      username: 'testUser',
      email: 'test@example.com',
      name: 'Test User'
    });
  });

  it('should return 404 if no user is found', async () => {

    db_con.query.mockResolvedValueOnce([[]]); // Simulate no user found

    await getUserDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 500 on database error', async () => {

    const mockError = new Error('DB error');
    db_con.query.mockRejectedValueOnce(mockError);


    await getUserDetails(req, res);


    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Request could not be processed due to an internal error. Please try again",
    });
  });
});