"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { RepoBlob } from "@/lib/atproto/blobs";
import { formatBytes } from "@/lib/format-bytes";

interface BlobPanelProps {
  blob: RepoBlob | null;
  loading: boolean;
  error: string | null;
}

function isTextContentType(contentType: string): boolean {
  return (
    contentType.startsWith("text/") ||
    contentType === "application/json" ||
    contentType.endsWith("+json") ||
    contentType.endsWith("+xml")
  );
}

function isImageContentType(contentType: string): boolean {
  return contentType.startsWith("image/");
}

function isAudioContentType(contentType: string): boolean {
  return contentType.startsWith("audio/");
}

function isVideoContentType(contentType: string): boolean {
  return contentType.startsWith("video/");
}

function toHexPreview(bytes: Uint8Array, maxBytes = 256): string {
  const slice = bytes.slice(0, maxBytes);
  const hex = Array.from(slice, (byte) => byte.toString(16).padStart(2, "0")).join(
    " ",
  );
  return bytes.length > maxBytes ? `${hex}\n…` : hex;
}

function useBlobUrl(blob: RepoBlob | null) {
  const blobUrl = useMemo(() => {
    if (!blob) {
      return null;
    }

    const copy = new Uint8Array(blob.bytes);
    return URL.createObjectURL(
      new Blob([copy], { type: blob.contentType }),
    );
  }, [blob]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return blobUrl;
}

function useImageDimensions(src: string | null) {
  const [result, setResult] = useState<{
    src: string;
    dimensions: { width: number; height: number } | null;
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    if (!src) {
      return;
    }

    let cancelled = false;
    const image = new window.Image();

    image.onload = () => {
      if (!cancelled) {
        setResult({
          src,
          dimensions: {
            width: Math.max(1, image.naturalWidth),
            height: Math.max(1, image.naturalHeight),
          },
          failed: false,
        });
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setResult({ src, dimensions: null, failed: true });
      }
    };
    image.src = src;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  if (!src || result?.src !== src) {
    return { dimensions: null, failed: false };
  }

  return { dimensions: result.dimensions, failed: result.failed };
}

function BlobStatus({
  loading,
  error,
  emptyMessage,
}: {
  loading: boolean;
  error: string | null;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        Loading blob…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 text-center text-sm text-zinc-500">
      {emptyMessage}
    </div>
  );
}

export function BlobDetails({ blob, loading, error }: BlobPanelProps) {
  if (loading || error || !blob) {
    return (
      <BlobStatus
        loading={loading}
        error={error}
        emptyMessage="Pick a blob from the list."
      />
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">CID</p>
          <p className="break-all font-mono text-xs text-zinc-200">{blob.cid}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            Content type
          </p>
          <p className="font-mono text-xs text-zinc-200">{blob.contentType}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">Size</p>
          <p className="font-mono text-xs text-zinc-200">
            {formatBytes(blob.bytes.byteLength)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BlobContent({ blob, loading, error }: BlobPanelProps) {
  const blobUrl = useBlobUrl(blob);
  const imagePreview = isImageContentType(blob?.contentType ?? "")
    ? blobUrl
    : null;
  const { dimensions: imageDimensions, failed: imageFailed } =
    useImageDimensions(imagePreview);

  const needsObjectUrl =
    blob !== null &&
    (isImageContentType(blob.contentType) ||
      isAudioContentType(blob.contentType) ||
      isVideoContentType(blob.contentType));

  if (
    loading ||
    error ||
    !blob ||
    (needsObjectUrl && !blobUrl) ||
    (imagePreview && !imageDimensions)
  ) {
    return (
      <BlobStatus
        loading={
          loading ||
          (needsObjectUrl && !blobUrl) ||
          Boolean(imagePreview && !imageDimensions && !imageFailed)
        }
        error={
          error ?? (imageFailed ? "Unable to preview this image." : null)
        }
        emptyMessage="Select a blob to inspect its contents."
      />
    );
  }

  let preview: ReactNode;

  if (isImageContentType(blob.contentType) && blobUrl && imageDimensions) {
    preview = (
      <Image
        src={blobUrl}
        alt={blob.cid}
        width={imageDimensions.width}
        height={imageDimensions.height}
        unoptimized
        className="max-h-[60vh] max-w-full rounded-lg border border-zinc-800 bg-black/40 object-contain"
      />
    );
  } else if (isAudioContentType(blob.contentType) && blobUrl) {
    preview = <audio controls src={blobUrl} className="w-full" />;
  } else if (isVideoContentType(blob.contentType) && blobUrl) {
    preview = (
      <video
        controls
        src={blobUrl}
        className="max-h-[60vh] max-w-full rounded-lg border border-zinc-800 bg-black/40"
      />
    );
  } else if (isTextContentType(blob.contentType)) {
    const text = new TextDecoder().decode(blob.bytes);
    preview = (
      <pre className="w-full max-w-full overflow-x-auto whitespace-pre rounded-xl border border-zinc-800 bg-black/40 p-4 font-mono text-xs leading-6 text-emerald-100">
        {text}
      </pre>
    );
  } else {
    preview = (
      <pre className="w-full max-w-full overflow-x-auto whitespace-pre rounded-xl border border-zinc-800 bg-black/40 p-4 font-mono text-xs leading-6 text-zinc-300">
        {toHexPreview(blob.bytes)}
      </pre>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <a
        href={blobUrl ?? undefined}
        download={blob.cid}
        className="inline-flex rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
      >
        Download blob
      </a>
      {preview}
    </div>
  );
}
