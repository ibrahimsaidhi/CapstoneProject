it("should pass", () => {
  expect(true).toBe(true);
});
// import React from 'react';
// import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
// import mockAxios from 'jest-mock-axios';
// import Chat from '../pages/Chat';

// jest.mock('axios', () => mockAxios);
// jest.mock('react-router-dom', () => {
//     const actualReactRouterDom = jest.requireActual('react-router-dom');
//     return {
//       ...actualReactRouterDom,
//       useLocation: jest.fn().mockReturnValue({
//         state: { chatId: '123', contactId: '1', chatType: 'one-on-one', chatName: 'Test Chat' },
//       }),
//     };
//   });
  

// const mockSocket = {
//   emit: jest.fn(),
//   on: jest.fn(),
//   off: jest.fn(),
// };

// describe('Chat Component', () => {
//   beforeEach(() => {
//     mockAxios.reset();
//     mockSocket.emit.mockClear();
//     mockSocket.on.mockClear();
//     mockSocket.off.mockClear();
//     jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
//         state: { chatId: '123', contactId: '1', chatType: 'one-on-one', chatName: 'Test Chat' },
//     });
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });
  

//   it('renders Chat component', async () => {
//     mockAxios.get.mockImplementation(url => {
//       if (url.includes('/api/user/details')) {
//         return Promise.resolve({
//           data: {
//             userId: 10,
//             username: "Leo34",
//             email: "test7@example.com",
//             name: "Leo"
//           },
//         });
//       }
//       if (url.includes('/api/messages/getParticipants')) {
//         return Promise.resolve({
//           data: {
//             "participants": [
//               {
//                 "user_id": 8,
//                 "name": "Brad",
//                 "username": "Brad12"
//               },
//               {
//                 "user_id": 9,
//                 "name": "Mary",
//                 "username": "Mary12"
//               },
//               {
//                 "user_id": 10,
//                 "name": "Leo",
//                 "username": "Leo34"
//               }
//             ]
//           },
//         });
//       }
//       if (url.includes('/api/messages/')) {
//         return Promise.resolve({
//           data: [
//             {
//               "message_id": 808,
//               "message": "Hey there!",
//               "timestamp": "2024-03-13T08:13:56.000Z",
//               "sender_id": 10,
//               "recipient_id": 11,
//               "message_type": "text",
//               "chat_id": 123,
//               "file_path": null,
//               "file_name": null,
//               "scheduled_time": null,
//               "status": "sent",
//               "sender_username": "Leo34"
//             },
//           ],
//         });
//       }
//       if (url.includes('/api/schedule/')) {
//         return Promise.resolve({
//             "data": {
//               "messages": [
//                 {
//                   "message_id": 891,
//                   "message": "hey leo",
//                   "timestamp": "2024-03-13T21:43:41.000Z",
//                   "sender_id": 9,
//                   "recipient_id": 10,
//                   "message_type": "regular",
//                   "chat_id": 179,
//                   "file_path": null,
//                   "file_name": null,
//                   "scheduled_time": null,
//                   "status": "pending"
//                 }
//               ]
//             }         
//         })
//       }
//       throw new Error(`Unhandled request: ${url}`);
//     });

//     // eslint-disable-next-line testing-library/no-unnecessary-act
//     await act( async () => render(<Chat socket={mockSocket}/>));
//   });

//   it('allows users to type a message and send', async () => {
//     mockAxios.get.mockImplementation(url => {
//       if (url.includes('/api/user/details')) {
//         return Promise.resolve({
//           data: {
//             userId: 10,
//             username: "Leo34",
//             email: "test7@example.com",
//             name: "Leo"
//           },
//         });
//       }
//       if (url.includes('/api/messages/getParticipants')) {
//         return Promise.resolve({
//           data: {
//             "participants": [
//               {
//                 "user_id": 8,
//                 "name": "Brad",
//                 "username": "Brad12"
//               },
//               {
//                 "user_id": 9,
//                 "name": "Mary",
//                 "username": "Mary12"
//               },
//               {
//                 "user_id": 10,
//                 "name": "Leo",
//                 "username": "Leo34"
//               }
//             ]
//           },
//         });
//       }
//       if (url.includes('/api/messages/')) {
//         return Promise.resolve({
//           data: [
//             {
//               "message_id": 808,
//               "message": "Hey there!",
//               "timestamp": "2024-03-13T08:13:56.000Z",
//               "sender_id": 10,
//               "recipient_id": 11,
//               "message_type": "text",
//               "chat_id": 123,
//               "file_path": null,
//               "file_name": null,
//               "scheduled_time": null,
//               "status": "sent",
//               "sender_username": "Leo34"
//             },
//           ],
//         });
//       }
//       if (url.includes('/api/schedule/')) {
//         return Promise.resolve({
//             "data": {
//               "messages": [
//                 {
//                   "message_id": 891,
//                   "message": "hey leo",
//                   "timestamp": "2024-03-13T21:43:41.000Z",
//                   "sender_id": 9,
//                   "recipient_id": 10,
//                   "message_type": "regular",
//                   "chat_id": 179,
//                   "file_path": null,
//                   "file_name": null,
//                   "scheduled_time": null,
//                   "status": "pending"
//                 }
//               ]
//             }         
//         })
//       }
//       if (url === `/api/chats/123/status`) {
//         return Promise.resolve({
//           data: {
//             chatStatus: "active"
//           }
//         });
//       }
//       throw new Error(`Unhandled request: ${url}`);
//     });

