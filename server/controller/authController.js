const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db_con = require("../connections");
const transporter = require("../mailTransporter.js");
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

//Todo Need to be refactored into env file, with a proper hexadecimal key
const SECRET_KEY_AUTHENTICATION = "secretkey";
const SECRET_KEY_ACTIVATION = "secret-key2";
const SECRET_KEY_FORGET_PASSWORD = "secret-key3";

//Expiration time of the cookie which is 10 minutes in seconds
const cookieExp = 60 * 10;

//Expiration time of the activation link which is 24 hours in seconds
const activationExp = 60 * 60 * 24;

//Expiration time of the forgot password link which is 30 minutes in seconds
const forgetPasswordExp = 60 * 30;

const login = (req, res) => {

    const query = "SELECT * FROM users WHERE username = ? and status = \"active\"";
  
    db_con.query(query, [req.body.username], (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }
      
      // Not found
      if (data.length === 0) {
        return res.status(400).json({ error: "Invalid password or username or inactive account. Please try again" });
      }
  
      const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
  
        // Bad request
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password or username or inactive account. Please try again" });
      }
  
      // Generate a JSON Web Token (JWT) with the user's ID
      const token = jwt.sign({ id: data[0].user_id }, SECRET_KEY_AUTHENTICATION, {expiresIn: cookieExp});
  
      // Extract sensitive information (like password) before sending the response
      const { password, ...userInfo } = data[0];
  
      // Set the JWT as an HTTP-only cookie for added security
      res.cookie("accessToken", token, {
        httpOnly: true,
        maxAge: cookieExp * 1000,
      });
  
      // Send a successful response with user information (excluding password)
      res.status(200).json({userInfo, token});
    });
  };

/**
 * Used to create a new inactive user. In particular checking the user fields are
 * validated, hashing the password, and saving the fields with the hashed password to
 * database. As well sending an email to the user to activate thier account.
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
            `SELECT * FROM webapp.users where email = ?`,[email]);
        
          //Check if there a user with the same email
          if(Object.keys(usersWithSameEmail[0]).length !== 0)
          {
              return res.status(400).json({
                  message: "There is already an account associated with that email. Please enter a different email",
              });
          }   
          
          //asyncly gets all users with the specifed username
          usersWithSameUsername = await db_con.promise().query(
            `SELECT * FROM webapp.users where username = ?`,[username]);
          
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
                    `INSERT INTO webapp.users (username, email, name, password, picture, status)
                    VALUES (?, ?, ?, ?, ?, 'inactive')`,[username, email, name, hash, picture]);

                  // Generate a JSON Web Token (JWT) with the user's ID
                  const token = jwt.sign({ id: dataFromInsertingNewUser[0].insertId}, SECRET_KEY_ACTIVATION, {expiresIn: activationExp});

                  const imageAttachment = await readFileAsync('email_templates/images/v3_blue-removebg-preview.png');

                  const mailOptions = {
                    from: "Parlons <"+process.env.MAIL_ADDRESS+">", // sender address
                    template: "activation", // the name of the template file, i.e., email.handlebars
                    to: email,
                    subject: `Welcome to Parlons`,
                    context: {
                      name: name,
                      link: 'https://parlons-capstone.netlify.app/activate?code='+token
                    },
                    attachments: [{
                      filename: 'image.png',
                      content: imageAttachment,
                      encoding: 'base64',
                      cid: 'uniqueImageCID', // Referenced in the HTML template
                  }],
                  };

                  await transporter.sendMail(mailOptions);

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

/**
 * Used to activate a new user. In particular checking the JWT code is valid
 * 
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 */  
const activation = async (req, res)  =>
  {
      try
      {
        const {code} = req.body;

        //Check if the JWT code is empty
        if(!code)
        {
            return res.status(400).json({
                message: "No Code. Please try again",
            });
        }

        jwt.verify(code, SECRET_KEY_ACTIVATION, async (err, data) => {
          if(err)
          {
            return res.status(400).json({
              message: "Email activation link is expired. Please submit a request for a new activation link",
            });
          }
          else{
            //ensures request api will only use userId from token. Provides extra security such that havin access to token can allow for making calls for any other user
            const userId = data.id

            //SQL to get database data for that friendUsername
            const userData = await db_con.promise().query(
              `SELECT * FROM webapp.users where user_id = ?`,[userId]
              );

            
            //check if user id is not found in database
            if (Object.keys(userData[0]).length === 0)
            {
              return res.status(400).json({
                message: "Unable to process request. Incorrect code",
              });
            }
            
            userActivationStatus = userData[0][0].status;
          
            //If user is in the db but is not inactive and does not need to be activated
            if (userActivationStatus != "inactive")
            {
              return res.status(400).json({
                message: "Unable to process request. That user is not inactive",
              });
            }

            const updateUserActivation = await db_con.promise().query(
              `update webapp.users set status = "active" where user_id = ? `,[userId]
            );

            return res.status(200).json({
              message: "User account was activated successfully. You can now login",
            });
          }
        })
      }
      catch(err)
      {
        console.log(err);
        res.status(500).json({
            message: "Activation could not be processed due to an internal error. Please try again",
        });
      }
      
  };

  /**
 * Used to resend activation email to a new user.
 * 
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 */  
const resendActivation = (req, res) => {

  const query = "SELECT * FROM users WHERE username = ? and status = \"inactive\"";

  db_con.query(query, [req.body.username], async (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    
    // Not found
    if (data.length === 0) {
      return res.status(400).json({ error: "Unable to process request. That user is not valid or is not inactive" });
    }

    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

      // Bad request
    if (!isPasswordValid || req.body.email !== data[0].email) {
      return res.status(400).json({ error: "Invalid password or username or email. Please try again" });
    }
    
    // Generate a JSON Web Token (JWT) with the user's ID
    const token = jwt.sign({ id: data[0].user_id}, SECRET_KEY_ACTIVATION, {expiresIn: activationExp});

    const imageAttachment = await readFileAsync('email_templates/images/v3_blue-removebg-preview.png');

    const mailOptions = {
      from: "Parlons <"+process.env.MAIL_ADDRESS+">", // sender address
      template: "activation", // the name of the template file, i.e., email.handlebars
      to: data[0].email,
      subject: `Welcome to Parlons`,
      context: {
        name: data[0].name,
        link: 'https://parlons-capstone.netlify.app/activate?code='+token
      },
      attachments: [{
        filename: 'image.png',
        content: imageAttachment,
        encoding: 'base64',
        cid: 'uniqueImageCID', // Referenced in the HTML template
     }],
    };

    await transporter.sendMail(mailOptions);

    // Send a successful response with user information (excluding password)
    res.status(200).json({ userId: data[0].user_id});
  });
};

  /**
 * Used to initate forgot password process, and send an email to user to change their password.
 * 
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 */  
const forgotPassword = (req, res) => {

  const query = "SELECT * FROM users WHERE email = ?";

  db_con.query(query, [req.body.email], async (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    
    // Not found
    if (data.length === 0) {
      return res.status(400).json({ error: "Unable to process request. There is no user associated with that email" });
    }

    // Generate a JSON Web Token (JWT) with the user's ID
    const token = jwt.sign({ id: data[0].user_id}, SECRET_KEY_FORGET_PASSWORD, {expiresIn: forgetPasswordExp});

    const imageAttachment = await readFileAsync('email_templates/images/v3_blue-removebg-preview.png');

    const mailOptions = {
      from: "Parlons <"+process.env.MAIL_ADDRESS+">", // sender address
      template: "forgetPassword", // the name of the template file, i.e., email.handlebars
      to: data[0].email,
      subject: `Reset Password`,
      context: {
        name: data[0].name,
        link: 'https://parlons-capstone.netlify.app/forgot-password?code='+token
      },
      attachments: [{
        filename: 'image.png',
        content: imageAttachment,
        encoding: 'base64',
        cid: 'uniqueImageCID', // Referenced in the HTML template
      }],
    };

    await transporter.sendMail(mailOptions);

    // Send a successful response with user information (excluding password)
    res.status(200).json({ userId: data[0].user_id});
  });
};

