import dotenv from "dotenv";

dotenv.config();

if(!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error("Database configuration is missing. Please check your .env file.");
    process.exit(1);
}