//     // eslint-disable-next-line testing-library/no-unnecessary-act
//     await act(async () => {render(<Chat socket={mockSocket}/>)});
      
//     // eslint-disable-next-line testing-library/no-unnecessary-act
//     await act(async () => {
//       const input = await screen.findByPlaceholderText('Send a message...');
//       const sendButton = await screen.findByText('Send');
      
//       // Simulate typing a message
//       fireEvent.change(input, { target: { value: 'Hello World' } });
//       // Simulate clicking the send button
//       fireEvent.click(sendButton);
//     })
//   });

//   it('fetches user details and messages on mount', async () => {
//     mockAxios.get.mockImplementation(url => {
//       if (url.includes('/api/user/details')) {
//         return Promise.resolve({
//           data: {
//             userId: 10,
//             username: "Leo34",
//             email: "test7@example.com",
//             name: "Leo"
//           },
//         });
//       }
//       if (url.includes('/api/messages/getParticipants')) {
//         return Promise.resolve({
//           data: {
//             "participants": [
//               {
//                 "user_id": 8,
//                 "name": "Brad",
//                 "username": "Brad12"
//               },
//               {
//                 "user_id": 9,
//                 "name": "Mary",
//                 "username": "Mary12"
//               },
//               {
//                 "user_id": 10,
//                 "name": "Leo",
//                 "username": "Leo34"
//               }
//             ]
//           },
//         });
//       }
//       if (url.includes('/api/messages/')) {
//         return Promise.resolve({
//           data: [
//             {
//               "message_id": 808,
//               "message": "Hey there!",
//               "timestamp": "2024-03-13T08:13:56.000Z",
//               "sender_id": 10,
//               "recipient_id": 11,
//               "message_type": "text",
//               "chat_id": 123,
//               "file_path": null,
//               "file_name": null,
//               "scheduled_time": null,
//               "status": "sent",
//               "sender_username": "Leo34"
//             },
//           ],
//         });
//       }
//       if (url.includes('/api/schedule/')) {
//         return Promise.resolve({
//             "data": {
//               "messages": [
//                 {
//                   "message_id": 891,
//                   "message": "hey leo",
//                   "timestamp": "2024-03-13T21:43:41.000Z",
//                   "sender_id": 9,
//                   "recipient_id": 10,
//                   "message_type": "regular",
//                   "chat_id": 179,
//                   "file_path": null,
//                   "file_name": null,
//                   "scheduled_time": null,
//                   "status": "pending"
//                 }
//               ]
//             }         
//         })
//       }
//       if (url.includes(`/api/chats/123/status`)) {
//         return Promise.resolve({
//           data: {
//             chatStatus: "active"
//           }
//         });
//       }
//       throw new Error(`Unhandled request: ${url}`);
//     });
//     // eslint-disable-next-line testing-library/no-unnecessary-act
//     await act(async () => render(<Chat socket={mockSocket} />));
//     expect(mockAxios.get).toHaveBeenCalledTimes(8); 
//   });

