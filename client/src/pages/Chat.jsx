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
    * Fetches the details of the current user that is logged in
    * from the server.
    */
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/user/details', { withCredentials: true });
            console.log("User response: " + JSON.stringify(response, null, 2));
            setUserId(response.data.userId);
            setUsername(response.data.username);
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
            fetchedMessages.forEach(message => ({
                ...message,
                timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }));
            setChatLog(fetchedMessages);
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
            const response = await axios.get(`http://localhost:5000/api/chats/${chatId}/status`, { withCredentials: true });
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
                setFileLabel(event.target.files.length > 0 ? `File Selected: ${fileName}` : "No File Chosen");
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
            const response = await axios.post('http://localhost:5000/api/upload/uploadFiles', formData, {
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

        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const messageData = {
            message_type: uploadedFilePath ? fileType : 'text',
            message: messageSent,
            file_path: uploadedFilePath,
            file_name: fileName,
            sender_username: username,
            senderId: userId,
            recipientId, 
            timestamp,
            chatId,
            chatType,
            chatName
        }

        await socket.emit("deliver_message", messageData);

        setMessageSent("");
        setUploadedFilePath(null);
        setFileType(null);
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
      

    // rendering the chat interface
    return (
        <div className="chat-room">
            <ImageModal isOpen={isModalOpen} src={currentImageSrc} onClose={() => setIsModalOpen(false)} />
            <div className="chat-box">
                <div className="chat-header">
                    <p>Messaging Chatroom</p>
                </div>
                <div className="messages-area">
                {chatLog.map((messageData, index) => {
                    const isCurrentUser = messageData.sender_id === userId;
                    const isImageMessage = messageData.message_type === 'image';
                    const isVideoMessage = messageData.message_type === 'video';
                    const isFileMessage = messageData.message_type === 'application';

                    const fileSrc = `http://localhost:5000${messageData.file_path}`;

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
