/**
 * @author Yash Kapoor - Front-end code 
 * @author Ibrahim Said - Back-end (server) code
 */

import React, { useState, useEffect, useMemo } from 'react';
import "./Chat.css";

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
    const userId = useMemo(() => {
        // Retrieve from local storage or generate a new one
        return localStorage.getItem('userId') || Math.floor(Math.random() * 1000) + 1;
     }, []);
    
    // manages the state of the message being currently typed
    const [messageSent, setMessageSent] = useState("");
    // manages the state of the chat log (list of messages)
    const [chatLog, setChatLog] = useState([]);

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
        /**
         * Handles incoming messages from users
         * @param {Object} messageData - Data of the received message
         */
        const receiveMessage = (messageData) => {
            const isCurrentUser = messageData.senderId === userId;
            console.log(messageData);
            // Update chat log with the new message, while still displaying the old messages
            setChatLog((log) => [...log, { ...messageData, sentByCurrentUser: isCurrentUser }]);
        };

        scrollToBottom();

        socket.on("receive_message", receiveMessage);
    
        // Cleanup function to remove the event listener
        return () => {
            socket.off("receive_message", receiveMessage);
        };
    }, [socket, userId, chatLog]);

    /**
     * Delivers the message over the socket to other users
     */
    const deliverMessage = async () => {
        if (messageSent !== "") {
            const timestamp = new Date().toISOString()
            .replace(/T/, ' ')      // replace T with a space
            .replace(/\..+/, '');    // delete the dot and everything after
            const messageData = {
                message: messageSent,
                senderId: userId,
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
                        const isCurrentUser = messageData.senderId === userId;
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
