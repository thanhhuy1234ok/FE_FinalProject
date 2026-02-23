import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Divider, Row, Tag, Typography } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/** =========================
 * Types
 ========================== */
type RoomCode = string;

type FloorGroup = {
    floor: number;
    rooms: RoomCode[];
};

type BuildingView = {
    id: number;
    name: string;
    code: string;
    floors?: FloorGroup[];
    roomsWithoutFloor?: RoomCode[];
};

type CampusView = {
    id: number;
    name: string;
    buildings: BuildingView[];
};

/** =========================
 * Mock Data
 ========================== */
const mockCampusData: CampusView = {
    id: 1,
    name: "Campus Thủ Đức",
    buildings: [
        {
            id: 101,
            name: "Tòa A",
            code: "A",
            floors: [
                { floor: 1, rooms: ["A-101", "A-102", "A-103"] },
                { floor: 2, rooms: ["A-201", "A-202"] },
                { floor: 3, rooms: [] },
            ],
            roomsWithoutFloor: [],
        },
        {
            id: 102,
            name: "Tòa B",
            code: "B",
            floors: [
                { floor: 1, rooms: ["B-101", "B-102"] },
                { floor: 2, rooms: ["B-201", "B-202", "B-203"] },
            ],
            roomsWithoutFloor: ["B-G01", "B-G02"],
        },
        {
            id: 103,
            name: "Thư viện",
            code: "LIB",
            floors: [],
            roomsWithoutFloor: ["LIB-001", "LIB-002", "LIB-003"],
        },
        {
            id: 104,
            name: "Tòa Lab CNTT",
            code: "IT",
            floors: [
                { floor: 1, rooms: ["IT-101", "IT-102", "IT-103", "IT-104"] },
                { floor: 2, rooms: ["IT-201"] },
            ],
            roomsWithoutFloor: [],
        },
    ],
};

/** =========================
 * Small helper: smooth collapse
 ========================== */
function CollapseBody({
    expanded,
    children,
}: {
    expanded: boolean;
    children: React.ReactNode;
}) {
    // maxHeight lớn để đủ chứa nội dung; transition sẽ mượt
    return (
        <div
            style={{
                overflow: "hidden",
                maxHeight: expanded ? 1200 : 0,
                opacity: expanded ? 1 : 0,
                transform: expanded ? "translateY(0)" : "translateY(-4px)",
                transition:
                    "max-height 260ms ease, opacity 200ms ease, transform 200ms ease",
            }}
        >
            {/* padding chỉ khi expanded để không chừa khoảng trống */}
            <div style={{ paddingTop: expanded ? 8 : 0 }}>{children}</div>
        </div>
    );
}

/** =========================
 * Page
 ========================== */
