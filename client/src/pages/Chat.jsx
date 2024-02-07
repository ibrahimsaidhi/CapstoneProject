/**
 * @author Yash Kapoor - Front-end code 
 * @author Ibrahim Said - Back-end (server) code
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/Chat.css";
import axios from 'axios';

/**
 * Chat component that handles real-time messaging
 * @param {Object} props.socket - Socket connection that is needed for real-time communication 
 * @returns {JSX.Element} A rendered chat component
 */
const Chat = ({socket}) => {
    /**
     * This is only for testing purposes.
     * It generates a userId to differentiate between the sender and receiver.
     */
    const [userId, setUserId] = useState(null);
    // manages the state of the message being currently typed
    const [messageSent, setMessageSent] = useState("");
    // manages the state of the chat log (list of messages)
    const [chatLog, setChatLog] = useState([]);
    const location = useLocation();
    const chatId = location.state?.chatId;
    const recipientId = location.state?.contactId;
    
    /**
     * Scrolls automatically to the bottom of the top every time a message is sent
     */
    const scrollToBottom = () => {
        const messagesArea = document.querySelector(".messages-area");
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    };

    useEffect(() => {
        fetchUserId();

        if (chatId) {
            fetchMessages(chatId);
        }
    }, [chatId]);

    useEffect(() => {
        /**
         * Handles incoming messages from users
         * @param {Object} messageData - Data of the received message
         */
        const receiveMessage = (messageData) => {
            const isCurrentUser = messageData.senderId === userId;
        
            // Align the structure of the real-time message with the fetched messages
            const alignedMessage = {
                ...messageData,
                sender_id: messageData.senderId, // Aligning field names
                recipient_id: messageData.recipientId,
                sentByCurrentUser: isCurrentUser
            };
        
            setChatLog((log) => [...log, alignedMessage]);
        };
        

        scrollToBottom();

        socket.on("receive_message", receiveMessage);
    
        // Cleanup function to remove the event listener
        return () => {
            socket.off("receive_message", receiveMessage);
        };
    }, [socket, userId, chatLog]);

   /**
    * Fetches the details of the current user that is logged in
    * from the server.
    */
    const fetchUserId = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/user/details', { withCredentials: true });
            console.log("user response: " + JSON.stringify(response, null, 2));
            setUserId(response.data.userId);
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };
    
    /**
     * Fetches the chat messages from the server.
     * When the user selects a chat from the list of chats,
     * all the messages are fetched from the database.
     */
    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/messages/${chatId}`, { withCredentials: true });
            console.log("Messages fetched from the database: " + JSON.stringify(response, null, 2));
            const fetchedMessages = response.data;
            fetchedMessages.forEach(message => {
                message.timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            })
            setChatLog(fetchedMessages);
        } catch (error) {
            console.error("Error fetching messages: ", error);
        }
    }

    /**
     * Fetches the current status for this particular chat
     * 
     * @returns             the status of the current chat 
     */
    const fetchChatStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/chats/${chatId}/status`, { withCredentials: true });
            return response.data.chatStatus;
    
        } catch (error) {
            console.error("Error fetching messages: ", error);
        }
    }

    /**
     * Delivers the message over the socket to other users
     */
    const deliverMessage = async () => {

        //Fetch the current status of the chat
        const chatStatus = await fetchChatStatus();

        //Check before delivering message that if chat is currently inactive, no message is sent
        if (chatStatus === "inactive")
        {
            return alert("Unable to send message to somone not in your contacts list");
        }
        
        if (messageSent !== "") {
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const messageData = {
                message: messageSent,
                senderId: userId,
                recipientId, 
                timestamp
            }

            await socket.emit("deliver_message", messageData);
            setMessageSent("");
        }
            }

    /**
     * Allows the user to press "Enter" to send a message
     * @param {Object} event 
     */
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            // preventing page reload
            event.preventDefault();
            deliverMessage();
        }
    }

    // rendering the chat interface
    return (
        <div className="chat-room"> 
            <div className="chat-box"> 
                <div className="chat-header">
                    <p>Messaging Chatroom</p>
                </div>
                <div className="messages-area">
                    {chatLog.map((messageData, index) => {
                        const isCurrentUser = messageData.sender_id === userId;
                        return (
                            <div key={index} className={isCurrentUser ? "message user-message" : "message opponent-message"}>
                                <p>{messageData.message}</p>
                                <p className="message-time">{messageData.timestamp}</p>
                            </div>
                        )
                    })}
                </div>
                <div className="chat-footer">
                    <input 
                        type="text"
                        className="message-input"
                        placeholder="Send a message..."
                        value={messageSent}
                        onChange={(e) => {
                            setMessageSent(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="send-button" onClick={deliverMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
