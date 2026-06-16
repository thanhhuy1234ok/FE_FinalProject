import { useEffect, useMemo, useState } from "react";
import {
    BookOutlined,
    FileExcelOutlined,
    PlusOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
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

import ButtonComponents from "@/components/share/button";
import ImportExcelData from "@/components/share/data-import/import.data";
import CourseHook from "../_hooks/course.hook";
import ModalCourse from "./modal";
import ModalCourseCTDT from "./modal-couse-ctđt";

import {
    createBulkCurriculumSubjectNameAPI,
    getCurriculumSubjectAPI,
} from "@/services/api";

const { Text, Title } = Typography;

type ISemesterGroupedRow = ICurriculumSubject & {
    _semesterKey: string;
    _rowSpan: number;
};

const ListCourse = () => {
    const [openModal, setOpenModal] = useState(false);
    const [openModalImportV1, setOpenModalImportV1] = useState(false);
    const [openCurriculumModal, setOpenCurriculumModal] = useState(false);

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
        reloadData,
        majorOptions,
    } = CourseHook();

    const yearOptions = useMemo(
        () =>
            dataYearOfCourse.map((item) => ({
                label: `K${String(item.year).slice(-2)} - ${item.year}`,
                value: item.id,
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
            console.error(error);
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

    const handleOpenCreateCurriculumModal = (course: IYear) => {
        setDefaultYearOfAdmissionId(Number(course.id));
        setOpenCurriculumModal(true);
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
                    row.isRequired === "1" ||
                    String(row.isRequired).toLowerCase() === "bắt buộc",
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

        dataCurriculumSubjects.forEach((item) => {
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
            title: "Thứ tự",
            dataIndex: "ordering",
            width: 90,
            align: "center",
            render: (value: number | undefined) => value ?? 0,
        },
        {
            title: "Kỳ học",
            dataIndex: "_semesterKey",
            width: 140,
            fixed: "left",
            onCell: (record) => ({
                rowSpan: record._rowSpan,
            }),
            render: (_: unknown, record) => {
                const semesterNumber = Number(record.semesterNumber ?? 1);
                const year = Math.ceil(semesterNumber / 2);
                const semesterInYear = semesterNumber % 2 === 0 ? 2 : 1;

                return (
                    <Tag color="processing">
                        Năm {year} - HK{semesterInYear}
                    </Tag>
                );
            },
        },
        {
            title: "Môn học",
            dataIndex: ["subject", "name"],
            width: 280,
            fixed: "left",
            render: (value: string | undefined, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{value ?? "—"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.subject?.code ?? "Chưa có mã môn"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "TC",
            width: 70,
            align: "center",
            render: (_: unknown, record) => (
                <Tag color="blue">{record.subject?.credit ?? 0}</Tag>
            ),
        },
        {
            title: "Loại",
            width: 120,
            align: "center",
            render: (_: unknown, record) =>
                record.isRequired ? (
                    <Tag color="green">Bắt buộc</Tag>
                ) : (
                    <Tag>Tự chọn</Tag>
                ),
        },

        {
            title: "Điều kiện học",
            dataIndex: "prerequisiteRule",
            width: 220,
            render: (value: string | null | undefined) =>
                value ? <Text>{value}</Text> : <Text type="secondary">—</Text>,
        },
    ];

    const listItemYears: CollapseProps["items"] = useMemo(() => {
        return dataYearOfCourse.map((yearItem) => {
            const curriculumsOfYear = dataCurriculums.filter(
                (curriculum) =>
                    Number(curriculum.year_of_admission_id) ===
                    Number(yearItem.id),
            );

            const totalSubjects = curriculumsOfYear.reduce(
                (total, curriculum) =>
                    total +
                    (curriculumSubjectsMap.get(Number(curriculum.id))?.length ??
                        0),
                0,
            );

            return {
                key: String(yearItem.id),
                label: (
                    <Space size={12} wrap>
                        <BookOutlined />

                        <Text strong>
                            Khóa K{String(yearItem.year).slice(-2)} -{" "}
                            {yearItem.year}
                        </Text>

                        <Tag color="purple">
                            {curriculumsOfYear.length} CTĐT
                        </Tag>

                        <Tag color="blue">{totalSubjects} môn học</Tag>
                    </Space>
                ),
                children: (
                    <div style={{ display: "grid", gap: 16 }}>
                        <Card
                            size="small"
                            style={{
                                borderRadius: 14,
                                background:
                                    "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
                            }}
                        >
                            <Space
                                style={{
                                    width: "100%",
                                    justifyContent: "space-between",
                                }}
                                wrap
                            >
                                <Space direction="vertical" size={0}>
                                    <Text strong>
                                        Quản lý CTĐT khóa K
                                        {String(yearItem.year).slice(-2)}
                                    </Text>
                                    <Text type="secondary">
                                        Thêm chương trình đào tạo hoặc import
                                        môn học bằng Excel.
                                    </Text>
                                </Space>

                                <Space wrap>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() =>
                                            handleOpenCreateCurriculumModal(
                                                yearItem,
                                            )
                                        }
                                    >
                                        Thêm CTĐT
                                    </Button>

                                    <Button
                                        icon={<FileExcelOutlined />}
                                        onClick={() =>
                                            setOpenModalImportV1(true)
                                        }
                                    >
                                        Import Excel
                                    </Button>
                                </Space>
                            </Space>
                        </Card>

                        {curriculumsOfYear.length === 0 ? (
                            <Card>
                                <Empty description="Chưa có chương trình đào tạo" />
                            </Card>
                        ) : (
                            <Collapse
                                bordered={false}
                                expandIconPosition="end"
                                style={{ background: "transparent" }}
                                items={curriculumsOfYear.map((curriculum) => {
                                    const curriculumSubjects =
                                        curriculumSubjectsMap.get(
                                            Number(curriculum.id),
                                        ) ?? [];

                                    const tableData =
                                        buildSemesterRows(curriculumSubjects);

                                    return {
                                        key: String(curriculum.id),
                                        label: (
                                            <div
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    gap: 12,
                                                    paddingRight: 12,
                                                }}
                                            >
                                                <Space
                                                    direction="vertical"
                                                    size={4}
                                                >
                                                    <Text strong>
                                                        {curriculum.name ??
                                                            "Chưa có tên CTĐT"}
                                                    </Text>

                                                    <Space wrap size={6}>
                                                        {curriculum.code && (
                                                            <Tag color="geekblue">
                                                                {
                                                                    curriculum.code
                                                                }
                                                            </Tag>
                                                        )}

                                                        {curriculum.major
                                                            ?.name && (
                                                            <Tag color="purple">
                                                                {
                                                                    curriculum
                                                                        .major
                                                                        .name
                                                                }
                                                            </Tag>
                                                        )}

                                                        <Tag color="cyan">
                                                            {
                                                                curriculumSubjects.length
                                                            }{" "}
                                                            môn học
                                                        </Tag>
                                                    </Space>
                                                </Space>

                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 13 }}
                                                >
                                                    Nhấn để xem chi tiết
                                                </Text>
                                            </div>
                                        ),
                                        children: (
                                            <div>
                                                <Card
                                                    size="small"
                                                    style={{
                                                        marginBottom: 16,
                                                        borderRadius: 12,
                                                        background: "#fafafa",
                                                    }}
                                                >
                                                    <Space
                                                        style={{
                                                            width: "100%",
                                                            justifyContent:
                                                                "space-between",
                                                        }}
                                                        wrap
                                                    >
                                                        <Space
                                                            direction="vertical"
                                                            size={0}
                                                        >
                                                            <Text strong>
                                                                Danh sách môn
                                                                học
                                                            </Text>
                                                            <Text type="secondary">
                                                                Môn học được
                                                                chia theo năm
                                                                học và học kỳ.
                                                            </Text>
                                                        </Space>

                                                        <Tag color="blue">
                                                            {
                                                                curriculumSubjects.length
                                                            }{" "}
                                                            môn
                                                        </Tag>
                                                    </Space>
                                                </Card>

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
                                                        size="small"
                                                        loading={
                                                            loadingCurriculumSubjects
                                                        }
                                                        scroll={{ x: 1100 }}
                                                    />
                                                )}
                                            </div>
                                        ),
                                    };
                                })}
                            />
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
        <div style={{ padding: 24 }}>
            <Card
                style={{
                    borderRadius: 16,
                    marginBottom: 16,
                }}
            >
                <Space
                    style={{
                        width: "100%",
                        justifyContent: "space-between",
                    }}
                    align="start"
                    wrap
                >
                    <Space direction="vertical" size={2}>
                        <Title level={3} style={{ margin: 0 }}>
                            Chương trình đào tạo
                        </Title>

                        <Text type="secondary">
                            Quản lý năm học, chương trình đào tạo và danh sách
                            môn học theo từng học kỳ.
                        </Text>
                    </Space>

                    <Space wrap>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleReloadAll}
                            loading={loadingCurriculumSubjects}
                        >
                            Làm mới
                        </Button>

                        <ButtonComponents
                            title="Thêm năm học"
                            onClick={() => setOpenModal(true)}
                        />
                    </Space>
                </Space>
            </Card>

            {dataYearOfCourse.length === 0 ? (
                <Card>
                    <Empty description="Chưa có năm học" />
                </Card>
            ) : (
                <Collapse
                    defaultActiveKey={[dataYearOfCourse[0]?.id?.toString()]}
                    expandIconPosition="end"
                    accordion
                    items={listItemYears}
                    style={{
                        background: "transparent",
                    }}
                />
            )}

            <ModalCourse
                openModal={openModal}
                setOpenModal={setOpenModal}
                refreshTable={handleReloadAll}
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
                uploadTitle="Nhập môn học vào chương trình đào tạo"
                apiFunction={handleImportCurriculumSubjectByName}
            />

            <ModalCourseCTDT
                open={openCurriculumModal}
                onClose={() => setOpenCurriculumModal(false)}
                majorOptions={majorOptions}
                yearOptions={yearOptions}
                defaultYearOfAdmissionId={defaultYearOfAdmissionId}
                onCreated={handleReloadAll}
            />
        </div>
    );
};

export default ListCourse;
