//TODO Need to look in for when to end the db connection
const db_con = require("../connections");

module.exports = class User {

    /**
     * Constructor for User class
     * 
     * @param {*} username      username for User
     * @param {*} email         email for User
     * @param {*} name          name for User
     * @param {*} password      hashed password for User
     * @param {*} picture       picture for User
     */
    constructor(username, email, name, password, picture)
    {
        this.username = username;
        this.email = email;
        this.name = name;
        this.password = password;
        this.picture = picture;
    }

    /**
     * Finds any potential user(s) in the database with the specifed id
     * 
     * @param {*} userId        userId to look for
     * @returns                 user(s) with the specfied id or empty if none found
     */
    static async findById(userId)
    {   
        const data = await db_con.promise().query(
                    `SELECT * FROM webapp.users where user_id = ?`,[userId]
                );
            
        return data;
    }

    /**
     * Finds any potential user(s) in the database with the specifed username
     * 
     * @param {*} username      username to look for
     * @returns                 user(s) with the specfied username or empty if none found
     */
    static async findByUsername(username)
    {
        const data = await db_con.promise().query(
            `SELECT * FROM webapp.users where username = ?`,[username]
        );
        return data;
    }

    /**
     * Finds any potential user(s) in the database with the specifed id
     * 
     * @param {*} email     email to look for
     * @returns             user(s) with the specfied email or empty if none found
     */
    static async findByEmail(email)
    {
        const data = await db_con.promise().query(
            `SELECT * FROM webapp.users where email = ?`,[email]
        );
            
        return data;
    }

    /**
     * Inserts a new user into the database
     * 
     * @param {User} newUser    the new user to be added
     * @returns                 information about how the query affected the table
     *                          including the "insertId" 
     */
    static async create(newUser)
    {
        const data = await db_con.promise().query(
                    `INSERT INTO webapp.users (username, email, name, password,picture)
                    VALUES (?, ?, ?, ?, ?)`,[newUser.username, newUser.email, newUser.name, newUser.password, newUser.picture]
                );
        return data[0];  
    }

}