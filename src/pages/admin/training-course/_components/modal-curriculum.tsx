import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Divider,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Typography,
    message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
    curriculumId: number | null;
    curriculumOptions: IOptionSelect[];
    subjectOptions: IOptionSelect[];
    onSubmit?: (payload: CurriculumTermPayload) => Promise<void> | void;
    lockCurriculumSelect?: boolean;
    reloadTable?: () => void; // ProTable actionRef reload
}

const prerequisiteRuleOptions = [
    { label: "None (null)", value: "__NULL__" },
    { label: "PASS_ALL_TERM_1", value: "PASS_ALL_TERM_1" },
    { label: "PASS_ALL_TERM_2", value: "PASS_ALL_TERM_2" },
];

const defaultTerm = (): TermForm => ({
    year: 1,
    semester: 1,
    subjectIds: [],
    prerequisiteRule: null,
    note: "",
});

export default function ModalBulkCurriculumTerms(props: Props) {
    const {
        open,
        onClose,
        curriculumId,
        curriculumOptions,
        subjectOptions,
        onSubmit,
        lockCurriculumSelect = true,
        reloadTable,
    } = props;

    const [form] = Form.useForm<CurriculumTermPayload>();
    const [submitting, setSubmitting] = useState(false);

    // ✅ WATCH để UI reactive
    const watchTerms = Form.useWatch("terms", form) as TermForm[] | undefined;

    const fallbackCurriculumId = useMemo(() => {
        return curriculumId ?? curriculumOptions?.[0]?.value ?? null;
    }, [curriculumId, curriculumOptions]);

    useEffect(() => {
        if (!open) return;

        form.setFieldsValue({
            curriculumId: +fallbackCurriculumId,
            terms: [defaultTerm()],
        });
    }, [open, fallbackCurriculumId, form]);

    const handleCurriculumChange = (newId: number) => {
        form.setFieldsValue({
            curriculumId: newId,
            terms: [defaultTerm()],
        });
    };

    // ✅ Reactive: term cuối đã nhập đủ chưa
    const isLastTermComplete = useMemo(() => {
        const terms = watchTerms ?? [];
        if (terms.length === 0) return true;

        const last = terms[terms.length - 1];
        const okYear = Number.isInteger(last?.year) && last.year >= 1;
        const okSem = Number.isInteger(last?.semester) && last.semester >= 1;
        const okSubjects =
            Array.isArray(last?.subjectIds) && last.subjectIds.length > 0;

        return okYear && okSem && okSubjects;
    }, [watchTerms]);

    // ✅ Reactive: check trùng year-semester
    const hasDuplicateTerm = useMemo(() => {
        const terms = watchTerms ?? [];
        const seen = new Set<string>();

        for (const t of terms) {
            if (!t?.year || !t?.semester) continue;
            const k = `${t.year}-${t.semester}`;
            if (seen.has(k)) return true;
            seen.add(k);
        }
        return false;
    }, [watchTerms]);

    const addDisabled = !isLastTermComplete || hasDuplicateTerm;

    const handleAddTerm = () => {
        if (!isLastTermComplete) {
            message.warning(
                "Bạn cần nhập đầy đủ Year, Semester và chọn Subjects cho term hiện tại trước khi thêm term mới.",
            );
            return;
        }

        if (hasDuplicateTerm) {
            message.error(
                "Bạn đang bị trùng term (year-semester). Vui lòng sửa trước khi thêm term mới.",
            );
            return;
        }

        const terms = (watchTerms ?? []) as TermForm[];
        form.setFieldsValue({ terms: [...terms, defaultTerm()] });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const payload: CurriculumTermPayload = {
                curriculumId: values.curriculumId,
                terms: (values.terms || []).map((t) => ({
                    year: t.year,
                    semester: t.semester,
                    subjectIds: t.subjectIds || [],
                    prerequisiteRule:
                        (t.prerequisiteRule as any) === "__NULL__"
                            ? null
                            : (t.prerequisiteRule ?? null),
                    note: t.note,
                })),
            };

            // ✅ chặn duplicate lần cuối trước khi submit
            {
                const seen = new Set<string>();
                for (const t of payload.terms) {
                    const k = `${t.year}-${t.semester}`;
                    if (seen.has(k)) {
                        message.error(
                            `Trùng term: year ${t.year} - semester ${t.semester}`,
                        );
                        return;
                    }
                    seen.add(k);
                }
            }

            setSubmitting(true);

            // ✅ CHỜ API tạo xong
            await onSubmit?.(payload);

            // ✅ ProTable reload không await được, nên gọi sau submit (thêm 1 tick để chắc data mới đã sẵn)
            setTimeout(() => {
                reloadTable?.();
            }, 150);

            message.success("Submit thành công!");
            form.resetFields();
            onClose();
        } catch (e) {
            console.log(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Nhập Terms cho Curriculum"
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleOk}
            okText="Submit"
            cancelText="Cancel"
            width={920}
            destroyOnClose
            confirmLoading={submitting}
        >
            <Form form={form} layout="vertical">
                <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                    align="start"
                >
                    <Form.Item
                        label="Curriculum"
                        name="curriculumId"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn curriculum",
                            },
                        ]}
                        style={{ flex: 1, marginRight: 12 }}
                    >
                        <Select
                            showSearch
                            options={curriculumOptions}
                            placeholder="Chọn curriculum"
                            optionFilterProp="label"
                            disabled={lockCurriculumSelect}
                            onChange={handleCurriculumChange}
                        />
                    </Form.Item>

                    <Form.Item label=" " style={{ marginTop: 28 }}>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={handleAddTerm}
                            disabled={addDisabled}
                            title={
                                addDisabled
                                    ? "Nhập đủ Year/Semester/Subjects và không trùng term để thêm"
                                    : "Thêm term mới"
                            }
                        >
                            Add term
                        </Button>
                    </Form.Item>
                </Space>

                <Divider style={{ margin: "8px 0 16px" }} />

                <Form.List name="terms">
                    {(fields, { remove }) => (
                        <>
                            {fields.map((field, idx) => (
                                <div
                                    key={field.key}
                                    style={{
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Space
                                        style={{
                                            width: "100%",
                                            justifyContent: "space-between",
                                        }}
                                        align="center"
                                    >
                                        <Text strong>Term #{idx + 1}</Text>
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(field.name)}
                                            disabled={fields.length === 1}
                                        >
                                            Remove
                                        </Button>
                                    </Space>

                                    <Divider style={{ margin: "12px 0" }} />

                                    <Space
                                        style={{ width: "100%" }}
                                        align="start"
                                        wrap
                                    >
                                        <Form.Item
                                            label="Year"
                                            name={[field.name, "year"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Nhập year",
                                                },
                                            ]}
                                        >
                                            <InputNumber
                                                min={1}
                                                max={10}
                                                style={{ width: 160 }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Semester"
                                            name={[field.name, "semester"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Nhập semester",
                                                },
                                                // ✅ validate trùng ngay khi đổi
                                                {
                                                    validator: async () => {
                                                        if (hasDuplicateTerm)
                                                            throw new Error(
                                                                "Trùng term (year-semester)!",
                                                            );
                                                    },
                                                },
                                            ]}
                                        >
                                            <InputNumber
                                                min={1}
                                                max={20}
                                                style={{ width: 160 }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Subjects"
                                            name={[field.name, "subjectIds"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Chọn ít nhất 1 subject",
                                                },
                                                {
                                                    validator: async (
                                                        _,
                                                        value,
                                                    ) => {
                                                        if (
                                                            !value ||
                                                            value.length === 0
                                                        ) {
                                                            throw new Error(
                                                                "Chọn ít nhất 1 subject",
                                                            );
                                                        }
                                                    },
                                                },
                                            ]}
                                            style={{ minWidth: 360 }}
                                        >
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                showSearch
                                                placeholder="Chọn subjectIds"
                                                options={subjectOptions}
                                                optionFilterProp="label"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Prerequisite Rule"
                                            name={[
                                                field.name,
                                                "prerequisiteRule",
                                            ]}
                                            tooltip="Chọn None để gửi null"
                                            style={{ minWidth: 240 }}
                                        >
                                            <Select
                                                allowClear
                                                placeholder="(optional)"
                                                options={
                                                    prerequisiteRuleOptions
                                                }
                                            />
                                        </Form.Item>
                                    </Space>

                                    <Form.Item
                                        label="Note (optional)"
                                        name={[field.name, "note"]}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Input placeholder="Ghi chú nội bộ (không bắt buộc)" />
                                    </Form.Item>
                                </div>
                            ))}

                            <Button
                                type="dashed"
                                block
                                icon={<PlusOutlined />}
                                onClick={handleAddTerm}
                                disabled={addDisabled}
                            >
                                Add another term
                            </Button>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
}
