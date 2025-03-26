require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./connectToDb");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const http = require("http")
const { Server } = require("socket.io")
const chatHandler = require("./socket/socketHandler")



// Initialize Express app
const app = express(); 

const server = http.createServer(app)
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./uploads'));
app.use(express.static('./uploads/messages'));

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const pushNotificationRoutes = require("./routes/pushNotificationRoutes");
app.use("/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", pushNotificationRoutes);

// const webpush = require("web-push");

// const vapidKeys = webpush.generateVAPIDKeys();

// console.log("Public Key:", vapidKeys.publicKey);
// console.log("Private Key:", vapidKeys.privateKey);




const io = new Server(server, {
    cors: { origin: "*" }
})

chatHandler(io)


// io.on("connection", (socket) => {
//     console.log('connection take place here');

//     socket.on("message", (data) => {
//         console.log('data recieved ', data);
//         socket.emit("message", data)
//     })
 
// })



// 📌 Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Chat Application API",
            version: "1.0.0",
            description: "API Documentation for Firebase Auth-based Chat App",
        },
        servers: [{ url: "http://localhost:5000", description: "Local server" }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./routes/*.js"],
};

// Initialize Swagger Docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// 🟡 Start Server with WebSockets
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`)); 