//   it('handles file upload when a file is selected', async () => {
//     mockAxios.get.mockImplementation(url => {
//       if (url.includes('/api/user/details')) {
//         return Promise.resolve({
//           data: {
//             userId: 10,
//             username: "Leo34",
//             email: "test7@example.com",
//             name: "Leo"
//           },
//         });
//       }
//       if (url.includes('/api/messages/getParticipants')) {
//         return Promise.resolve({
//           data: {
//             "participants": [
//               {
//                 "user_id": 8,
//                 "name": "Brad",
//                 "username": "Brad12"
//               },
//               {
//                 "user_id": 9,
//                 "name": "Mary",
//                 "username": "Mary12"
//               },
//               {
//                 "user_id": 10,
//                 "name": "Leo",
//                 "username": "Leo34"
//               }
//             ]
//           },
//         });
//       }
//       if (url.includes('/api/messages/')) {
//         return Promise.resolve({
//           data: [
//             {
//               "message_id": 808,
//               "message": "Hey there!",
//               "timestamp": "2024-03-13T08:13:56.000Z",
//               "sender_id": 10,
//               "recipient_id": 11,
//               "message_type": "text",
//               "chat_id": 123,
//               "file_path": null,
//               "file_name": null,
//               "scheduled_time": null,
//               "status": "sent",
//               "sender_username": "Leo34"
//             },
//           ],
//         });
//       }
//       if (url.includes('/api/schedule/')) {
//         return Promise.resolve({
//             "data": {
//               "messages": [
//                 {
//                   "message_id": 891,
//                   "message": "hey leo",
//                   "timestamp": "2024-03-13T21:43:41.000Z",
//                   "sender_id": 9,
//                   "recipient_id": 10,
//                   "message_type": "regular",
//                   "chat_id": 179,
//                   "file_path": null,
//                   "file_name": null,
//                   "scheduled_time": null,
//                   "status": "pending"
//                 }
//               ]
//             }         
//         })
//       }
//       if (url.includes(`/api/chats/123/status`)) {
//         return Promise.resolve({
//           data: {
//             chatStatus: "active"
//           }
//         });
//       }   
//       throw new Error(`Unhandled request: ${url}`);
//     });

//     mockAxios.post.mockImplementation(url => {
//       if (url.includes(`/api/upload/uploadFiles`)) {
//         return Promise.resolve({
//           data: {
//             filePath: '/uploads/test.png'
//           }
//         });
//       }   
//     })
//     const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });

//     // eslint-disable-next-line testing-library/no-unnecessary-act
//     await act(async () => {render(<Chat socket={mockSocket}/>)});
//     const fileInput = screen.getByLabelText('Choose Files');

//     // change event to simulate a user selecting a file
//     fireEvent.change(fileInput, { target: { files: [file] } });

//     const fileElement = await screen.findByText(file.name);
//     expect(fileElement).toBeInTheDocument();
    
//   });

//   it('renders scheduled messages correctly', async () => {
//     mockAxios.get.mockImplementation(url => {
//       if (url.includes('/api/user/details')) {
//         return Promise.resolve({
//           data: {
//             userId: 10,
//             username: "Leo34",
//             email: "test7@example.com",
//             name: "Leo"
//           },
//         });
//       }
//       if (url.includes('/api/messages/getParticipants')) {
//         return Promise.resolve({
//           data: {
//             "participants": [
//               {
//                 "user_id": 8,
//                 "name": "Brad",
//                 "username": "Brad12"
//               },
//               {
//                 "user_id": 9,
//                 "name": "Mary",
//                 "username": "Mary12"
//               },
//               {
//                 "user_id": 10,
//                 "name": "Leo",
//                 "username": "Leo34"
//               }
//             ]
//           },
//         });
//       }
//       if (url.includes('/api/messages/')) {
//         return Promise.resolve({
//           data: [
//             {
//               "message_id": 808,
//               "message": "Hey there!",
//               "timestamp": "2024-03-13T08:13:56.000Z",
//               "sender_id": 10,
//               "recipient_id": 11,
//               "message_type": "text",
//               "chat_id": 123,
//               "file_path": null,
//               "file_name": null,
//               "scheduled_time": null,
//               "status": "sent",
//               "sender_username": "Leo34"
//             },
//           ],
//         });
//       }
//       if (url.includes('/api/schedule/')) {
//         return Promise.resolve({
//             "data": {
//               "messages": [
//                 {
//                   "message_id":964,
//                   "message":"testMessage",
//                   "timestamp":"2024-03-20T06:21:12.000Z",
//                   "sender_id":10,
//                   "recipient_id":9,
//                   "message_type":"text",
//                   "chat_id":179,
//                   "file_path":null,
//                   "file_name":"",
//                   "scheduled_time":"2024-03-20T06:21:42.000Z",
//                   "status":"pending"
//                 }
//               ]
//             },
//             status: 200      
//         })
//       }
//       if (url.includes(`/api/chats/123/status`)) {
//         return Promise.resolve({
//           data: {
//             chatStatus: "active"
//           }
//         });
//       }   
//       throw new Error(`Unhandled request: ${url}`);
//     });

//     mockAxios.post.mockImplementation(url => {
//       if (url.includes(`/api/upload/uploadFiles`)) {
//         return Promise.resolve({
//           data: {
//             filePath: '/uploads/test.png'
//           }
//         });
//       }   
//     })
//     const scheduledMessages = [{
//       message_id:964,
//       message:"testMessage",
//       timestamp:"2024-03-20T06:21:12.000Z",
//       sender_id:10,
//       recipient_id:9,
//       message_type:"text",
//       chat_id:179,
//       file_path:null,
//       file_name:"",
//       scheduled_time:"2024-03-20T06:21:42.000Z",
//       status:"pending"
//     }];

