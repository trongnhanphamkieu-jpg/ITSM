"use client";

import { useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
}

interface FileUploadProps {
  entityType: string;
  entityId?: string;
  onUpload?: (file: UploadedFile) => void;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  existingFiles?: UploadedFile[];
  onRemove?: (fileId: string) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  entityType,
  entityId,
  onUpload,
  accept = ".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png",
  maxSizeMb = 10,
  multiple = false,
  existingFiles = [],
  onRemove,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError("");

      const fileArray = Array.from(files);
      for (const file of fileArray) {
        if (file.size > maxSizeMb * 1024 * 1024) {
          setError(`File "${file.name}" vượt quá ${maxSizeMb}MB`);
          return;
        }
      }

      setUploading(true);
      try {
        for (const file of fileArray) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("entityType", entityType);
          if (entityId) formData.append("entityId", entityId);

          const res = await api.upload<any>("/files/upload", formData);
          if (res.data && onUpload) {
            onUpload(res.data);
          }
        }
      } catch (err: any) {
        setError(err.message || "Lỗi upload file");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [entityType, entityId, maxSizeMb, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-surface-secondary/30"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {uploading ? (
          <>
            <i className="bi bi-arrow-repeat animate-spin text-2xl text-primary" />
            <p className="text-sm text-muted">Đang tải lên...</p>
          </>
        ) : (
          <>
            <i className="bi bi-cloud-arrow-up text-2xl text-muted" />
            <p className="text-sm text-muted">
              Kéo thả file hoặc <span className="font-medium text-primary">nhấn để chọn</span>
            </p>
            <p className="text-xs text-muted/70">
              PDF, Excel, Word, ảnh — tối đa {maxSizeMb}MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500">
          <i className="bi bi-exclamation-circle mr-1" />
          {error}
        </p>
      )}

      {/* File List */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary/30 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <i className="bi bi-file-earmark text-muted" />
                <span className="truncate text-sm text-foreground">{f.fileName}</span>
                <span className="shrink-0 text-xs text-muted">
                  {formatFileSize(f.fileSize)}
                </span>
              </div>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  className="ml-2 shrink-0 rounded p-1 text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <i className="bi bi-trash text-sm" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
