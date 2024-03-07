const db_con = require('../connections');
const bcrypt = require('bcrypt');
const query =  `SELECT username, picture, password FROM webapp.users WHERE user_id = ?`;

exports.getUserProfile = async function (req, res){
    try {
        // Gets user id that was set from the authMiddleware
        const userId = req.userId;

        const user = await db_con.promise().query(
            query, [userId]
        );

        // Check if user found
        if (user[0].length > 0) {
            res.status(200).json({
                userId: userId,
                username: user[0][0].username,
                picture: user[0][0].picture,
                password: user[0][0].password
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
    }
}

exports.setProfilePicture = async function (req,res) {
    try {
        // Gets user id that was set from the authMiddleware
        const userId = req.userId;
        
        const user = await db_con.promise().query(
            query, [userId]
        );

        // Check if user found, if it is then update the table with the request image path
        const userPic = user[0][0].picture;
        if (user[0].length > 0) {
            await db_con.promise().query(
                'UPDATE users SET picture = ? where user_id = ?',
                [userPic, userId]
            );
            
        } else {
            res.status(404).json({ message: "User not found" });
        }

        // Commit and confirm transaction
        await db_con.promise().commit();
        res.status(201).json({ message: 'Profile image updated successfully', userId, userPic});
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
    }
}

exports.setNewPassword = async function (req,res) {
    try {
        // Gets user id that was set from the authMiddleware
        const userId = req.userId;
        const newPassword = req.body.newPassword;
        const password = req.body.password;
  
        // query the user from the database
        const user = await db_con.promise().query(
            query, [userId]
        );

        // hash a new salt for the new password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, async function(err, hash) {
                // update the table with the new salted hash
                await db_con.promise().query(
                    'UPDATE users SET password = ? where user_id = ?',
                    [hash, userId]
                );
            });
        })

        // Commit and confirm transaction
        await db_con.promise().commit();
        res.status(201).json({ message: 'Password updated successfully'});
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
    }
}