const admin = require("firebase-admin");
const serviceAccount = require("./chat-application-31800-firebase-adminsdk-fbsvc-fb3ecb8cd7.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chat-application-31800.firebaseio.com",
});

module.exports = admin;
