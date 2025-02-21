import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Used for accessing cookies form user's browser and perform operations on that.

const app = express();

// configurations of CORS, json files, URL and public assets folder.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json(
    {
        limit: "30kb",
    }
));

app.use(express.urlencoded(
    { 
    extended: true, limit: "30kb" 
    }
));

app.use(express.static("public"));
app.use(cookieParser());

export default app; // export {app}; both are same thing.