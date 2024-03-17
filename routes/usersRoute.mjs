import express from "express";
import User from "../modules/user.mjs";
import { HTTPCodes } from "../modules/httpConstants.mjs";
import SuperLogger from "../modules/SuperLogger.mjs";
import DBManager from "../modules/storageManager.mjs";
import jwt from 'jsonwebtoken';



const USER_API = express.Router();
USER_API.use(express.json()); 

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // If there's no token, return an Unauthorized (401) status
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Token verification failed." });
        }
        req.user = user; 
        next(); // Move to the next middleware or route handler
    });
};

// Define a route to handle GET requests to the base user path
USER_API.get('/', (req, res) => {
    SuperLogger.log("Demo of logging tool");
    SuperLogger.log("An important msg", SuperLogger.LOGGING_LEVELS.CRTICAL);
    // Example: Return a list of users or a message
    res.status(HTTPCodes.SuccessfulResponse.Ok).json({ message: "User route is up!" });
});

// Define a route to handle GET requests for a specific user by ID
USER_API.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId; 

    try {
        const userDetails = await DBManager.getUser(userId);
        res.json(userDetails);
    } catch (error) {
        console.error(error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).send("Error fetching user profile.");
    }
});

// Define a route to handle POST requests to create a new user
USER_API.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    if (username && email && password) {
        try {

            const user = await DBManager.createUser({
                username,
                email,
                password
            });

            res.status(HTTPCodes.SuccessfulResponse.Ok).json(user);
        } catch (error) {
            console.error(error);
            res.status(HTTPCodes.ServerErrorRespons.InternalError).send("Error creating user.");
        }
    } else {
        res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("Missing data field");
    }
});

// Define a route to handle POST requests to update an existing user by ID
USER_API.post('/:id', async (req, res) => {
    const { username, email, password, about } = req.body; 
    const userId = req.params.id;

    try {
        const updatedUser = await DBManager.updateUser({ userId, username, email, password, about });
        if (updatedUser) {
            res.status(HTTPCodes.SuccessfulResponse.Ok).json(updatedUser);
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: "Error updating user" });
    }
});

// Define a route to handle DELETE requests for a specific user by ID
USER_API.delete('/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
        return res.status(400).send("User ID must be an integer");
    }

    try {
        const result = await DBManager.deleteUser(userId);
        if (result) {
            res.status(200).json({ message: "User deleted successfully." });
        } else {
            res.status(404).json({ message: "User not found." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred." });
    }
});

export default USER_API;
