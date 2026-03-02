import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));

app.use(express.json({ limit: "20kb" }));

app.use(cookieParser());

// health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "sucess",
        message: "Server is healthy"
    });
})

export {
    app,
};