import PgBoss from "pg-boss";
import dotenv from "dotenv";

dotenv.config();

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const boss = new PgBoss(connectionString);

export const startQueue = async () => {
    await boss.start();
    console.log("PgBoss started and connected to PostgreSQL");
}

export default boss;