const user = require("../models/User");
const bcrypt = require("bcrypt")

//TODO Need to look in for when to end the db connection
const db_con = require("../connections");

/**
 * TODO Need to be implemented.
 * Checks if the password is valid based off bussiness rules
 * 
 * @param {*} password      the password to be checked      
 * @returns                 boolean, true if password is valid; false otherwise
 */
function isPasswordInvalid(password)
{
    return false;
}

module.exports = {

    /**
     * Post API for creating a new user. In particular checking the user fields are
     * validated, hashing the password, and saving the fields with the hashed password to
     * database. Potential TODO is email validation.
     * 
     * @param {*} req       Information about the HTTP request
     * @param {*} res       Response to the HTTP request
     */
    post: async (req, res) =>
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
            else if (isPasswordInvalid(password))
            {
                res.status(400).json({
                    message: "Password entered is invalid, please enter a different password",
                });
            }
            else
            {
                //asyncly gets all users with the specifed username
                usersWithSameUsername =  await user.findByUsername(username);

                //asyncly gets all users with the specifed email
                usersWithSameEmail = await user.findByEmail(email);
                
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

                            //creates new user model using entered data and hashed password
                            newUser = new user(username, email, name, hash, picture)

                            //asyncly inserts a new user row into the database
                            dataFromInsertingNewUser = await user.create(newUser);

                            res.status(201).json({
                                userId: dataFromInsertingNewUser.insertId,
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
        
    }
};