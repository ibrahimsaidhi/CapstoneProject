const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Configuring storage for multer
 */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); 
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
 * Handles the file uploaded by the user and places it in the appropriate directory.
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
const uploadFile = async (req, res) => {
    try {
        // Checking if the "uploads" directory exists
        await ensureUploadsDirExists();

        upload(req, res, function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error uploading file', error: err.message });
            }
            if (req.file) {
                res.json({ filePath: `/uploads/${req.file.filename}` });
            } else {
                res.status(400).send('No file uploaded.');
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Error checking if the uploads directory exists"});
    }
};

/**
 * Checks if the "uploads" directory exists.
 * If it does not exist, then it gets created.
 */
const ensureUploadsDirExists = async () => {
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
        await fs.access(uploadsDir);
    } catch (error) {
        console.log('Uploads directory does not exist, creating it.');
        await fs.mkdir(uploadsDir, { recursive: true });
    }
}

module.exports = { uploadFile };
