import { useLocation } from "react-router-dom";

//Page that will display the chats. Temp add for now, will be replaced
const Chats = () => {
    
    const { state } = useLocation();

    return <h1>Chats, Current user is {state} </h1>;
  };
  
  export default Chats;