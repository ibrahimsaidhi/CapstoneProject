const db_con = require("../connections");

/**
 * Gets the details of the currently logged-in user.
 * Precondition: before this method is called, another function
 * named authMiddleware is used to retrieve the user's ID from a cookie.
 * 
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
const getUserDetails = async (req, res) => {
    try {
        // Gets user id that was set from the authMiddleware
        const userId = req.userId;

        const userDetails = await db_con.promise().query(
            `SELECT username, email, name FROM webapp.users WHERE user_id = ?`, [userId]
        );

        // Check if user details were found
        if (userDetails[0].length > 0) {
            res.status(200).json({
                userId: userId,
                username: userDetails[0][0].username,
                email: userDetails[0][0].email,
                name: userDetails[0][0].name
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
};

module.exports = { getUserDetails };
