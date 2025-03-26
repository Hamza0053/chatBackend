const axios = require("axios");
const admin = require("../firebaseAdmin");

const auth = admin.auth();
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY; // Secure API Key

const User = require("../models/users")



// 📌 Register User
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required!" });
    }

    try {
        // 🔍 Check if the user already exists in MongoDB
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "User already exists"
            });
        }

        // 🔐 Register User in Firebase Authentication
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        const firebaseUid = response.data.localId; // ✅ Get Firebase UID

        // ✅ Ensure we store Firebase UID as `userId` in MongoDB
        const newUser = new User({
            email: response.data.email, 
            userId: firebaseUid, // 🔹 Store Firebase UID as userId
            profile_picture: "profile.png" // Default profile picture
        });

        await newUser.save(); // Save user to MongoDB
console.log("=========== user registered successfully")
        // 🆔 Return MongoDB `_id` and Firebase data
        res.json({
            message: "User registered successfully!",
            _id: newUser._id, // MongoDB User ID
            userId: firebaseUid, // Firebase UID
            email: response.data.email,
            idToken: response.data.idToken, // Firebase authentication token
            profile_picture: response.data.profile_picture,
            name: response.data.name,
        });

    } catch (error) {
        console.error("❌ Registration Error:", error.message);
        res.status(500).json({ error: error.response?.data?.error?.message || "Registration failed" });
    }
};



// 📌 Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('login user');

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required!" });
    }

    try {
        // 🔐 Authenticate User with Firebase
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        // 🔍 Find the user in MongoDB
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found in the database"
            });
        }

        // 🆔 Return Firebase ID Token & MongoDB _id
        res.json({
            success: true,
            message: "Login successful!",
            _id: user._id,
            userId: user.userId,
            email: response.data.email,
            idToken: response.data.idToken,
            profile_picture: response.data.profile_picture,
            name: response.data.name,
        });
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(400).json({ success: false,  error: error.response?.data?.error?.message || "Login failed" });
    }
};


// 📌 Get User Profile (Using Firebase ID Token)
exports.getUserProfile = async (req, res) => {

    try {
        const response = await User.find({ _id: req.user._id })
        res.json({ success: true, message: "User verified!", user: response });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid Firebase ID Token!" });
    }
};


// 📌 Logout (Revoke User's Token)
exports.logoutUser = async (req, res) => {
    const { uid } = req.body; // Get user ID from request

    if (!uid) return res.status(400).json({ error: "User ID (uid) is required!" });

    try {
        // ✅ Revoke user's refresh tokens (Force Logout)
        await auth.revokeRefreshTokens(uid);

        res.json({ success: true, message: "User logged out successfully! Token revoked." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Logout failed" });
    }
};


exports.updateProfile = async (req, res) => {
    const {

        phone,
        name,
        bio,
        status,
    } = req.body

    // console.log('the given request is', );

    try {

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            {
                phone: phone,
                profile_picture: req?.file?.filename,
                bio: bio,
                status: status,
                name: name
            },
            {
                new: true,
                runValidators: true
            }
        )

        return res.status(200).json({
            success: true,
            message: "profile updated successfully",
            profile: updatedUser
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error is : ${error}`
        })
    }

}