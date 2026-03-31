"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  reportId: string;
  existingPhotos?: Array<{
    id: string;
    file_name: string;
    storage_path: string;
  }>;
  disabled?: boolean;
}

/**
 * Photo upload component for damage reports.
 * Uses native file input with camera capture for mobile devices.
 * Photos will be uploaded to Supabase Storage in the integration phase.
 * Currently stores captured file references locally for display.
 */
export function PhotoUpload({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reportId,
  existingPhotos = [],
  disabled = false,
}: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPhotos, setLocalPhotos] = useState<
    Array<{ name: string; url: string }>
  >([]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: Array<{ name: string; url: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 10MB limit.`,
          variant: "destructive",
        });
        continue;
      }

      const url = URL.createObjectURL(file);
      newPhotos.push({ name: file.name, url });
    }

    setLocalPhotos((prev) => [...prev, ...newPhotos]);

    toast({
      title: "Photos Added",
      description: `${newPhotos.length} photo(s) added. They will be uploaded when Supabase Storage is connected.`,
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeLocalPhoto(index: number) {
    setLocalPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  }

  const allPhotos = [
    ...existingPhotos.map((p) => ({
      id: p.id,
      name: p.file_name,
      url: p.storage_path,
      isExisting: true,
    })),
    ...localPhotos.map((p, index) => ({
      id: `local-${index}`,
      name: p.name,
      url: p.url,
      isExisting: false,
    })),
  ];

  return (
    <div className="space-y-3">
      {/* Photo grid */}
      {allPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {photo.isExisting ? (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="absolute bottom-1 left-1 right-1 text-[10px] text-center truncate bg-background/80 rounded px-1">
                    {photo.name}
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              )}
              {!disabled && !photo.isExisting && (
                <button
                  type="button"
                  onClick={() => {
                    const localIndex = index - existingPhotos.length;
                    if (localIndex >= 0) removeLocalPhoto(localIndex);
                  }}
                  className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label={`Remove ${photo.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!disabled && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[48px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo or Upload
          </Button>
        </div>
      )}
    </div>
  );
}
