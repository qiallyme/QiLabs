/**
 * Ingestion Status Polling Helper
 * 
 * Polls ingestion status until complete or error, with exponential backoff
 */

import { getIngestStatus, type IngestStatusResponse } from './workerClient';

export interface IngestStatusOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  onStatusUpdate?: (status: IngestStatusResponse) => void;
}

/**
 * Poll ingestion status until complete or error
 */
export async function pollIngestStatus(
  ingestId: string,
  options: IngestStatusOptions = {}
): Promise<IngestStatusResponse> {
  const {
    maxAttempts = 30, // 30 attempts max
    initialDelay = 1000, // Start with 1 second
    maxDelay = 10000, // Max 10 seconds between polls
    onStatusUpdate,
  } = options;

  let delay = initialDelay;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const status = await getIngestStatus(ingestId);
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }

      // Check if complete or error
      if (status.status === 'complete' || status.status === 'error') {
        return status;
      }

      // Wait before next poll (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, maxDelay);
      attempts++;
    } catch (error) {
      console.error(`[IngestStatus] Poll attempt ${attempts + 1} failed:`, error);
      // Continue polling even on error (might be transient)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, maxDelay);
      attempts++;
    }
  }

  // Timeout - return last known status or throw
  throw new Error(`Ingestion status polling timed out after ${attempts} attempts`);
}

/**
 * Get human-readable status message
 */
export function getIngestStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Queued for processing...';
    case 'processing':
      return 'Processing...';
    case 'complete':
      return 'Indexed';
    case 'error':
      return 'Indexing failed';
    default:
      return `Status: ${status}`;
  }
}

/**
 * Check if status is terminal (complete or error)
 */
export function isIngestStatusTerminal(status: string): boolean {
  return status === 'complete' || status === 'error';
}

