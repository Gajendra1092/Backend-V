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

// routes import (segration)
import userRouter from "./routes/user.routes.js";

// routes declarations
// app.use("/users", userRouter);  used as a middleware here. Ref. example file in backend folder.
app.use("/api/v1/users", userRouter); // standard pratice to define api version.





export default app; // export {app}; both are same thing.