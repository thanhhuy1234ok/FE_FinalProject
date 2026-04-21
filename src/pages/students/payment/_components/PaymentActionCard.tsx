import { Button, Card, Col, Input, Radio, Row, Space, Typography } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
    paymentMethod: TPaymentMethod;
    setPaymentMethod: (value: TPaymentMethod) => void;
    note: string;
    setNote: (value: string) => void;
    onPay: () => Promise<boolean>;
    paying: boolean;
    status?: TPaymentStatus;
}

const PaymentActionCard = ({
    paymentMethod,
    setPaymentMethod,
    note,
    setNote,
    onPay,
    paying,
    status,
}: Props) => {
    const disabled = status !== "PENDING";

    return (
        <Card title="Xác nhận thanh toán" style={{ borderRadius: 16 }}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div>
                    <Text strong>Phương thức thanh toán</Text>
                    <div style={{ marginTop: 10 }}>
                        <Radio.Group
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled={disabled}
                        >
                            <Space direction="vertical">
                                <Radio value="BANK_TRANSFER">
                                    Chuyển khoản ngân hàng
                                </Radio>
                                <Radio value="MOMO">Ví điện tử MoMo</Radio>
                                <Radio value="CASH">Tiền mặt</Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                </div>

                <div>
                    <Text strong>Ghi chú</Text>
                    <TextArea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        placeholder="Nhập ghi chú nếu có"
                        disabled={disabled}
                        style={{ marginTop: 10 }}
                    />
                </div>

                <Row justify="end">
                    <Col>
                        <Button
                            type="primary"
                            size="large"
                            loading={paying}
                            disabled={disabled}
                            onClick={onPay}
                        >
                            Xác nhận thanh toán
                        </Button>
                    </Col>
                </Row>
            </Space>
        </Card>
    );
};

export default PaymentActionCard;
