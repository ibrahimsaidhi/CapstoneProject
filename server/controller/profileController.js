const db_con = require('../connections');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const query =  `SELECT username, picture, password FROM users WHERE user_id = ?`;

/**
 * Storage variable config for multer
 */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../profileUploads')); 
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

/**
 * Initializing multer with the storage configuration
 */
const upload = multer({ storage: storage }).single('file'); 


/**
 * Retrieves all essentials of the user's profile 
 * @param {*} req 
 * @param {*} res 
 */
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

/**
 * Updates profile picture path in database with new request from client
 * @param {*} req 
 * @param {*} res 
 */
exports.setProfilePicture = async function (req,res) {
    try {
        // Gets user id that was set from the authMiddleware
        const userId = req.userId;

        // make sure the directory exists, if not make the directory
        await ensureUploadsDirExists();
        upload(req, res, function(err){
            if (err) {
                return res.status(500).json({ message: 'Error uploading file', error: err.message });
            }
            if (req.file) {
                res.json({ filePath: `/uploads/${req.file.filename}` });
            } else {
                res.status(400).send('No file uploaded.');
            }
            // update the profile picture with the one from the request
            const image = req.file.filename;
            const imageQuery = "UPDATE users SET picture = ? where user_id = ?"
            db_con.promise().query(
                imageQuery,
                [image, userId]
            );
        })

        await db_con.promise().commit();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
    }
}

/**
 * Listens to the client for new password change requests, and updates the database with new password
 * @param {*} req 
 * @param {*} res 
 */
exports.setNewPassword = async function (req,res) {
    try {
        // Gets user id that was set from the authMiddleware
        const userId = req.userId;
        const newPassword = req.body.newPassword;
        const password = req.body.password;

        let p = false;
        const q = "SELECT * FROM users WHERE user_id = ?"
        
        db_con.query(q, [userId], (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Internal server error" });
            }
            
            const isPasswordValid = bcrypt.compareSync(
                password,
                data[0].password
            );

            const isPasswordSame = password === newPassword;

            // check if passwords are the same
            if (isPasswordSame){
                return res.status(400).json({ error: "Passwords are the same, please enter a new password that is different from the old one." });
            }
            
                // hash a new salt for the new password
            else if (isPasswordValid){
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPassword, salt, async function(err, hash) {
                        // update the table with the new salted hash
                        await db_con.promise().query(
                            'UPDATE users SET password = ? where user_id = ?',
                            [hash, userId]
                        );
                    });
                })
                res.status(201).json({ message: 'Password updated! Please login again...'});
            }
            else {
                return res.status(400).json({ error: "Invalid current password. Please try again" });
            }
        
        });

        // Commit and confirm transaction
        await db_con.promise().commit();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request could not be processed due to an internal error. Please try again",
        });
    }
}

/**
 * Checks if the "profileUploads" directory exists.
 * If it does not exist, then it gets created.
 */
const ensureUploadsDirExists = async () => {
    const uploadsDir = path.join(__dirname, '../profileUploads');
    try {
        await fs.access(uploadsDir);
    } catch (error) {
        console.log('Profile Uploads directory does not exist, creating it.');
        await fs.mkdir(uploadsDir, { recursive: true });
    }
}