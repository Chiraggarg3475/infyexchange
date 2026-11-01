import imageCompression from "browser-image-compression";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const BUCKET_NAME = "listing-images";

export function getThumbnailPath(mainPath: string): string {
  if (mainPath.endsWith(".webp") && !mainPath.endsWith("_t.webp")) {
    return `${mainPath.slice(0, -5)}_t.webp`;
  }
  const dotIndex = mainPath.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${mainPath}_t.webp`;
  }
  return `${mainPath.slice(0, dotIndex)}_t${mainPath.slice(dotIndex)}`;
}

export function getPublicImageUrl(path: string, isThumbnail = false): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const resolvedPath = isThumbnail ? getThumbnailPath(path) : path;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${resolvedPath}`;
}

export function getStoragePathsWithThumbs(mainPaths: string[]): string[] {
  const allPaths: string[] = [];
  for (const p of mainPaths) {
    allPaths.push(p);
    allPaths.push(getThumbnailPath(p));
  }
  return allPaths;
}

export async function compressAndUploadPhoto(params: {
  supabase: SupabaseClient<Database>;
  file: File;
  userId: string;
  listingId: string;
  slotIndex: number;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  const { supabase, file, userId, listingId, slotIndex, onProgress } = params;

  onProgress?.(10);

  const mainCompressed = await imageCompression(file, {
    maxSizeMB: 0.15,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.72,
    onProgress: (p) => {
      onProgress?.(Math.min(55, 10 + Math.round(p * 0.45)));
    },
  });

  const thumbCompressed = await imageCompression(file, {
    maxSizeMB: 0.03,
    maxWidthOrHeight: 320,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.68,
    onProgress: (p) => {
      onProgress?.(Math.min(80, 55 + Math.round(p * 0.25)));
    },
  });

  const mainPath = `${userId}/${listingId}/${slotIndex}.webp`;
  const thumbPath = `${userId}/${listingId}/${slotIndex}_t.webp`;

  const { error: mainErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(mainPath, mainCompressed, {
      contentType: "image/webp",
      upsert: true,
    });

  if (mainErr) {
    throw mainErr;
  }

  onProgress?.(90);

  const { error: thumbErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(thumbPath, thumbCompressed, {
      contentType: "image/webp",
      upsert: true,
    });

  if (thumbErr) {
    throw thumbErr;
  }

  onProgress?.(100);
  return mainPath;
}
