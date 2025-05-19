import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Client-side utility for uploading to Cloudinary via our API route

export const uploadToCloudinary = async (file: File, type: string = "candidate") => {
    if (!file) return null;
  
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Send to our API route
      const response = await fetch('/api/cloudinary-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, type }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      return result.url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return null;
    }
  };
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };