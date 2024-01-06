const express = require("express");
const cors = require("cors");
const authenticationRoutes =  require("./routes/auth.js");
require("dotenv").config();


const app = express();

app.use(express.json());
app.use(cors());
app.use("/server/auth", authenticationRoutes);

app.get("/", (req, res) => {
    res.json("Hello")
});


app.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});