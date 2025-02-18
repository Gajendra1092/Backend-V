// require('dotenv').config({path:{./env}}); // to load environment variables
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

connectDB();










// const app = express();

// ;(async () => {
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // here we are concatinating the DB_NAME and URL hence $ sign is used.
//        app.on("error", (error)=> {console.error("MongoDB connection error:", error);
//        throw error;
//     }); // This line checks that after connecting to DB if api is able to talk to DB or not.

//     app.listen(process.env.PORT, () => {
//         console.log(`Server is running on port ${process.env.PORT}`);
//     })
       

//     }
//     catch(error){
//         console.error("ERROR:" ,error);
//         throw error;
//     }
// })();