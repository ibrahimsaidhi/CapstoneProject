const mysql = require('mysql2');

// Database connection configuration
let db_con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'Priya5555%',
    database: ''  
});
  
// Connect to the database
db_con.connect((err) => {
    if (err) {
        console.error("Database Connection Failed !!!", err);
        return;
    }
    console.log("Connected to Database");

    // SQL statement to create the table
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender VARCHAR(255) NOT NULL,
            recipient VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME NOT NULL
        );
    `;

    // Execute the SQL statement
    db_con.query(createTableSql, (err, results) => {
        if (err) {
            console.error("Failed to create table 'chat_messages':", err);
        } else {
            console.log("Table 'chat_messages' created or already exists.");
        }
        // Closing the connection
        db_con.end();
    });
});
