import { Card, Col, Descriptions, Row, Typography } from "antd";
import dayjs from "dayjs";

import PaymentStatusTag from "./PaymentStatusTag";

const { Text } = Typography;

interface Props {
    payment: IPayment;
}

const semesterLabel = (semester?: string) => {
    switch (semester) {
        case "HK1":
            return "Học kỳ 1";
        case "HK2":
            return "Học kỳ 2";
        case "SUMMER":
            return "Học kỳ hè";
        default:
            return semester || "--";
    }
};

const PaymentInfoCard = ({ payment }: Props) => {
    return (
        <Card title="Thông tin phiếu thanh toán" style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Descriptions
                        column={1}
                        bordered
                        size="middle"
                        labelStyle={{ width: 180, fontWeight: 600 }}
                    >
                        <Descriptions.Item label="Mã phiếu">
                            {payment.code}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sinh viên">
                            {payment.student?.user?.name || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {payment.student?.user?.email || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Học kỳ">
                            {semesterLabel(payment.term?.semester)} -{" "}
                            {payment.term?.year || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <PaymentStatusTag status={payment.status} />
                        </Descriptions.Item>
                    </Descriptions>
                </Col>

                <Col xs={24} lg={10}>
                    <Descriptions
                        column={1}
                        bordered
                        size="middle"
                        labelStyle={{ width: 180, fontWeight: 600 }}
                    >
                        <Descriptions.Item label="Hạn thanh toán">
                            {payment.dueDate
                                ? dayjs(payment.dueDate).format(
                                      "HH:mm DD/MM/YYYY",
                                  )
                                : "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {payment.createdAt
                                ? dayjs(payment.createdAt).format(
                                      "HH:mm DD/MM/YYYY",
                                  )
                                : "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày thanh toán">
                            {payment.paidAt
                                ? dayjs(payment.paidAt).format(
                                      "HH:mm DD/MM/YYYY",
                                  )
                                : "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                            <Text type="secondary">
                                {payment.note || "Không có ghi chú"}
                            </Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>
        </Card>
    );
};

export default PaymentInfoCard;
