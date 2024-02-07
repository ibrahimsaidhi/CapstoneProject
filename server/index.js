const express = require("express");
const cors = require("cors");
const authenticationRoutes =  require("./routes/auth.js");
const chatRoutes = require("./routes/chat.js")
const contactsRoutes = require("./routes/contacts.js");
const allChatsRoutes = require("./routes/allChats.js");
const userRoutes = require("./routes/users.js")
const socketHandler = require("./socketHandler");
const db_con = require("./connections.js");
const http = require("http");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Enable CORS to accept the jwt cookie for api calls
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Credentials",
    ],
  };

const app = express();

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api/auth", authenticationRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/chats", allChatsRoutes);
app.use("/api/user", userRoutes);

const server = http.createServer(app);

socketHandler(server, db_con);

app.get("/", (req, res) => {
    res.json("Hello");
});

server.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});
