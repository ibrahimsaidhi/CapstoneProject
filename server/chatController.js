const db_con = require('./index');

// Fetching messages from the database
exports.getMessages = function(req, res){
    db_con.query("SELECT * from message", function(error, messages){
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(messages);
        console.log("Messages fetched from the database");
    });
};