/**
 * Used to change the forgottoen password for a user. In particular checking the JWT code is valid and thier new password is valid
 * 
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 */  
const changeForgottenPassword = (req, res) => 
{
  try
  {
    //Gets body of api request into its appropiate fields
    const{password, code} = req.body;

    //Check if any of the the required fields are empty
    if(!password ||!code)
    {
        return res.status(400).json({
            message: "None of the input fields can be empty. Please try again",
        });
    }

    jwt.verify(code, SECRET_KEY_FORGET_PASSWORD, async (err, data) => {
      if(err)
      {
        return res.status(400).json({
          message: "Forgot password link is expired. Please submit a new request to change your password",
        });
      }
      else{
        //ensures request api will only use userId from token. Provides extra security such that havin access to token can allow for making calls for any other user
        const userId = data.id

        //SQL to get database data for that friendUsername
        const userData = await db_con.promise().query(
          `SELECT * FROM webapp.users where user_id = ?`,[userId]
          );

        
        //check if user id is not found in database
        if (Object.keys(userData[0]).length === 0)
        {
          return res.status(400).json({
            message: "Unable to process request. Incorrect code",
          });
        }

        //Check if new password is invalid
        if (isPlaintextPasswordInvalid(password))
        {
            return res.status(400).json({
                message: "Password must be at least 8 characters and must include at least one upper-case letter, one lower-case letter, one numerical digit and one special character",
            });
        }

        //Bcrypt hashing of the new password entered
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, async function(err, hash) 
          {
              //asyncly updates the password for the user in the database
              dataFromUpdatingPassword = await db_con.promise().query(
                `UPDATE webapp.users SET password = ? where user_id = ?`,[hash, userId]);

                const imageAttachment = await readFileAsync('email_templates/images/v3_blue-removebg-preview.png');

              const mailOptions = {
                from: "Parlons <"+process.env.MAIL_ADDRESS+">", // sender address
                template: "passwordChanged", // the name of the template file, i.e., email.handlebars
                to: userData[0][0].email,
                subject: `Your password has been updated`,
                context: {
                  name: userData[0][0].name
                },
                attachments: [{
                  filename: 'image.png',
                  content: imageAttachment,
                  encoding: 'base64',
                  cid: 'uniqueImageCID', // Referenced in the HTML template
               }],
              };

              await transporter.sendMail(mailOptions);

              res.status(200).json({
                message: "Password has been changed succesfully",
              });
          });
        })
      }
    })
  }
  catch(err)
    {
      console.log(err);
      res.status(500).json({
          message: "Password change could not be processed due to an internal error. Please try again",
      });
    }
};
  

module.exports = { login, registration, logout, refreshAccessToken, activation, resendActivation, forgotPassword, changeForgottenPassword};