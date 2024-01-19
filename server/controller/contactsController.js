const db_con = require("../connections");

/**
 * Gets all of the contacts for a particular user. In partiular the userId, username and pic for each contact
 * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
 * 
 * @param {*} req        Information about the HTTP request
 * @param {*} res        Response to the HTTP request
 */
const allContacts = async (req, res)  =>
  {
      try
      {
        //Gets user id that was set from the authMiddleware
        const id = req.userId;
        
        //SQL request to get username, picture and userId of all contacts for userId
        const contactData = await db_con.promise().query(
          `Select users.username, users.picture, users.user_id from webapp.users INNER JOIN
          (SELECT contacts.friend_id
          FROM webapp.contacts where user_id = ?
          UNION 
          SELECT contacts.user_id
          FROM webapp.contacts where friend_id = ?) t2  ON users.user_id = t2.friend_id`,[id, id]
        );
           
        //Return to client, the users that are contacts
        res.status(200).json({
          users: contactData[0],
        });

      }
      catch(err)
      {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
      }
      
  };

  /**
   * Gets all of the users with username containin the search term and that is not already a contact of the user. In partiular the userId, username and pic of each user.
   * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
   * 
   * @param {*} req       Information about the HTTP request
   * @param {*} res       Response to the HTTP request
   */
  const searchNewContact = async (req, res)  =>
  {
      try
      {
          //Gets user id that was set from the authMiddleware
          const id = req.userId;
          
          //Gets the search term passed in the request parameter
          const {term} = req.params

          //search term that will be looked for in the database
          const searchTerm = "%" +term +"%"

          //SQL request to get username, picture and userId of all users with username containin the search term and that is not already a contact of the user
          const contactData = await db_con.promise().query(
            `Select users.username, users.picture, users.user_id from webapp.users LEFT JOIN
            (SELECT contacts.friend_id
            FROM webapp.contacts where user_id = ?
            UNION 
            SELECT contacts.user_id
            FROM webapp.contacts where friend_id = ?) t2  ON users.user_id = t2.friend_id where t2.friend_id is null and users.user_id  <> ? and users.username LIKE ?`,[id, id, id, searchTerm]
          );

           //Return to client, the users that have the specied term in thier username and not in contacts
          res.status(200).json({
            users: contactData[0],
          });

      }
      catch(err)
      {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
      }
      
  };

  /**
   * Adds new a contact between the userId and the friendId
   * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
   * 
   * @param {*} req       Information about the HTTP request
   * @param {*} res       Response to the HTTP request
   */
  const addContact = async (req, res)  =>
  {
      try
      {
          //Gets user id that was set from the authMiddleware
          const userId = req.userId;

          //Gets the friendId passed in the request body
          const {friendId} = req.body;

          //SQL request to add new row for userId and friendId into contacts
          const isFriendIdValid = await db_con.promise().query(
            `SELECT * FROM webapp.users where user_id = ?`,[friendId]
            );
          
          //check if friendId is not found in database
          if (Object.keys(isFriendIdValid[0]).length === 0)
          {
              //Return to client, that the request was unsuccessful
              return res.status(400).json({
                message: "friendId does not exist, please enter a different one",
            });
          }

          const isUserAndFriendContacts = await db_con.promise().query(
            `SELECT contacts.friend_id
            FROM webapp.contacts where user_id = ? and friend_id = ?
            UNION 
            SELECT contacts.user_id
            FROM webapp.contacts where friend_id = ? and user_id = ?`,[userId, friendId, userId, friendId]
            );

          //check if user and friend are not already contacts
          if (Object.keys(isUserAndFriendContacts[0]).length === 0)
          {
              const contactData = await db_con.promise().query(
                          `INSERT INTO webapp.contacts (user_id, friend_id) VALUES (?, ?)`,[userId, friendId]
                          );
                        
              //Return to client, that the request was successful
              res.status(200).json({
                message: "New contact added successfully",
              });
          }
          else
          {
              //Return to client, that the request was unsuccessful
              res.status(400).json({
                message: "User and friend are already contacts",
              });
          }

          

      }
      catch(err)
      {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
      }
      
  };
  
  /**
   * removes contact between the userId and the friendId
   * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
   * 
   * @param {*} req       Information about the HTTP request
   * @param {*} res       Response to the HTTP request
   */
  const removeContact = async (req, res)  =>
  {
      try
      {
          //Gets user id that was set from the authMiddleware
          const userId = req.userId;

          //Gets the friendId passed in the request body
          const {friendId} = req.body;

          const isUserAndFriendContacts = await db_con.promise().query(
            `SELECT contacts.friend_id
            FROM webapp.contacts where user_id = ? and friend_id = ?
            UNION 
            SELECT contacts.user_id
            FROM webapp.contacts where friend_id = ? and user_id = ?`,[userId, friendId, userId, friendId]
            );

          //check if user and friend are already contacts
          if (Object.keys(isUserAndFriendContacts[0]).length !== 0)
          {
            //SQL request to remove row for userId and friendId in contacts
            const contactData = await db_con.promise().query(
              `Delete from webapp.contacts where (user_id = ? and friend_id = ?) or (user_id = ? and friend_id = ?)`,[userId, friendId, friendId, userId]
            );

            //Return to client, that the request was successful
            res.status(200).json({
              message: "Contact was removed successfully",
            });
          }
          else
          {
            //Return to client, that the request was unsuccessful
            res.status(400).json({
              message: "User and friend are not already contacts",
            });
          }

      }
      catch(err)
      {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
      }
      
  };

module.exports = {allContacts, searchNewContact, addContact,removeContact};