import React from "react";
import { Image, Text, View } from "react-native";
import { Section, StickyCategoryTabs } from "./src/components";
import { SafeAreaProvider } from "react-native-safe-area-context";

type IPropsDish = { id: string; name: string; price: string; photo: string };

const sections: Section<IPropsDish>[] = [
  {
    id: "popular",
    title: "Popular",
    data: Array.from({ length: 6 }, (_, i) => ({
      id: `popular-${i}`,
      name: `Popular ${i + 1}`,
      price: `$${9 + i}`,
      photo: `https://picsum.photos/seed/p${i}/800/500`,
    })),
  },
  {
    id: "burgers",
    title: "Burgers",
    data: Array.from({ length: 8 }, (_, i) => ({
      id: `burger-${i}`,
      name: `Burger ${i + 1}`,
      price: `$${10 + i}`,
      photo: `https://picsum.photos/seed/b${i}/800/500`,
    })),
  },
  {
    id: "desserts",
    title: "Desserts",
    data: Array.from({ length: 7 }, (_, i) => ({
      id: `dessert-${i}`,
      name: `Dessert ${i + 1}`,
      price: `$${6 + i}`,
      photo: `https://picsum.photos/seed/d${i}/800/500`,
    })),
  },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <StickyCategoryTabs<IPropsDish>
        sections={sections}
        renderHeader={() => (
          <Image
            source={{ uri: "https://picsum.photos/seed/hero/1600/900" }}
            style={{ width: "100%", height: 240 }}
          />
        )}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <Image
              source={{ uri: item.photo }}
              style={{ width: "100%", height: 180, borderRadius: 8 }}
            />
            <Text style={{ marginTop: 8, fontSize: 16, fontWeight: "600" }}>
              {item.name}
            </Text>
            <Text style={{ marginTop: 4, color: "#666" }}>{item.price}</Text>
          </View>
        )}
        onPressBack={() => console.log("Back")}
        onPressSearch={() => console.log("Search")}
        navAppearThreshold={24} // show nav after ~24px scroll
      />
    </SafeAreaProvider>
  );
}
