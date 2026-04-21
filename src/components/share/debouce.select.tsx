import React, {
    useMemo,
    useRef,
    useState,
    useEffect,
    useCallback,
} from "react";
import { Empty, Select, Spin } from "antd";
import type { SelectProps } from "antd/es/select";
import debounce from "lodash/debounce";

type OptionValue = string | number;

export type DebounceOption = {
    label: React.ReactNode;
    value: OptionValue;
    key?: React.Key;
};

export interface DebounceSelectProps<
    OptionType extends DebounceOption = DebounceOption,
> extends Omit<
    SelectProps<OptionType | OptionType[]>,
    "options" | "children" | "onChange"
> {
    fetchOptions: (search: string) => Promise<OptionType[]>;
    debounceTimeout?: number;
    selectAll?: boolean;
    selectAllLabel?: React.ReactNode;
    onChange?: SelectProps<OptionType | OptionType[]>["onChange"];
}

const SELECT_ALL_VALUE = "__ALL__";

export function DebounceSelect<
    OptionType extends DebounceOption = DebounceOption,
>({
    fetchOptions,
    debounceTimeout = 800,
    selectAll = false,
    selectAllLabel = "Chọn tất cả",
    mode,
    value,
    onChange,
    ...props
}: DebounceSelectProps<OptionType>) {
    const [fetching, setFetching] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [options, setOptions] = useState<OptionType[]>([]);
    const fetchRef = useRef(0);

    const loadOptions = useCallback(
        async (search: string) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;

            setFetching(true);
            try {
                const newOptions = await fetchOptions(search);
                if (fetchId !== fetchRef.current) return;
                setOptions(newOptions);
            } finally {
                if (fetchId === fetchRef.current) {
                    setFetching(false);
                    setHasFetched(true);
                }
            }
        },
        [fetchOptions],
    );

    const debounceFetcher = useMemo(
        () => debounce(loadOptions, debounceTimeout),
        [loadOptions, debounceTimeout],
    );

    useEffect(() => {
        return () => {
            debounceFetcher.cancel();
        };
    }, [debounceFetcher]);

    const handleOnFocus = () => {
        if (options.length > 0) return;
        loadOptions("");
    };

    const handleOnBlur = () => {
        setOptions([]);
    };

    const mergedOptions = useMemo(() => {
        if (mode === "multiple" && selectAll && options.length > 0) {
            return [
                {
                    label: selectAllLabel,
                    value: SELECT_ALL_VALUE,
                    key: SELECT_ALL_VALUE,
                } as OptionType,
                ...options,
            ];
        }
        return options;
    }, [options, mode, selectAll, selectAllLabel]);

    const handleChange: SelectProps<OptionType | OptionType[]>["onChange"] = (
        newValue,
        optionList,
    ) => {
        if (mode !== "multiple") {
            onChange?.(newValue, optionList);
            return;
        }

        const values = (newValue as DebounceOption[]) || [];
        const hasSelectAll = values.some(
            (item) => item?.value === SELECT_ALL_VALUE,
        );

        const currentSelected = (value as DebounceOption[]) || [];
        const hadSelectAll = currentSelected.some(
            (item) => item?.value === SELECT_ALL_VALUE,
        );

        if (hasSelectAll) {
            // Nếu đang click "Tất cả"
            // và trước đó đã có hết rồi => bỏ hết
            const realSelectedCount = values.filter(
                (item) => item?.value !== SELECT_ALL_VALUE,
            ).length;

            const allRealOptions = options as DebounceOption[];

            const isAllAlreadySelected =
                allRealOptions.length > 0 &&
                currentSelected.filter(
                    (item) => item?.value !== SELECT_ALL_VALUE,
                ).length === allRealOptions.length;

            if (hadSelectAll || isAllAlreadySelected) {
                onChange?.([] as any, [] as any);
                return;
            }

            onChange?.(allRealOptions as any, allRealOptions as any);
            return;
        }

        // nếu chọn tay đủ tất cả option thì tự động giữ toàn bộ option thật
        const uniqueRealValues = values.filter(
            (item) => item?.value !== SELECT_ALL_VALUE,
        );

        onChange?.(uniqueRealValues as any, optionList);
    };

    return (
        <Select
            {...props}
            mode={mode}
            value={value}
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={
                fetching ? <Spin size="small" /> : hasFetched ? <Empty /> : null
            }
            options={mergedOptions}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            onChange={handleChange}
            style={{ width: "100%", cursor: "pointer", ...props.style }}
        />
    );
}
