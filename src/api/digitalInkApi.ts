import DigitalInkModule from '../../modules/digital-ink/src/DigitalInkModule';

import type { RecognitionRequest, RecognitionResponse } from '@/schemas/ink';

export const digitalInkApi = {
  isAvailable(): boolean {
    return DigitalInkModule !== null;
  },

  async isModelDownloaded(languageTag: string): Promise<boolean> {
    if (!DigitalInkModule) return false;
    return DigitalInkModule.isModelDownloaded(languageTag);
  },

  async downloadModel(languageTag: string): Promise<void> {
    if (!DigitalInkModule) {
      throw new Error('Digital Ink requires an Android or iOS development build.');
    }
    await DigitalInkModule.downloadModel(languageTag);
  },

  async recognize(request: RecognitionRequest): Promise<RecognitionResponse> {
    if (!DigitalInkModule) {
      throw new Error('Digital Ink requires an Android or iOS development build.');
    }

    return DigitalInkModule.recognize(
      JSON.stringify(request.ink),
      request.languageTag,
      request.writingArea.width,
      request.writingArea.height,
      request.preContext ?? '',
    );
  },
};
