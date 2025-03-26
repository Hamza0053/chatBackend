const express = require("express");
const { registerUser, loginUser, getUserProfile, logoutUser, updateProfile } = require("../controllers/auth");
const verifyToken = require("../middlewares/auth");
const upload = require("../middlewares/fileUpload")

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "strongpassword"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully!"
 *                 uid:
 *                   type: string
 *                   example: "abcd1234"
 *       500:
 *         description: Registration failed
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "strongpassword"
 *     responses:
 *       200:
 *         description: User login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful!"
 *                 uid:
 *                   type: string
 *                   example: "abcd1234"
 *                 idToken:
 *                   type: string
 *                   example: "eyJhbGciOiJSUzI1..."
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: "eyJhbGciOiJSUzI1..."
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User verified!"
 *                 user:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                       example: "abcd1234"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", verifyToken, getUserProfile);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user by revoking token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *                 example: "abcd1234"
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User logged out successfully! Token revoked."
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", verifyToken, logoutUser);
/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "abcd1234"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               bio:
 *                 type: string
 *                 example: "Software Engineer at XYZ"
 *               status:
 *                 type: string
 *                 example: "active"
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 profile:
 *                   type: object
 *                   properties:
 *                     privacy_settings:
 *                       type: object
 *                       properties:
 *                         last_seen:
 *                           type: string
 *                           example: "everyone"
 *                         profile_photo:
 *                           type: string
 *                           example: "everyone"
 *                         status:
 *                           type: string
 *                           example: "everyone"
 *                     _id:
 *                       type: string
 *                       example: "67a87f73884580826d782652"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "newhas@gmail.com"
 *                     profile_picture:
 *                       type: string
 *                       example: "profile.png"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     online:
 *                       type: boolean
 *                       example: false
 *                     blocked_users:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     last_seen:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-09T10:12:03.797Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-09T10:12:03.802Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-09T11:15:29.315Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                     bio:
 *                       type: string
 *                       example: "Software Engineer at XYZ"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *       400:
 *         description: Bad request (missing required fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "userId is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error is: <error message>"
 */

router.put("/profile", verifyToken, upload.single("profile_picture"), updateProfile);


module.exports = router;
