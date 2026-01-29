import queryString from "query-string";

export type SortOrder = "ascend" | "descend" | null | undefined;
export type ProSort = Record<string, SortOrder>;
export type ProFilter = Record<string, (string | number)[] | null | undefined>;
export type QueryParams = Record<string, unknown> | undefined | null;

type BuildQueryOptions = {
    /** Các field cần trim (search fields) */
    searchFields?: readonly string[];

    /** Thứ tự ưu tiên sort */
    sortPriority?: readonly string[];

    /** Default sort */
    defaultSort?: string; // vd: "id" hoặc "-id"

    /** Key sort backend */
    sortKey?: string;

    /** Hook normalize custom */
    normalize?: (key: string, value: unknown) => unknown;

    /** Cách serialize filter */
    filterSerializer?: (filter: ProFilter) => Record<string, unknown>;

    /** options stringify */
    qsOptions?: queryString.StringifyOptions;
};

const defaultQsOptions: queryString.StringifyOptions = {
    skipEmptyString: true,
    skipNull: true,
};

const trimOrUndef = (v: unknown) => {
    if (v == null) return undefined;
    const s = String(v).trim();
    return s.length ? s : undefined;
};

const defaultFilterSerializer = (
    filter: ProFilter,
): Record<string, unknown> => {
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(filter ?? {})) {
        if (!val?.length) continue;
        out[key] = val.map(String).join(",");
    }
    return out;
};
const buildSortParam = (
    sort: ProSort | undefined,
    {
        sortPriority = ["name", "createdAt", "updatedAt"], // ✅ default priority
        defaultSort = "id",
        sortKey = "sort",
    }: Pick<BuildQueryOptions, "sortPriority" | "defaultSort" | "sortKey">,
): Record<string, string> => {
    // 1) ưu tiên theo sortPriority nếu có
    for (const field of sortPriority) {
        const order = sort?.[field];
        if (order === "ascend") return { [sortKey]: field };
        if (order === "descend") return { [sortKey]: `-${field}` };
    }

    // 2) nếu field user sort không nằm trong priority (hoặc priority rỗng) => lấy field đầu tiên từ sort
    if (sort) {
        for (const [field, order] of Object.entries(sort)) {
            if (order === "ascend") return { [sortKey]: field };
            if (order === "descend") return { [sortKey]: `-${field}` };
        }
    }

    // 3) fallback
    return { [sortKey]: defaultSort };
};

export const buildQuery = (
    params?: QueryParams,
    sort?: ProSort,
    filter?: ProFilter,
    options: BuildQueryOptions = {},
) => {
    const {
        searchFields = [],
        sortPriority = [],
        defaultSort = "createdAt",
        sortKey = "sort",
        normalize,
        filterSerializer = defaultFilterSerializer,
        qsOptions = defaultQsOptions,
    } = options;

    // 1) clone params
    const clone: Record<string, unknown> = { ...(params ?? {}) };

    // 2) trim các search field động
    for (const f of searchFields) {
        if (f in clone) clone[f] = trimOrUndef(clone[f]);
    }

    // 3) custom normalize
    if (normalize) {
        for (const key of Object.keys(clone)) {
            clone[key] = normalize(key, clone[key]);
        }
    }

    // 4) base params
    const baseStr = queryString.stringify(clone, qsOptions);

    // 5) sort
    const sortObj = buildSortParam(sort, {
        sortPriority,
        defaultSort,
        sortKey,
    });
    const sortStr = queryString.stringify(sortObj, qsOptions);

    // 6) filter
    const filterObj = filterSerializer(filter ?? {});
    const filterStr = queryString.stringify(filterObj, qsOptions);

    // 7) merge
    return [baseStr, sortStr, filterStr].filter(Boolean).join("&");
};
