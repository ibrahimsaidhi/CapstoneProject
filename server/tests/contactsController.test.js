
const {getAll, searchNewContact, sendRequest, deleteRequest, updateRequest, blockRequest} = require("../controller/contactsController");
const db_con = require('../connections');

jest.mock('../connections', () => ({
  promise: jest.fn().mockReturnThis(),
  beginTransaction: jest.fn().mockResolvedValue(),
  query: jest.fn().mockResolvedValue([[], {}]),
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
}));


describe('getAll', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedContactDataInDB =  
  [
    {
      name: 'Unit Test User3',
      username: 'UTU3',
      picture: 'file-1711104693859.PNG',
      user_id: 3
    },
    {
      name: 'Unit Test User4',
      username: 'UTU4',
      picture: 'file-17111046938592.PNG',
      user_id: 4
    }
  ]

  it('should get all friend, incoming, outgoing, blocked and non-friends', async () => {
    db_con.query.mockResolvedValueOnce([[expectedContactDataInDB], {}]);     // for inserting chat

    const queryTypes = ["friends", "incoming", "outgoing", "blocked", "non-friends"];
    
    for (queryType of queryTypes) 
    {
      const mockReq = {
        userId: 5,
        query: {
          type : queryType,
        },
      };

      await getAll(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        users: [expectedContactDataInDB],
      });
    }
  });

});


describe('searchNewContact', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  

  it('should search for stranger UTU3', async () => {

    const expectedContactDataInDB =  
    [
      {
        name: 'Unit Test User3',
        username: 'UTU3',
        picture: 'file-1711104693859.PNG',
        user_id: 3
      }
    ]

    db_con.query.mockResolvedValueOnce([[expectedContactDataInDB], {}]);     // for inserting chat

    const mockReq = {
      userId: 5,
      params: {
        term : "User3",
      },
    };

    await searchNewContact(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      users: [expectedContactDataInDB],
    });
    
  });

});

describe('sendRequest', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  

  it('should send a request to stranger UTU3', async () => {

    const expectedContactDataInDB =  
    [
      {
        user_id: 3,
        username: 'UTU3',
        email: 'utu3@gmail.com',
        name: 'Unit Test User3',
        status: 'active',
        picture: 'file-1711104693859.PNG'
      }
    ]

    db_con.query.mockResolvedValueOnce([expectedContactDataInDB, []])   // for getUserAndContactRelation sql 1
                  .mockResolvedValueOnce([[], {}])   // for getUserAndContactRelation sql 2
                  .mockResolvedValueOnce([{ insertId: 123 }, {}]);     // for inserting chat

    const mockReq = {
      userId: 5,
      body: {
        term : "UTU3",
      },
    };

    await sendRequest(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Friend request sent successfully",
    });
    
  });

});



