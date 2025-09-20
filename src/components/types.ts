import type { ReactElement } from "react";
import { SharedValue } from "react-native-reanimated";

export type Section<T> = {
  id: string;
  title: string;
  data: T[];
};

export type StickyCategoryTabsProps<T> = {
  sections: Array<Section<T>>;
  renderHeader?: () => ReactElement | null;
  renderItem: (info: { item: T; sectionId: string }) => ReactElement;
  renderSectionHeader?: (section: Section<T>) => ReactElement;
  initialActiveIndex?: number;
  tabHeight?: number; // expected tabs row height until measured (default 48)
  onPressBack?: () => void;
  onPressSearch?: () => void;
  navAppearThreshold?: number; // px to scroll before nav turns solid (default 24)
};

export type TopNavHeaderProps = {
  progress: SharedValue<number>;
  onPressBack?: () => void;
  onPressSearch?: () => void;
};

export type FlatRowProps<T> =
  | { type: "HEADER"; key: string }
  | { type: "TABS"; key: string }
  | { type: "SECTION_HEADER"; key: string; sectionIndex: number }
  | {
      type: "ITEM";
      key: string;
      sectionIndex: number;
      itemIndex: number;
      item: any;
    };
