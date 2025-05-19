import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const { file, filename } = await request.json();

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: "votelysign", // Optional folder in your Cloudinary account
      public_id: `${Date.now()}-${filename.split(".")[0]}`, // Create unique name
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