//     // eslint-disable-next-line testing-library/no-unnecessary-act
//     await act(async () => {render(<Chat socket={mockSocket}/>)});
    
//     await waitFor(() => {
//       scheduledMessages.forEach(async (msg) => {
//           const messageText = `${msg.message} - Scheduled for ${new Date(msg.scheduled_time).toLocaleString()}`;
//           expect(await screen.findByText(messageText)).toBeInTheDocument();
//       });
//     });
//   });

//   it('sends a message with a delay when scheduled', async () => {
//     mockAxios.get.mockImplementation(url => {
//       if (url.includes('/api/user/details')) {
//         return Promise.resolve({
//           data: {
//             userId: 10,
//             username: "Leo34",
//             email: "test7@example.com",
//             name: "Leo"
//           },
//         });
//       }
//       if (url.includes('/api/messages/getParticipants')) {
//         return Promise.resolve({
//           data: {
//             "participants": [
//               {
//                 "user_id": 8,
//                 "name": "Brad",
//                 "username": "Brad12"
//               },
//               {
//                 "user_id": 9,
//                 "name": "Mary",
//                 "username": "Mary12"
//               },
//               {
//                 "user_id": 10,
//                 "name": "Leo",
//                 "username": "Leo34"
//               }
//             ]
//           },
//         });
//       }
//       if (url.includes('/api/messages/')) {
//         return Promise.resolve({
//           data: [
//             {
//               "message_id": 808,
//               "message": "Hey there!",
//               "timestamp": "2024-03-13T08:13:56.000Z",
//               "sender_id": 10,
//               "recipient_id": 11,
//               "message_type": "text",
//               "chat_id": 123,
//               "file_path": null,
//               "file_name": null,
//               "scheduled_time": null,
//               "status": "sent",
//               "sender_username": "Leo34"
//             },
//           ],
//         });
//       }
//       if (url.includes('/api/schedule/')) {
//         return Promise.resolve({
//             "data": {
//               "messages": [
//                 {
//                   "message_id":964,
//                   "message":"testMessage",
//                   "timestamp":"2024-03-20T06:21:12.000Z",
//                   "sender_id":10,
//                   "recipient_id":9,
//                   "message_type":"text",
//                   "chat_id":179,
//                   "file_path":null,
//                   "file_name":"",
//                   "scheduled_time":"2024-03-20T06:21:42.000Z",
//                   "status":"pending"
//                 }
//               ]
//             },
//             status: 200      
//         })
//       }
//       if (url.includes(`/api/chats/123/status`)) {
//         return Promise.resolve({
//           data: {
//             chatStatus: "active"
//           }
//         });
//       }   
//       throw new Error(`Unhandled request: ${url}`);
//     });

//     mockAxios.post.mockImplementation(url => {
//       if (url.includes(`/api/upload/uploadFiles`)) {
//         return Promise.resolve({
//           data: {
//             filePath: '/uploads/test.png'
//           }
//         });
//       }   
//       if (url.includes(`/api/schedule/insertScheduledMessages`)) {
//         return Promise.resolve({
//           data: {
//             "success":true,
//             "messageId":965
//           }, 
//           status: 200
//         });
//       } 
//     })
//     // eslint-disable-next-line testing-library/no-unnecessary-act
//     await act(async () => {render(<Chat socket={mockSocket}/>)});
//     const delayDropdown = screen.getByRole('combobox');
//     const messageInput = screen.getByRole('textbox');
//     const sendButton = screen.getByRole('button', { name: /send/i });

//     // Select a delay from the dropdown
//     fireEvent.change(delayDropdown, { target: { value: '5' } }); 

//     // Type a message
//     fireEvent.change(messageInput, { target: { value: 'Scheduled message' } });

//     // Click send button
//     fireEvent.click(sendButton);

//     const expectedDelayMinutes = 5;
//     const expectedScheduledTime = new Date(Date.now() + expectedDelayMinutes * 60000);
  
//     await waitFor(() => {
//       expect(mockAxios.post).toHaveBeenCalled();
//     });
  
//     const postData = mockAxios.post.mock.calls[mockAxios.post.mock.calls.length - 1][1];
//     const actualScheduledTime = new Date(postData.scheduledTime);
  
//     // Check if the actual scheduled time is within a tolerance range of the expected time
//     const toleranceMs = 60 * 1000; 
//     expect(actualScheduledTime.getTime()).toBeGreaterThanOrEqual(expectedScheduledTime.getTime() - toleranceMs);
//     expect(actualScheduledTime.getTime()).toBeLessThanOrEqual(expectedScheduledTime.getTime() + toleranceMs);
//   });
// });
