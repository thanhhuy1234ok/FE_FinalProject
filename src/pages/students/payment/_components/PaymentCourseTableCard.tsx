import { Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PaymentCourseItem } from "../_hooks/usePaymentPage";

type Props = {
    items: PaymentCourseItem[];
    columns: ColumnsType<PaymentCourseItem>;
};

const PaymentCourseTableCard = ({ items, columns }: Props) => {
    return (
        <Card title="Danh sách môn cần thanh toán" style={{ borderRadius: 16 }}>
            <Table<PaymentCourseItem>
                rowKey={(record) => String(record.registrationId)}
                bordered
                columns={columns}
                dataSource={items}
                pagination={false}
            />
        </Card>
    );
};

export default PaymentCourseTableCard;
