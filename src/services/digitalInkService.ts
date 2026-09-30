import { digitalInkApi } from '@/api/digitalInkApi';
import {
  validateRecognitionRequest,
  type RecognitionRequest,
  type RecognitionResponse,
} from '@/schemas/ink';

export const digitalInkService = {
  isAvailable: digitalInkApi.isAvailable,

  async prepareLanguage(languageTag: string): Promise<'ready' | 'downloaded'> {
    const alreadyDownloaded = await digitalInkApi.isModelDownloaded(languageTag);
    if (alreadyDownloaded) return 'ready';

    await digitalInkApi.downloadModel(languageTag);
    return 'downloaded';
  },

  async recognize(request: RecognitionRequest): Promise<RecognitionResponse> {
    validateRecognitionRequest(request);
    await this.prepareLanguage(request.languageTag);
    const response = await digitalInkApi.recognize(request);

    if (!response.candidates.length) {
      throw new Error('No text was recognized. Try writing larger and more clearly.');
    }

    return response;
  },
};
