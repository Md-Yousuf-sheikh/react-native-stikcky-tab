import React, { useCallback, useRef } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export function CategoryTabsBar({
  titles,
  activeIndex,
  onPress,
}: {
  titles: string[];
  activeIndex: number;
  onPress: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  // Keep the active tab in view
  const onTabLayout = useCallback(
    (index: number, x: number) => {
      if (index !== activeIndex) return;
      scrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
    },
    [activeIndex]
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {titles?.map((t, i) => {
        const isActive = i === activeIndex;
        return (
          <TouchableOpacity
            key={`${i}-${t}`}
            onPress={() => onPress(i)}
            onLayout={(e) => {
              const { x } = e.nativeEvent.layout;
              onTabLayout(i, x);
            }}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /** Overlay header */
  overlayNavWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20, // above sticky tabs
  },
  navBar: {
    height: 56, // content height; SafeAreaView adds iOS top inset
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomColor: "#eee",
  },
  navIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconTranslucentBg: {
    backgroundColor: "rgba(0,0,0,0.25)", // improves contrast over hero image
  },

  /** Tabs (sticky header row content) */
  tabsContainer: {
    backgroundColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  tabs: {
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
  },
  tabActive: {
    backgroundColor: "#111",
  },
  tabLabel: { fontSize: 14, color: "#333" },
  tabLabelActive: { color: "white", fontWeight: "600" },

  /** Section + items */
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  sectionHeaderText: { fontSize: 18, fontWeight: "700" },
  item: { backgroundColor: "white" },
});
