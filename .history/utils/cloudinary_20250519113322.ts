import { v2 as cloudinary } from "cloudinary";

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const uploadToCloudinary = async (file: File) => {
  if (!file) return null;

  // Convert file to base64
  const fileStr = await readFileAsBase64(file);

  try {
    const response = await fetch("/api/cloudinary-upload", {
      method: "POST",
      body: JSON.stringify({ file: fileStr, filename: file.name }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};
