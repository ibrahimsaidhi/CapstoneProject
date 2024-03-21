const { createGroupChat } = require('../controller/groupChatController');
const db_con = require('../connections');

jest.mock('../connections', () => ({
  promise: jest.fn().mockReturnThis(),
  beginTransaction: jest.fn().mockResolvedValue(),
  query: jest.fn().mockResolvedValue([[], {}]),
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
}));

describe('createGroupChat', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new group chat if name is unique', async () => {
    db_con.query.mockResolvedValueOnce([[], {}])    // for checking existing chat
                   .mockResolvedValueOnce([{ insertId: 123 }, {}]);     // for inserting chat

    const mockReq = {
      body: {
        chatName: 'Unique Group Chat',
        userIds: [1, 2, 3],
      },
    };

    await createGroupChat(mockReq, mockRes);

    expect(db_con.beginTransaction).toHaveBeenCalledTimes(1);
    expect(db_con.query).toHaveBeenCalledTimes(2 + mockReq.body.userIds.length);
    expect(db_con.commit).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Group chat created successfully',
      chatId: 123,
    });
  });

  it('should not create a group chat if name already exists', async () => {
    db_con.query.mockResolvedValueOnce([[{ chat_id: 456 }], {}]);
    const mockReq = {
      body: {
        chatName: 'Existing Group Chat',
        userIds: [1, 2, 3],
      },
    };

    await createGroupChat(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Group chat name already exists. Please choose a different name.',
    });
  });

  it('should handle errors during group chat creation', async () => {
    // Mock an error on insert
    db_con.query.mockRejectedValueOnce(new Error('Insert failed'));

    const mockReq = {
      body: {
        chatName: 'Faulty Group Chat',
        userIds: [1, 2, 3],
      },
    };

    await createGroupChat(mockReq, mockRes);

    expect(db_con.rollback).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Failed to create group chat',
      error: 'Insert failed',
    });
  });
});
