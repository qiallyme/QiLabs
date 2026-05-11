import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for handling streaming responses
 * Adapted from create-anything for QiNote RAG streaming
 * 
 * Used for processing chunked responses from search/ingestion APIs
 */
export function useHandleStreamResponse({
  onChunk,
  onFinish,
}: {
  onChunk: (content: string) => void;
  onFinish: (content: string) => void;
}) {
  const handleStreamResponse = useCallback(
    async (response: Response) => {
      if (response.body) {
        const reader = response.body.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let content = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              onFinish(content);
              break;
            }
            const chunk = decoder.decode(value, { stream: true });
            content += chunk;
            onChunk(content);
          }
        }
      }
    },
    [onChunk, onFinish]
  );

  const handleStreamResponseRef = useRef(handleStreamResponse);
  useEffect(() => {
    handleStreamResponseRef.current = handleStreamResponse;
  }, [handleStreamResponse]);

  return useCallback(
    (response: Response) => handleStreamResponseRef.current(response),
    []
  );
}

