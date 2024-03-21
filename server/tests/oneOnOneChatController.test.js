const { createOneOnOneChat } = require('../controller/oneOnOneChatController');
const db_con = require('../connections');

jest.mock('../connections', () => ({
  promise: jest.fn().mockReturnThis(),
  beginTransaction: jest.fn().mockResolvedValue(),
  query: jest.fn().mockResolvedValue([[], {}]),
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
}));

describe('createOneOnOneChat', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should create a new one-on-one chat if none exists', async () => {
    db_con.query.mockResolvedValueOnce([[], {}]) 
                   .mockResolvedValueOnce([{ insertId: 123 }, {}]); 

    const mockReq = {
      body: {
        chatName: 'Test Chat',
        userIds: [1, 2],
      },
    };

    await createOneOnOneChat(mockReq, mockRes);

    expect(db_con.beginTransaction).toHaveBeenCalledTimes(1);
    expect(db_con.query).toHaveBeenCalledTimes(4); 
    expect(db_con.commit).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'One-on-one chat created successfully',
      chatId: 123,
    });
  });

  it('should not create a new chat and return existing chat ID if a chat already exists', async () => {
    db_con.query.mockResolvedValueOnce([[{ chat_id: 456 }], {}]); 

    const mockReq = {
      body: {
        chatName: 'Test Chat',
        userIds: [1, 2],
      },
    };

    await createOneOnOneChat(mockReq, mockRes);

    expect(db_con.rollback).toHaveBeenCalledTimes(1); 
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Chat already exists',
      chatId: 456,
    });
  });

  it('should handle errors during chat creation', async () => {
    db_con.query.mockRejectedValueOnce(new Error('Insert failed'));

    const mockReq = {
      body: {
        chatName: 'Test Chat',
        userIds: [1, 2],
      },
    };

    await createOneOnOneChat(mockReq, mockRes);

    expect(db_con.rollback).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Failed to create one-on-one chat',
      error: 'Insert failed',
    });
  });
});
