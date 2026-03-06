import pool from "../../config/db.js";


const createProject = async ({ name, repository_url, branch}) => {
    const query = `INSERT INTO projects (name, repository_url, branch) VALUES ($1, $2, $3) RETURNING *`;

    const values = [name, repository_url, branch || 'main'];
    const result = await pool.query(query, values);
    return result.rows[0];
}

const getAllProjects = async () => {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows;
}

export  {
    createProject,
    getAllProjects
}