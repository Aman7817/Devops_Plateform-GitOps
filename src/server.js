import "./config/index.js";
import "./config/db.js"
import { startQueue } from "./queue/boss.js";
import { startWorker } from "./modules/deployment/deployment.worker.js";
import {app} from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // Start the job queue
    await startQueue();
    // Start the worker to process deployment jobs
    await startWorker();

});