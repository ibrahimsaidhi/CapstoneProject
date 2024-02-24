/**
 * @author Yash Kapoor - Front-end code 
 * @author Ibrahim Said - Back-end (server) code
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import "../styles/Chat.css";
import axios from 'axios';
import { BsEmojiSmile } from "react-icons/bs";

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
    // detecting and managing notifications that are sent
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    console.log("notifications", notifications)

    // detect all unread messages
    // const unreadNotifications = notifications.map(() => {
    //     return notifications.filter((n) => n.isRead === false);
    // });


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

    useEffect(() =>{
        // receiving notifications
        const receiveNotification = (messageData) => {
            const isChatOpen = messageData.recipientId === userId; // this checks if the recipient is currently active on the chat
            if (isChatOpen){
                // if recipient user, then update the notification index to state that message has been read (???) 
                setNotifications((prev) => [{...messageData, isRead: true}, ...prev]); 
            }
            else {
                setNotifications((prev) => [messageData, ...prev]); // if not, then the message has not been read. 
            }
        };

        socket.on("receive_notification", receiveNotification);
        // cleanup socket listener after use
        return () => {
            socket.off("receive_notification", receiveNotification);
        };
    }, [socket, userId, notifications]);

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
     * Delivers the message over the socket to other users
     */
    const deliverMessage = async () => {
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

    const addEmoji = (e) => {
        const sym = e.unified.split("_");
        const codeArray = [];
        sym.forEach((el) => codeArray.push("0x" + el));
        let emoji = String.fromCodePoint(...codeArray);
        setMessageSent(messageSent + emoji);
      };

    const redirect = () =>{
        window.location.href = "http://localhost:3000/allchats";
    }

    // rendering the chat interface
    return (
        <div className="chat-room"> 
            <div className="chat-box"> 
                <div className="chat-header">
                    <button className="back-button" onClick={redirect}>Back</button>
                    <p>Messaging Chatroom</p>  
                    <div className="notifications">
                        <div className="notifications-icon" onClick={() => setOpen(!open)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chat-left" viewBox="0 0 16 16">
                                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                            </svg>
                        </div>
                        {open ? (
                            <div className="notifications-header">
                                <h4>Notifications</h4>
                                
                            </div>
                        ) : null}
                    </div>
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
                    <span
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="emoji-icon"
                        >
                        <BsEmojiSmile />
                    </span>
                    
                    <button className="send-button" onClick={deliverMessage}>Send</button>
                </div>
            </div>
            {showEmoji && <div>
                        <Picker 
                            data={emojiData}
                            emojiSize={20}
                            emojiButtonSize={28}
                            onEmojiSelect={addEmoji}
                            maxFrequentRows={0}
                        />
                    </div>}
        </div>
    );
}

export default Chat;
