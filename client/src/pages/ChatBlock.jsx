/**
 * Refactoring chat UI so that chats and friends are displayed in one page
 * @author: Ibrahim Said
 */

import Chat from './Chat';
import AllChats from './AllChats';
import io from "socket.io-client";
import "../styles/ChatBlock.css";


const socket = io(`${process.env.REACT_APP_PARLONS_PROFILE_URL}`);

/**
 * 
 * @returns a page that contains the chat-box next to the list of chats
 */
const ChatBlock = () =>{
    return (
        <div className='container'>
            <div className='chat-list'>
            <p>{console.log(socket)}</p>
                <AllChats/>
            </div>
            <div className='chat-box'>
                <Chat socket={socket}/>
            </div>
        </div>  
    );
}
export default ChatBlock;