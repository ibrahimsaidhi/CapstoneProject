import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ModalStyles.css';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../images/default_avatar.png';
import '../styles/AllChats.css';

/**
 * Component that displays all the chats that the
 * user has after they log in with their credentials.
 */
const AllChats = () => {
  const [chats, setChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  /**
   * Makes API requests with a base URL and 
   * withCredentials set to a value of true to 
   * enable cookies.
   */
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  /**
   * Excludes the contacts that are already 
   * in the list of chats. After the user clicks on
   * "New Chat", it shall only display the names of the
   * users that they have not already started a chat with.
   */
  const filteredContacts = contacts.filter(contact => {
    // Check if the contact is not in the list of chats
    return !chats.some(chat => chat.sender_id === contact.user_id || chat.recipient_id === contact.user_id);
  });

  useEffect(() => {
    fetchUserId();   
  }, []);

  /**
   * Fetches the details of the current user that is logged in
   * from the server.
   */
  const fetchUserId = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/details', { withCredentials: true });
      console.log("User response: " + JSON.stringify(response, null, 2));
      setUserId(response.data.userId);
      fetchData(response.data.userId);
    } catch (error) {
      console.error("Error fetching user details: ", error);
    }
  };
  
  /**
   * Fetches the list of contacts that includes all users that are registered 
   * in the website. Then, it fetches the list of chats that the current user 
   * has already initiated with other users.
   * @param {number} userId - The ID of the current user.
   */
  const fetchData = async (userId) => {
    try {
      const contactsResponse = await api.get('/contacts/all');
      const chatsResponse = await api.get(`/chats/${userId}`);
      if (contactsResponse.data.users && chatsResponse.data.chats) {
        const updatedChats = chatsResponse.data.chats.map(chat => {
          const otherUserId = chat.sender_id === userId ? chat.recipient_id : chat.sender_id;
          const contact = contactsResponse.data.users.find(user => user.user_id === otherUserId);
          return { ...chat, recipient_username: contact ? contact.username : 'Unknown' };
        });
        setChats(updatedChats);
        setContacts(contactsResponse.data.users);
      }
    } catch (error) {
      console.error("Error: ", error.response?.data.message || error.message);
    }
  };

  /**
   * Starts a chat with a new contact 
   * by redirecting the user to the appropriate endpoint.
   * @param {number} contactId - The ID of the contact that the user selects to start a new chat with.
   */
  const startChat = (contactId) => {
    setIsModalOpen(false);
    navigate(`/chat`, { state: { contactId: contactId }});
  }

  /**
   * Opens the modal to start a new chat.
   */
  const handleNewChat = () => {
    setIsModalOpen(true);
  }

  /**
   * Handles continuing an existing chat.
   * @param {Object} chat - The chat object that contains information 
   * about a chat.
   */
  const continueChat = (chat) => {
    const contactId = chat.sender_id === userId ? chat.recipient_id : chat.sender_id;
    console.log("Chat object that contains existing chat information: " + JSON.stringify(chat, null, 2));
    navigate(`/chat`, { state: { chatId: chat.chat_id, contactId: contactId } });
  };

  /**
   * Component that allows the user to open 
   * a modal whenever they want to start a new
   * chat with another user.
   * @param {Object} props - Props contain isOpen, onClose, contacts, and startChat. 
   * isOpen - whether the modal is open or not.
   * onClose - disable the modal when it is closed.
   * contacts - list of users that are registered on the website.
   * startChat - function that allows the user to start a new chat with a contact. 
   */
  const ContactsModal = ({ isOpen, onClose, contacts, startChat }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          {contacts.length === 0 ? (
            <p>No Contacts to Display</p>
          ) : (
            <ul>
              {contacts.map(contact => (
                <li key={contact.user_id} className="contact-item">
                  <div className="contact-name">{contact.username}</div>
                  <button onClick={() => startChat(contact.user_id)}>Start Chat</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Your Chats</h1>
      <button onClick={handleNewChat}>New Chat</button>
      <ContactsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contacts={filteredContacts}
        startChat={startChat}
      />
    <ul>
      {chats.map((chat) => (
        <li key={chat.chat_id} className="chat-item">
          <img src={defaultAvatar} alt="" />
          <span className="username" onClick={() => continueChat(chat)} style={{cursor: 'pointer'}}>
            {chat.recipient_username}
          </span>
        </li>
      ))}
    </ul>
    </div>
  );
}

export default AllChats;
