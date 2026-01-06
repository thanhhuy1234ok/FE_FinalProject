import type { MenuItem } from "./menu";


export const findActiveKey = (items: MenuItem[] = [], path: string): string | undefined => {
  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    if ("key" in item && item.key === path) {
      return item.key as string;
    }

    if ("children" in item && Array.isArray(item.children)) {
      const found = findActiveKey(item.children as MenuItem[], path);
      if (found) return found;
    }
  }
  return undefined;
};
