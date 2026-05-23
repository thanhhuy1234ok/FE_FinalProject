import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { getPaymentHistoryAPI } from "@/services/api";

export const usePaymentHistory = () => {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState<IPayment[]>([]);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPaymentHistoryAPI();

            const raw = res?.data;

            // 🔥 đảm bảo luôn là array
            const data = Array.isArray(raw) ? raw : raw ? [raw] : [];

            setPayments(data);
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

    return {
        loading,
        payments,
        fetchPayments,
    };
};
