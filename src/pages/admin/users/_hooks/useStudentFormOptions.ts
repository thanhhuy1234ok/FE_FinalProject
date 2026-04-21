import { Form } from "antd";
import type { FormInstance } from "antd/es/form";
import { useCallback } from "react";

interface UseStudentFormOptionsProps {
    form: FormInstance;
    majorOptions: IOptionSelect[];
    classOptions: IOptionSelect[];
    yearOptions: IOptionSelect[];
}

const useStudentFormOptions = ({
    form,
    majorOptions,
    classOptions,
    yearOptions,
}: UseStudentFormOptionsProps) => {
    const selectedYear = Form.useWatch("YearOfStudy", form);
    const selectedMajor = Form.useWatch("major", form);

    const fetchYearOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const normalizedKeyword = keyword?.trim().toLowerCase();

            return yearOptions.filter((item: any) => {
                if (!normalizedKeyword) return true;

                return item.label
                    ?.toString()
                    .toLowerCase()
                    .includes(normalizedKeyword);
            });
        },
        [yearOptions],
    );

    const fetchMajorOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const normalizedKeyword = keyword?.trim().toLowerCase();

            return majorOptions.filter((item: any) => {
                if (!normalizedKeyword) return true;

                return (
                    item.label
                        ?.toString()
                        .toLowerCase()
                        .includes(normalizedKeyword) ||
                    item.code
                        ?.toString()
                        .toLowerCase()
                        .includes(normalizedKeyword)
                );
            });
        },
        [majorOptions],
    );

    const fetchClassOptions = useCallback(
        async (keyword: string): Promise<IOptionSelect[]> => {
            const yearId = selectedYear?.value;
            const majorId = selectedMajor?.value;

            if (!yearId || !majorId) return [];

            const normalizedKeyword = keyword?.trim().toLowerCase();

            return classOptions.filter((item: any) => {
                const matchMajor = Number(item.majorId) === Number(majorId);
                const matchYear =
                    Number(item.yearOfAdmissionId) === Number(yearId);

                const matchKeyword = normalizedKeyword
                    ? item.label
                          ?.toString()
                          .toLowerCase()
                          .includes(normalizedKeyword) ||
                      item.code
                          ?.toString()
                          .toLowerCase()
                          .includes(normalizedKeyword)
                    : true;

                return matchMajor && matchYear && matchKeyword;
            });
        },
        [classOptions, selectedMajor, selectedYear],
    );

    const handleYearChange = useCallback(() => {
        form.setFieldsValue({
            major: undefined,
            AdminClass: undefined,
        });
    }, [form]);

    const handleMajorChange = useCallback(() => {
        form.setFieldsValue({
            AdminClass: undefined,
        });
    }, [form]);

    return {
        selectedYear,
        selectedMajor,
        fetchYearOptions,
        fetchMajorOptions,
        fetchClassOptions,
        handleYearChange,
        handleMajorChange,
        isMajorDisabled: false,
        isClassDisabled: !selectedYear || !selectedMajor,
    };
};

export default useStudentFormOptions;
