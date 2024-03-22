/**
 * Refactoring chat UI so that chats and friends are displayed in one page
 * @author: Ibrahim Said
 */


import { useState} from "react";
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

    /**
     * updateListCount reprsents prop that is passed down to all chat to let it now there has been a message sent to a new chat
     */
    const [updateListCount, setUpdateListCount] = useState(0);

    function incrementUpdateListCount()
    {
        setUpdateListCount(() => updateListCount + 1);
    }

    return (
        <div className='container'>
            <div className='chat-list'>
                <AllChats listUpdate={updateListCount}/>
            </div>
            <div className='chat-box'>
                <Chat socket={socket} listUpdateFunc={incrementUpdateListCount}/>
            </div>
        </div>  
    );
}
export default ChatBlock;