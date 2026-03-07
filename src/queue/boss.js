import PgBoss from "pg-boss";
import dotenv from "dotenv";

dotenv.config();

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const boss = new PgBoss(connectionString);
export const startQueue = async () => {
    await boss.start();
    // explicitly create the queue to ensure it exists before any jobs are sent
    await boss.createQueue("deployment-start");
    console.log("PgBoss instance created with connection string:", import.meta.url);
    console.log("Boss ID: ", boss.id);


    console.log("PgBoss started and connected to PostgreSQL");

};
export default boss;