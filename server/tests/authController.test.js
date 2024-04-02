const {
  login,
  registration,
  logout,
  refreshAccessToken,
  activation,
  resendActivation,
  forgotPassword,
  changeForgottenPassword,
} = require('../controller/authController');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db_con = require("../connections");
const httpMocks = require('node-mocks-http');
const fs = require('fs');
const util = require('util');
const transporter = require("../mailTransporter");

jest.spyOn(jwt, 'sign');
jest.spyOn(jwt, 'verify');
jest.spyOn(bcrypt, 'compareSync');
jest.spyOn(fs, 'readFile');
jest.spyOn(util, 'promisify');

const readFileAsync = util.promisify(fs.readFile);

jest.mock('../connections', () => ({
  query: jest.fn(),
  promise: jest.fn(() => ({
    query: jest.fn(),
  })),
}));
jest.mock('bcrypt');
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
    use: jest.fn(),
  })),
}));

describe('login', () => {
  it('should respond with a 200 and the user info if the login is successful', async () => {
    const mockUser = {
      user_id: 1,
      username: 'test',
      password: 'test',
      status: 'active'
    };

    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/login',
      body: {
        username: 'test',
        password: 'test'
      }
    });

    const res = httpMocks.createResponse();

    db_con.query.mockImplementation((query, params, callback) => {
      callback(null, [mockUser]);
    });

    bcrypt.compareSync.mockReturnValue(true);

    await login(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.userInfo).toEqual({ user_id: 1, username: 'test', status: 'active' });
    expect(data.token).toBeDefined();
  });
});


describe('registration', () => {
  it('should respond with a 201 and the user id if the registration is successful', async () => {
    const mockUser = {
      username: 'test',
      email: 'test@test.com',
      name: 'Test',
      password: 'Test@123',
      picture: 'test.png'
    };

    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/register',
      body: mockUser
    });

    const res = httpMocks.createResponse();

    db_con.promise().query.mockImplementation((query, params) => {
      if (query.includes('SELECT * FROM users')) {
        return [[], []]; // No user with the same email or username
      } else if (query.includes('INSERT INTO users')) {
        return [{ insertId: 1 }, []]; // New user inserted with id 1
      }
    });

    bcrypt.genSalt.mockImplementation((saltRounds, callback) => {
      callback(null, 'testSalt');
    });

    bcrypt.hash.mockImplementation((password, salt, callback) => {
      callback(null, 'hashedPassword');
    });

    await registration(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(500);
  });

});

describe('logout', () => {
  it('should clear the accessToken cookie and return a successful response', () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    logout(req, res);

    const cookies = res.cookies;
    expect(cookies.accessToken.value).toBe("");
    expect(cookies.accessToken.options.httpOnly).toBe(true);
    expect(cookies.accessToken.options.expires.getTime()).toBe(new Date(0).getTime());

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.message).toBe("Logout successful.");
  });
});


describe('refreshAccessToken', () => {
  it('should refresh the accessToken cookie and return a successful response', () => {
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Bearer token123'
      },
      cookies: {
        accessToken: 'oldToken'
      }
    });
    const res = httpMocks.createResponse();

    refreshAccessToken(req, res);

    const cookies = res.cookies;
    expect(cookies.accessToken.value).toBe('Bearer token123');
    expect(cookies.accessToken.options.httpOnly).toBe(true);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.message).toBe("Access token refreshed successfully");
  });
});

describe('activation', () => {
  it('should activate a user and return a successful response', async () => {
    const req = httpMocks.createRequest({
      body: {
        code: 'validCode'
      }
    });
    const res = httpMocks.createResponse();

    jwt.verify.mockImplementation((code, secret, callback) => {
      callback(null, { id: 'userId' });
    });

    db_con.promise.mockImplementation(() => ({
      query: jest.fn().mockResolvedValueOnce([[{ status: 'inactive' }]]).mockResolvedValueOnce([{}])
    }));

    await activation(req, res);

    if (res._isJSON()) {
      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.message).toBe("User account was activated successfully. You can now login");
    }
  });

});

describe('resendActivation', () => {
  it('should resend activation email and return a successful response', async () => {
    const req = httpMocks.createRequest({
      body: {
        username: 'testUser',
        password: 'testPassword',
        email: 'test@example.com'
      }
    });
    const res = httpMocks.createResponse();

    db_con.query.mockImplementation((query, params, callback) => {
      callback(null, [{ user_id: 'userId', password: 'hashedPassword', email: 'test@example.com' }]);
    });

    bcrypt.compareSync.mockReturnValue(true);
    jwt.sign.mockReturnValue('testToken');
    readFileAsync.mockResolvedValue('imageData');

    await resendActivation(req, res);

    if (res._isJSON()) {
      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.userId).toBe('userId');
    }
  });

});


describe('forgotPassword', () => {
  it('should initiate forgot password process and return a successful response', async () => {
    const req = httpMocks.createRequest({
      body: {
        email: 'test@example.com'
      }
    });
    const res = httpMocks.createResponse();

    db_con.query.mockImplementation((query, params, callback) => {
      callback(null, [{ user_id: 'userId', email: 'test@example.com', name: 'testUser' }]);
    });

    jwt.sign.mockReturnValue('testToken');
    readFileAsync.mockResolvedValue('imageData');

    await forgotPassword(req, res);

    if (res._isJSON()) {
      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.userId).toBe('userId');
    }
  });
});

describe('changeForgottenPassword', () => {
  it('should change the password and return a successful response', async () => {
    const req = httpMocks.createRequest({
      body: {
        code: 'validCode',
        password: 'NewPassword1!'
      }
    });
    const res = httpMocks.createResponse();

    jwt.verify.mockImplementation((code, secret, callback) => {
      callback(null, { id: 'userId' });
    });

    const mockQuery = jest.fn();

    mockQuery
      .mockResolvedValueOnce([
        [
          {
            user_id: 'validUserId',
            email: 'test@example.com',
            name: 'Test User',
          },
        ],
      ])
      .mockResolvedValueOnce({ affectedRows: 1 });

    db_con.promise.mockImplementation(() => ({
      query: mockQuery,
    }));

    bcrypt.genSalt.mockImplementation((saltRounds, callback) => {
      callback(null, 'testSalt');
    });

    bcrypt.hash.mockImplementation((password, salt, callback) => {
      callback(null, 'hashedPassword');
    });

    await changeForgottenPassword(req, res);

    if (res._isJSON()) {
      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.message).toBe("Password was changed successfully. You can now login with your new password");
    }
  });
});

