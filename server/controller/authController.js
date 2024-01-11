const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db_con = require("../connections");


const SECRET_KEY = "secretkey";

//Add function for register and logout

const login = (req, res) => {

    const query = "SELECT * FROM users WHERE username = ?";
  
    db_con.query(query, [req.body.username], (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }
      
      // Not found
      if (data.length === 0) {
        return res.status(400).json({ error: "Invalid password or username. Please try again" });
      }
  
      const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
  
        // Bad request
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password or username. Please try again" });
      }
  
      // Generate a JSON Web Token (JWT) with the user's ID
      const token = jwt.sign({ id: data[0].id }, SECRET_KEY);
  
      // Extract sensitive information (like password) before sending the response
      const { password, ...userInfo } = data[0];
  
      // Set the JWT as an HTTP-only cookie for added security
      res.cookie("accessToken", token, {
        httpOnly: true,
      });
  
      // Send a successful response with user information (excluding password)
      res.status(200).json(userInfo);
    });
  };

/**
 * Used to create a new user. In particular checking the user fields are
 * validated, hashing the password, and saving the fields with the hashed password to
 * database. Potential TODO is email validation.
 * 
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 */  
const registration = async (req, res)  =>
  {
      try
      {
          //Gets body of api request into its appropiate fields
          const{username, email, name, password, picture} = req.body;
          
          //Check if any of the the required fields are empty
          if(!username || !email ||!name || !password || !picture)
          {
              res.status(400).json({
                  message: "The fields can't be empty",
              });
          }
          //Check if password is invalid
          else if (isPlaintextPasswordInvalid(password))
          {
              res.status(400).json({
                  message: "Password entered is invalid, please enter a different password",
              });
          }
          else
          {
              //asyncly gets all users with the specifed username
              usersWithSameUsername = await db_con.promise().query(
                `SELECT * FROM webapp.users where username = ?`,[username]);
              

              //asyncly gets all users with the specifed email
              usersWithSameEmail =await db_con.promise().query(
                `SELECT * FROM webapp.users where email = ?`,[email]);
              
              //Check if there a user with the same username
              if(Object.keys(usersWithSameUsername[0]).length !== 0)
              {
                  res.status(400).json({
                      message: "Username already exist, please enter a different one",
                  });
              }
              //Check if there a user with the same email
              else if(Object.keys(usersWithSameEmail[0]).length !== 0)
              {
                  res.status(400).json({
                      message: "There is already an account associated with that email, please enter a different one",
                  });
              }
              else
              {
                  //Bcrypt hashing of the password entered
                  bcrypt.genSalt(10, (err, salt) => {
                      bcrypt.hash(password, salt, async function(err, hash) {

                          //asyncly inserts a new user row into the database
                          dataFromInsertingNewUser = await db_con.promise().query(
                            `INSERT INTO webapp.users (username, email, name, password, picture)
                            VALUES (?, ?, ?, ?, ?)`,[username, email, name, hash, picture]);

                          res.status(201).json({
                              userId: dataFromInsertingNewUser[0].insertId,
                          });
                      
                      });
                  })
              }
          }
      }
      catch(err)
      {
          res.status(500).json({
              message: "Registration could not be processed due to an internal error. Please try again",
          });
      }
      
  };


/**
 * TODO Need to be implemented.
 * Checks if the plain text password is invalid based off bussiness rules
 * 
 * @param {*} password      the password to be checked      
 * @returns                 boolean, true if password is valid; false otherwise
 */
function isPlaintextPasswordInvalid(password)
{
    return false;
}

module.exports = {login, registration};