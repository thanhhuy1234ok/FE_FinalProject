import { BankOutlined, CreditCardOutlined } from "@ant-design/icons";
import { Button, Card, Col, Radio, Row, Space, Tag, Typography } from "antd";
import { useState } from "react";
import PaymentConfirmModal from "./PaymentConfirmModal";

const { Text } = Typography;

export type PaymentMethod = "VNPAY" | "MOMO" | "BANK_TRANSFER";

type Props = {
    value: PaymentMethod;
    onChange: (value: PaymentMethod) => void;
    totalAmount: number;
    paying: boolean;
    onPay: () => void | Promise<void>;
    items: any[];
};

const formatCurrency = (value?: number | string) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const PaymentMethodCard = ({
    value,
    onChange,
    totalAmount,
    paying,
    onPay,
    items,
}: Props) => {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleOpenConfirm = () => {
        setConfirmOpen(true);
    };

    const handleConfirmPay = async () => {
        await onPay();
        setConfirmOpen(false);
    };

    return (
        <>
            <Card title="Phương thức thanh toán" style={{ borderRadius: 16 }}>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} lg={16}>
                        <Radio.Group
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            style={{ width: "100%" }}
                        >
                            <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                            >
                                <Radio.Button
                                    value="VNPAY"
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        padding: 12,
                                    }}
                                >
                                    <Space>
                                        <CreditCardOutlined />
                                        <div>
                                            <Text strong>VNPay</Text>
                                            <br />
                                            <Text type="secondary">
                                                Thanh toán qua cổng VNPay
                                            </Text>
                                        </div>
                                        <Tag color="green">Khuyến nghị</Tag>
                                    </Space>
                                </Radio.Button>

                                <Radio.Button
                                    value="MOMO"
                                    disabled
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        padding: 12,
                                    }}
                                >
                                    <Space>
                                        <CreditCardOutlined />
                                        <div>
                                            <Text strong>Momo</Text>
                                            <br />
                                            <Text type="secondary">
                                                Sắp hỗ trợ
                                            </Text>
                                        </div>
                                        <Tag>Coming soon</Tag>
                                    </Space>
                                </Radio.Button>

                                <Radio.Button
                                    value="BANK_TRANSFER"
                                    disabled
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        padding: 12,
                                    }}
                                >
                                    <Space>
                                        <BankOutlined />
                                        <div>
                                            <Text strong>
                                                Chuyển khoản ngân hàng
                                            </Text>
                                            <br />
                                            <Text type="secondary">
                                                Sắp hỗ trợ
                                            </Text>
                                        </div>
                                        <Tag>Coming soon</Tag>
                                    </Space>
                                </Radio.Button>
                            </Space>
                        </Radio.Group>
                    </Col>

                    <Col
                        xs={24}
                        lg={8}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            gap: 12,
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Tổng cần thanh toán
                            </Text>

                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 700,
                                    color: "#cf1322",
                                    lineHeight: 1.2,
                                    marginTop: 4,
                                }}
                            >
                                {formatCurrency(totalAmount)}
                            </div>
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            loading={paying}
                            disabled={!items.length || totalAmount <= 0}
                            onClick={handleOpenConfirm}
                            style={{
                                height: 44,
                                padding: "0 28px",
                                borderRadius: 10,
                                fontWeight: 600,
                                boxShadow: "0 4px 12px rgba(24,144,255,0.35)",
                            }}
                        >
                            Thanh toán ngay
                        </Button>
                    </Col>
                </Row>
            </Card>

            <PaymentConfirmModal
                open={confirmOpen}
                loading={paying}
                items={items}
                totalAmount={totalAmount}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirmPay}
            />
        </>
    );
};

export default PaymentMethodCard;
