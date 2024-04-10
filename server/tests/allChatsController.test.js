const allChatsController = require('../controller/allChatsController');
const db_con = require('../connections');

jest.mock('../connections', () => ({
  promise: jest.fn().mockReturnThis(),
  beginTransaction: jest.fn().mockResolvedValue(),
  query: jest.fn().mockResolvedValue([[], {}]),
  execute: jest.fn(),
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
}));


describe('getUserId', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedContactDataInDB =  
    {
      name:"one-on-one",
      chat_id: 10, 
      chat_type:"one-to-one", 
      message:"hello UTU3", 
      timestamp:"2024-04-08 20:23:57", 
      sender_id:5, 
      recipient_id:3,
    }

  it('get chat for known UserId', async () => {

    db_con.execute.mockImplementation((query, values, callback) => {
      callback(null, [expectedContactDataInDB]);
    });

    const mockReq = {
      params: {
        userId : 5,
      },
    };

    allChatsController.getAllChats(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      chats: [expectedContactDataInDB],
    });
    
  });

});

describe('getStatus', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedContactDataInDB =  
    {
      status:"active",
    }
  

  it('get status for active chat', async () => {
    db_con.query.mockResolvedValueOnce([[expectedContactDataInDB], {}]);     // for inserting chat

    const mockReq = {
      params: {
        chatId : 10,
      },
    };

    await allChatsController.getStatus(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      chatStatus: "active",
    });
    
  });

});

