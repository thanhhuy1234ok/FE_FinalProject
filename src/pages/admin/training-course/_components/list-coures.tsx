import { useEffect, useMemo, useState } from "react";
import ButtonComponents from "@/components/share/button";
import CourseHook from "../_hooks/course.hook";
import {
    Button,
    Card,
    Collapse,
    Empty,
    Space,
    Table,
    Tag,
    Typography,
    message,
    type CollapseProps,
    type TableColumnsType,
} from "antd";
import ModalCourse from "./modal";
import ImportExcelData from "@/components/share/data-import/import.data";
import {
    createBulkCurriculumSubjectAPI,
    createBulkCurriculumSubjectNameAPI,
    getCurriculumSubjectAPI,
} from "@/services/api";

const { Text } = Typography;

type ISemesterGroupedRow = ICurriculumSubject & {
    _semesterKey: string;
    _rowSpan: number;
};

const ListCourse = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openModalImport, setOpenModalImport] = useState(false);
    const [openModalImportV1, setOpenModalImportV1] = useState(false);

    // giữ lại cho modal sau này
    const [openTermModal, setOpenTermModal] = useState<boolean>(false);
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<
        number | null
    >(null);

    const [openCurriculumModal, setOpenCurriculumModal] =
        useState<boolean>(false);
    const [defaultYearOfAdmissionId, setDefaultYearOfAdmissionId] = useState<
        number | null
    >(null);

    const [loadingCurriculumSubjects, setLoadingCurriculumSubjects] =
        useState(false);
    const [dataCurriculumSubjects, setDataCurriculumSubjects] = useState<
        ICurriculumSubject[]
    >([]);

    const {
        dataYearOfCourse = [],
        dataCurriculums = [],
        curriculumOptions,
        subjectOptions,
        reloadData,
        majorOptions,
    } = CourseHook();

    const yearOptions = useMemo(
        () =>
            (dataYearOfCourse ?? []).map((y) => ({
                label: `K${String(y.year).slice(-2)} - ${y.year}`,
                value: y.id,
            })),
        [dataYearOfCourse],
    );

    const fetchCurriculumSubjects = async () => {
        try {
            setLoadingCurriculumSubjects(true);
            const res = await getCurriculumSubjectAPI(
                "current=1&pageSize=1000",
            );
            setDataCurriculumSubjects(res?.data?.result ?? []);
        } catch (error) {
            console.error("Error fetching curriculum subjects:", error);
            message.error("Không tải được danh sách môn học trong CTĐT");
            setDataCurriculumSubjects([]);
        } finally {
            setLoadingCurriculumSubjects(false);
        }
    };

    useEffect(() => {
        fetchCurriculumSubjects();
    }, []);

    const handleReloadAll = async () => {
        await reloadData();
        await fetchCurriculumSubjects();
    };

    const handleOpenTermModal = (curriculumId: number) => {
        setSelectedCurriculumId(curriculumId);
        setOpenTermModal(true);
    };

    const handleOpenCreateCurriculumModal = (course: IYear) => {
        setDefaultYearOfAdmissionId(Number(course.id));
        setOpenCurriculumModal(true);
    };

    const handleImportCurriculumSubject = async (rows: ICurSubExcel[]) => {
        const payload: ImportCurriculumSubjectPayload = {
            items: rows.map((row) => ({
                curriculumId: Number(row.curriculumId),
                subjectId: Number(row.subjectId),
                semesterNumber: Number(row.semesterNumber),
                isRequired:
                    row.isRequired === true ||
                    row.isRequired === "true" ||
                    row.isRequired === 1 ||
                    row.isRequired === "1",
                ordering:
                    row.ordering !== null && row.ordering !== undefined
                        ? Number(row.ordering)
                        : 0,
                prerequisiteRule: row.prerequisiteRule ?? null,
            })),
        };

        return createBulkCurriculumSubjectAPI(payload);
    };

    const handleImportCurriculumSubjectByName = async (
        rows: ICurSubExcelByName[],
    ) => {
        const payload: ImportCurriculumSubjectByNamePayload = {
            items: rows.map((row) => ({
                curriculumName: String(row.curriculumName ?? "").trim(),
                subjectName: String(row.subjectName ?? "").trim(),
                semesterNumber: Number(row.semesterNumber),
                isRequired:
                    row.isRequired === true ||
                    row.isRequired === "true" ||
                    row.isRequired === 1 ||
                    row.isRequired === "1",
                ordering:
                    row.ordering !== null &&
                    row.ordering !== undefined &&
                    row.ordering !== ""
                        ? Number(row.ordering)
                        : 0,
                prerequisiteRule: row.prerequisiteRule
                    ? String(row.prerequisiteRule).trim()
                    : null,
            })),
        };

        return createBulkCurriculumSubjectNameAPI(payload);
    };

    const curriculumSubjectsMap = useMemo(() => {
        const map = new Map<number, ICurriculumSubject[]>();

        (dataCurriculumSubjects ?? []).forEach((item) => {
            const key = Number(item.curriculumId);

            if (!map.has(key)) {
                map.set(key, []);
            }

            map.get(key)?.push(item);
        });

        return map;
    }, [dataCurriculumSubjects]);

    const buildSemesterRows = (
        curriculumSubjects: ICurriculumSubject[] = [],
    ): ISemesterGroupedRow[] => {
        const sorted = [...curriculumSubjects].sort((a, b) => {
            if ((a.semesterNumber ?? 1) !== (b.semesterNumber ?? 1)) {
                return (a.semesterNumber ?? 1) - (b.semesterNumber ?? 1);
            }
            return (a.ordering ?? 0) - (b.ordering ?? 0);
        });

        const groupedMap = new Map<string, ICurriculumSubject[]>();

        sorted.forEach((item) => {
            const semesterNumber = Number(item.semesterNumber ?? 1);
            const year = Math.ceil(semesterNumber / 2);
            const semesterInYear = semesterNumber % 2 === 0 ? 2 : 1;
            const key = `${year}-${semesterInYear}`;

            if (!groupedMap.has(key)) {
                groupedMap.set(key, []);
            }

            groupedMap.get(key)?.push(item);
        });

        const result: ISemesterGroupedRow[] = [];

        groupedMap.forEach((items, key) => {
            items.forEach((item, index) => {
                result.push({
                    ...item,
                    _semesterKey: key,
                    _rowSpan: index === 0 ? items.length : 0,
                });
            });
        });

        return result;
    };

    const columns: TableColumnsType<ISemesterGroupedRow> = [
        {
            title: "Kỳ học",
            dataIndex: "_semesterKey",
            width: 150,
            onCell: (record) => ({
                rowSpan: record._rowSpan,
            }),
            render: (_: unknown, record) => {
                const semesterNumber = Number(record.semesterNumber ?? 1);
                const year = Math.ceil(semesterNumber / 2);
                const semesterInYear = semesterNumber % 2 === 0 ? 2 : 1;

                return `Năm ${year} - HK${semesterInYear}`;
            },
        },
        {
            title: "Tên môn học",
            dataIndex: ["subject", "name"],
            width: 260,
            render: (value: string | undefined) => value ?? "—",
        },
        {
            title: "Mã môn",
            dataIndex: ["subject", "code"],
            width: 120,
            render: (value: string | undefined) => value ?? "—",
        },
        {
            title: "TC",
            width: 80,
            align: "center",
            render: (_: unknown, record) => record.subject?.credit,
        },
        {
            title: "Loại",
            width: 120,
            align: "center",
            render: (_: unknown, record) =>
                record.isRequired ? (
                    <Tag color="blue">Bắt buộc</Tag>
                ) : (
                    <Tag>Tự chọn</Tag>
                ),
        },
        {
            title: "Nhóm",
            dataIndex: "groupCode",
            width: 120,
            render: (value: string | null | undefined) => value ?? "—",
        },
        {
            title: "Thứ tự",
            dataIndex: "ordering",
            width: 90,
            align: "center",
            render: (value: number | undefined) => value ?? 0,
        },
        {
            title: "Điều kiện học",
            dataIndex: "prerequisiteRule",
            width: 180,
            render: (value: string | null | undefined) => value ?? "—",
        },
    ];

    const listItemYears: CollapseProps["items"] = useMemo(() => {
        return (dataYearOfCourse ?? []).map((yearItem) => {
            const curriculumsOfYear = (dataCurriculums ?? []).filter(
                (curriculum) =>
                    Number(curriculum.year_of_admission_id) ===
                    Number(yearItem.id),
            );

            return {
                key: String(yearItem.id),
                label: (
                    <Space>
                        <Text strong>
                            Khóa K{String(yearItem.year).slice(-2)} -{" "}
                            {yearItem.year}
                        </Text>
                        <Tag color="processing">
                            {curriculumsOfYear.length} CTĐT
                        </Tag>
                    </Space>
                ),
                children: (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <Space wrap>
                            <ButtonComponents
                                title="Thêm CTĐT"
                                onClick={() =>
                                    handleOpenCreateCurriculumModal(yearItem)
                                }
                            />

                            <Button onClick={() => setOpenModalImport(true)}>
                                Import theo ID
                            </Button>

                            <Button onClick={() => setOpenModalImportV1(true)}>
                                Import theo tên
                            </Button>
                        </Space>

                        {curriculumsOfYear.length === 0 ? (
                            <Empty description="Chưa có chương trình đào tạo" />
                        ) : (
                            curriculumsOfYear.map((curriculum) => {
                                const curriculumSubjects =
                                    curriculumSubjectsMap.get(
                                        Number(curriculum.id),
                                    ) ?? [];

                                const tableData =
                                    buildSemesterRows(curriculumSubjects);

                                return (
                                    <Card
                                        key={curriculum.id}
                                        title={
                                            <Space
                                                direction="vertical"
                                                size={0}
                                            >
                                                <Text strong>
                                                    {curriculum.name ??
                                                        "Chưa có tên CTĐT"}
                                                </Text>

                                                <Space wrap size={6}>
                                                    {curriculum.code && (
                                                        <Tag>
                                                            {curriculum.code}
                                                        </Tag>
                                                    )}

                                                    {curriculum.major?.name && (
                                                        <Tag color="purple">
                                                            {
                                                                curriculum.major
                                                                    .name
                                                            }
                                                        </Tag>
                                                    )}
                                                </Space>
                                            </Space>
                                        }
                                        extra={
                                            <Button
                                                type="primary"
                                                onClick={() =>
                                                    handleOpenTermModal(
                                                        Number(curriculum.id),
                                                    )
                                                }
                                            >
                                                Thêm môn học
                                            </Button>
                                        }
                                        styles={{
                                            body: {
                                                paddingTop: 12,
                                            },
                                        }}
                                    >
                                        {tableData.length === 0 ? (
                                            <Empty description="CTĐT chưa có môn học" />
                                        ) : (
                                            <Table<ISemesterGroupedRow>
                                                rowKey={(record) =>
                                                    String(record.id)
                                                }
                                                columns={columns}
                                                dataSource={tableData}
                                                pagination={false}
                                                bordered
                                                size="middle"
                                                loading={
                                                    loadingCurriculumSubjects
                                                }
                                                scroll={{ x: 1100 }}
                                            />
                                        )}
                                    </Card>
                                );
                            })
                        )}
                    </div>
                ),
            };
        });
    }, [
        dataYearOfCourse,
        dataCurriculums,
        curriculumSubjectsMap,
        loadingCurriculumSubjects,
    ]);

    return (
        <div>
            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
                wrap
            >
                <h1 style={{ margin: 0 }}>
                    Danh sách năm học / chương trình đào tạo
                </h1>

                <ButtonComponents
                    title="Thêm năm học"
                    onClick={() => setOpenModal(true)}
                />
            </Space>

            {(dataYearOfCourse ?? []).length === 0 ? (
                <Empty description="Chưa có năm học" />
            ) : (
                <Collapse
                    defaultActiveKey={[dataYearOfCourse[0]?.id?.toString()]}
                    expandIconPosition="end"
                    accordion
                    items={listItemYears}
                />
            )}

            <ModalCourse
                openModal={openModal}
                setOpenModal={setOpenModal}
                refreshTable={handleReloadAll}
            />

            <ImportExcelData<ICurSubExcel>
                setOpenModalImport={setOpenModalImport}
                openModalImport={openModalImport}
                fetchData={handleReloadAll}
                headers={[
                    "Chương trình đào tạo ID",
                    "Môn học ID",
                    "Học kỳ",
                    "Bắt buộc",
                    "Thứ tự",
                    "Điều kiện học",
                ]}
                dataMapping={[
                    "curriculumId",
                    "subjectId",
                    "semesterNumber",
                    "isRequired",
                    "ordering",
                    "prerequisiteRule",
                ]}
                templateFileUrl=""
                uploadTitle="Nhập dữ liệu chương trình đào tạo"
                apiFunction={handleImportCurriculumSubject}
            />

            <ImportExcelData<ICurSubExcelByName>
                setOpenModalImport={setOpenModalImportV1}
                openModalImport={openModalImportV1}
                fetchData={handleReloadAll}
                headers={[
                    "Tên chương trình đào tạo",
                    "Tên môn học",
                    "Học kỳ",
                    "Bắt buộc",
                    "Thứ tự",
                    "Điều kiện học",
                ]}
                dataMapping={[
                    "curriculumName",
                    "subjectName",
                    "semesterNumber",
                    "isRequired",
                    "ordering",
                    "prerequisiteRule",
                ]}
                templateFileUrl=""
                uploadTitle="Nhập dữ liệu chương trình đào tạo"
                apiFunction={handleImportCurriculumSubjectByName}
            />

            {/*
            <ModalBulkCurriculumTerms
                open={openTermModal}
                onClose={() => setOpenTermModal(false)}
                curriculumOptions={curriculumOptions}
                curriculumId={selectedCurriculumId}
                subjectOptions={subjectOptions}
                onSubmit={async (payload) => {
                    await createBulkCurriculumSubjectAPI(payload);
                }}
                reloadTable={handleReloadAll}
            />
            */}

            {/*
            <ModalCourseCTDT
                open={openCurriculumModal}
                onClose={() => setOpenCurriculumModal(false)}
                majorOptions={majorOptions}
                yearOptions={yearOptions}
                defaultYearOfAdmissionId={defaultYearOfAdmissionId}
                onCreated={handleReloadAll}
            />
            */}
        </div>
    );
};

export default ListCourse;
