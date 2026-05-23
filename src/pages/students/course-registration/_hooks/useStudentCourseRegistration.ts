import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import {
    cancelCourseRegistrationAPI,
    getAvailableCourseOfferingsForStudentAPI,
    getMyCourseRegistrationsAPI,
    registerCourseAPI,
} from "@/services/api";
import type { AvailableItem } from "../_components/tab/registation";
import type { RegisteredItem } from "../_components/tab/registeredCourse";
import { useNavigate } from "react-router-dom";

const getTermLabel = (term?: { semester?: string; year?: number }) => {
    if (!term) return "—";

    return (
        `${term?.semester ?? ""}${
            term?.year ? ` - ${term.year}` : ""
        }`.trim() || "—"
    );
};

const normalizeArray = (res: any) => {
    const arr =
        res?.data?.data ?? res?.data?.result ?? res?.result ?? res?.data ?? [];

    return Array.isArray(arr) ? arr : [];
};

export const useStudentCourseRegistration = () => {
    const [availableData, setAvailableData] = useState<AvailableItem[]>([]);
    const [registeredData, setRegisteredData] = useState<RegisteredItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [keyword, setKeyword] = useState("");
    const [selectedRegisteredTerm, setSelectedRegisteredTerm] =
        useState<string>("all");

    const navigate = useNavigate();

    const getErrorMessage = (error: any, fallback: string) => {
        const msg =
            error?.response?.data?.message ||
            error?.data?.message ||
            error?.message;

        if (Array.isArray(msg)) return msg.join(", ");
        return msg || fallback;
    };

    const fetchData = async (searchValue?: string) => {
        try {
            setLoading(true);

            const query = new URLSearchParams({
                current: "1",
                pageSize: "100",
                ...(searchValue?.trim() ? { keyword: searchValue.trim() } : {}),
            }).toString();

            const [availableRes, registeredRes] = await Promise.all([
                getAvailableCourseOfferingsForStudentAPI(query),
                getMyCourseRegistrationsAPI("current=1&pageSize=100"),
            ]);

            const safeAvailableList = normalizeArray(availableRes);
            const safeRegisteredList = normalizeArray(registeredRes);

            const registeredSubjectIds = new Set<number>(
                safeRegisteredList
                    .map(
                        (item: RegisteredItem) =>
                            item?.courseOffering?.teacherSubject?.subject?.id,
                    )
                    .filter((id: number | undefined): id is number => !!id),
            );

            const normalizedAvailableData: AvailableItem[] =
                safeAvailableList.map((item: AvailableItem) => {
                    const subjectId = item?.subject?.id;
                    const isRegistered = !!item?.isRegistered;

                    const isSameSubjectRegistered =
                        !isRegistered &&
                        !!subjectId &&
                        registeredSubjectIds.has(subjectId);

                    const isFull = !!item?.isFull;

                    return {
                        ...item,

                        // chỉ đúng lớp đã đăng ký
                        isRegistered,

                        // lớp khác nhưng cùng môn đã đăng ký
                        isSameSubjectRegistered,

                        canRegister:
                            item?.canRegister ??
                            (!isRegistered &&
                                !isSameSubjectRegistered &&
                                !isFull),
                    };
                });

            setAvailableData(normalizedAvailableData);
            setRegisteredData(safeRegisteredList);
        } catch (error: any) {
            message.error(getErrorMessage(error, "Không tải được dữ liệu"));
            setAvailableData([]);
            setRegisteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const selectedCourses = useMemo(() => {
        const keySet = new Set(selectedRowKeys.map(Number));
        return availableData.filter((item) => keySet.has(item.id));
    }, [availableData, selectedRowKeys]);

    const selectedSubjectIds = useMemo(() => {
        return new Set(
            selectedCourses
                .map((item) => item?.subject?.id)
                .filter((id): id is number => !!id),
        );
    }, [selectedCourses]);

    const registeredTermOptions = useMemo(() => {
        const map = new Map<string, string>();

        registeredData.forEach((item) => {
            const term = item?.courseOffering?.term;
            const termId = term?.id;

            if (!termId) return;

            map.set(String(termId), getTermLabel(term));
        });

        return [
            { label: "Tất cả", value: "all" },
            ...Array.from(map.entries()).map(([value, label]) => ({
                label,
                value,
            })),
        ];
    }, [registeredData]);

    const filteredRegisteredData = useMemo(() => {
        if (selectedRegisteredTerm === "all") return registeredData;

        return registeredData.filter(
            (item) =>
                String(item?.courseOffering?.term?.id ?? "") ===
                selectedRegisteredTerm,
        );
    }, [registeredData, selectedRegisteredTerm]);

    useEffect(() => {
        const validIds = new Set(
            availableData
                .filter(
                    (item) =>
                        !item?.isRegistered &&
                        !item?.isFull &&
                        item?.canRegister !== false &&
                        (item?.remainingSlots ?? 0) > 0,
                )
                .map((item) => item.id),
        );

        setSelectedRowKeys((prev) =>
            prev.filter((key) => validIds.has(Number(key))),
        );
    }, [availableData]);

    useEffect(() => {
        const hasSelectedTerm = registeredTermOptions.some(
            (item) => item.value === selectedRegisteredTerm,
        );

        if (!hasSelectedTerm) {
            setSelectedRegisteredTerm("all");
        }
    }, [registeredTermOptions, selectedRegisteredTerm]);

    const handleSearch = async () => {
        await fetchData(keyword);
    };

    const handleClearSearch = async () => {
        setKeyword("");
        await fetchData("");
    };

    const handleRegisterSelected = async () => {
        if (!selectedRowKeys.length) {
            message.warning("Vui lòng chọn ít nhất 1 môn học");
            return;
        }

        try {
            setSubmitting(true);

            const ids = selectedRowKeys.map(Number);
            const res = await registerCourseAPI(ids);

            const registrations =
                res?.data?.registrations ??
                res?.data?.data?.registrations ??
                res?.data?.data ??
                [];

            message.success(
                `Đăng ký thành công ${
                    Array.isArray(registrations)
                        ? registrations.length
                        : ids.length
                } môn học`,
            );

            setSelectedRowKeys([]);
            await fetchData(keyword);
        } catch (error: any) {
            message.error(getErrorMessage(error, "Đăng ký thất bại"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id: number) => {
        try {
            setSubmitting(true);
            await cancelCourseRegistrationAPI(id);
            message.success("Hủy đăng ký thành công");
            await fetchData(keyword);
        } catch (error: any) {
            message.error(getErrorMessage(error, "Hủy đăng ký thất bại"));
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayOne = async (record: RegisteredItem) => {
        message.success(
            `Đã tạo thanh toán cho ${
                record?.courseOffering?.teacherSubject?.subject?.name ??
                "môn học"
            }`,
        );
    };

    const handlePayAll = async () => {
        if (!filteredRegisteredData.length) {
            message.warning("Không có môn học nào để thanh toán");
            return;
        }

        message.success(
            `Đã tạo thanh toán cho ${filteredRegisteredData.length} môn học`,
        );

        navigate("/payment", {
            state: {
                courses: filteredRegisteredData,
            },
        });
    };

    return {
        availableData,
        registeredData,
        loading,
        submitting,
        selectedRowKeys,
        keyword,
        selectedRegisteredTerm,
        selectedCourses,
        selectedSubjectIds,
        registeredTermOptions,
        filteredRegisteredData,
        setKeyword,
        setSelectedRowKeys,
        setSelectedRegisteredTerm,
        handleSearch,
        handleClearSearch,
        handleRegisterSelected,
        handleCancel,
        handlePayOne,
        handlePayAll,
    };
};
