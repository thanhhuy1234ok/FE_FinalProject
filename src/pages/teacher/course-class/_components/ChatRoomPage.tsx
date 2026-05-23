import {
    FileOutlined,
    MessageOutlined,
    PictureOutlined,
    SendOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Empty,
    Input,
    List,
    Row,
    Space,
    Spin,
    Typography,
    Upload,
    message,
} from "antd";
import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";

import {
    getConversationMessagesAPI,
    getMyConversationsAPI,
    seenConversationAPI,
    sendMessageAPI,
    uploadChatFileAPI,
} from "@/services/api";
import { useCurrentApp } from "@/context/use.curent";
import { socket } from "@/socket/socket";

const { Text, Title } = Typography;

const isImageUrl = (url?: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url.split("?")[0]);
};

const isImageFile = (file?: File | null) => {
    return Boolean(file?.type?.startsWith("image/"));
};

interface CourseChatSectionProps {
    courseOfferingId?: number;
    isActive?: boolean;
    onSeen?: () => void;
}

const CourseChatSection = ({
    courseOfferingId,
    isActive = false,
    onSeen,
}: CourseChatSectionProps) => {
    const chatRef = useRef<HTMLDivElement>(null);
    const { user } = useCurrentApp();

    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState("");

    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [openEmoji, setOpenEmoji] = useState(false);

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState("");

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(0);

    const isNearBottom = () => {
        const el = chatRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    };

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            chatRef.current?.scrollTo({
                top: chatRef.current.scrollHeight,
                behavior: "smooth",
            });
        });

        setShowScrollButton(false);
        setNewMessageCount(0);
    };

    const markSeen = async (conversationId: number) => {
        if (!isActive) return;

        try {
            await seenConversationAPI(conversationId);
            onSeen?.();

            setConversations((prev) =>
                prev.map((item) =>
                    item.id === conversationId
                        ? {
                              ...item,
                              unreadCount: 0,
                          }
                        : item,
                ),
            );
        } catch (error) {
            console.log("SEEN ERROR:", error);
        }
    };

    const handleChatScroll = () => {
        if (isNearBottom()) {
            setShowScrollButton(false);
            setNewMessageCount(0);
        }
    };

    const clearPendingFile = () => {
        if (pendingPreview) {
            URL.revokeObjectURL(pendingPreview);
        }

        setPendingFile(null);
        setPendingPreview("");
    };

    const fetchMessages = async (conversationId: number) => {
        try {
            setLoadingMessages(true);

            const res = await getConversationMessagesAPI(conversationId);
            const data = res?.data?.data || res?.data || [];

            setMessages(data);
            setTimeout(scrollToBottom, 80);
        } catch (error) {
            message.error("Không tải được tin nhắn");
        } finally {
            setLoadingMessages(false);
        }
    };

    const fetchConversations = async () => {
        try {
            setLoadingRooms(true);

            const res = await getMyConversationsAPI();
            let data = res?.data?.data || res?.data || [];

            if (courseOfferingId) {
                data = data.filter(
                    (item: any) =>
                        item.courseOfferingId === courseOfferingId ||
                        item.courseOffering?.id === courseOfferingId,
                );
            }

            setConversations(data);

            if (data.length > 0) {
                setSelectedConversation(data[0]);
            }
        } catch (error) {
            message.error("Không tải được danh sách chat");
        } finally {
            setLoadingRooms(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [courseOfferingId]);

    useEffect(() => {
        if (!selectedConversation?.id) return;

        fetchMessages(selectedConversation.id);

        socket.emit("conversation:join", {
            conversationId: selectedConversation.id,
        });

        if (isActive) {
            markSeen(selectedConversation.id);
        }

        return () => {
            socket.emit("conversation:leave", {
                conversationId: selectedConversation.id,
            });
        };
    }, [selectedConversation?.id]);

    useEffect(() => {
        if (!isActive || !selectedConversation?.id) return;

        markSeen(selectedConversation.id);
    }, [isActive, selectedConversation?.id]);

    useEffect(() => {
        const handleNewMessage = (payload: any) => {
            const newMessage = payload?.message;
            if (!newMessage) return;

            if (newMessage.conversationId === selectedConversation?.id) {
                const nearBottom = isNearBottom();

                setMessages((prev) => {
                    const existed = prev.some(
                        (item) => item.id === newMessage.id,
                    );

                    if (existed) return prev;

                    return [...prev, newMessage];
                });

                if (isActive) {
                    markSeen(selectedConversation.id);
                }

                if (nearBottom) {
                    setTimeout(scrollToBottom, 50);
                } else {
                    setShowScrollButton(true);
                    setNewMessageCount((prev) => prev + 1);
                }
            }

            setConversations((prev) =>
                prev.map((item) =>
                    item.id === newMessage.conversationId
                        ? {
                              ...item,
                              lastMessage: payload.conversation?.lastMessage,
                              lastMessageAt:
                                  payload.conversation?.lastMessageAt,
                              unreadCount:
                                  item.id === selectedConversation?.id &&
                                  isActive
                                      ? 0
                                      : item.id === newMessage.conversationId
                                        ? (item.unreadCount || 0) + 1
                                        : item.unreadCount,
                          }
                        : item,
                ),
            );
        };

        const handleConversationUpdated = (payload: any) => {
            if (
                courseOfferingId &&
                payload?.courseOfferingId &&
                payload.courseOfferingId !== courseOfferingId
            ) {
                return;
            }

            setConversations((prev) =>
                prev.map((item) =>
                    item.id === payload.conversationId
                        ? {
                              ...item,
                              lastMessage: payload.lastMessage,
                              lastMessageAt: payload.lastMessageAt,
                              unreadCount:
                                  item.id === selectedConversation?.id &&
                                  isActive
                                      ? 0
                                      : payload.unreadCount,
                          }
                        : item,
                ),
            );
        };

        socket.on("message:new", handleNewMessage);
        socket.on("conversation:updated", handleConversationUpdated);

        return () => {
            socket.off("message:new", handleNewMessage);
            socket.off("conversation:updated", handleConversationUpdated);
        };
    }, [selectedConversation?.id, isActive, courseOfferingId]);

    useEffect(() => {
        return () => {
            if (pendingPreview) {
                URL.revokeObjectURL(pendingPreview);
            }
        };
    }, [pendingPreview]);

    const handleEmojiClick = (emojiData: any) => {
        setChatInput((prev) => prev + emojiData.emoji);
    };

    const handleSelectFile = (file: File) => {
        if (!selectedConversation?.id) {
            message.error("Chưa chọn phòng chat");
            return false;
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];

        if (!allowedTypes.includes(file.type)) {
            message.error("Chỉ hỗ trợ ảnh, PDF, Word, PowerPoint");
            return false;
        }

        if (file.size > 20 * 1024 * 1024) {
            message.error("File không được vượt quá 20MB");
            return false;
        }

        if (pendingPreview) {
            URL.revokeObjectURL(pendingPreview);
        }

        setPendingFile(file);

        if (file.type.startsWith("image/")) {
            setPendingPreview(URL.createObjectURL(file));
        } else {
            setPendingPreview("");
        }

        return false;
    };

    const handleSendMessage = async () => {
        if (!selectedConversation?.id) return;
        if (!chatInput.trim() && !pendingFile) return;

        const content = chatInput.trim();

        try {
            setSending(true);

            let imgUrl: string | undefined;

            if (pendingFile) {
                const formData = new FormData();
                formData.append("file", pendingFile);

                const res = await uploadChatFileAPI(formData);
                const payload =
                    res?.data?.data || res?.data?.result || res?.data;

                imgUrl = payload?.imgUrl || payload?.fileUrl || payload?.url;

                if (!imgUrl) {
                    message.error("Upload file thất bại");
                    return;
                }
            }

            await sendMessageAPI(selectedConversation.id, {
                content,
                imgUrl,
            });

            setChatInput("");
            clearPendingFile();
            setTimeout(scrollToBottom, 80);
        } catch (error) {
            console.log("SEND MESSAGE ERROR:", error);
            message.error("Gửi tin nhắn thất bại");
        } finally {
            setSending(false);
        }
    };

    const getLastMessageText = (item: any) => {
        if (item.lastMessage?.content) return item.lastMessage.content;
        if (item.lastMessage?.imgUrl) return "[File đính kèm]";
        return "Chưa có tin nhắn";
    };

    return (
        <Card
            style={{ borderRadius: 24, overflow: "hidden" }}
            bodyStyle={{ padding: 0 }}
        >
            <Row style={{ minHeight: 620 }}>
                <Col
                    xs={24}
                    lg={7}
                    style={{
                        borderRight: "1px solid #f0f0f0",
                        background: "#fafcff",
                    }}
                >
                    <div
                        style={{
                            padding: 20,
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    >
                        <Title level={4} style={{ margin: 0 }}>
                            <MessageOutlined /> Nhóm chat
                        </Title>
                    </div>

                    <Spin spinning={loadingRooms}>
                        <List
                            dataSource={conversations}
                            locale={{
                                emptyText: (
                                    <Empty description="Chưa có phòng chat" />
                                ),
                            }}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() =>
                                        setSelectedConversation(item)
                                    }
                                    style={{
                                        padding: 18,
                                        cursor: "pointer",
                                        background:
                                            selectedConversation?.id === item.id
                                                ? "#e6f4ff"
                                                : "transparent",
                                        transition: "0.2s",
                                    }}
                                >
                                    <Space align="start">
                                        <Badge count={item.unreadCount || 0}>
                                            <Avatar>
                                                {item.name?.charAt(0) || "C"}
                                            </Avatar>
                                        </Badge>

                                        <div style={{ maxWidth: 190 }}>
                                            <Text
                                                strong
                                                ellipsis
                                                style={{ display: "block" }}
                                            >
                                                {item.name || "Conversation"}
                                            </Text>

                                            <Text type="secondary" ellipsis>
                                                {getLastMessageText(item)}
                                            </Text>
                                        </div>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Spin>
                </Col>

                <Col xs={24} lg={17}>
                    {selectedConversation ? (
                        <div
                            style={{
                                height: 620,
                                display: "flex",
                                flexDirection: "column",
                                background: "#fff",
                            }}
                        >
                            <div
                                style={{
                                    height: 70,
                                    padding: "0 20px",
                                    borderBottom: "1px solid #f0f0f0",
                                    background: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Space>
                                    <Avatar size={46}>
                                        {selectedConversation.name?.charAt(0) ||
                                            "C"}
                                    </Avatar>

                                    <div>
                                        <Text strong style={{ fontSize: 16 }}>
                                            {selectedConversation.name}
                                        </Text>

                                        <br />

                                        <Text type="secondary">
                                            {selectedConversation.type ===
                                            "COURSE"
                                                ? "Phòng chat lớp học"
                                                : "Cuộc trò chuyện"}
                                        </Text>
                                    </div>
                                </Space>
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    position: "relative",
                                    minHeight: 0,
                                }}
                            >
                                <div
                                    ref={chatRef}
                                    onScroll={handleChatScroll}
                                    style={{
                                        height: "100%",
                                        overflowY: "auto",
                                        padding: 20,
                                        background:
                                            "linear-gradient(to bottom, #f8fbff, #ffffff)",
                                        fontFamily:
                                            '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif',
                                    }}
                                >
                                    <Spin spinning={loadingMessages}>
                                        <Space
                                            direction="vertical"
                                            size={16}
                                            style={{ width: "100%" }}
                                        >
                                            {messages.map((msg: any) => {
                                                const isMe =
                                                    msg.senderId === user?.id;

                                                return (
                                                    <div
                                                        key={msg.id}
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: isMe
                                                                ? "flex-end"
                                                                : "flex-start",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                maxWidth: 420,
                                                                minWidth: 70,
                                                                background: isMe
                                                                    ? "#1677ff"
                                                                    : "#fff",
                                                                color: isMe
                                                                    ? "#fff"
                                                                    : "#000",
                                                                padding:
                                                                    "10px 14px",
                                                                borderRadius: 18,
                                                                boxShadow:
                                                                    "0 4px 12px rgba(0,0,0,0.05)",
                                                                wordBreak:
                                                                    "break-word",
                                                                fontFamily:
                                                                    '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif',
                                                            }}
                                                        >
                                                            {!isMe && (
                                                                <div
                                                                    style={{
                                                                        fontWeight: 600,
                                                                        marginBottom: 5,
                                                                        fontSize: 13,
                                                                    }}
                                                                >
                                                                    {msg.sender
                                                                        ?.name ||
                                                                        msg
                                                                            .sender
                                                                            ?.fullName ||
                                                                        "Người dùng"}
                                                                </div>
                                                            )}

                                                            {msg.content && (
                                                                <div>
                                                                    {
                                                                        msg.content
                                                                    }
                                                                </div>
                                                            )}

                                                            {msg.imgUrl &&
                                                                (isImageUrl(
                                                                    msg.imgUrl,
                                                                ) ? (
                                                                    <img
                                                                        src={
                                                                            msg.imgUrl
                                                                        }
                                                                        alt="chat-file"
                                                                        onClick={() =>
                                                                            window.open(
                                                                                msg.imgUrl,
                                                                                "_blank",
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: "100%",
                                                                            maxWidth: 300,
                                                                            borderRadius: 12,
                                                                            marginTop:
                                                                                msg.content
                                                                                    ? 8
                                                                                    : 0,
                                                                            cursor: "pointer",
                                                                            objectFit:
                                                                                "cover",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        onClick={() =>
                                                                            window.open(
                                                                                msg.imgUrl,
                                                                                "_blank",
                                                                            )
                                                                        }
                                                                        style={{
                                                                            marginTop:
                                                                                msg.content
                                                                                    ? 8
                                                                                    : 0,
                                                                            padding: 12,
                                                                            borderRadius: 12,
                                                                            background:
                                                                                isMe
                                                                                    ? "rgba(255,255,255,0.18)"
                                                                                    : "#f1f4f9",
                                                                            cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        <Space>
                                                                            <FileOutlined />
                                                                            <Text
                                                                                style={{
                                                                                    color: isMe
                                                                                        ? "#fff"
                                                                                        : undefined,
                                                                                }}
                                                                            >
                                                                                Xem
                                                                                file
                                                                            </Text>
                                                                        </Space>
                                                                    </div>
                                                                ))}

                                                            <div
                                                                style={{
                                                                    textAlign:
                                                                        "right",
                                                                    marginTop: 4,
                                                                    fontSize: 11,
                                                                    opacity: 0.7,
                                                                }}
                                                            >
                                                                {msg.createdAt
                                                                    ? dayjs(
                                                                          msg.createdAt,
                                                                      ).format(
                                                                          "HH:mm",
                                                                      )
                                                                    : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </Space>
                                    </Spin>
                                </div>

                                {showScrollButton && (
                                    <Button
                                        type="primary"
                                        shape="round"
                                        onClick={scrollToBottom}
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            bottom: 18,
                                            zIndex: 20,
                                            boxShadow:
                                                "0 8px 20px rgba(22,119,255,0.25)",
                                        }}
                                    >
                                        {newMessageCount > 0
                                            ? `${newMessageCount} tin nhắn mới ↓`
                                            : "Tin mới ↓"}
                                    </Button>
                                )}
                            </div>

                            <div
                                style={{
                                    padding: "14px 20px",
                                    borderTop: "1px solid #f0f0f0",
                                    background: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    position: "relative",
                                }}
                            >
                                {pendingFile && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 76,
                                            left: 20,
                                            right: 20,
                                            padding: 12,
                                            borderRadius: 14,
                                            background: "#fff",
                                            border: "1px solid #e5e7eb",
                                            boxShadow:
                                                "0 8px 24px rgba(0,0,0,0.12)",
                                            zIndex: 10,
                                        }}
                                    >
                                        <Space align="start">
                                            {isImageFile(pendingFile) &&
                                            pendingPreview ? (
                                                <img
                                                    src={pendingPreview}
                                                    alt="preview"
                                                    style={{
                                                        width: 90,
                                                        height: 70,
                                                        objectFit: "cover",
                                                        borderRadius: 10,
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: 90,
                                                        height: 70,
                                                        borderRadius: 10,
                                                        background: "#f1f4f9",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 28,
                                                    }}
                                                >
                                                    📄
                                                </div>
                                            )}

                                            <div style={{ flex: 1 }}>
                                                <Text strong>
                                                    {pendingFile.name}
                                                </Text>
                                                <br />
                                                <Text type="secondary">
                                                    {(
                                                        pendingFile.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </Text>
                                                <br />
                                                <Text type="secondary">
                                                    Nhập thêm nội dung rồi bấm
                                                    Gửi
                                                </Text>
                                            </div>

                                            <Button
                                                danger
                                                size="small"
                                                onClick={clearPendingFile}
                                            >
                                                Xóa
                                            </Button>
                                        </Space>
                                    </div>
                                )}

                                <div style={{ position: "relative" }}>
                                    <Button
                                        shape="circle"
                                        size="large"
                                        icon={<SmileOutlined />}
                                        onClick={() =>
                                            setOpenEmoji((prev) => !prev)
                                        }
                                    />

                                    {openEmoji && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: 54,
                                                left: 0,
                                                zIndex: 1000,
                                                boxShadow:
                                                    "0 10px 30px rgba(0,0,0,0.15)",
                                                borderRadius: 16,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <EmojiPicker
                                                onEmojiClick={handleEmojiClick}
                                                width={320}
                                                height={420}
                                                searchDisabled={false}
                                                skinTonesDisabled={false}
                                                previewConfig={{
                                                    showPreview: false,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Upload
                                    showUploadList={false}
                                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
                                    beforeUpload={(file) => {
                                        handleSelectFile(file);
                                        return false;
                                    }}
                                >
                                    <Button
                                        shape="circle"
                                        size="large"
                                        icon={<PictureOutlined />}
                                        loading={sending}
                                    />
                                </Upload>

                                <Input
                                    style={{
                                        fontFamily:
                                            '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif',
                                    }}
                                    size="large"
                                    value={chatInput}
                                    placeholder={
                                        pendingFile
                                            ? "Nhập nội dung kèm file..."
                                            : "Nhập tin nhắn..."
                                    }
                                    onChange={(e) =>
                                        setChatInput(e.target.value)
                                    }
                                    onPressEnter={handleSendMessage}
                                />

                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SendOutlined />}
                                    loading={sending}
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim() && !pendingFile}
                                >
                                    Gửi
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                height: 620,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Empty description="Chọn phòng chat để bắt đầu" />
                        </div>
                    )}
                </Col>
            </Row>
        </Card>
    );
};

export default CourseChatSection;
