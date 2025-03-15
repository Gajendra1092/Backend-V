import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // nodejs library which is used in file handling like read file, write, remove or change permissions etc.

 // Configuration
 cloudinary.config({ 
    cloud_name: 'dvpset7bw', 
    api_key: '316193194152524', 
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});

// method to upload file.
const uploadOnCloudinary = async (localFilePath) => {
    try{
         if(!localFilePath) return null
         //upload the file on cloudinary
         const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
         })
         // file has been uploaded successfully.
         console.log('File uploaded successfully', response.url);
         return response

    }    
    catch(error){
        fs.unlinkSync(localFilePath) // making Sync remove the file locally saved temp file as the upload op get failed.
        return null
    }
}

export {uploadOnCloudinary};