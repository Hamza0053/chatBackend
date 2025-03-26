// routes/pushNotificationRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const pushNotificationController = require('../controllers/pushNotificationController');

// Route to save push subscription
router.post('/subscribe',verifyToken, pushNotificationController.subscribeUser);

// Route to send message and notifications
router.post('/send-message', pushNotificationController.sendMessageWithNotification);

module.exports = router;
