import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './Chat';
import io from "socket.io-client";

const socket = io("http://localhost:5000")

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<Chat socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
