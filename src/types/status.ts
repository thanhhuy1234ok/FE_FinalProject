export enum TPaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
}

export enum TPaymentItemStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
}

export enum TPaymentMethod {
    CASH = "CASH",
    BANK_TRANSFER = "BANK_TRANSFER",
    MOMO = "MOMO",
    VNPAY = "VNPAY",
    TECHCOMBANK = "TECHCOMBANK",
}
