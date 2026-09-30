import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type InkLanguage } from '@/constants/languages';

type RecognitionSession = {
  candidates: string[];
  language: string;
};

type RecognitionSessionContextValue = {
  selectedLanguage: InkLanguage;
  setSelectedLanguage: (language: InkLanguage) => void;
  result: RecognitionSession | null;
  setResult: (result: RecognitionSession) => void;
};

const RecognitionSessionContext = createContext<RecognitionSessionContextValue | null>(null);

export function RecognitionSessionProvider({ children }: PropsWithChildren) {
  const [selectedLanguage, setSelectedLanguage] = useState<InkLanguage>(DEFAULT_LANGUAGE);
  const [result, setResult] = useState<RecognitionSession | null>(null);
  const value = useMemo(
    () => ({ selectedLanguage, setSelectedLanguage, result, setResult }),
    [result, selectedLanguage],
  );

  return (
    <RecognitionSessionContext.Provider value={value}>
      {children}
    </RecognitionSessionContext.Provider>
  );
}

export function useRecognitionSession() {
  const context = useContext(RecognitionSessionContext);

  if (!context) {
    throw new Error('useRecognitionSession must be used inside RecognitionSessionProvider.');
  }

  return context;
}
