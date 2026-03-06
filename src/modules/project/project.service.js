import {createProject, getAllProjects} from "./project.model.js";
import {ApiError} from "../../utils/ApiError.js";

const registerProject = async (data) => {
    if(!data.name || !data.repository_url) {
        throw new ApiError(400, "Name and repository_url are required");
    }
    const project = await createProject(data);
    return  project;
}

const fetchProjects = async () => {
    const projects = await getAllProjects();
    return projects;
}

export  {
    registerProject,
    fetchProjects
}       
