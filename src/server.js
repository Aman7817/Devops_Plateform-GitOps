console.log("Loading from:", import.meta.url, "at", Date.now());
import "./config/index.js";
import "./config/db.js"
import boss, {startQueue}  from "./queue/boss.js";
import { startWorker } from "./modules/deployment/deployment.worker.js";
import {app} from "./app.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    // 1. Queue first
    await startQueue();
    console.log("Queue started");
    // 2. Worker second  
    await startWorker();
    console.log("Worker started");

    // 3. Server LAST
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();