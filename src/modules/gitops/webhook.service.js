import pool from "../../config/db.js";
import boss  from "../../queue/boss.js";
import { ApiError } from "../../utils/ApiError.js";

const processWebhook = async (payload) => {
    try {
        const repoUrl = payload.repository?.clone_url;
        const commitHash = payload.head_commit?.id;

        if (!repoUrl || !commitHash) {
            throw new ApiError(400, "Invalid payload: Missing repository URL or commit hash");
        }

        const projectResult = await pool.query(
            "SELECT * FROM projects WHERE repository_url = $1", 
            [repoUrl]
        );

        if (projectResult.rows.length === 0) {
            console.log("Project not registered. Ignoring webhook.");
            return;
        }

        const project = projectResult.rows[0];
        
        const deploymentResult = await pool.query(
            `INSERT INTO deployments (project_id, status, commit_hash) 
             VALUES ($1, $2, $3)
             RETURNING *`,
            [project.id, "pending", commitHash]
        );
        const deployment = deploymentResult.rows[0];
        console.log("✅ Deployment created:", deployment.id);

        // DEBUG: Check boss state
        console.log("🔍 Boss started?", boss.isStarted);
        console.log("🔍 Boss connection?", boss.db ? "YES" : "NO");

        // DEBUG: Try to send job
        console.log("📤 Sending job to queue...");
        try {
            const jobId = await boss.send("deployment-start", {
                deployment_id: deployment.id
            });
            console.log("✅ Job sent successfully, Job ID:", jobId);
        } catch (bossError) {
            console.error("❌ BOSS SEND FAILED:", bossError.message);
            console.error(bossError.stack);
            throw bossError;
        }

        return deployment;
    } catch (error) {
        console.error("❌ PROCESS WEBHOOK ERROR:", error.message);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to process webhook: ${error.message}`);
    }
};
export  {
    processWebhook
};