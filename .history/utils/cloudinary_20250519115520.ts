import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: File,
  type: string = "candidate"
) => {
  if (!file) return null;

  // Convert file to base64
  const fileStr = await readFileAsBase64(file);

  try {
    const response = await fetch("/api/cloudinary-upload", {
      method: "POST",
      body: JSON.stringify({ file: fileStr, filename: file.name, type: type }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