describe('deleteRequest', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });


  
   
  it('deleteRequest for Outgoing', async () => {

    const expectedContactDataInDB =  
    [
      {
        user_id: 3,
        username: 'UTU3',
        email: 'utu3@gmail.com',
        name: 'Unit Test User3',
        status: 'active',
        picture: 'file-1711104693859.PNG'
      }
    ]

    
    const expectedContactDataInDB2 =  
    [
      {
        user_id: 5,
        friend_id: 3,
        status: 'pending',
      }
    ]

    db_con.query.mockResolvedValueOnce([expectedContactDataInDB, []])   // for getUserAndContactRelation sql 1
                  .mockResolvedValueOnce([expectedContactDataInDB2, {}])   // for getUserAndContactRelation sql 2
                  .mockResolvedValueOnce([[], {}]);     // for inserting chat

    const mockReq = {
      userId: 5,
      query: {
        type : "outgoing",
      },
      params: {
        username : "UTU3",
      },
    };

    await deleteRequest(mockReq, mockRes);
    //expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Friend request was cancelled successfully",
    });
    
  });
  
  it('deleteRequest for incoming', async () => {

    const expectedContactDataInDB =  
    [
      {
        user_id: 3,
        username: 'UTU3',
        email: 'utu3@gmail.com',
        name: 'Unit Test User3',
        status: 'active',
        picture: 'file-1711104693859.PNG'
      }
    ]

    
    const expectedContactDataInDB2 =  
    [
      {
        user_id: 3,
        friend_id: 5,
        status: 'pending',
      }
    ]

    db_con.query.mockResolvedValueOnce([expectedContactDataInDB, []])   // for getUserAndContactRelation sql 1
                  .mockResolvedValueOnce([expectedContactDataInDB2, {}])   // for getUserAndContactRelation sql 2
                  .mockResolvedValueOnce([[], {}]);

    const mockReq = {
      userId: 5,
      query: {
        type : "incoming",
      },
      params: {
        username : "UTU3",
      },
    };

    await deleteRequest(mockReq, mockRes);
    //expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Friend request was declined successfully",
    });
    
  });

  it('deleteRequest for friends', async () => {

    const expectedContactDataInDB =  
    [
      {
        user_id: 3,
        username: 'UTU3',
        email: 'utu3@gmail.com',
        name: 'Unit Test User3',
        status: 'active',
        picture: 'file-1711104693859.PNG'
      }
    ]

    
    const expectedContactDataInDB2 =  
    [
      {
        user_id: 3,
        friend_id: 5,
        status: 'friends',
      }
    ]
    const expectedContactDataInDB3 =  
    [
      {
        chat_id: 13,
      }
    ]

    db_con.query.mockResolvedValueOnce([expectedContactDataInDB, []])   // for getUserAndContactRelation sql 1
                  .mockResolvedValueOnce([expectedContactDataInDB2, {}])   // for getUserAndContactRelation sql 2
                  .mockResolvedValueOnce([[expectedContactDataInDB3], {}])
                  .mockResolvedValueOnce([[], {}]);

    const mockReq = {
      userId: 5,
      query: {
        type : "friends",
      },
      params: {
        username : "UTU3",
      },
    };

    await deleteRequest(mockReq, mockRes);
    //expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User was removed from friends list successfully",
    });
    
  });

  it('deleteRequest for blocked', async () => {

    const expectedContactDataInDB =  
    [
      {
        user_id: 3,
        username: 'UTU3',
        email: 'utu3@gmail.com',
        name: 'Unit Test User3',
        status: 'active',
        picture: 'file-1711104693859.PNG'
      }
    ]

    
    const expectedContactDataInDB2 =  
    [
      {
        user_id: 5,
        friend_id: 3,
        status: 'blocked',
      }
    ]

    db_con.query.mockResolvedValueOnce([expectedContactDataInDB, []])   // for getUserAndContactRelation sql 1
                  .mockResolvedValueOnce([expectedContactDataInDB2, {}])   // for getUserAndContactRelation sql 2
                  .mockResolvedValueOnce([[], {}]);

    const mockReq = {
      userId: 5,
      query: {
        type : "blocked",
      },
      params: {
        username : "UTU3",
      },
    };

    await deleteRequest(mockReq, mockRes);
    //expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User was unblocked successfully",
    });
    
  });

});



describe('updateRequest', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updateRequest for friends', async () => {

    const expectedContactDataInDB =  
    [
      {
        user_id: 3,
        username: 'UTU3',
        email: 'utu3@gmail.com',
        name: 'Unit Test User3',
        status: 'active',
        picture: 'file-1711104693859.PNG'
      }
    ]

    
    const expectedContactDataInDB2 =  
    [
      {
        user_id: 3,
        friend_id: 5,
        status: 'pending',
      }
    ]
    const expectedContactDataInDB3 =  
    [
      {
        chat_id: 13,
      }
    ]

    db_con.query.mockResolvedValueOnce([expectedContactDataInDB, []])   // for getUserAndContactRelation sql 1
                  .mockResolvedValueOnce([expectedContactDataInDB2, {}])   // for getUserAndContactRelation sql 2
                  .mockResolvedValueOnce([[expectedContactDataInDB3], {}])
                  .mockResolvedValueOnce([[], {}]);

    const mockReq = {
      userId: 5,
      query: {
        action : "accept",
      },
      params: {
        username : "UTU3",
      },
    };

    await updateRequest(mockReq, mockRes);
    //expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Friend request was accepted successfully",
    });
    
  });


});

describe('blockRequest', () => {
  
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blockRequest for friends', async () => {

    const expectedContactDataInDB =  
    [
      {
        user_id: 3,
        username: 'UTU3',
        email: 'utu3@gmail.com',
        name: 'Unit Test User3',
        status: 'active',
        picture: 'file-1711104693859.PNG'
      }
    ]

    
    const expectedContactDataInDB2 =  
    [
      {
        user_id: 3,
        friend_id: 5,
        status: 'friends',
      }
    ]
    const expectedContactDataInDB3 =  
    [
      {
        chat_id: 13,
      }
    ]

    db_con.query.mockResolvedValueOnce([expectedContactDataInDB, []])   // for getUserAndContactRelation sql 1
                  .mockResolvedValueOnce([expectedContactDataInDB2, {}])   // for getUserAndContactRelation sql 2
                  .mockResolvedValueOnce([[expectedContactDataInDB3], {}])
                  .mockResolvedValueOnce([[], {}]);

    const mockReq = {
      userId: 5,
      query: {
        action : "accept",
      },
      params: {
        username : "UTU3",
      },
    };

    await blockRequest(mockReq, mockRes);
    //expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User was blocked successfully",
    });
    
  });


});

