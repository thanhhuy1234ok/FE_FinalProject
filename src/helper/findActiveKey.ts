import type { MenuItem } from "./menu";

export const findActiveKey = (
    items: MenuItem[] = [],
    path: string,
): string | undefined => {
    let bestMatch: string | undefined;

    for (const item of items) {
        if (!item || typeof item !== "object") continue;

        const key = (item as any).key as string | undefined;
        if (key) {
            // ✅ exact match
            if (key === path) return key;

            // ✅ prefix match: "/manage-campus-room/campus" matches "/manage-campus-room/campus/1/buildings"
            if (path === key || path.startsWith(key + "/")) {
                // chọn key dài nhất (match cụ thể hơn)
                if (!bestMatch || key.length > bestMatch.length) {
                    bestMatch = key;
                }
            }
        }

        const children = (item as any).children as MenuItem[] | undefined;
        if (Array.isArray(children)) {
            const childMatch = findActiveKey(children, path);
            if (childMatch) {
                if (!bestMatch || childMatch.length > bestMatch.length) {
                    bestMatch = childMatch;
                }
            }
        }
    }

    return bestMatch;
};
