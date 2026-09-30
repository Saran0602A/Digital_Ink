export type InkLanguage = {
  label: string;
  nativeLabel: string;
  tag: string;
};

export const INK_LANGUAGES: InkLanguage[] = [
  { label: 'English', nativeLabel: 'English', tag: 'en-US' },
  { label: 'Hindi', nativeLabel: 'हिन्दी', tag: 'hi' },
  { label: 'Tamil', nativeLabel: 'தமிழ்', tag: 'ta' },
  { label: 'Telugu', nativeLabel: 'తెలుగు', tag: 'te' },
];

export const DEFAULT_LANGUAGE = INK_LANGUAGES[0];
