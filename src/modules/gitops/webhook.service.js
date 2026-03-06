import pool from "../../config/db.js";
import boss  from "../../queue/boss.js";
import { ApiError } from "../../utils/ApiError.js";


const processWebhook = async (payload) => {
    try {
        // 1. Extract data from payload
        const repoUrl = payload.repository?.clone_url;
        const commitHash = payload.head_commit?.id;  // Assuming head_commit is present for push events

        // 2. Validate required fields
        if (!repoUrl || !commitHash) {
            throw new ApiError(400, "Invalid payload: Missing repository URL or commit hash");
        }

        // 3. Find project by repo_url
        const projectResult = await pool.query(
            "SELECT * FROM projects WHERE repository_url = $1", 
            [repoUrl]
        );

        // 4. Check if project exists
        if (projectResult.rows.length === 0) {
            console.log("Project not registered. Ignoring webhook.");
            return; // or throw new ApiError(404, "Project not found");
        }

        const project = projectResult.rows[0];
        
        // 5. Create deployment record
        const deploymentResult = await pool.query(
            `INSERT INTO deployments (project_id, status, commit_hash) 
             VALUES ($1, $2, $3)
             RETURNING *`,
            [project.id, "pending", commitHash]
        );
        const deployment = deploymentResult.rows[0];

        await boss.send("deployment-start", {
            deployment_id: deployment.id
        })
        console.log(`Deployment record created with ID: ${deployment.id} and queued for processing.`);
        return deployment;
    } catch (error) {
        // Agar pehle se ApiError hai to waisa hi rehne do
        if (error instanceof ApiError) {
            throw error;
        }
        // Otherwise wrap in ApiError
        throw new ApiError(500, `Failed to process webhook: ${error.message}`);
    }
};

export  {
    processWebhook
};