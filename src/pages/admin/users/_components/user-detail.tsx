import React from "react";
import {
    Drawer,
    Row,
    Col,
    Tag,
    Typography,
    Avatar,
    Button,
    Space,
    Card,
    Badge,
} from "antd";
import "@/styles/drawdetail.scss";
const { Text } = Typography;

const renderRoleTag = (role?: string) => {
    const map: Record<string, { label: string; color: any }> = {
        ADMIN: { label: "Quản trị viên", color: "red" },
        TEACHER: { label: "Giảng viên", color: "gold" },
        STUDENT: { label: "Sinh viên", color: "blue" },
    };
    const r = role ? (map[role] ?? { label: role, color: "default" }) : null;
    return r ? <Tag color={r.color}>{r.label}</Tag> : null;
};

const Item = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="pitem">
        <div className="pitem__label">{label}</div>
        <div className="pitem__value">{value}</div>
    </div>
);

const has = (v: any) => !(v === null || v === undefined || v === "");

export default function UserProfileDrawer({
    open,
    setOpen,
    dataInit,
    setDataInit,
}: any) {
    const role = dataInit?.role?.name;

    const initials =
        (dataInit?.name ?? "")
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map((w: string) => w[0]?.toUpperCase())
            .join("") || "U";

    return (
        <Drawer
            width={720}
            placement="right"
            open={open}
            closable={false}
            className="profile-drawer-v2"
            onClose={() => {
                setOpen(false);
                setDataInit(null);
            }}
        >
            {/* HEADER */}
            <div className="pheader">
                <div className="pheader__left">
                    <Avatar
                        size={52}
                        src={dataInit?.avatar ?? undefined}
                        className="pheader__avatar"
                    >
                        {initials}
                    </Avatar>

                    <div className="pheader__info">
                        <div className="pheader__name">{dataInit?.name}</div>
                        <div className="pheader__meta">
                            {dataInit?.email && (
                                <Text type="secondary">{dataInit.email}</Text>
                            )}
                            {role && (
                                <>
                                    <span className="dot">•</span>
                                    {renderRoleTag(role)}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <Space>
                    <Button
                        onClick={() => {
                            setOpen(false);
                            setDataInit(null);
                        }}
                    >
                        Đóng
                    </Button>
                </Space>
            </div>

            {/* CONTENT */}
            <div className="pcontent">
                <Card
                    className="pcard"
                    bordered={false}
                    title="Thông tin cá nhân"
                >
                    <Row gutter={[14, 14]}>
                        {has(dataInit?.name) && (
                            <Col xs={24} sm={12}>
                                <Item label="Họ và tên" value={dataInit.name} />
                            </Col>
                        )}
                        {has(dataInit?.email) && (
                            <Col xs={24} sm={12}>
                                <Item label="Email" value={dataInit.email} />
                            </Col>
                        )}
                        {has(dataInit?.gender) && (
                            <Col xs={24} sm={12}>
                                <Item
                                    label="Giới tính"
                                    value={
                                        dataInit.gender === "male"
                                            ? "Nam"
                                            : dataInit.gender === "female"
                                              ? "Nữ"
                                              : dataInit.gender
                                    }
                                />
                            </Col>
                        )}
                        {has(dataInit?.address) && (
                            <Col xs={24} sm={12}>
                                <Item
                                    label="Địa chỉ"
                                    value={dataInit.address}
                                />
                            </Col>
                        )}
                        {has(dataInit?.phone) && (
                            <Col xs={24} sm={12}>
                                <Item
                                    label="Số điện thoại"
                                    value={dataInit.phone}
                                />
                            </Col>
                        )}
                        {has(dataInit?.isActive) && (
                            <Col xs={24} sm={12}>
                                <Item
                                    label="Trạng thái"
                                    value={
                                        <Tag
                                            color={
                                                dataInit.isActive
                                                    ? "green"
                                                    : "default"
                                            }
                                        >
                                            {dataInit.isActive ? (
                                                <Badge
                                                    status="success"
                                                    text="Đang hoạt động"
                                                />
                                            ) : (
                                                <Badge
                                                    status="default"
                                                    text="Tạm khóa"
                                                />
                                            )}
                                        </Tag>
                                    }
                                />
                            </Col>
                        )}
                        {role && (
                            <Col xs={24} sm={12}>
                                <Item
                                    label="Vai trò"
                                    value={renderRoleTag(role)}
                                />
                            </Col>
                        )}
                    </Row>
                </Card>

                {/* STUDENT */}
                {role === "STUDENT" && dataInit?.student && (
                    <Card
                        className="pcard"
                        bordered={false}
                        title="Thông tin sinh viên"
                    >
                        <Row gutter={[14, 14]}>
                            {has(dataInit?.student?.mssv) && (
                                <Col xs={24} sm={12}>
                                    <Item
                                        label="MSSV"
                                        value={dataInit.student.mssv}
                                    />
                                </Col>
                            )}
                            {has(dataInit?.student?.major?.name) && (
                                <Col xs={24} sm={12}>
                                    <Item
                                        label="Chuyên ngành"
                                        value={dataInit.student.major.name}
                                    />
                                </Col>
                            )}
                            {has(dataInit?.student?.yearOfAdmission?.year) && (
                                <Col xs={24} sm={12}>
                                    <Item
                                        label="Năm nhập học"
                                        value={
                                            dataInit.student.yearOfAdmission
                                                .year
                                        }
                                    />
                                </Col>
                            )}
                            {has(dataInit?.student?.adminClass?.name) && (
                                <Col xs={24} sm={12}>
                                    <Item
                                        label="Lớp hành chính"
                                        value={dataInit.student.adminClass.name}
                                    />
                                </Col>
                            )}
                        </Row>
                    </Card>
                )}

                {/* TEACHER */}
                {role === "TEACHER" && dataInit?.teacher && (
                    <Card
                        className="pcard"
                        bordered={false}
                        title="Thông tin giảng viên"
                    >
                        <Row gutter={[14, 14]}>
                            {has(dataInit?.teacher?.msgv) && (
                                <Col xs={24} sm={12}>
                                    <Item
                                        label="Mã giảng viên"
                                        value={dataInit.teacher.msgv}
                                    />
                                </Col>
                            )}
                            {has(dataInit?.teacher?.specialization) && (
                                <Col xs={24} sm={12}>
                                    <Item
                                        label="Chuyên môn"
                                        value={dataInit.teacher.specialization}
                                    />
                                </Col>
                            )}
                            {has(dataInit?.teacher?.degree) && (
                                <Col xs={24} sm={12}>
                                    <Item
                                        label="Học vị"
                                        value={dataInit.teacher.degree}
                                    />
                                </Col>
                            )}
                        </Row>
                    </Card>
                )}
            </div>
        </Drawer>
    );
}
