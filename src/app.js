import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

// app.use(cors({
//     // origin: process.env.CORS_ORIGIN,
// }));
app.use(cors())

app.use(express.json({ limit: "20kb" }));

app.use(cookieParser());

// health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "sucess",
        message: "Server is healthy"
    });
})

// import routes
import projectRoutes from "./modules/project/project.routes.js";
import webHookRoutes from "./modules/gitops/webhook.routes.js"
// use routes
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/webhook", webHookRoutes)

export {
    app,
};