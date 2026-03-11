import {
    getCurriculumsAPI,
    getMajorsAPI,
    getSubjectsAPI,
    getYearsAPI,
} from "@/services/api";
import { useEffect, useMemo, useState } from "react";

const CourseHook = () => {
    const [dataYearOfCourse, setDataYearOfCourse] = useState<IYear[]>([]);
    const [dataCurriculums, setDataCurriculums] = useState<ICurriculum[]>([]);
    const [dataSubjects, setDataSubjects] = useState<ISubject[]>([]);
    const [dataMajors, setDataMajors] = useState<IMajor[]>([]);
    const [reload, setReload] = useState(false);

    const curriculumOptions = useMemo(
        () =>
            (dataCurriculums ?? []).map((c) => ({
                label: c.name,
                value: c.id,
            })),
        [dataCurriculums],
    );

    const subjectOptions = useMemo(
        () => (dataSubjects ?? []).map((s) => ({ label: s.name, value: s.id })),
        [dataSubjects],
    );

    const majorOptions = useMemo(
        () => (dataMajors ?? []).map((m) => ({ label: m.name, value: m.id })),
        [dataMajors],
    );

    const reloadData = () => setReload((prev: any) => !prev); // ✅ toggle để chạy lại useEffect

    useEffect(() => {
        const YearCouresList = async () => {
            const res = await getYearsAPI("current=1&pageSize=100");
            if (res?.data?.result) setDataYearOfCourse(res.data.result);
        };

        const CurriculumsList = async () => {
            const res = await getCurriculumsAPI("current=1&pageSize=100");
            if (res?.data) setDataCurriculums(res.data.result);
        };

        const SubjectsList = async () => {
            const res = await getSubjectsAPI("current=1&pageSize=100");
            if (res?.data?.result) setDataSubjects(res.data.result);
        };

        const MajorsList = async () => {
            const res = await getMajorsAPI("current=1&pageSize=100");
            if (res?.data?.result) setDataMajors(res.data.result);
        };

        void YearCouresList();
        void CurriculumsList();
        void SubjectsList();
        void MajorsList();
    }, [reload]);

    return {
        dataYearOfCourse,
        dataCurriculums,
        curriculumOptions,
        subjectOptions,
        reloadData, // ✅ dùng cái này thay tableRef.reload
        majorOptions,
    };
};

export default CourseHook;