export default function CampusBuildingRoomPage() {
    const [openModal, setOpenModal] = useState(false);
    const [dataCampus, setDataCampus] = useState<CampusView | null>(null);

    // ✅ expanded state per building
    const [expandedBuildings, setExpandedBuildings] = useState<
        Record<number, boolean>
    >({});

    const toggleBuilding = (id: number) => {
        setExpandedBuildings((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Fake loading data
    useEffect(() => {
        const t = setTimeout(() => {
            setDataCampus(mockCampusData);
        }, 250);
        return () => clearTimeout(t);
    }, []);

    // Default expand all buildings when data loaded
    useEffect(() => {
        if (!dataCampus) return;
        const init: Record<number, boolean> = {};
        dataCampus.buildings.forEach((b) => (init[b.id] = true));
        setExpandedBuildings(init);
    }, [dataCampus]);

    // Tổng số phòng toàn campus
    const totalRooms = useMemo(() => {
        if (!dataCampus) return 0;
        return dataCampus.buildings.reduce((sum, b) => {
            const floorRoomCount =
                b.floors?.reduce(
                    (count, f) => count + (f.rooms?.length ?? 0),
                    0,
                ) ?? 0;
            const noFloorRoomCount = b.roomsWithoutFloor?.length ?? 0;
            return sum + floorRoomCount + noFloorRoomCount;
        }, 0);
    }, [dataCampus]);

    return (
        <div style={{ padding: 30, background: "#f2f4f7", minHeight: "100%" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <Title level={2} style={{ margin: 0, color: "#2f3542" }}>
                    Quản lý Campus & Phòng học
                </Title>

                <Button
                    type="primary"
                    style={{ borderRadius: 8 }}
                    onClick={() => setOpenModal(true)}
                    title="Tạo mới tòa nhà"
                >
                    Tạo mới tòa nhà
                </Button>
            </div>

            {/* Campus Card */}
            <Card
                key={dataCampus?.id}
                title={
                    <Text strong style={{ color: "#1e90ff" }}>
                        {dataCampus?.name ?? "Đang tải..."}
                    </Text>
                }
                style={{ marginBottom: 30, borderRadius: 12 }}
                bodyStyle={{ backgroundColor: "#ffffff", borderRadius: 12 }}
                loading={!dataCampus}
            >
                {dataCampus?.buildings?.map((building) => {
                    const floorRoomCount =
                        building.floors?.reduce(
                            (count, floor) =>
                                count + (floor.rooms?.length ?? 0),
                            0,
                        ) ?? 0;

                    const noFloorRoomCount =
                        building.roomsWithoutFloor?.length ?? 0;
                    const roomCount = floorRoomCount + noFloorRoomCount;

                    const expanded = !!expandedBuildings[building.id];

                    return (
                        <Card
                            key={building.id}
                            type="inner"
                            title={
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <Text strong>{building.name}</Text>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <Text type="secondary">
                                            ({roomCount} phòng)
                                        </Text>

                                        <Button
                                            size="small"
                                            shape="circle"
                                            onClick={() =>
                                                toggleBuilding(building.id)
                                            }
                                            aria-label={
                                                expanded
                                                    ? "Collapse rooms"
                                                    : "Expand rooms"
                                            }
                                            title={
                                                expanded ? "Thu gọn" : "Mở rộng"
                                            }
                                            icon={
                                                expanded ? (
                                                    <MinusOutlined />
                                                ) : (
                                                    <PlusOutlined />
                                                )
                                            }
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 160ms ease",
                                            }}
                                        />
                                    </div>
                                </div>
                            }
                            style={{
                                marginBottom: 20,
                                borderLeft: "4px solid #1e90ff",
                                background: "#f9f9f9",
                                borderRadius: 8,
                            }}
                        >
                            {/* ✅ Smooth collapse, no "Đang thu gọn" text */}
                            <CollapseBody expanded={expanded}>
                                {roomCount === 0 ? (
                                    <Text type="secondary">Không có phòng</Text>
                                ) : (
                                    <>
                                        {/* Có tầng */}
                                        {building.floors?.map((floor) => (
                                            <div
                                                key={`${building.id}-floor-${floor.floor}`}
                                                style={{ marginBottom: 16 }}
                                            >
                                                <Text
                                                    italic
                                                    style={{ color: "#636e72" }}
                                                >
                                                    Tầng {floor.floor}:
                                                </Text>

                                                <Row
                                                    gutter={[8, 8]}
                                                    style={{ marginTop: 8 }}
                                                >
                                                    {floor.rooms?.length ? (
                                                        floor.rooms.map(
                                                            (room) => (
                                                                <Col
                                                                    key={`${building.id}-${room}`}
                                                                >
                                                                    <Tag
                                                                        color="blue"
                                                                        style={{
                                                                            borderRadius: 20,
                                                                            padding:
                                                                                "6px 12px",
                                                                            transition:
                                                                                "transform 160ms ease",
                                                                        }}
                                                                    >
                                                                        Phòng{" "}
                                                                        {room}
                                                                    </Tag>
                                                                </Col>
                                                            ),
                                                        )
                                                    ) : (
                                                        <Col>
                                                            <Tag
                                                                color="default"
                                                                style={{
                                                                    borderRadius: 20,
                                                                    padding:
                                                                        "6px 12px",
                                                                    color: "#999",
                                                                }}
                                                            >
                                                                Chưa có phòng
                                                            </Tag>
                                                        </Col>
                                                    )}
                                                </Row>
                                            </div>
                                        ))}

                                        {/* Phòng không thuộc tầng */}
                                        {!!building.roomsWithoutFloor
                                            ?.length && (
                                            <div style={{ marginBottom: 16 }}>
                                                <Text
                                                    italic
                                                    style={{ color: "#636e72" }}
                                                >
                                                    Không có tầng:
                                                </Text>

                                                <Row
                                                    gutter={[8, 8]}
                                                    style={{ marginTop: 8 }}
                                                >
                                                    {building.roomsWithoutFloor.map(
                                                        (room) => (
                                                            <Col
                                                                key={`${building.id}-nofloor-${room}`}
                                                            >
                                                                <Tag
                                                                    color="blue"
                                                                    style={{
                                                                        borderRadius: 20,
                                                                        padding:
                                                                            "6px 12px",
                                                                    }}
                                                                >
                                                                    Phòng {room}
                                                                </Tag>
                                                            </Col>
                                                        ),
                                                    )}
                                                </Row>
                                            </div>
                                        )}
                                    </>
                                )}

                                <Divider style={{ margin: "12px 0" }} />
                                <Text strong style={{ color: "#2f3542" }}>
                                    Số phòng trong tòa: {roomCount}
                                </Text>
                            </CollapseBody>
                        </Card>
                    );
                })}

                <Divider />
                <Text strong style={{ color: "#27ae60" }}>
                    Tổng số phòng: {totalRooms}
                </Text>
            </Card>

            {/* Demo modal (bạn thay bằng ModalBuilding thật) */}
            {openModal && (
                <Card style={{ borderRadius: 12 }}>
                    <Text strong>Modal tạo mới tòa nhà (demo)</Text>
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <Button onClick={() => setOpenModal(false)}>
                            Đóng
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                setDataCampus((prev) => {
                                    if (!prev) return prev;
                                    const nextId =
                                        Math.max(
                                            ...prev.buildings.map((b) => b.id),
                                        ) + 1;

                                    const newBuilding: BuildingView = {
                                        id: nextId,
                                        name: `Tòa mới ${nextId}`,
                                        code: `NEW${nextId}`,
                                        floors: [{ floor: 1, rooms: [] }],
                                        roomsWithoutFloor: [],
                                    };

                                    setExpandedBuildings((old) => ({
                                        ...old,
                                        [nextId]: true,
                                    }));

                                    return {
                                        ...prev,
                                        buildings: [
                                            newBuilding,
                                            ...prev.buildings,
                                        ],
                                    };
                                });
                                setOpenModal(false);
                            }}
                        >
                            Fake tạo tòa nhà
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
