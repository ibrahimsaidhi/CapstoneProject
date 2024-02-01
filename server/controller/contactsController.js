const db_con = require("../connections");

//SQL query to get chat id for two users
const findChatSessionQuery = `
SELECT c.chat_id
FROM chat c
JOIN message m ON c.message_id = m.message_id
WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
LIMIT 1`;

/**
 * Gets all the information about a users contacts, based of the 5 differnet types specifed in query parameter. 1.get all friends of a user. 2 
 * get all users who sent an incoming friend request. 3 get all users who the current user has sent an outgoin request to. 4 get all users that 
 * the user has blocked. 5 get all the users in the system who are not friends with the user.
 * 
 * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
 * 
 * @param {*} req        Information about the HTTP request
 * @param {*} res        Response to the HTTP request
 */
const getAll = async (req, res)  =>
  {
      try
      {
        //Gets user id that was set from the authMiddleware
        const id = req.userId;

        //Gets the type passed in the request query parameter
        const type = req.query.type;

        let contactData;

        switch(type) 
        {
          case "friends":
             contactData = await db_con.promise().query(
              `Select users.username, users.picture, users.user_id from webapp.users INNER JOIN
              (SELECT contacts.friend_id
              FROM webapp.contacts where user_id = ?  and status = "friends"
              UNION 
              SELECT contacts.user_id
              FROM webapp.contacts where friend_id = ? and status = "friends") t2  ON users.user_id = t2.friend_id`,[id, id]
            );
            break;
            
          case "incoming":
            contactData = await db_con.promise().query(
              `Select users.username, users.picture, users.user_id from webapp.users INNER JOIN
              (SELECT contacts.user_id
              FROM webapp.contacts where friend_id = ?  and status = "pending") t2  ON users.user_id = t2.user_id`,[id]
            );
            break;
          case "outgoing":
            contactData = await db_con.promise().query(
              `Select users.username, users.picture, users.user_id from webapp.users INNER JOIN
              (SELECT contacts.friend_id
              FROM webapp.contacts where user_id = ?  and status = "pending") t2  ON users.user_id = t2.friend_id`,[id]
            );
            break;
          case "blocked":
            contactData = await db_con.promise().query(
              `Select users.username, users.picture, users.user_id from webapp.users INNER JOIN
              (SELECT contacts.friend_id
              FROM webapp.contacts where user_id = ?  and status = "blocked") t2  ON users.user_id = t2.friend_id`,[id]
            );
            break;
          case "non-friends":
            contactData = await db_con.promise().query(
              `Select users.username, users.picture, users.user_id from webapp.users LEFT JOIN
              (SELECT contacts.friend_id
              FROM webapp.contacts where user_id = ? and status = "friend"
              UNION 
              SELECT contacts.user_id
              FROM webapp.contacts where friend_id = ? and status = "friend") t2  ON users.user_id = t2.friend_id where t2.friend_id is null and users.user_id  <> ?`,[id, id, id]
            );
            break;
          default:
            return res.status(400).json({
              message: "Request could not be processed due to type parameter. Please try again with type parameter of values friends, incoming, outgoing, blocked, or non-friends",
            });
        }
         
        //Return to client, the users specifed
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
 * Gets all of the users with username containin the search term and that is not already a friend, blocked or pending friend of the user. In
 * partiular the userId, username and pic of each user.
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

        //Return to client, the users that have the specified term in their username and not in contacts
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
 * Gets the relation data between two users. In particular the data of two users from the contacts db. 
 * 
 * @param {*} userId                   User Id of the first user
 * @param {*} friendUsername           Username of the second user
 * @returns                            false, error message if no relation due to the friendUsername not existing; false, error message and id of 
 *                                     friend if no relation but friend exists in system; true, friend Id, data row in contacts for user and 
 *                                     friendId if user and friend have any relation
 */
async function getUserAndContactRelation(userId, friendUsername)
{
    //SQL to get database data for that friendUsername
    const friendData = await db_con.promise().query(
      `SELECT * FROM webapp.users where username = ?`,[friendUsername]
      );

    //check if friendUsername is not found in database
    if (Object.keys(friendData[0]).length === 0)
    {
      return {
        result: false,
        message: "Unable to process request. That user does not exist"
      }
    }
    
    friendId = friendData[0][0].user_id;

    if (friendId === userId)
    {
      return {
        result: false,
        message: "Unable to process request. You can not enter your own username"
      }
    }
    

    const userAndFriendData = await db_con.promise().query(
     `select * from webapp.contacts where (user_id = ? and friend_id = ?) or (user_id = ? and friend_id = ?)`,[userId, friendId, friendId, userId]
      );

    //check if user has no relation with friend
    if (Object.keys(userAndFriendData[0]).length === 0)
    {
      return {
        result: false,
        friendId: friendId,
        message: "Unable to process request. You currently don't have any relationship with that user",
      }
    }

    return {
      result:true, 
      friendId: friendId,
      userAndFriendData:userAndFriendData[0][0]
    }

}



/**
 * Sends a friend request to specifed username. Internally inserts new row in db for current user and other user with pending status
 * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
 * 
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 */
const sendRequest = async (req, res)  =>
{
    try
    {
        //Gets user id that was set from the authMiddleware
        const userId = req.userId;

        //Gets the friendUsername passed in the request body
        const {friendUsername} = req.body;
        
        //Gets the relation between the current user, and the second friend user 
        userAndContactResultSet = await getUserAndContactRelation (userId, friendUsername);
        
        //Gets the friend id based of username
        friendId = userAndContactResultSet.friendId

        //checkin if theirs a friend id, to test if user entered is in the system
        if (!friendId)
        {
          return res.status(400).json({
            message: userAndContactResultSet.message,
          });
        }

        //Gets the relation data between users including their user id of the initatior and the their relation status
        userAndFriendData = userAndContactResultSet.userAndFriendData;

         //checks if there is no relation between the users
        if (userAndContactResultSet.result === false)
        {
            const contactData = await db_con.promise().query(
                        `INSERT INTO webapp.contacts (user_id, friend_id, status) VALUES (?, ?, "pending")`,[userId, friendId]
                        );
                      
            //Return to client, that the request was successful
            res.status(200).json({
              message: "Friend request sent successfully",
            });
        }
        else
        {
          //current status of the relationship
          statusOfRelationship = userAndFriendData.status;

          if (statusOfRelationship === "friends")
          {
              errorMsg = "Unable to send friend request to an existing contact";
          }
          else if (statusOfRelationship === "pending")
          {
            errorMsg = "Unable to send friend request again. You already a pending friend friequest with that user";
          }
          else if (statusOfRelationship === "blocked" && userAndFriendData.user_id == userId)
          {
            errorMsg = "Unable to send friend request to someone you have blocked";
          }
          else
          {
            errorMsg = "Unable to send friend request to someone that has you blocked";
          }

          //Return to client, that the request was unsuccessful
          res.status(400).json({
            message: errorMsg,
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
   * Deletes row in db between current user and specifed username. Used to handle current user cancelling thier own outgoing friend request, 
   * current user declining an incoming friend request from another user, removing a current friend from thier contacts and unblocking a user 
   * they had previously blocked
   * 
   * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
   * 
   * @param {*} req       Information about the HTTP request
   * @param {*} res       Response to the HTTP request
   */
  const deleteRequest = async (req, res)  =>
  {
      //tracks if there are multiple create,update, delate sql statements in which it will be done as a transaction
      let isTransaction = false;

      try
      {
          //Gets user id that was set from the authMiddleware
          const userId = req.userId;

           //Gets the type param passed in the request query parameter. Refers to current type of relationship between users that will be deleted for the request 
          const type = req.query.type;

          //checks that requests without the incoming, outgoing, friends or blocked value for the type parameter are not processed
          if(!type || (type!=="incoming" && type!=="outgoing" && type!=="friends" && type!=="blocked"))
          {
            return res.status(400).json({
              message: "Request could not be processed due to type parameter. Please try again with type parameter of values incoming, outgoing or friends",
            });
          }

          //Gets the contact username passed in the request parameter
          const friendUsername = req.params.username
          
          //Gets the relation between the current user, and the second friend user 
          userAndContactResultSet = await getUserAndContactRelation (userId, friendUsername);

          //checks if there is no relation between the users
          if (userAndContactResultSet.result === false)
          {
            return res.status(400).json({
              message: userAndContactResultSet.message,
            });
          }

          //Gets the relation data between users including their user id of the initatior and the their relation status
          userAndFriendData = userAndContactResultSet.userAndFriendData;

          //Gets the friend id based of username
          friendId = userAndContactResultSet.friendId

          //message for sucesss, which will be different depeneding on type value
          let successMessage;

          //message for errir, which will be different depeneding on type value
          let errorMessage;

          //current status of the relationship
          statusOfRelationship = userAndFriendData.status;

          //initatior of the latest relationship status change
          initaiorId = userAndFriendData.user_id;

          switch(type) {
            case "incoming":
              //check that in order to delete an incoming request, aka declining a friend request, the current status must be pending and that initatior of the request must be the other user
              if (statusOfRelationship === "pending" && initaiorId === friendId)  //Decline friend request
              {
                successMessage = "Friend request was declined successfully"
              }
              else
              {
                errorMessage = "Unable to decline friend request. You have not received a pending friend request from that user";
              }
              break;
            case "outgoing":
              //check that in order to delete an outgoing request, aka canaceling a friend request, the current status must be pending and that initatior of the request must be the user
              if (statusOfRelationship === "pending" && initaiorId === userId) //Rescinding friend requests
              {
                successMessage = "Friend request was cancelled successfully"
              }
              else
              {
                errorMessage = "Unable to rescind friend request. You have not sent a pending friend request to that that user";
              }
              break;
            case "friends":
              //check that in order to delete a friend, the current status must be friends
              if (statusOfRelationship === "friends" )
              {
                successMessage = "User was removed from friends list successfully";

                const findChatSessionData = await db_con.promise().query(
                  findChatSessionQuery,[userId, friendId, friendId, userId]
                );
      
                //checks if there an existing chat between the users
                if (Object.keys(findChatSessionData[0]).length !== 0)
                {
                  //since there an existing chat, both update and delete sql statements will need to need to be run in transaction
                  isTransaction = true;
                  await db_con.promise().beginTransaction();
      
                  chatId = findChatSessionData[0][0].chat_id;
      
                  //update chat db, to change status of the existing chat to active since the users are friends now
                  const updateChatsQuery = await db_con.promise().query(`update webapp.chat set status = "inactive" where chat_id = ?`,[chatId]);
                }
              }
              else
              {
                errorMessage = "Unable to remove user. You currently don't have that user as a contact";
              }
              break;
            case "blocked":
               //check that in order to unblock somone, the current status is blocked and that initatior of the block was the user
              if (statusOfRelationship === "blocked" && initaiorId === userId)
              {
                successMessage = "User was unblocked successfully";
                //need to set privious chats with user to active
              }
              else
              {
                return res.status(400).json({
                  message: "Unable to unblock User. Since you currently don't have that user blocked",
                });
              }
              break;
          }

          //check if there was error message set during processing the request
          if (errorMessage)
          {
              return res.status(400).json({ 
                message: errorMessage,}
              ); 
          }
          
          //if no error message, it deletes the row for user and friends in contacts db 
          const deleteQuery = await db_con.promise().query(
            `Delete from webapp.contacts where (user_id = ? and friend_id = ?) or (user_id = ? and friend_id = ?)`,[userId, friendId, friendId, userId]
          );

          if(isTransaction)
          {
             await db_con.promise().commit();
          }  
          
          res.status(200).json({
            message: successMessage,
          });

      }
      catch(err)
      {
        console.log(err);

         //if error in middle of transaction, it rollsback the changes
         if(isTransaction)
         {
           db_con.promise().rollback();
         } 
 
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
      }
      
  };

  /**
   * Update row in db between current user and specifed username. Used to handle only the current user accepting an incoming friend request.
   * 
   * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
   * 
   * @param {*} req       Information about the HTTP request
   * @param {*} res       Response to the HTTP request
   */
  const updateRequest = async (req, res)  =>
  {
      //tracks if there are multiple create,update, delate sql statements in which it will be done as a transaction
      let isTransaction = false;
      
      try
      {
        //Gets user id that was set from the authMiddleware
        const userId = req.userId;
        
        //Gets the action passed in the request query parameter
        const action = req.query.action;

        //checks that requests without the accept or unblock value for the action parameter are not processed
        if(!action || action!=="accept")
        {
          return res.status(400).json({
            message: "Request could not be processed due to action parameter. Please try again with type parameter of value accept, block or unblock",
          });
        }

        //Gets the contact username passed in the request parameter
        const friendUsername = req.params.username

        //Gets the relation between the current user, and the second friend user 
        userAndContactResultSet = await getUserAndContactRelation (userId, friendUsername);

        //checks if there is no relation between the users
        if (userAndContactResultSet.result === false)
        {
          return res.status(400).json({
            message: userAndContactResultSet.message,
          });
        }

        //Gets the relation data between users including their user id of the initatior and the their relation status
        userAndFriendData = userAndContactResultSet.userAndFriendData;

        //Gets the friend id based of username
        friendId = userAndContactResultSet.friendId

        //message for sucesss, which will be different depeneding if it was to unblock or to accept
        let successMessage;

        //current status of the relationship
        statusOfRelationship = userAndFriendData.status;

        //initatior of the latest relationship status change
        initaiorId = userAndFriendData.user_id;

        //check that in order to accept friend request, the current status is pending and that initatior of the request was the friend 
        if (statusOfRelationship === "pending" && initaiorId === friendId) 
        {
          successMessage = "Friend request was accepted successfully";
          //need to set privious chats with user to active
        
          const findChatSessionData = await db_con.promise().query(
            findChatSessionQuery,[userId, friendId, friendId, userId]
          );

          //checks if there an existing chat between the users
          if (Object.keys(findChatSessionData[0]).length !== 0)
          {
            //since there an existing chat, two update sql statements will need to need to be run in transaction
            isTransaction = true;
            await db_con.promise().beginTransaction();

            chatId = findChatSessionData[0][0].chat_id;

            //update chat db, to change status of the existing chat to active since the users are friends now
            const updateChatsQuery = await db_con.promise().query(`update webapp.chat set status = "active" where chat_id = ?`,[chatId]);
          }

          //Updates the contacts db, with the new status of their relationship
          const updateContactsQuery = await db_con.promise().query(
            `update webapp.contacts set status = "friends" where (user_id = ? and friend_id = ?) or (user_id = ? and friend_id = ?)`,[userId, friendId, friendId, userId]
          );

           if(isTransaction)
           {
              await db_con.promise().commit();
           }  
          

          //Return to client, that the request was successful
          res.status(200).json({
            message: successMessage,
          });
        }
        else
        {
          return res.status(400).json({
            message: "Unable to accept friend request. You currently don't have a friend request from that user",
          });
        }
        
      }
      catch(err)
      {
        console.log(err);

        //if error in middle of transaction, it rollsback the changes
        if(isTransaction)
        {
          db_con.promise().rollback();
        } 

        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
      }
      
  };

    /**
   * inserts a new row in db between current user and specifed username or modifies an existing row in db. Used to handle the current user
   * blockin another user. Works for blockin any user expect for current user themsleves and users that blocked the current user.
   * 
   * Precondition: authMiddleware is used prior to this method to get the userId from the cookie
   * 
   * @param {*} req       Information about the HTTP request
   * @param {*} res       Response to the HTTP request
   */
  const blockRequest = async (req, res)  =>
  {
      //tracks if there are multiple create,update, delate sql statements in which it will be done as a transaction
      let isTransaction = false;
      
      try
      {
          //Gets user id that was set from the authMiddleware
          const userId = req.userId;
          
          //Gets the contact username passed in the request parameter
          const friendUsername = req.params.username

          //Gets the relation between the current user, and the second friend user 
          userAndContactResultSet = await getUserAndContactRelation (userId, friendUsername);          
          
          //Gets the friend id based of username
          friendId = userAndContactResultSet.friendId

          //since block can be done, with or without relation, checkin if theirs a friend id, to test if user entered is in the system
          if (!friendId)
          {
            return res.status(400).json({
              message: userAndContactResultSet.message,
            });
          }

          //if there is no relation between the users, 
          if (userAndContactResultSet.result === false)
          {
            const contactData = await db_con.promise().query(
              `INSERT INTO webapp.contacts (user_id, friend_id, status) VALUES (?, ?, "blocked")`,[userId, friendId]
              );          
          }
          else
          {
            //Gets the relation data between users including their user id of the initatior and the their relation status
            userAndFriendData = userAndContactResultSet.userAndFriendData;

            //current status of the relationship
            statusOfRelationship = userAndFriendData.status;

            //initatior of the latest relationship status change
            initaiorId = userAndFriendData.user_id;

            //Checks that the current relationship isnt already blocked
            if (statusOfRelationship !== "blocked" )
            {
              const findChatSessionData = await db_con.promise().query(
                findChatSessionQuery,[userId, friendId, friendId, userId]
              );
    
              //checks if there an existing chat between the users
              if (Object.keys(findChatSessionData[0]).length !== 0)
              {
                //since there an existing chat, two update sql statements will need to need to be run in transaction
                isTransaction = true;
                await db_con.promise().beginTransaction();
    
                chatId = findChatSessionData[0][0].chat_id;
    
                //update chat db, to change status of the existing chat to active since the users are friends now
                const updateChatsQuery = await db_con.promise().query(`update webapp.chat set status = "inactive" where chat_id = ?`,[chatId]);
              }

              const updateQuery = await db_con.promise().query(
                `update webapp.contacts set status = "blocked", user_id = ?, friend_id = ? where (user_id = ? and friend_id = ?) or (user_id = ? and friend_id = ?)`,[userId, friendId, userId, friendId, friendId, userId]
              );
            }
            else
            {
              return res.status(400).json({
                message: initaiorId === userId ? "Unable to block User. Since you currently have that user blocked": "Unable to block User. Since that user already has you blocked",
              });
            }
          }

          if(isTransaction)
          {
             await db_con.promise().commit();
          } 

          return res.status(200).json({
            message: "User was blocked successfully",
          });

      }
      catch(err)
      {
        console.log(err);

        //if error in middle of transaction, it rollsback the changes
        if(isTransaction)
        {
          db_con.promise().rollback();
        } 

        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
      }
      
  };


module.exports = {getAll, searchNewContact, sendRequest, deleteRequest, updateRequest, blockRequest};