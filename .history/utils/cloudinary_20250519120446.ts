// Tidak ada import cloudinary di sini

export const uploadToCloudinary = async (
  file: File,
  type: string = "candidate"
) => {
  if (!file) return null;

  try {
    const base64 = await fileToBase64(file);

    const response = await fetch("/api/cloudinary-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64, type }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error || "Upload failed");

    return result.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};
