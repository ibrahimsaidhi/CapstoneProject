import React from 'react';
import Chat from './Chat';
import AllChats from './AllChats';
import socketHandler from '../../../server/socketHandler';

const ChatBlock = () =>{
    return (
        <div>
            <div>
                <AllChats/>
            </div>
            <div>
                <Chat socket={socketHandler}/>
            </div>
        </div>
        
    );
}
export default ChatBlock;