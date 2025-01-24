import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUUID } from "@/lib/utils";
import { BUCKET_NAME } from "@/db/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const chatId = formData.get("chatId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate unique path for Supabase storage
    const filePath = `${user.id}/${generateUUID()}/${file.name}`;

    // Upload to Supabase storage bucket with improved configuration
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "max-age=31536000",
        contentType: file.type
      });

    if (storageError) {
      throw storageError;
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Save file metadata if chatId is provided
    if (chatId) {
      await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          chat_id: chatId,
          bucket_id: BUCKET_NAME,
          storage_path: filePath,
          filename: file.name,
          original_name: file.name,
          content_type: file.type,
          size: file.size,
          url: publicUrl
        });
    }

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      name: file.name,
      contentType: file.type,
      success: true,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}