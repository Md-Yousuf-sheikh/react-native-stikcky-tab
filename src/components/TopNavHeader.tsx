import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TopNavHeaderProps } from "./types";

export function TopNavHeader({
  progress,
  onPressBack,
  onPressSearch,
}: TopNavHeaderProps) {
  const { top } = useSafeAreaInsets();
  const totalHeight = top + 56; // fixed, no layout jumps

  // White underlay fades in with progress
  const underlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  // Cross-fade icon layers (light over image -> dark over white)
  const lightIconsStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));
  const darkIconsStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      {/* Fading white background */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, styles.whiteBg, underlayStyle]}
      />

      {/* LIGHT icons (white) — absolute, does not change layout */}
      <Animated.View
        style={[styles.absoluteRow, { paddingTop: top }, lightIconsStyle]}
        // this layer receives touches while visible
        pointerEvents="auto"
      >
        <TouchableOpacity
          style={[styles.btn, styles.translucent]}
          onPress={onPressBack}
          hitSlop={HITSLOP}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.btn, styles.translucent]}
          onPress={onPressSearch}
          hitSlop={HITSLOP}
        >
          <Ionicons name="search" size={22} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* DARK icons (black) — absolute, does not change layout */}
      <Animated.View
        style={[styles.absoluteRow, { paddingTop: top }, darkIconsStyle]}
        // let the light layer take touches when it's visible
        pointerEvents="none"
      >
        <View style={styles.btn}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.btn}>
          <Ionicons name="search" size={22} color="#111" />
        </View>
      </Animated.View>
    </View>
  );
}

const HITSLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const styles = StyleSheet.create({
  container: {
    zIndex: 20,
    width: "100%",
  },
  absoluteRow: {
    ...StyleSheet.absoluteFillObject,
    height: undefined, // let paddingTop + 56 set the vertical space
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  translucent: { backgroundColor: "rgba(0,0,0,0.25)" },
  whiteBg: { backgroundColor: "white" },
});
