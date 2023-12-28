import WebSocket from 'ws';
const socket = new WebSocket("ws://localhost:5000"); // create the Websocket connection

//DOM Elements
const myMessages = document.getElementById("messages")
const myInput = document.getElementById("message")
const sendBtn = document.getElementById("send")

sendBtn.disabled = true
sendBtn.addEventListener("click", sendMsg, false)

//Sending message from client
function sendMsg() {
    const text = myInput.value
    msgGeneration(text, "Client")
    socket.send(text)
}

//Creating DOM element to show received messages on browser page
function msgGeneration(msg, from) {
    const newMessage = document.createElement("h5")
    newMessage.innerText = `${from} says: ${msg}`
    myMessages.appendChild(newMessage)
}

//enabling send message when connection is open
socket.onopen = function() {
    sendBtn.disabled = false
}

//handling message event
socket.onmessage = function(event) {
    const { data } = event
    msgGeneration(data, "Server")
}