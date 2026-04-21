import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { getMyPaymentsAPI } from "@/services/api";

export const usePaymentHistory = () => {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState<IPayment[]>([]);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMyPaymentsAPI();
            const data = res?.data ?? res ?? [];
            setPayments(Array.isArray(data) ? data : []);
        } catch (error: any) {
            message.error(error?.message || "Không thể tải lịch sử thanh toán");
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const paidPayments = useMemo(() => {
        return payments.filter((item) => item.status === "PAID");
    }, [payments]);

    return {
        loading,
        payments,
        paidPayments,
        fetchPayments,
    };
};
