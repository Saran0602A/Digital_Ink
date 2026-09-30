import { NativeModule, requireOptionalNativeModule } from 'expo';

import type { RecognitionResponse } from './DigitalInk.types';

declare class DigitalInkModule extends NativeModule {
  isModelDownloaded(languageTag: string): Promise<boolean>;
  downloadModel(languageTag: string): Promise<void>;
  recognize(
    inkJson: string,
    languageTag: string,
    width: number,
    height: number,
    preContext: string,
  ): Promise<RecognitionResponse>;
}

export default requireOptionalNativeModule<DigitalInkModule>('DigitalInk');
