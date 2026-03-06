import {fetchProjects, registerProject} from './project.service.js';
import {ApiError} from "../../utils/ApiError.js";
import {ApiResponse} from "../../utils/ApiResponse.js";
import {asyncHandler} from "../../utils/asyncHandler.js";

console.log('registerProject type:', typeof registerProject);
console.log('registerProject value:', registerProject);

const createProjectController = asyncHandler(async (req, res) => {
    const project = await registerProject(req.body);

    if(!project) {
        throw new ApiError(500, "Failed to create project");
    }

    res.status(201)
    .json(new ApiResponse(true, "Project created successfully", project));

})
const fetchProjectsController = asyncHandler(async(req,res) => {
    const projects = await fetchProjects();
    if(!projects) {
        throw new ApiError(500, "Failed to fetch projects");
    }
    res.status(200).json(new ApiResponse(true, "Projects fetched successfully", projects));
})

export  {
    createProjectController,
    fetchProjectsController
}