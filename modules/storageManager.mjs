import pg from "pg";
import bcrypt from 'bcrypt';
import SuperLogger from "./SuperLogger.mjs";

export class DBManager {
    constructor() {
        const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false;
        this.pool = new pg.Pool({
            connectionString: process.env["DB_CONNECTIONSTRING_" + process.env.ENVIRONMENT.toUpperCase()],
            ssl,
        });
    }

    async getUser(userId) {
    const { rows } = await this.pool.query('SELECT * FROM "Users" WHERE userid = $1', [userId]);
    return rows[0];
}

    async updateUser(user) {
        try {
            const query = 'UPDATE "public"."Users" SET "username" = $1, "email" = $2, "password" = $3 WHERE id = $4;';
            const values = [user.username, user.email, user.password, user.id];
            const { rows } = await this.pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async deleteUser(userId) {
        const query = 'DELETE FROM public."Users" WHERE userid = $1 RETURNING *;'; 
        try {
            const { rows } = await this.pool.query(query, [userId]); // Execute the query with the user ID
            return rows[0]; 
        } catch (error) {
            console.error('Error in deleteUser:', error);
            throw error; 
        }
    }

    async createUser(user) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
    
            const query = `
                INSERT INTO public."Users" (username, email, password)
                VALUES ($1, $2, $3)
                RETURNING userid, username, email, registrationdate;
            `;
            const values = [user.username, user.email, hashedPassword];
            const { rows } = await this.pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async loginUser(email, password) {
        try {
            const query = 'SELECT * FROM "public"."Users" WHERE LOWER(email) = LOWER($1)';
            const { rows } = await this.pool.query(query, [email]);
    
            if (rows.length === 0) {
                return null;
            }
    
            const user = rows[0];
    
            // Compare provided password with the hashed password in the database using b crypt
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                console.log("password matched, good job!");
    
                // Extract user data without the password this includes the user id and registration date
                const { password, ...userWithoutPassword } = user;
                 
                return userWithoutPassword;
            } else {
                console.log("wrong password");
                return null;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    async updateUserAbout(userId, about) {
        try {
            const query = `
                UPDATE "public"."Users" SET about = $1 WHERE userid = $2 RETURNING *;
            `;
            const values = [about, userId];
            const { rows } = await this.pool.query(query, values);
            if (rows.length > 0) {
                return rows[0]; // Return the updated user row
            } else {
                return null; // User not found
            }
        } catch (error) {
            console.error("Error updating user's about section:", error);
            throw error;
        }
    }

    async createArticle(userid, title, content) {
        try {
            const query = `
                INSERT INTO public.articles (userid, title, content)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const values = [userid, title, content];
            const { rows } = await this.pool.query(query, values);
            return rows[0]; 
        } catch (error) {
            console.error('Error creating article:', error);
            throw error;
        }
    }

    async getAllArticles() {
        const query = 'SELECT * FROM public.articles ORDER BY postdate DESC;';
        const { rows } = await this.pool.query(query);
        return rows;
    }

    

    async getArticleById(articleId) {
        const query = 'SELECT * FROM public.articles WHERE articleid = $1;';
        const values = [articleId];
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }
}



let connectionString = process.env["DB_CONNECTIONSTRING_" + process.env.ENVIRONMENT.toUpperCase()];
if (connectionString == undefined) {
    throw ("You forgot the db connection string");
}

export default new DBManager(connectionString);
