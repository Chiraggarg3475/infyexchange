"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ImagePlus, X } from "lucide-react";
import { getPublicImageUrl } from "@/lib/images";

export interface PhotoSlot {
  id: string;
  previewUrl: string;
  existingPath?: string;
  file?: File;
  progress: number;
  uploading: boolean;
}

interface PhotoPickerProps {
  photos: PhotoSlot[];
  maxPhotos: number;
  disabled?: boolean;
  onAddFiles: (files: FileList) => void;
  onRemovePhoto: (id: string) => void;
}

export function PhotoPicker({
  photos,
  maxPhotos,
  disabled = false,
  onAddFiles,
  onRemovePhoto,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Photos ({photos.length} of {maxPhotos})
        </span>
        <span className="text-xs text-muted-foreground">
          Compressed in your browser before upload
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((slot) => {
          const src = slot.existingPath
            ? getPublicImageUrl(slot.existingPath, true)
            : slot.previewUrl;

          return (
            <motion.div
              key={slot.id}
              initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 24 }
              }
              className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Selected listing preview"
                loading="lazy"
                className="size-full object-cover"
              />

              {slot.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-xs">
                  <svg
                    className="size-12 -rotate-90"
                    viewBox="0 0 36 36"
                    aria-label={`Uploading ${slot.progress}%`}
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      className="stroke-border"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      className="stroke-gold transition-all duration-150"
                      strokeWidth="3"
                      strokeDasharray={94.2}
                      strokeDashoffset={94.2 - (94.2 * slot.progress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {!disabled && !slot.uploading && (
                <button
                  type="button"
                  onClick={() => onRemovePhoto(slot.id)}
                  aria-label="Remove photo"
                  className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur-xs transition-colors hover:bg-destructive hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </motion.div>
          );
        })}

        {photos.length < maxPhotos && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-border bg-card/60 p-4 text-center text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={maxPhotos > 1}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
