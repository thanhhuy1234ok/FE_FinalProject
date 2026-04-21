import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { getMyCurrentPaymentAPI, payPaymentAPI } from "@/services/api";

export const usePaymentPage = () => {
    const [loading, setLoading] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payment, setPayment] = useState<IPayment | null>(null);
    const [paymentMethod, setPaymentMethod] =
        useState<TPaymentMethod>("BANK_TRANSFER");
    const [note, setNote] = useState("");

    const fetchPayment = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMyCurrentPaymentAPI();

            const data = res?.data ?? res;
            setPayment(data ?? null);
        } catch (error: any) {
            setPayment(null);
            message.error(
                error?.message || "Không thể tải thông tin thanh toán",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayment();
    }, [fetchPayment]);

    const activeItems = useMemo(() => {
        return (payment?.items ?? []).filter(
            (item: any) => item.status === "ACTIVE",
        );
    }, [payment]);

    const totalCredits = useMemo(() => {
        return activeItems.reduce(
            (sum: any, item: any) => sum + Number(item.credits ?? 0),
            0,
        );
    }, [activeItems]);

    const totalAmount = useMemo(() => {
        return activeItems.reduce(
            (sum: any, item: any) => sum + Number(item.amount ?? 0),
            0,
        );
    }, [activeItems]);

    const onPay = useCallback(async () => {
        if (!payment?.id) {
            message.warning("Không có phiếu thanh toán hợp lệ");
            return false;
        }

        setPaying(true);
        try {
            const res = await payPaymentAPI(payment.id, {
                paymentMethod,
                note: note?.trim() || undefined,
            });

            const data = res?.data ?? res;
            setPayment(data ?? null);

            message.success("Thanh toán thành công");
            return true;
        } catch (error: any) {
            message.error(error?.message || "Thanh toán thất bại");
            return false;
        } finally {
            setPaying(false);
        }
    }, [payment?.id, paymentMethod, note]);

    return {
        loading,
        paying,
        payment,
        paymentMethod,
        setPaymentMethod,
        note,
        setNote,
        activeItems,
        totalCredits,
        totalAmount,
        fetchPayment,
        onPay,
    };
};
