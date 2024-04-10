const { insertScheduledMessages, getScheduledMessages, deleteScheduledMessage } = require('../controller/scheduleMessagesController');
const db_con = require('../connections');

jest.mock('../connections', () => ({
  promise: jest.fn().mockReturnThis(),
  query: jest.fn()
}));

describe('scheduleMessagesController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    db_con.promise.mockClear();
    db_con.query.mockClear();
  });

  describe('insertScheduledMessages', () => {
    it('should insert a scheduled message and return the message ID', async () => {
      req.body = {
        chatId: '123',
        message: 'Test message',
        senderId: '456',
        recipientId: '789',
        message_type: 'text',
        timestamp: '2024-04-10 17:39:00',
        file_path: null,
        file_name: null,
        scheduledTime: '2024-04-10 18:00:00',
        status: 'pending'
      };
      const mockInsertId = 1;
      db_con.query.mockResolvedValueOnce([{ insertId: mockInsertId }]);

      await insertScheduledMessages(req, res);


      expect(db_con.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, messageId: mockInsertId });
    });

    it('should handle database errors during message insertion', async () => {
        req.body = { /* ... */ };
        const mockError = new Error('DB insert error');
        db_con.query.mockRejectedValueOnce(mockError);
  
        await insertScheduledMessages(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
      });
  });


  describe('getScheduledMessages', () => {

    it('should fetch scheduled messages for a given chat ID', async () => {

      req.params.chatId = '123';
      const mockResults = [{ message: 'Test message', status: 'pending' }];
      db_con.query.mockResolvedValueOnce([mockResults]);

      await getScheduledMessages(req, res);

      expect(db_con.query).toHaveBeenCalledWith(expect.any(String), [req.params.chatId]);
      expect(res.json).toHaveBeenCalledWith({ messages: mockResults });
    });

    it('should handle database errors during message fetching', async () => {

        req.params.chatId = '123';
        const mockError = new Error('DB fetch error');
        db_con.query.mockRejectedValueOnce(mockError);
  
        await getScheduledMessages(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
      });
  });


  describe('deleteScheduledMessage', () => {

    it('should delete a scheduled message and return success', async () => {

      req.params.messageId = '1';
      const mockResult = { affectedRows: 1 };
      db_con.query.mockResolvedValueOnce([mockResult]);

      await deleteScheduledMessage(req, res);

      expect(db_con.query).toHaveBeenCalledWith(expect.any(String), [req.params.messageId]);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Scheduled message cancelled." });
    });

    it('should return 404 if the message is not found or already sent', async () => {

      req.params.messageId = '1';
      const mockResult = { affectedRows: 0 };
      db_con.query.mockResolvedValueOnce([mockResult]);

      await deleteScheduledMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Message not found or already sent.");
    });

    it('should handle database errors during message deletion', async () => {
        req.params.messageId = '1';
        const mockError = new Error('DB delete error');
        db_con.query.mockRejectedValueOnce(mockError);
  
        await deleteScheduledMessage(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
      });
  });
});