// src/utils/sections.ts
export function findActiveSectionIndex(scrollY: number, sectionTops: number[], headerHeight: number, tabsHeight: number) {
  // "effective top" is what you can actually see below the tabs
  const effectiveTop = scrollY + tabsHeight;
  let idx = 0;
  for (let i = 0; i < sectionTops.length; i++) {
    if (sectionTops[i] <= effectiveTop) idx = i;
    else break;
  }
  return idx;
}
