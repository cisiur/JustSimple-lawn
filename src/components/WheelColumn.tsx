import { useRef, useCallback, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE } from '../constants/theme';

const ITEM_H = 52;
const VISIBLE = 5;
export const WHEEL_H = ITEM_H * VISIBLE; // 260 — exported so modal can size itself
const MULTIPLIER = 200; // 200× repetitions ≈ infinite for practical use

interface Props {
  items: string[];
  initialIndex: number;
  onChange: (index: number) => void;
  width: number;
}

export function WheelColumn({ items, initialIndex, onChange, width }: Props) {
  const listRef = useRef<FlatList>(null);
  const count = items.length;
  const midStart = Math.floor(MULTIPLIER / 2) * count;

  // Build the long repeated list once
  const data = Array.from({ length: count * MULTIPLIER }, (_, i) => items[i % count]);

  // Scroll to the initial position after layout
  useEffect(() => {
    const offset = (midStart + initialIndex) * ITEM_H;
    const t = setTimeout(() => {
      listRef.current?.scrollToOffset({ offset, animated: false });
    }, 50);
    return () => clearTimeout(t);
  }, []); // empty — runs once on mount; remount via key to reset

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const offset = e.nativeEvent.contentOffset.y;
      const absIdx = Math.round(offset / ITEM_H);
      const normalized = ((absIdx % count) + count) % count;
      onChange(normalized);
    },
    [count, onChange],
  );

  return (
    <View style={[styles.container, { width }]}>
      {/* Highlight band behind the selected row */}
      <View style={styles.selection} pointerEvents="none" />

      {/* Semi-transparent masks that dim non-selected rows */}
      <View style={styles.fadeTop} pointerEvents="none" />
      <View style={styles.fadeBottom} pointerEvents="none" />

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: ITEM_H,
          offset: ITEM_H * index,
          index,
        })}
        contentContainerStyle={styles.listPad}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        removeClippedSubviews
        windowSize={7}
        maxToRenderPerBatch={20}
        initialNumToRender={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: WHEEL_H,
    overflow: 'hidden',
  },
  listPad: {
    paddingVertical: ITEM_H * 2,
  },
  item: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // Top/bottom border lines that frame the selected item
  selection: {
    position: 'absolute',
    top: ITEM_H * 2,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: COLORS.primary,
    zIndex: 1,
  },
  // White overlays that fade out non-selected items
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 2,
    backgroundColor: 'rgba(255,255,255,0.78)',
    zIndex: 2,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 2,
    backgroundColor: 'rgba(255,255,255,0.78)',
    zIndex: 2,
  },
});
