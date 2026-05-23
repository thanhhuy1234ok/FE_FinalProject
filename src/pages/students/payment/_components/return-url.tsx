import { Button, Result } from "antd";
import { Link, useSearchParams } from "react-router-dom";

const ReturnURLPage = () => {
    const [searchParams] = useSearchParams();

    const status = searchParams.get("status");
    const responseCode = searchParams.get("responseCode");

    const success = status === "PAID" && responseCode === "00";

    return (
        <Result
            status={success ? "success" : "error"}
            title={success ? "Thanh toán thành công" : "Thanh toán thất bại"}
            subTitle={
                success
                    ? "Hệ thống đã ghi nhận thanh toán của bạn."
                    : "Giao dịch chưa hoàn tất. Bạn có thể thử thanh toán lại."
            }
            extra={[
                <Button key="home">
                    <Link to="/">Trang Chủ</Link>
                </Button>,
                <Button key="payment" type="primary">
                    <Link to="/payment">Quay lại thanh toán</Link>
                </Button>,
            ]}
        />
    );
};

export default ReturnURLPage;
