import { useCallback, useEffect, useRef, useState } from 'react';

import type { RecognitionRequest } from '@/schemas/ink';
import { digitalInkService } from '@/services/digitalInkService';

export type ModelStatus = 'unavailable' | 'checking' | 'downloading' | 'ready' | 'error';

export function useDigitalInk(languageTag: string) {
  const [modelStatus, setModelStatus] = useState<ModelStatus>('checking');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const prepareModel = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setError(null);

    if (!digitalInkService.isAvailable()) {
      setModelStatus('unavailable');
      return;
    }

    try {
      setModelStatus('downloading');
      await digitalInkService.prepareLanguage(languageTag);
      if (currentRequest === requestId.current) setModelStatus('ready');
    } catch (caught) {
      if (currentRequest !== requestId.current) return;
      setModelStatus('error');
      setError(caught instanceof Error ? caught.message : 'Unable to prepare the language model.');
    }
  }, [languageTag]);

  useEffect(() => {
    void prepareModel();
    return () => {
      requestId.current += 1;
    };
  }, [prepareModel]);

  const recognize = useCallback(async (request: RecognitionRequest) => {
    setError(null);
    setIsRecognizing(true);
    try {
      return await digitalInkService.recognize(request);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Recognition failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  return {
    modelStatus,
    isRecognizing,
    error,
    prepareModel,
    recognize,
    clearError: () => setError(null),
  };
}
