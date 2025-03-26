const multer = require("multer");

// Set up storage configuration
const storage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        console.log('🔥 Requested Body:', req.body, file);  // ✅ Now this will work properly
        cb(null, './uploads');
    },
    filename: (req, file, cb) => { 
        cb(null, `${Date.now()}-${file.originalname}`); // Hardcoded filename (not recommended)
    }
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg','audio/webm', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};


// Create an upload middleware that processes both files & body
const upload = multer({ storage, fileFilter });

// Middleware to parse both files & body
const handleUpload = upload.single("file"); // Adjust field name as needed

module.exports = upload;
