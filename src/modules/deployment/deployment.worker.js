import boss from "../../queue/boss.js";
import pool from "../../config/db.js";

export const startWorker = async () => {

    console.log("👷 Deployment worker started and waiting for jobs");

    await boss.work("deployment-start", async job => {

        const { deployment_id } = job.data;

        console.log(`⚙️ Worker received job for deployment ID: ${deployment_id}`);

        // mark deployment as in progress
        await pool.query(
            `UPDATE deployments 
             SET status = 'in_progress'
             WHERE id = $1`,
            [deployment_id]
        );

        // simulate build / deployment work
        await new Promise(resolve => setTimeout(resolve, 5000));

        // mark deployment completed
        await pool.query(
            `UPDATE deployments 
             SET status = 'completed',
                 finished_at = NOW()
             WHERE id = $1`,
            [deployment_id]
        );

        console.log(`✅ Deployment ID ${deployment_id} marked as completed`);

    });

};