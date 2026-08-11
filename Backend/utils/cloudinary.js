import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload files to Cloudinary
export async function uploadToCloudinary(filePath, folder = 'Doctor') {
    try {
        const result = await cloudinary.uploader(filePath, {
            folder,
            resource_type: "image"
        });

        // Remove the local files after upoad
        fs.unlinkSync(filePath);
        return result;
    }
    catch (err) {
        console.error("Cloudinary upload error:", err);
        throw err;
    }
}

// Delete an image that is present in Cloudinary if user rmeoves from the UI
export async function deleteFromCloudinary(publicId) {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    }
    catch (err) {
        console.error("Cloudinary delete error:", err);
        throw err;
    }
}

export default cloudinary;