import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Divider, Row, Tag, Typography, Spin } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { getBuildingAPI } from "@/services/api";
import ModalBuilding from "./modal.building";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

/** =========================
 * Types UI
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
 * Types API
 ========================== */
interface IRoomApi {
    id: number;
    name?: string;
    code: string;
    floor?: number | null;
}

interface IBuildingApi {
    id: number;
    name: string;
    code: string;
    campus_id: number;
    has_floors?: boolean;
    total_floors?: number | null;
    is_active?: boolean;
    rooms?: IRoomApi[];
    campus?: {
        id: number;
        name: string;
        code?: string;
        is_active?: boolean;
    };
}

/** =========================
 * Build campus object from buildings API
 ========================== */
const buildCampusFromBuildings = (
    buildings: IBuildingApi[],
): CampusView | null => {
    if (!buildings?.length) return null;

    const firstCampus = buildings[0]?.campus;

    return {
        id: firstCampus?.id ?? buildings[0].campus_id,
        name: firstCampus?.name ?? "Campus",
        buildings: buildings.map((building) => {
            const floorsMap = new Map<number, string[]>();
            const roomsWithoutFloor: string[] = [];

            (building.rooms ?? []).forEach((room) => {
                const roomCode = room.code || room.name || `ROOM-${room.id}`;

                if (
                    room.floor === null ||
                    room.floor === undefined ||
                    room.floor === 0
                ) {
                    roomsWithoutFloor.push(roomCode);
                } else {
                    if (!floorsMap.has(room.floor)) {
                        floorsMap.set(room.floor, []);
                    }
                    floorsMap.get(room.floor)?.push(roomCode);
                }
            });

            let floors: FloorGroup[] = Array.from(floorsMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([floor, rooms]) => ({
                    floor,
                    rooms,
                }));

            if (
                (building.has_floors ?? true) &&
                (building.total_floors ?? 0) > 0
            ) {
                const existedFloors = new Set(floors.map((f) => f.floor));

                for (let i = 1; i <= (building.total_floors ?? 0); i++) {
                    if (!existedFloors.has(i)) {
                        floors.push({
                            floor: i,
                            rooms: [],
                        });
                    }
                }

                floors = floors.sort((a, b) => a.floor - b.floor);
            }

            return {
                id: building.id,
                name: building.name,
                code: building.code,
                floors,
                roomsWithoutFloor,
            };
        }),
    };
};

/** =========================
 * Smooth collapse
 ========================== */
function CollapseBody({
    expanded,
    children,
}: {
    expanded: boolean;
    children: React.ReactNode;
}) {
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
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [expandedBuildings, setExpandedBuildings] = useState<
        Record<number, boolean>
    >({});

    const campusId = Number(id);

    const toggleBuilding = (id: number) => {
        setExpandedBuildings((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const fetchCampus = async () => {
        try {
            setLoading(true);

            // nếu API của bạn hỗ trợ query string thì dùng kiểu này
            const res = await getBuildingAPI(
                `current=1&pageSize=100&campus_id=${campusId}`,
            );

            const buildingList: IBuildingApi[] =
                res?.data?.result ??
                res?.data?.data?.result ??
                res?.data?.data ??
                [];

            const transformed = buildCampusFromBuildings(buildingList);
            setDataCampus(transformed);

            const initExpanded: Record<number, boolean> = {};
            transformed?.buildings?.forEach((b) => {
                initExpanded[b.id] = true;
            });
            setExpandedBuildings(initExpanded);
        } catch (error) {
            console.error("Fetch campus failed:", error);
            setDataCampus(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampus();
    }, []);

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

            <Card
                key={dataCampus?.id ?? "campus-card"}
                title={
                    <Text strong style={{ color: "#1e90ff" }}>
                        {dataCampus?.name ?? "Đang tải..."}
                    </Text>
                }
                style={{ marginBottom: 30, borderRadius: 12 }}
                styles={{
                    body: { backgroundColor: "#ffffff", borderRadius: 12 },
                }}
            >
                {loading ? (
                    <div style={{ padding: "24px 0", textAlign: "center" }}>
                        <Spin />
                    </div>
                ) : !dataCampus ? (
                    <Text type="secondary">Không có dữ liệu campus</Text>
                ) : (
                    <>
                        {dataCampus.buildings?.map((building) => {
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
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <Text strong>
                                                    {building.name}
                                                </Text>
                                                <Tag color="geekblue">
                                                    {building.code}
                                                </Tag>
                                            </div>

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
                                                        toggleBuilding(
                                                            building.id,
                                                        )
                                                    }
                                                    title={
                                                        expanded
                                                            ? "Thu gọn"
                                                            : "Mở rộng"
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
                                                        justifyContent:
                                                            "center",
                                                        transition:
                                                            "all 160ms ease",
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
                                    <CollapseBody expanded={expanded}>
                                        {roomCount === 0 ? (
                                            <Text type="secondary">
                                                Không có phòng
                                            </Text>
                                        ) : (
                                            <>
                                                {building.floors?.map(
                                                    (floor) => (
                                                        <div
                                                            key={`${building.id}-floor-${floor.floor}`}
                                                            style={{
                                                                marginBottom: 16,
                                                            }}
                                                        >
                                                            <Text
                                                                italic
                                                                style={{
                                                                    color: "#636e72",
                                                                }}
                                                            >
                                                                Tầng{" "}
                                                                {floor.floor}:
                                                            </Text>

                                                            <Row
                                                                gutter={[8, 8]}
                                                                style={{
                                                                    marginTop: 8,
                                                                }}
                                                            >
                                                                {floor.rooms
                                                                    ?.length ? (
                                                                    floor.rooms.map(
                                                                        (
                                                                            room,
                                                                        ) => (
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
                                                                                    {
                                                                                        room
                                                                                    }
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
                                                                            Chưa
                                                                            có
                                                                            phòng
                                                                        </Tag>
                                                                    </Col>
                                                                )}
                                                            </Row>
                                                        </div>
                                                    ),
                                                )}

                                                {!!building.roomsWithoutFloor
                                                    ?.length && (
                                                    <div
                                                        style={{
                                                            marginBottom: 16,
                                                        }}
                                                    >
                                                        <Text
                                                            italic
                                                            style={{
                                                                color: "#636e72",
                                                            }}
                                                        >
                                                            Không có tầng:
                                                        </Text>

                                                        <Row
                                                            gutter={[8, 8]}
                                                            style={{
                                                                marginTop: 8,
                                                            }}
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
                                                                            Phòng{" "}
                                                                            {
                                                                                room
                                                                            }
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
                                        <Text
                                            strong
                                            style={{ color: "#2f3542" }}
                                        >
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
                    </>
                )}
            </Card>

            <ModalBuilding
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={fetchCampus}
                campusId={+campusId}
            />
        </div>
    );
}
