import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    fs.unlinkSync(localFilePath); // delete local file after upload
    console.log("File uploaded successfully", result.url);
    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath); // delete file even if upload fails
    console.error("Upload failed:", error);
    return null;
  }
};

export { uploadOnCloudinary };
