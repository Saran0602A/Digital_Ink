import { useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import type { InkPoint, InkStroke, WritingArea } from '@/schemas/ink';
import { colors, radius, spacing } from '@/theme/tokens';
import { strokeToPath } from '@/utils/strokeToPath';

type Props = {
  strokes: InkStroke[];
  onStrokeEnd: (points: InkPoint[]) => void;
  onAreaChange: (area: WritingArea) => void;
  onDrawingChange?: (drawing: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export function InkCanvas({ strokes, onStrokeEnd, onAreaChange, onDrawingChange, style }: Props) {
  const activeRef = useRef<InkPoint[]>([]);
  const [activeStroke, setActiveStroke] = useState<InkPoint[]>([]);
  const [area, setArea] = useState<WritingArea>({ width: 0, height: 0 });

  const appendPoint = (x: number, y: number) => {
    const point = { x, y, t: Date.now() };
    activeRef.current = [...activeRef.current, point];
    setActiveStroke(activeRef.current);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          activeRef.current = [];
          onDrawingChange?.(true);
          appendPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          appendPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderRelease: (event) => {
          appendPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
          onStrokeEnd(activeRef.current);
          activeRef.current = [];
          setActiveStroke([]);
          onDrawingChange?.(false);
        },
        onPanResponderTerminate: () => {
          if (activeRef.current.length) onStrokeEnd(activeRef.current);
          activeRef.current = [];
          setActiveStroke([]);
          onDrawingChange?.(false);
        },
      }),
    [onDrawingChange, onStrokeEnd],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextArea = {
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    };
    setArea(nextArea);
    onAreaChange(nextArea);
  };

  return (
    <View onLayout={handleLayout} style={[styles.canvas, style]} {...panResponder.panHandlers}>
      {!strokes.length && !activeStroke.length ? (
        <View pointerEvents="none" style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Write a short clinical note</Text>
          <Text style={styles.emptyText}>Use your finger or stylus inside this area</Text>
        </View>
      ) : null}

      <Svg height="100%" pointerEvents="none" width="100%">
        {[0.33, 0.66].map((position) => (
          <Line
            key={position}
            stroke={colors.line}
            strokeDasharray="5 8"
            strokeWidth="1"
            x1="16"
            x2={Math.max(area.width - 16, 16)}
            y1={area.height * position}
            y2={area.height * position}
          />
        ))}
        {strokes.map((stroke, index) => (
          <Path
            d={strokeToPath(stroke.points)}
            fill="none"
            key={`${index}-${stroke.points.length}`}
            stroke={colors.ink}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
        ))}
        {activeStroke.length ? (
          <Path
            d={strokeToPath(activeStroke)}
            fill="none"
            stroke={colors.ink}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 265,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: spacing.xl,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  emptyTitle: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  emptyText: { color: '#8B9AA3', fontSize: 12, marginTop: spacing.xs },
});
