import { createClient } from "./client";

const BUCKET_NAME = "employee-avatars";

/**
 * Upload an employee avatar to Supabase Storage.
 * Files are stored under `{userId}/avatar.{ext}`.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error("[Storage] Avatar upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Delete an employee avatar from Supabase Storage.
 */
export async function deleteAvatar(userId: string): Promise<boolean> {
  const supabase = createClient();

  // List all files in the user's folder and delete them
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(userId);

  if (listError || !files?.length) {
    return false;
  }

  const paths = files.map((f) => `${userId}/${f.name}`);
  const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);

  if (error) {
    console.error("[Storage] Avatar delete failed:", error.message);
    return false;
  }

  return true;
}

/**
 * Get the public URL for an avatar path.
 */
export function getAvatarUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
