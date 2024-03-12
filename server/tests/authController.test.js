const { login } = require('../controller/authController');
const db_con = require('../connections');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
}));
jest.mock('../connections', () => ({
  query: jest.fn(),
}));

describe('login', () => {
  beforeEach(() => {
    jwt.sign.mockReset();
    bcrypt.compareSync.mockReset();
    db_con.query.mockReset();
  });

  it('Should login successfully, return 200 and a token for valid credentials', async () => {

    // Setting up the necessary mock request and response objects
    const req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    const mockUser = {
      user_id: 1,
      username: 'testuser',
      password: 'Password123!',
    };


    db_con.query.mockImplementation((query, values, callback) => {
      callback(null, [mockUser]);
    });
    bcrypt.compareSync.mockReturnValue(true);
    jwt.sign.mockReturnValue('testtoken');

    await login(req, res);

    // Assert: the function behaves as expected
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      token: 'testtoken',
    }));
    expect(bcrypt.compareSync).toHaveBeenCalledWith('testpassword', mockUser.password);
    expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser.user_id }, expect.any(String), { expiresIn: expect.any(Number) });
  });

});
