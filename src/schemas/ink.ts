export type InkPoint = {
  x: number;
  y: number;
  t: number;
};

export type InkStroke = {
  points: InkPoint[];
};

export type InkDocument = {
  strokes: InkStroke[];
};

export type WritingArea = {
  width: number;
  height: number;
};

export type RecognitionRequest = {
  ink: InkDocument;
  languageTag: string;
  writingArea: WritingArea;
  preContext?: string;
};

export type RecognitionResponse = {
  candidates: string[];
};

export function validateRecognitionRequest(request: RecognitionRequest): void {
  if (!request.ink.strokes.length) {
    throw new Error('Write something before converting it to text.');
  }

  const hasInvalidPoint = request.ink.strokes.some(
    (stroke) =>
      stroke.points.length === 0 ||
      stroke.points.some(
        (point) =>
          !Number.isFinite(point.x) ||
          !Number.isFinite(point.y) ||
          !Number.isFinite(point.t),
      ),
  );

  if (hasInvalidPoint) {
    throw new Error('The handwriting contains an invalid stroke. Please clear and try again.');
  }

  if (request.writingArea.width <= 0 || request.writingArea.height <= 0) {
    throw new Error('The writing area is not ready yet.');
  }
}
