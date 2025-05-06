const { getAllContacts, createChat, getUserChats, getChatMessages , uploadFile , getUserCalls } = require("../controllers/chat")
const verifyToken = require("../middlewares/auth");
const express = require("express")
const upload = require("../middlewares/fileUpload")

const router = express.Router()

router.post("/upload/file", verifyToken, upload.single("file"), uploadFile);

/**
 * @swagger 
 * /api/contacts:
 *   get:
 *     summary: Retrieve all contacts excluding the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the contact list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       profile_picture:
 *                         type: string
 *                         example: "profile.jpg"
 *       400:
 *         description: Bad request (User ID missing in request)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User ID is missing from request"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error: <error message>"
 */

router.get('/contacts', verifyToken, getAllContacts)


/**
 * @swagger
 * /api/create:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - members
 *               - isGroupChat
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["67a87f73884580826d782652", "67a889b2492526adffe3ca53"]
 *               isGroupChat:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chat:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67a889d2817e28a9e0616dd0"
 *                     members:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: 
 *                         - "67a87f73884580826d782652"
 *                         - "67a889b2492526adffe3ca53"
 *                     isGroupChat:
 *                       type: boolean
 *                       example: false
 *                     groupAdmins:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     deletedBy:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-09T10:56:18.484Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-09T10:56:18.484Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Bad request (Invalid input data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */

// 🟢 Create a Chat (One-on-One or Group)
router.post("/create", verifyToken, createChat);
/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Retrieve all chats of the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "67a882523ec26dc4ca0ae21a"
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "67a87f73884580826d782652"
 *                             name:
 *                               type: string
 *                               example: "John Doe"
 *                             profile_picture:
 *                               type: string
 *                               example: "profile.png"
 *                       isGroupChat:
 *                         type: boolean
 *                         example: false
 *                       groupAdmins:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                       deletedBy:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-09T10:24:18.856Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-09T10:24:18.856Z"
 *                       __v:
 *                         type: integer
 *                         example: 0
 *       400:
 *         description: Bad request (Invalid request parameters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid request"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */

router.get("/chat", verifyToken, getUserChats);


/**
 * @swagger
 * /api/calls:
 *   get:
 *     summary: Retrieve all calls for the authenticated user
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user calls
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 calls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d5ec49a8f3c31234567890"
 *                       caller:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           profile_picture:
 *                             type: string
 *                             example: "profile.jpg"
 *                       receiver:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Jane Smith"
 *                           profile_picture:
 *                             type: string
 *                             example: "profile.jpg"
 *                       group:
 *                         type: object
 *                         properties:
 *                           groupName:
 *                             type: string
 *                             example: "Team Meeting"
 *                           members:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["60d5ec49a8f3c31234567890"]
 *                       call_type:
 *                         type: string
 *                         example: "video"
 *                       call_status:
 *                         type: string
 *                         example: "completed"
 *                       started_at:
 *                         type: string
 *                         example: "2 hours ago"
 *                       ended_at:
 *                         type: string
 *                         example: "1 hour ago"
 *                       duration:
 *                         type: string
 *                         example: "01:30:45"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve user calls"
 */

router.get("/calls", verifyToken, getUserCalls);

/**
 * @swagger
 * /api/messages/{chatId}:
 *   get:
 *     summary: Retrieve messages for a specific chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the chat
 *     responses:
 *       200:
 *         description: Successfully retrieved chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d5ec49a8f3c31234567890"
 *                       chat:
 *                         type: string
 *                         example: "chat1234"
 *                       sender:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           profile_picture:
 *                             type: string
 *                             example: "profile.jpg"
 *                       message_content:
 *                         type: string
 *                         example: "Hello, how are you?"
 *                       replyTo:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           message_content:
 *                             type: string
 *                             example: "I'm good, thanks!"
 *                           sender:
 *                             type: string
 *                             example: "Jane Doe"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-09T12:34:56.789Z"
 *       400:
 *         description: Bad request (Invalid chatId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid chat ID"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */

router.get("/messages/:chatId", verifyToken, getChatMessages);



module.exports = router
