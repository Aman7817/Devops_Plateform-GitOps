import boss from "../../queue/boss.js";
import pool from "../../config/db.js";
import simpleGit from "simple-git";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { resolve } from "dns";

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

        // mark deployment as in progress
        await pool.query(
            `UPDATE deployments 
             SET status = 'building'
             WHERE id = $1`,
            [deployment_id]
        );
        // get project details
        const result = await pool.query(
            `SELECT p.repository_url
            FROM deployments d
            JOIN projects p ON p.id = d.project_id
            WHERE d.id = $1`,
            [deployment_id]
        );
        const repoURL = result.rows[0].repository_url;
        const workspace = path.join("workspace", `deploy-${deployment_id}`);

        if(!fs.existsSync("workspace")) {
            fs.mkdirSync("workspace");
        }

        console.log("Cloning repository:", repoURL);

        await git.clone(repoURL, workspace);

        console.log(" Repository cloned to:", workspace);

        // detect stack (for simplicity, we assume Node.js if package.json exists)
        let stack = "node";

        if (fs.existsSync(path.join(workspace, "package.json"))) {
            stack = "node";
        }
        console.log(`Detected stack: ${stack}`);

        // generate Dockerfile based on stack 
        const dockerfile = `
        FROM node:20
        WORKDIR /app
        COPY . .
        RUN npm install
        EXPOSE 3000
        CMD ["npm", "start"]`;

        fs.writeFileSync(path.join(workspace, "Dockerfile"), dockerfile);

        console.log(" Dockerfile generated");

        const imageName = `deploy-${deployment_id}`;

        console.log("Building Docker image:", imageName);

        await execPromise(`docker build -t ${imageName} ${workspace}`);

        console.log(" Docker image built successfully");

        await execPromise(`docker run -d -p 3001:3000 ${imageName}`);

        console.log(" Docker container started on port 3001");

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