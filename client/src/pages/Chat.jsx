/**
 * @author Yash Kapoor - Front-end code 
 * @author Ibrahim Said - Back-end (server) code
 */

import React, { useState, useEffect } from 'react';
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useLocation } from 'react-router-dom';
import "../styles/Chat.css";
import '../styles/ImageModal.css';
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
    const [username, setUsername] = useState(null);
    const [uploadedFilePath, setUploadedFilePath] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [fileLabel, setFileLabel] = useState("No File Chosen");
    const [fileName, setFileName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [chatParticipants, setChatParticipants] = useState([]);

    // timed messages delay
    const [sendDelay, setSendDelay] = useState("Now");
    const [customDelay, setCustomDelay] = useState("");
    const [isCustomDelay, setIsCustomDelay] = useState(false);
    const [scheduledMessages, setScheduledMessages] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const location = useLocation();
    const chatId = location.state?.chatId;
    const recipientId = location.state?.contactId;
    const chatType = location.state?.chatType;    
    const chatName = location.state?.chatName;

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
        // Fetch user details and chat messages
        fetchUserDetails().then(() => {
            if (chatId) {
                fetchMessages(chatId);
                fetchChatParticipants(chatId);
                // Join the chat room
                socket.emit("join_chat", chatId);
            }
        });

        return () => {
            if (chatId) {
                // Emitting the leave_chat event when the 
                // component unmounts or dependencies change
                socket.emit("leave_chat", chatId);
                console.log(`User with ID ${userId} is leaving chat ${chatId}`);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [chatId, socket, userId]); 
    

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
                sentByCurrentUser: isCurrentUser,
                timestamp: formatTimestamp()
            };
        
            setChatLog((log) => [...log, alignedMessage]);
        };

        /**
         * Ensures that the scheduled message gets removed from the side panel
         * after it gets sent.
         * @param {number} messageId - the ID of the message
         */
        const handleMessageSent = (messageId) => {        
            setScheduledMessages((currentMessages) =>
                currentMessages.filter(message => {
                    return message.message_id !== messageId;
                })
            );
        };
        
        scrollToBottom();

        socket.on("receive_message", receiveMessage);
        socket.on("message_sent", handleMessageSent);
    
        // Cleanup function to remove the event listener
        return () => {
            socket.off("receive_message", receiveMessage);
            socket.off("message_sent", handleMessageSent);
        };
    }, [socket, userId, chatLog]);

    /**
     * takes emoji raw string and converts to hex equivalent for EmojiMart to process
     * @param {*} e 
     */
    const addEmoji = (e) => {
        const sym = e.unified.split("-");
        const codeArray = [];
        sym.forEach((el) => codeArray.push("0x" + el));
        let emoji = String.fromCodePoint(...codeArray);
        setMessageSent(messageSent + emoji);
      };

    /**
     * Fetch scheduled messages for this chat.
     */
    const fetchScheduledMessages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_PARLONS_URL}/schedule/${chatId}`, { withCredentials: true });
            if (response.status === 200 && response.data.messages) {
                const userScheduledMessages = response.data.messages.filter(message => message.sender_id === userId);
                setScheduledMessages(userScheduledMessages);
            }
        } catch (error) {
            console.error("Error fetching scheduled messages: ", error);
        }
    };
    
    /**
     * Fetches the names of the participants in the chat.
     * Assumes an endpoint exists that returns an array of user details for a given chatId.
     * @param {number} chatId - The ID of the chat for which participants are being fetched.
     */
    const fetchChatParticipants = async (chatId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_PARLONS_URL}/messages/getParticipants/${chatId}`, { withCredentials: true });
            console.log("Fetch Chat Participants Response: " + JSON.stringify(response.data, null, 2));
            setChatParticipants(response.data.participants);
        } catch (error) {
            console.error("Error fetching chat participants: ", error);
        }
    };

    /**
     * Generates a title for the chat header based on the participants' names.
     * @returns {string} The title to be displayed in the chat header.
     */
    const getChatTitle = () => {
        // debugging purposes
        console.log("Current user's username:", username);
        console.log("Chat participants' usernames:", chatParticipants);
    
        const participantsWithTitle = chatParticipants.map((participant) => 
            participant.username === username ? `${participant.username} (Me)` : participant.username
        );
                
        return participantsWithTitle.length > 1 ? participantsWithTitle.join(', ') : participantsWithTitle[0] || 'Messaging Chatroom';
    };
    
    

   /**
    * Fetches the details of the current user that is logged in
    * from the server.
    */
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_PARLONS_URL}/user/details`, { withCredentials: true });
            console.log("User response: " + JSON.stringify(response, null, 2));
            setUserId(response.data.userId);
            setUsername(response.data.username);
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };
    
    /**
     * The timestamp is originally in UTC. 
     * This formats the timestamp, so it is the same time
     * as the time on the user's computer.
     * 
     * The formatted timestamp is in YYYY-MM-DD HH-MM-SS
     * @param {DateTime} timestamp - the timestamp in UTC
     * @returns     the formatted timestamp
     */
    const formatTimestamp = (timestamp = null) => {
        let now;
        if(timestamp != null) {
            now = new Date(timestamp);
        } else {
            now = new Date();
        }

        // date object used to get the current time
        // Function to pad numbers to two digits with leading zeros
        const padTo2Digits = (num) => num.toString().padStart(2, '0');
        const formattedTimestamp = [
            now.getFullYear(),
            padTo2Digits(now.getMonth() + 1), 
            padTo2Digits(now.getDate()),
            ].join('-') + ' ' + [
            padTo2Digits(now.getHours()),
            padTo2Digits(now.getMinutes()),
            padTo2Digits(now.getSeconds()),
            ].join(':');
        
        return formattedTimestamp;
    }

    /**
     * Fetches the chat messages from the server.
     * When the user selects a chat from the list of chats,
     * all the messages are fetched from the database.
     */
    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_PARLONS_URL}/messages/${chatId}`, { withCredentials: true });
            console.log("Messages fetched from the database: " + JSON.stringify(response, null, 2));
            const fetchedMessages = response.data;
            const updatedMessages = fetchedMessages.map(message => {
                const formattedTimestamp = formatTimestamp(message.timestamp);

                return {
                    ...message,
                    timestamp: formattedTimestamp
                };
            });
            setChatLog(updatedMessages);
            fetchScheduledMessages();
        } catch (error) {
            console.error("Error fetching messages: ", error);
        }
    }

    /**
     * Fetches the current status for this particular chat
     * 
     * @returns      the status of the current chat 
     */
    const fetchChatStatus = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_PARLONS_URL}/chats/${chatId}/status`, { withCredentials: true });
            return response.data.chatStatus;
    
        } catch (error) {
            console.error("Error fetching messages: ", error);
        }
    }

    /**
     * Handles the change event on a file input element.
     * It calls the "uploadFile" function with the 
     * appropriate file type (image, video, audio, documents, compressed files).
     * @param {Event} event - Event object that contains the properties of the file that has been uploaded.
     */
    const handleFileChange = async (event) => {
        const files = event.target.files;
        if(files.length > 0) {
            // Check if at least one file is selected
            const file = files[0];
            const fileName = file.name;
    
            Array.from(files).forEach(file => {
                const fileType = file.type.split('/')[0];
                
                switch (fileType) {
                    case 'image':
                        // Handle image upload
                        uploadFile(file, 'image');
                        break;
                    case 'video':
                        // Handle video upload
                        uploadFile(file, 'video');
                        break;
                    case 'audio':
                        // Handle audio upload
                        uploadFile(file, 'audio');
                        break;
                    default:
                        // Handle other files (documents, compressed files)
                        // I rendered a "download file" link for these that the user can click on
                        uploadFile(file, 'other');
                        break;
                }
                setFileName(fileName);
                setFileLabel(event.target.files.length > 0 ? `${fileName}` : "No File Chosen");
            });
        }
    };

    /**
     * Makes a request to the server to place the file that the user uploaded
     * in the appropriate directory.
     * 
     * If the upload is successful, then it sets the file path and the type of file (e.g., image, video, documents)
     * If there is an error during the upload, then it logs the error to the console.
     * @param {File} file - The file object to be uploaded.
     * @param {String} type - A string that indicates the type of file that is being uploaded (e.g., image, video, audio, other)
     */
    const uploadFile = async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_PARLONS_URL}/upload/uploadFiles`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
            console.log('File uploaded successfully:', response.data);
            setUploadedFilePath(response.data.filePath);
            setFileType(file.type.split('/')[0]);        
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    
    /**
     * Makes a call to the server to insert the
     * message into the database after a delay.
     * 
     * The delay depends on when the user scheduled the message for.
     * @param {Object} messageData - data of the message
     * @param {number} delay - the time the user needs to wait for before the message sends
     */
    const insertScheduledMessage = async (messageData, delay) => {
        const scheduledTime = new Date(new Date().getTime() + parseFloat(delay) * 60000);
    
        const postData = {
            chatId: messageData.chatId,
            message: messageData.message,
            senderId: messageData.senderId,
            sender_username: messageData.sender_username,
            recipientId: messageData.recipientId,
            message_type: messageData.message_type,
            timestamp: messageData.timestamp,
            file_path: messageData.file_path,
            file_name: messageData.file_name,
            chatName: messageData.chatName,
            chatType: messageData.chatType,
            scheduledTime: scheduledTime, 
            status: 'pending'
        };
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_PARLONS_URL}/schedule/insertScheduledMessages`, postData, { withCredentials: true });
    
            if (response.status === 200) {
                console.log("Message scheduled: ", JSON.stringify(response.data));
                fetchScheduledMessages();
            } else {
                console.error("Error scheduling message: ", response.data);
            }
        } catch (error) {
            console.error('Error scheduling message:', error);
        }
    };
    
    /**
     * Delivers the message over the socket to other users
     */
    const deliverMessage = async () => {
        // Fetch the current status of the chat
        const chatStatus = await fetchChatStatus();

        // Check before delivering message that if chat is currently inactive, no message is sent
        if (chatStatus === "inactive")
        {
            return alert("Unable to send message to someone not in your contacts list");
        }
        
        if (!messageSent.trim() && !uploadedFilePath) return;

        // formatting the timestamp
        const formattedTimestamp = formatTimestamp();

        const messageData = {
            message_type: uploadedFilePath ? fileType : 'text',
            message: messageSent,
            file_path: uploadedFilePath,
            file_name: fileName,
            sender_username: username,
            senderId: userId,
            recipientId, 
            timestamp: formattedTimestamp,
            chatId,
            chatType,
            chatName
        }

        if (sendDelay === "Now") {
            // user wants to send the message now
            await socket.emit("deliver_message", messageData);
            fetchScheduledMessages();
        } else {
            // user scheduled the message for a particular time in the future
            await insertScheduledMessage(messageData, sendDelay);
        }  
        setMessageSent("");
        setUploadedFilePath(null);
        setFileType(null);
    }

    /**
     * Allows the user to press "Enter" to send a message
     * @param {Event} event 
     */
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            // preventing page reload
            event.preventDefault();
            deliverMessage();
            handleFileDeselect(); 
        }
    }

    /**
     * Updating the state variables to ensure that no file is selected.
     * This is useful when the user clicks on the "Remove File" button
     * to remove a specific file and choose another file to send in a 
     * chat instead.
     */
    const handleFileDeselect = () => {
        document.getElementById('fileInput').value = '';
        setFileLabel("No File Chosen");
        setUploadedFilePath(null);
        setFileType(null);
        setFileName("");
    };

    /**
     * Allows the user to schedule the message, so it sends after 
     * a delay that is chosen by the user. 
     * @param {Event} e - The event object that contains information 
     *                    about when the user wants to send the message
     */
    const handleSendDelayChange = (e) => {
        const selectedDelay = e.target.value;
        setSendDelay(selectedDelay);
    
        if (selectedDelay === "Custom") {
            const customInput = prompt("Enter custom delay in minutes:", "90");

            if (customInput === null) {
                // User pressed cancel
                setSendDelay(sendDelay); 
                setIsCustomDelay(false);
                return; 
            }

            const customDelayInMinutes = parseFloat(customInput);
    
            if (!isNaN(customDelayInMinutes) && customDelayInMinutes > 0) {
                setCustomDelay(customDelayInMinutes.toString());
                setIsCustomDelay(true);
                setSendDelay(customDelayInMinutes);
            } else {
                alert("Invalid input. Please enter a number greater than 0.");
                setSendDelay("Now"); 
                setIsCustomDelay(false);
            }
        } else {
            setCustomDelay(""); 
            setSendDelay(selectedDelay);
            setIsCustomDelay(false);
        }
    };

    /**
     * Makes a call to the server to delete the scheduled message 
     * from the database. 
     * @param {number} messageId - the ID of the message.
     */
    const cancelScheduledMessage = async (messageId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_PARLONS_URL}/schedule/${messageId}`, { withCredentials: true });
            if (response.status === 200) {
                // Removing the message from the scheduled messages state
                setScheduledMessages(scheduledMessages.filter(message => message.message_id !== messageId));
            }
        } catch (error) {
            console.error("Error cancelling scheduled message: ", error);
        }
    };
    

    /**
     * The side panel that displays a list of the messages that have been
     * scheduled by the user. The user has the option to close the panel 
     * and re-open it if they would like.
     * 
     * If the user wants to send the message after X minutes, this is where
     * it shall appear. 
     * @returns     null if the user decides to close the panel.
     */
    const ScheduledMessagesPanel = () => {
        if (!isPanelOpen) return null;

        return (
            <div className="scheduled-messages-panel">
                <button onClick={togglePanel} className="toggle-panel-button">
                    {isPanelOpen ? 'Hide' : 'Show'} Scheduled Messages
                </button>
                <h3 className="scheduled-messages-header">Scheduled Messages</h3>
                <div className="messages-list-container">
                    <ul>
                        {scheduledMessages?.map((message, index) => (
                            message.scheduled_time === null ? (
                                ""
                            ) : 
                            <li key={index}>
                                {message.message} 
                                {message.file_name && message.file_name !== "" && ` [${message.file_name}]`} - Scheduled for {new Date(message.scheduled_time).toLocaleString()}
                                <button onClick={() => cancelScheduledMessage(message.message_id)}>Cancel</button>        
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="send-delay-dropdown-container">
                    <select className="send-delay-dropdown" value={sendDelay} onChange={handleSendDelayChange}>
                        <option value="Now">Send Now</option>
                        <option value="5">After 5 minutes</option>
                        <option value="15">After 15 minutes</option>
                        <option value="30">After 30 minutes</option>
                        <option value="60">After 60 minutes</option>
                        {isCustomDelay && <option value={customDelay}>{`After ${customDelay} minutes`}</option>}
                        <option value="Custom">Customize</option>
                    </select>
                </div>
            </div>
        );
    };

    /**
     * Enables users to enlarge an image by clicking on it.
     * @param {Object} props - Props contain isOpen, onClose, and src.
     * isOpen - whether the modal is open or not.
     * onClose - disable the modal when it is closed.
     * src - the URL of the image to be enlarged
     */
    const ImageModal = ({ isOpen, src, onClose }) => {
        if (!isOpen) return null;
        
        return (
            <div className="image-modal-backdrop" onClick={onClose}>
            <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                <img src={src} alt="Expanded view" style={{ maxWidth: '90%', maxHeight: '90%' }} />
                <button onClick={onClose}>Close</button>
            </div>
            </div>
        );
    };

    /**
     * Changes the state of the panel, so it can
     * be opened/closed by the user.
     */
    const togglePanel = () => {
        setIsPanelOpen(prevState => !prevState);
    }

    // rendering the chat interface
    return (
        <div className="chat-room">
            <ImageModal isOpen={isModalOpen} src={currentImageSrc} onClose={() => setIsModalOpen(false)} />
            <div className="chat-container">
                <div className="chat-box">
                    <div className="chat-header">
                        <p>{`Participants: ${getChatTitle()}`}</p>
                    </div>
                    <div className="messages-area">
                    {chatLog.map((messageData, index) => {
                        const isCurrentUser = messageData.sender_id === userId;
                        const isImageMessage = messageData.message_type === 'image';
                        const isVideoMessage = messageData.message_type === 'video';
                        const isFileMessage = messageData.message_type === 'application';

                        const fileSrc = `${process.env.REACT_APP_PARLONS_PROFILE_URL}${messageData.file_path}`;

                        return (
                            <div key={index} className={isCurrentUser ? "message user-message" : "message opponent-message"}>
                                <strong>{messageData.sender_username}</strong>
                                {/* Display text message if it exists */}
                                {<p>{messageData.message}</p>}
                                {/* Then check for and display file if it exists */}
                                {isImageMessage && (
                                    <img src={fileSrc}
                                        alt="file" 
                                        style={{ maxWidth: '300px', maxHeight: '300px', cursor: 'pointer' }} 
                                        onClick={() => {
                                            setCurrentImageSrc(fileSrc);
                                            setIsModalOpen(true);
                                        }}
                                    />
                                )}
                                {isVideoMessage && (
                                    <video width="320" height="240" controls style={{display: 'block', margin: '0 auto' }}>
                                        <source src={fileSrc} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                                {isFileMessage && (
                                    <a href={fileSrc} download style={{ color: "#FF7F50"}}>{messageData.file_name}</a>
                                )}
                                <p className="message-time">{messageData.timestamp}</p>
                            </div>
                            );
                        })}

                    </div>
                    <div className="chat-footer">
                        <div className="file-input-container">
                            <input
                                type="file"
                                id="fileInput"
                                style={{ display: 'none' }}
                                accept="image/*,video/*,audio/*,application/pdf,application/zip"
                                onChange={handleFileChange}
                                multiple
                            />
                            <label htmlFor="fileInput" className="file-upload-button">
                                Choose Files
                            </label>
                            
                            <button className="file-deselect-button" onClick={handleFileDeselect}>
                                Remove File
                            </button>
                            <br/>
                            <br />
                            <span className="file-upload-status">{fileLabel}</span>               
                        </div>
                        <div className="message-send-options">
                            <textarea
                                className="message-input"
                                placeholder="Send a message..."
                                value={messageSent}
                                onChange={(e) => setMessageSent(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <span
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="emoji-icon"
                            >
                                <BsEmojiSmile />
                            </span>
                            <button className="send-button" 
                                onClick={() => { 
                                    deliverMessage(); 
                                    handleFileDeselect(); 
                                }}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
                {
                    isPanelOpen ? (
                        <ScheduledMessagesPanel />
                    ) : (
                        <button onClick={togglePanel} className="toggle-panel-button">
                        Show Scheduled Messages
                        </button>
                    )
                }
            </div>
            {showEmoji && <div className="emoji-picker-container">
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
