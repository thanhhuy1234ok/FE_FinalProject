import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import {
    createInvoiceAPI,
    createVNPayUrlAPI,
    getMyPaymentsAPI,
} from "@/services/api";

export type PaymentCourseItem = {
    id?: number;
    registrationId: number;
    courseOfferingId: number;
    courseCode: string;
    subject: {
        id: number;
        code: string;
        name: string;
        credit: number;
    };
    teacher?: {
        id: number;
        name?: string | null;
    };
    term?: {
        id: number;
        semester: string;
        year: number;
    };
    credits?: number;
    unitPrice: number;
    amount: number;
    payment?: {
        id: number;
        code: string;
        status: string;
        totalAmount: string;
        dueDate: string | null;
    } | null;
};

export const usePaymentPage = () => {
    const [loading, setLoading] = useState(false);
    const [paying, setPaying] = useState(false);

    const [items, setItems] = useState<PaymentCourseItem[]>([]);
    const [totalCredits, setTotalCredits] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const [createdPaymentId, setCreatedPaymentId] = useState<number | null>(
        null,
    );

    const [dueDate, setDueDate] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const fetchPayment = useCallback(async () => {
        try {
            setLoading(true);

            const res = await getMyPaymentsAPI();

            const result =
                res?.data?.data?.result ??
                res?.data?.result ??
                res?.data?.data ??
                res?.data ??
                res;

            const paymentItems = Array.isArray(result?.items)
                ? result.items
                : [];

            setItems(paymentItems);
            setTotalCredits(Number(result?.totalCredits ?? 0));
            setTotalAmount(Number(result?.totalAmount ?? 0));

            const existingPaymentId =
                result?.id ??
                result?.payment?.id ??
                paymentItems.find((item: PaymentCourseItem) => item.payment?.id)
                    ?.payment?.id ??
                null;

            setCreatedPaymentId(
                existingPaymentId ? Number(existingPaymentId) : null,
            );

            const paymentDueDate =
                result?.dueDate ??
                result?.payment?.dueDate ??
                paymentItems.find(
                    (item: PaymentCourseItem) => item.payment?.dueDate,
                )?.payment?.dueDate ??
                null;

            const paymentStatus =
                result?.status ??
                result?.payment?.status ??
                paymentItems.find(
                    (item: PaymentCourseItem) => item.payment?.status,
                )?.payment?.status ??
                null;

            setDueDate(paymentDueDate);
            setStatus(paymentStatus);
        } catch (error: any) {
            setItems([]);
            setTotalCredits(0);
            setTotalAmount(0);
            setCreatedPaymentId(null);
            setDueDate(null);
            setStatus(null);

            message.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tải danh sách thanh toán",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayment();
    }, [fetchPayment]);

    const paymentId = useMemo(() => {
        return (
            createdPaymentId ??
            items.find((item) => item.payment?.id)?.payment?.id ??
            null
        );
    }, [createdPaymentId, items]);

    const isOverdue = useMemo(() => {
        if (status === "OVERDUE") return true;
        if (!dueDate) return false;

        return new Date(dueDate).getTime() < Date.now();
    }, [dueDate, status]);

    const onPay = async () => {
        if (!items.length) {
            message.warning("Không có môn học nào cần thanh toán");
            return;
        }

        if (status === "PAID") {
            message.warning("Hóa đơn này đã được thanh toán");
            return;
        }

        if (isOverdue) {
            message.error("Hóa đơn đã quá hạn thanh toán");
            return;
        }

        try {
            setPaying(true);

            let currentPaymentId = paymentId;

            if (!currentPaymentId) {
                const invoiceRes = await createInvoiceAPI();

                const invoice =
                    invoiceRes?.data?.data ?? invoiceRes?.data ?? invoiceRes;

                currentPaymentId = Number(invoice?.id);

                if (!currentPaymentId) {
                    throw new Error("Tạo hóa đơn thất bại");
                }

                setCreatedPaymentId(currentPaymentId);
                setDueDate(invoice?.dueDate ?? null);
                setStatus(invoice?.status ?? null);
            }

            const res = await createVNPayUrlAPI(currentPaymentId);

            const data = res?.data?.data ?? res?.data ?? res;

            const url = data?.paymentUrl;

            if (!url) {
                throw new Error("Không lấy được link thanh toán VNPay");
            }

            window.location.href = url;
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Tạo link thanh toán thất bại";

            message.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setPaying(false);
        }
    };

    return {
        loading,
        paying,

        items,
        totalCredits,
        totalAmount,

        paymentId,
        dueDate,
        status,
        isOverdue,

        fetchPayment,
        onPay,
    };
};
