import boss from "../../queue/boss.js";
import pool from "../../config/db.js";
import simpleGit from "simple-git";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { generateDockerfile } from "../../infrastructure/docker/dockerfileGenerator.js";
import { detectStack } from "../../infrastructure/stack-detector/stackDetector.js";


const git = simpleGit();

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

export const startWorker = async () => {

    console.log("👷 Deployment worker started and waiting for jobs");

    await boss.work("deployment-start", async job => {

        const { deployment_id } = job.data;

        console.log(`⚙️ Worker received job for deployment ID: ${deployment_id}`);

        try {

            await pool.query(
                `UPDATE deployments SET status = 'building' WHERE id = $1`,
                [deployment_id]
            );

            const result = await pool.query(
                `SELECT p.repository_url
                FROM deployments d
                JOIN projects p ON p.id = d.project_id
                WHERE d.id = $1`,
                [deployment_id]
            );

            const repoURL = result.rows[0].repository_url;

            const workspace = path.join("workspace", `deploy-${deployment_id}`);

            if (fs.existsSync(workspace)) {
                fs.rmSync(workspace, { recursive: true, force: true });
            }

            console.log("Cloning repository:", repoURL);

            await git.clone(repoURL, workspace);

            const stack = detectStack(workspace);

            console.log("Detected stack:", stack);

            const dockerfile = generateDockerfile(stack);

            fs.writeFileSync(
                path.join(workspace, "Dockerfile"),
                dockerfile
            );

            const imageName = `deploy-${deployment_id}`;

            console.log("Building Docker image:", imageName);

            await execPromise(`docker build -t ${imageName} ${workspace}`);

            await execPromise(`docker run -d -p 3001:3000 ${imageName}`);

            await pool.query(
                `UPDATE deployments
                SET status = 'completed',
                    finished_at = NOW()
                WHERE id = $1`,
                [deployment_id]
            );

            console.log(`✅ Deployment ${deployment_id} completed`);

        } catch (error) {

            console.error("Deployment failed:", error);

            await pool.query(
                `UPDATE deployments
                SET status = 'failed'
                WHERE id = $1`,
                [deployment_id]
            );

        }

    });
};