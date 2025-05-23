import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;  
const UserSchema = new Schema(
    
    {
        username:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },

        avatar:{
            type: String, // cloudinary url
            required: true,
        },

        coverImage:{
            type: String, // cloudinary url
        },

        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type: String,
            required: [true, 'Password is required'], // custom message field
        },
        refreshToken:{
            type: String,
        }},
        {
            timestamps: true
        }

)
UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next()
})
// This will update the password evertime when the user even saves the other things. So, if condition is introduced.

// method to check for password
UserSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password) // await as crypto graphy takes time.
}

UserSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
    },
      process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    
)
}

UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    },
      process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User", UserSchema); // User is the name of the collection in the database. UserSchema is the schema of the collection.