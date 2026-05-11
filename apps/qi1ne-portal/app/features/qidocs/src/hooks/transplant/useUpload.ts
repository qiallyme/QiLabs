import { useState, useCallback } from 'react';

/**
 * Hook for handling file uploads
 * Adapted from create-anything for QiNote ingestion
 * 
 * TODO: Replace /_create/api/upload/ with QiNote backend endpoint
 */
export function useUpload() {
  const [loading, setLoading] = useState(false);

  const upload = useCallback(async (input: {
    file?: File;
    url?: string;
    base64?: string;
    buffer?: ArrayBuffer;
  }) => {
    try {
      setLoading(true);
      let response;

      if ('file' in input && input.file) {
        const formData = new FormData();
        formData.append('file', input.file);
        // TODO: Replace with QiNote ingestion endpoint
        response = await fetch('/api/ingest/upload', {
          method: 'POST',
          body: formData,
        });
      } else if ('url' in input && input.url) {
        // TODO: Replace with QiNote ingestion endpoint
        response = await fetch('/api/ingest/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: input.url }),
        });
      } else if ('base64' in input && input.base64) {
        // TODO: Replace with QiNote ingestion endpoint
        response = await fetch('/api/ingest/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ base64: input.base64 }),
        });
      } else if ('buffer' in input && input.buffer) {
        // TODO: Replace with QiNote ingestion endpoint
        response = await fetch('/api/ingest/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: input.buffer,
        });
      } else {
        throw new Error('Invalid upload input');
      }

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Upload failed: File too large.');
        }
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return { url: data.url, mimeType: data.mimeType || null };
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      if (typeof uploadError === 'string') {
        return { error: uploadError };
      }
      return { error: 'Upload failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }] as const;
}

