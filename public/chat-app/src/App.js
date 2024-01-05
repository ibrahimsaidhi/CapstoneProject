import './App.css';
import io from "socket.io-client";
import Chat from "./Chat"

const socket = io("http://localhost:5000")

function App() {
  return (
    <div className="App">
      <Chat socket={socket} />
    </div>
  )
}

export default App;
