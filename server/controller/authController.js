const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db_con = require("../connections");

//Todo Need to be refactored into env file, with a proper hexadecimal key
const SECRET_KEY = "secretkey";

//Expiration time of the cookie which is 10 minutes in seconds
const cookieExp = 60 * 10;


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
      const token = jwt.sign({ id: data[0].user_id }, SECRET_KEY, {expiresIn: cookieExp});
  
      // Extract sensitive information (like password) before sending the response
      const { password, ...userInfo } = data[0];
  
      // Set the JWT as an HTTP-only cookie for added security
      res.cookie("accessToken", token, {
        httpOnly: true,
        SameSite: 'None',
        maxAge: cookieExp * 1000,
      });
  
      // Send a successful response with user information (excluding password)
      res.status(200).json({userInfo, token});
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
              return res.status(400).json({
                  message: "None of the input fields can be empty. Please try again",
              });
          }
          
          //asyncly gets all users with the specifed email
          usersWithSameEmail =await db_con.promise().query(
            `SELECT * FROM users where email = ?`,[email]);
        
          //Check if there a user with the same email
          if(Object.keys(usersWithSameEmail[0]).length !== 0)
          {
              return res.status(400).json({
                  message: "There is already an account associated with that email. Please enter a different email",
              });
          }   
          
          //asyncly gets all users with the specifed username
          usersWithSameUsername = await db_con.promise().query(
            `SELECT * FROM users where username = ?`,[username]);
          
           //Check if there a user with the same username
          if(Object.keys(usersWithSameUsername[0]).length !== 0)
          {
              return res.status(400).json({
                  message: "Someone already has this username. Please enter a different username",
              });
          }
          
          //Check if password is invalid
          if (isPlaintextPasswordInvalid(password))
          {
              return res.status(400).json({
                  message: "Password must be at least 8 characters and must include at least one upper-case letter, one lower-case letter, one numerical digit and one special character",
              });
          }
          
          //Bcrypt hashing of the password entered
          bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, async function(err, hash) 
              {
                  //asyncly inserts a new user row into the database
                  dataFromInsertingNewUser = await db_con.promise().query(
                    `INSERT INTO users (username, email, name, password, picture)
                    VALUES (?, ?, ?, ?, ?)`,[username, email, name, hash, picture]);

                  res.status(201).json({
                      userId: dataFromInsertingNewUser[0].insertId,
                  });
              });
          })
      }
      catch(err)
      {
        console.log(err);
        res.status(500).json({
            message: "Registration could not be processed due to an internal error. Please try again",
        });
      }
      
  };


/**
 * Checks if the plain text password is invalid based off bussiness rules. An invalid password is a passowrd that is not at least 8 characters and doesnt contain at
 * least one upper-case letter, one lower-case letter, one numerical digit and one special character.
 * 
 * @param {*} password      the password to be checked      
 * @returns                 boolean, true if password is valid; false otherwise
 */
function isPlaintextPasswordInvalid(password)
{
  if((password.length >= 8) && (/[A-Z]/.test(password)) && (/[a-z]/.test(password)) && (/[0-9]/.test(password)) 
    && (/[!@#$%^&*()\-+={}[\]:;"'<>,.?\/|\\]/.test(password)))
  {
    return false; 
  }
  else
  {
    return true;
  }
    
};


const logout = (req, res) => {
  // Clear the HTTP-only cookie by setting its expiration date to the past
  res.cookie("accessToken", "", {
    httpOnly: true,
    expires: new Date(0)
  });

  // Send a successful response indicating the user has been logged out
  res.status(200).json({ message: "Logout successful." });
};



const refreshAccessToken = (req, res) => {

  const token = req.headers.authorization || req.cookies.accessToken || req.query.token;

  // Reset the timer everytime there is activity
  res.cookie("accessToken", token, {
    httpOnly: true,
    maxAge: cookieExp * 1000,
  });

  res.status(200).json({ message: "Access token refreshed successfully" });
};

module.exports = { login, registration, logout, refreshAccessToken };