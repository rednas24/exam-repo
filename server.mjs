import 'dotenv/config';
import express from 'express';
import USER_API from './routes/usersRoute.mjs';
import SuperLogger from './modules/SuperLogger.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import DBManager from './modules/storageManager.mjs';
import cors from 'cors';
import { authenticateToken } from './routes/usersRoute.mjs';
import jwt from 'jsonwebtoken';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
server.use(cors());

// Middleware to parse JSON bodies
server.use(express.json());

// Enable logging for all requests
const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger());

// Setup API routes
server.use("/user", USER_API);

server.post('/api/posts', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    // Extracting userId from the token validated
    const userid = req.user.userId;
    try {
        const article = await DBManager.createArticle(userid, title, content);
        res.status(201).json(article);
    } catch (error) {
        console.error('Failed to create article:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get all articles
server.get('/api/posts', async (req, res) => {
    try {
        const articles = await DBManager.getAllArticles(); // Assuming this method exists and works correctly
        res.json(articles); 
    } catch (error) {
        console.error('Failed to get articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//serve static files
server.use(express.static(path.join(__dirname, 'public')));



// SPA fallback to serve index.html for any non-API and non-static file requests
server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.get('/user/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId; //take the userId from the token

    try {
        const userDetails = await DBManager.getUser(userId);
        if (userDetails) {
            res.json({ success: true, data: userDetails });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching user details' });
    }
});


server.delete('/user/delete/:userId', authenticateToken, async (req, res) => {
    const userId = req.user.userId; 
    
    try {
        const deleteResult = await DBManager.deleteUser(userId); 
        if (deleteResult) {
            res.json({ success: true, message: 'Account deleted successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ success: false, message: 'An error occurred during account deletion.' });
    }
});

// Login route
server.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await DBManager.loginUser(email, password);
        if (user) {
            // Generate a token
            const token = jwt.sign({ userId: user.userid }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        
            // Login successful, return the token
            res.json({ 
                success: true, 
                message: 'Login successful', 
                token, 
                username: user.username, 
                email: user.email 
            });
        }else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

server.post('/user/profile/update', authenticateToken, async (req, res) => {
    
    const userId = req.user.userId; 
    const { about } = req.body;

    try {
        const updatedUser = await DBManager.updateUserAbout(userId, about);
        if (updatedUser) {
            res.json({ success: true, message: 'Profile updated successfully.', data: updatedUser });
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'An error occurred during profile update.' });
    }
});

// Route to get a specific article by ID
server.get('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const article = await DBManager.getArticleById(id);
        if (!article) {
            return res.status(404).send('Article not found');
        }
        res.json(article);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});