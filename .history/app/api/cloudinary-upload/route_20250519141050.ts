import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary-server";

export async function POST(request: NextRequest) {
  try {
    const { file, type } = await request.json();

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const folder = type === "banner" ? "banners" : "candidates";

    const uploadResult = await cloudinary.uploader.upload(file, { folder });

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
