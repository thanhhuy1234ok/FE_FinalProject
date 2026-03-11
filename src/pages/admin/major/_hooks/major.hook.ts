import { getDepartmentsAPI, getMajorsAPI } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

const useMajorHook = () => {
    const [dataMajor, setDataMajor] = useState<IMajor[]>([]);
    const [dataDepartment, setDataDepartment] = useState<IDepartment[]>([]);

    const fetchDataMajor = async () => {
        try {
            const response = await getMajorsAPI("current=1&pageSize=10");
            if (response?.data?.result) {
                setDataMajor(response.data.result);
            }
        } catch (error) {
            console.error("Error fetching data major:", error);
        }
    };

    const fetchDataDepartment = async () => {
        try {
            const response = await getDepartmentsAPI("current=1&pageSize=100");
            if (response?.data?.result) {
                setDataDepartment(response.data.result);
            }
        } catch (error) {
            console.error("Error fetching data department:", error);
        }
    };

    const departmentOptions = useMemo(
        () =>
            dataDepartment.map((item) => ({
                label: item.name,
                value: item.id,
            })),
        [dataDepartment],
    );

    useEffect(() => {
        fetchDataMajor();
        fetchDataDepartment();
    }, []);

    return {
        dataMajor,
        dataDepartment,
        departmentOptions,
        fetchDataMajor,
        fetchDataDepartment,
    };
};

export default useMajorHook;
