import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { TopNavHeader } from "./TopNavHeader";
import type { FlatRowProps, Section, StickyCategoryTabsProps } from "./types";
import { CategoryTabsBar } from "./CategoryTabsBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function StickyCategoryTabs<T>({
  sections,
  renderHeader,
  renderItem,
  renderSectionHeader,
  initialActiveIndex = 0,
  tabHeight = 48,
  onPressBack,
  onPressSearch,
  navAppearThreshold = 124,
}: StickyCategoryTabsProps<T>) {
  const hasHeader = !!renderHeader;
  const { top } = useSafeAreaInsets(); // for reference if needed elsewhere

  // Shared values (UI thread)
  const scrollY = useSharedValue(0);
  const headerH = useSharedValue(0);
  const tabsBarH = useSharedValue(tabHeight);
  const navH = useSharedValue(56 + top); // measured TopNav total height (safe-area included)
  const navProgress = useSharedValue(0); // <— drives TopNavHeader fade

  // JS state kept minimal
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const isPressScrollingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  //   when press button wait
  function handlePressScroll() {
    // Clear old timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    isPressScrollingRef.current = true;

    timeoutRef.current = setTimeout(() => {
      isPressScrollingRef.current = false;
    }, 500);
  }

  // Animated FlatList ref (for scrollToIndex)
  const aRef = useAnimatedRef<FlatList<FlatRowProps<T>>>();
  const listRef = useRef<FlatList<FlatRowProps<T>>>(null);

  // Data flattening
  const { flatData, tabsRowIndex, sectionHeaderIndexBySection } =
    useMemo(() => {
      const rows: Array<FlatRowProps<T>> = [];
      if (hasHeader) rows.push({ type: "HEADER", key: "HEADER" });
      const tabsIndex = rows.push({ type: "TABS", key: "TABS" }) - 1;

      const headerIndices: number[] = [];
      sections.forEach((section, sIdx) => {
        rows.push({
          type: "SECTION_HEADER",
          key: `S-${section.id}`,
          sectionIndex: sIdx,
        });
        headerIndices.push(rows.length - 1);
        section.data.forEach((item, iIdx) => {
          rows.push({
            type: "ITEM",
            key: `S-${section.id}-I-${iIdx}`,
            sectionIndex: sIdx,
            itemIndex: iIdx,
            item,
          });
        });
      });

      return {
        flatData: rows,
        tabsRowIndex: tabsIndex,
        sectionHeaderIndexBySection: headerIndices,
      };
    }, [sections, hasHeader]);

  const keyExtractor = useCallback((row: FlatRowProps<T>) => row.key, []);

  // Smooth spacer under TopNav within the TABS row (0 -> navH)
  const spacerAnimatedStyle = useAnimatedStyle(() => {
    const threshold = headerH.value; // tabs hit top after header
    const range = Math.max(1, navH.value); // animate over ~nav height
    const h = interpolate(
      scrollY.value,
      [threshold - range, threshold + range],
      [0, navH.value],
      Extrapolation.CLAMP
    );
    return { height: h };
  });

  // Reanimated scroll handler (no runOnJS)
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      scrollY.value = y;

      // update top-nav fade progress (0..1), clamped
      navProgress.value = Math.max(0, Math.min(1, y / navAppearThreshold));
    },
  });

  // Render Items
  const renderItems = useCallback(
    ({ item }: ListRenderItemInfo<FlatRowProps<T>>) => {
      switch (item.type) {
        case "HEADER":
          return (
            <View
              onLayout={(e) => {
                headerH.value = e.nativeEvent.layout.height;
              }}
              children={renderHeader ? renderHeader() : null}
            />
          );

        case "TABS":
          return (
            <View style={styles.tabsContainer}>
              {/* Spacer grows smoothly to nav height (keeps tabs below TopNav) */}
              <Animated.View style={spacerAnimatedStyle} />
              <View
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height || tabHeight;
                  tabsBarH.value = h;
                }}
              >
                <CategoryTabsBar
                  titles={sections.map((s, i) => s.title || `Section ${i + 1}`)}
                  activeIndex={activeIndex}
                  onPress={(index) => {
                    if (index !== activeIndex) setActiveIndex(index);

                    const targetIndex = sectionHeaderIndexBySection[index];

                    // --- compute the SAME spacer height the animated view is using right now ---
                    const y = scrollY.value;
                    const threshold = headerH.value; // when tabs reach the top
                    const range = Math.max(1, navH.value); // animate spacer over ~nav height
                    let currentSpacer = 0;
                    if (y <= threshold - range) {
                      currentSpacer = 0;
                    } else if (y >= threshold + range) {
                      currentSpacer = navH.value;
                    } else {
                      // linear interpolation from [threshold - range, threshold + range] -> [0, navH]
                      const t = (y - (threshold - range)) / (2 * range); // 0..1
                      currentSpacer = t * navH.value;
                    }

                    // tabs bar height (already measured)
                    const tabsHeight = tabsBarH.value;

                    // small epsilon so the section header isn’t clipped by hairline borders
                    const EPS = 1;

                    const viewOffsetSize = currentSpacer + tabsHeight + EPS;

                    const viewOffset =
                      index == 0 ? viewOffsetSize * 6 : viewOffsetSize;

                    isPressScrollingRef.current = true;

                    // Reset after 500ms
                    handlePressScroll();

                    try {
                      (listRef.current as any)?.scrollToIndex({
                        index: targetIndex,
                        animated: true,
                        viewOffset,
                        viewPosition: 0, // align to top
                      });
                    } catch {}
                  }}
                />
              </View>
            </View>
          );

        case "SECTION_HEADER": {
          const section = sections[item.sectionIndex];
          return (
            <View style={styles.sectionHeader}>
              {renderSectionHeader ? (
                renderSectionHeader(section as Section<T>)
              ) : (
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
              )}
            </View>
          );
        }

        case "ITEM": {
          const section = sections[item.sectionIndex];
          return (
            <View style={styles.item}>
              {renderItem({
                item: (item as any).item,
                sectionId: (section as Section<T>).id,
              })}
            </View>
          );
        }
      }
    },
    [
      activeIndex,
      renderHeader,
      renderItem,
      renderSectionHeader,
      sections,
      sectionHeaderIndexBySection,
      spacerAnimatedStyle,
      tabHeight,
    ]
  );

  // Auto-active tab from viewability (JS side is fine)
  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ index: number | null; item: FlatRowProps<T> }>;
    }) => {
      if (isPressScrollingRef.current) return;
      const first = viewableItems
        .filter(
          (vi) => vi.index != null && (vi.item as any).type === "SECTION_HEADER"
        )
        .sort((a, b) => a.index! - b.index!)[0];
      if (!first) return;
      const next = (first.item as any).sectionIndex as number;
      if (next !== activeIndex) setActiveIndex(next);
    }
  ).current;

  // measure TopNav total height (safe-area included)
  const onMeasureNav = (h: number) => {
    navH.value = h;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Absolute TopNav */}
      <View
        style={styles.overlayNavWrapper}
        onLayout={(e) => onMeasureNav(e.nativeEvent.layout.height)}
      >
        <TopNavHeader
          progress={navProgress}
          onPressBack={onPressBack}
          onPressSearch={onPressSearch}
        />
      </View>

      <Animated.FlatList
        ref={(r) => {
          (aRef as any).current = r as any;
          (listRef as any).current = r as any;
        }}
        data={flatData}
        bounces={false}
        keyExtractor={keyExtractor}
        renderItem={renderItems as any}
        stickyHeaderIndices={[tabsRowIndex]} // tabs stick directly beneath the header (spacer anim handles overlap)
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 40 }}
        removeClippedSubviews
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={hasHeader ? 12 : 10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlayNavWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  tabsContainer: {
    backgroundColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  sectionHeaderText: { fontSize: 18, fontWeight: "700" },
  item: { backgroundColor: "white" },
});
