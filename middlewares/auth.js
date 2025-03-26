const admin = require("../firebaseAdmin");
const User = require("../models/users"); // Import the MongoDB User model

// 📌 Middleware to Verify Firebase ID Token and Attach MongoDB _id
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization; // Get token from headers
    // console.log("The provided token is:", authHeader);

    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 🔹 Verify Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 🔹 Find the User in MongoDB using the email from the Firebase token
        const user = await User.findOne({ email: decodedToken.email });

        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found in the database" });
        }

        // 🔹 Attach both Firebase and MongoDB User ID (_id) to req.user
        req.user = { ...decodedToken, _id: user._id };

        next(); // Continue to the next middleware/route
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = verifyToken;
