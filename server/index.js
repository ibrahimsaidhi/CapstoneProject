const express = require("express");
const cors = require("cors");
const authenticationRoutes =  require("./routes/auth.js");
const chatRoutes = require("./routes/chat.js")
const socketHandler = require("./socketHandler");
const db_con = require("./db");
const http = require("http");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authenticationRoutes);
app.use("/chat", chatRoutes);

const server = http.createServer(app);

socketHandler(server, db_con);

app.get("/", (req, res) => {
    res.json("Hello");
});

server.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});
