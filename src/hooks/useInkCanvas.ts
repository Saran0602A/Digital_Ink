import { useCallback, useState } from 'react';

import type { InkPoint, InkStroke, WritingArea } from '@/schemas/ink';

export function useInkCanvas() {
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  const [writingArea, setWritingArea] = useState<WritingArea>({ width: 0, height: 0 });

  const addStroke = useCallback((points: InkPoint[]) => {
    if (!points.length) return;
    setStrokes((current) => [...current, { points }]);
  }, []);

  const undo = useCallback(() => {
    setStrokes((current) => current.slice(0, -1));
  }, []);

  const clear = useCallback(() => setStrokes([]), []);

  return {
    strokes,
    writingArea,
    hasInk: strokes.length > 0,
    addStroke,
    undo,
    clear,
    setWritingArea,
  };
}
