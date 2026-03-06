import {Router} from "express";
import  {createProjectController, fetchProjectsController}  from "./project.controller.js";

const router = Router();
router.route("/").post(createProjectController);
router.route('/').get(fetchProjectsController)

export default router;