import { getFacultyAPI, getMajorsAPI, getYearsAPI } from "@/services/api";
import type { ActionType } from "@ant-design/pro-components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const departmentHook = () => {
    const tableRef = useRef<ActionType | null>(null);

    const [dataYears, setDataYears] = useState<IYear[]>([]);
    const [dataMajors, setDataMajors] = useState<IMajor[]>([]);
    const [reload, setReload] = useState(false);

    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingMajors, setLoadingMajors] = useState(false);
    const [dataFaculty, setDataFaculty] = useState<IFaculty[]>([]);
    const yearOption = useMemo(
        () =>
            (dataYears ?? []).map((item) => ({
                label: item.year,
                value: item.id,
            })),
        [dataYears],
    );

    const majorOptions = useMemo(
        () =>
            (dataMajors ?? []).map((item) => ({
                label: item.name,
                value: item.id,
            })),
        [dataMajors],
    );

    const facultyOptions = useMemo(
        () =>
            (dataFaculty ?? []).map((item) => ({
                label: item.name,
                value: item.id,
            })),
        [dataFaculty],
    );

    const reloadData = () => setReload((prev) => !prev);

    const fetchYears = useCallback(async () => {
        try {
            setLoadingYears(true);
            const res = await getYearsAPI("current=1&pageSize=100");
            setDataYears(res?.data?.result ?? []);
        } catch (error) {
            console.log("fetchYears error:", error);
            setDataYears([]);
        } finally {
            setLoadingYears(false);
        }
    }, []);

    const fetchMajors = useCallback(async () => {
        try {
            setLoadingMajors(true);
            const res = await getMajorsAPI("current=1&pageSize=100");
            setDataMajors(res?.data?.result ?? []);
        } catch (error) {
            console.log("fetchMajors error:", error);
            setDataMajors([]);
        } finally {
            setLoadingMajors(false);
        }
    }, []);

    const fetchFaculty = useCallback(async () => {
        try {
            const res = await getFacultyAPI("current=1&pageSize=100");
            setDataFaculty(res?.data?.result ?? []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDataFaculty([]);
        }
    }, []);

    useEffect(() => {
        void fetchYears();
        void fetchMajors();
        void fetchFaculty();
    }, [reload, fetchYears, fetchMajors]);

    return {
        tableRef,

        dataYears,
        dataMajors,

        yearOption,
        majorOptions,
        facultyOptions,

        loadingYears,
        loadingMajors,

        fetchYears,
        fetchMajors,

        reloadData,
    };
};

export default departmentHook;
