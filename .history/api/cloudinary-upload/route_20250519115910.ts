import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { file, type } = await request.json();

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Use different folders based on image type
    const folder = type === "banner" ? "banners" : "candidates";

    // Upload the base64 string to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: folder,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
