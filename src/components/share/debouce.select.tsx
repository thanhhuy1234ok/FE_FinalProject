import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';

type OptionValue = string | number;

export type DebounceOption = {
    label: React.ReactNode;
    value: OptionValue;
    key?: React.Key;
};

export interface DebounceSelectProps<
    OptionType extends DebounceOption = DebounceOption,
> extends Omit<SelectProps<OptionType | OptionType[]>, 'options' | 'children'> {
    fetchOptions: (search: string) => Promise<OptionType[]>;
    debounceTimeout?: number;
}

export function DebounceSelect<
    OptionType extends DebounceOption = DebounceOption,
>({
    fetchOptions,
    debounceTimeout = 800,
    ...props
}: DebounceSelectProps<OptionType>) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<OptionType[]>([]);
    const fetchRef = useRef(0);

    const loadOptions = useCallback(
        async (search: string) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;

            setFetching(true);
            try {
                const newOptions = await fetchOptions(search);
                if (fetchId !== fetchRef.current) return; // ignore out-of-order responses
                setOptions(newOptions);
            } finally {
                if (fetchId === fetchRef.current) setFetching(false);
            }
        },
        [fetchOptions],
    );

    const debounceFetcher = useMemo(() => debounce(loadOptions, debounceTimeout), [
        loadOptions,
        debounceTimeout,
    ]);

    useEffect(() => {
        return () => {
            debounceFetcher.cancel(); // cleanup on unmount
        };
    }, [debounceFetcher]);

    const handleOnFocus = () => {
        // init data when focus if empty
        if (options.length > 0) return;
        loadOptions('');
    };

    const handleOnBlur = () => {
        setOptions([]);
    };

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            options={options}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            style={{ cursor: 'pointer' }}
            {...props}
        />
    );
}
