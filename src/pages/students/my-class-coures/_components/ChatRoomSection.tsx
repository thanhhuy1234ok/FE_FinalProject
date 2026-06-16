import {
    FileOutlined,
    MessageOutlined,
    PictureOutlined,
    SendOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    Input,
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
    createCourseConversationAPI,
    getConversationMessagesAPI,
    seenConversationAPI,
    sendMessageAPI,
    uploadChatFileAPI,
} from "@/services/api";
import { socket } from "@/socket/socket";
import { useCurrentApp } from "@/context/use.curent";

const { Title, Text } = Typography;

type ChatRoomSectionProps = {
    courseOfferingId: number;
    isActive?: boolean;
    onSeen?: () => void;
};

const isImageUrl = (url?: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url.split("?")[0]);
};

const isImageFile = (file?: File | null) => {
    return Boolean(file?.type?.startsWith("image/"));
};

const ChatRoomSection = ({
    courseOfferingId,
    isActive = false,
    onSeen,
}: ChatRoomSectionProps) => {
    const { user } = useCurrentApp();
    const chatRef = useRef<HTMLDivElement>(null);

    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState("");

    const [loading, setLoading] = useState(false);
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

    const handleChatScroll = () => {
        if (isNearBottom()) {
            setShowScrollButton(false);
            setNewMessageCount(0);
        }
    };

    const markSeen = async (conversationId: number) => {
        if (!isActive) return;

        try {
            await seenConversationAPI(conversationId);
            onSeen?.();
        } catch (error) {
            console.log("SEEN CONVERSATION ERROR:", error);
        }
    };

    const fetchMessages = async (conversationId: number) => {
        try {
            setLoadingMessages(true);

            const res = await getConversationMessagesAPI(conversationId);
            const payload = res?.data?.data || res?.data?.result || res?.data;

            setMessages(payload || []);

            setTimeout(() => {
                scrollToBottom();
            }, 80);
        } catch (error) {
            console.log("GET MESSAGES ERROR:", error);
            message.error("Không tải được tin nhắn");
        } finally {
            setLoadingMessages(false);
        }
    };

    const fetchConversation = async () => {
        try {
            setLoading(true);

            const res = await createCourseConversationAPI(courseOfferingId);
            const payload = res?.data?.data || res?.data?.result || res?.data;

            setConversation(payload);

            if (payload?.id) {
                await fetchMessages(payload.id);

                socket.emit("conversation:join", {
                    conversationId: payload.id,
                });

                if (isActive) {
                    await markSeen(payload.id);
                }
            }
        } catch (error) {
            console.log("CREATE COURSE CONVERSATION ERROR:", error);
            message.error("Không tải được phòng chat");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!courseOfferingId) return;

        fetchConversation();
    }, [courseOfferingId]);

    useEffect(() => {
        if (!conversation?.id) return;

        return () => {
            socket.emit("conversation:leave", {
                conversationId: conversation.id,
            });
        };
    }, [conversation?.id]);

    useEffect(() => {
        if (!isActive || !conversation?.id) return;

        markSeen(conversation.id);
    }, [isActive, conversation?.id]);

    useEffect(() => {
        const handleNewMessage = (payload: any) => {
            const newMessage = payload?.message;
            if (!newMessage) return;

            if (newMessage.conversationId !== conversation?.id) return;

            const nearBottom = isNearBottom();

            setMessages((prev) => {
                const existed = prev.some((item) => item.id === newMessage.id);
                if (existed) return prev;

                return [...prev, newMessage];
            });

            if (isActive) {
                markSeen(conversation.id);
            }

            if (nearBottom) {
                setTimeout(() => {
                    scrollToBottom();
                }, 50);
            } else {
                setShowScrollButton(true);
                setNewMessageCount((prev) => prev + 1);
            }
        };

        socket.on("message:new", handleNewMessage);

        return () => {
            socket.off("message:new", handleNewMessage);
        };
    }, [conversation?.id, isActive]);

    useEffect(() => {
        if (isNearBottom()) {
            scrollToBottom();
        }
    }, [messages]);

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
        if (!conversation?.id) {
            message.error("Không tìm thấy phòng chat");
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

    const clearPendingFile = () => {
        if (pendingPreview) {
            URL.revokeObjectURL(pendingPreview);
        }

        setPendingFile(null);
        setPendingPreview("");
    };

    const handleSendMessage = async () => {
        if (!conversation?.id) return;
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

            await sendMessageAPI(conversation.id, {
                content,
                imgUrl,
            });

            setChatInput("");
            clearPendingFile();

            setTimeout(() => {
                scrollToBottom();
            }, 80);
        } catch (error) {
            console.log("SEND MESSAGE ERROR:", error);
            message.error("Gửi tin nhắn thất bại");
        } finally {
            setSending(false);
        }
    };

    const lastMessage = messages?.[messages.length - 1];

    return (
        <Card
            style={{
                borderRadius: 20,
                overflow: "hidden",
            }}
            bodyStyle={{ padding: 0 }}
        >
            <Spin spinning={loading}>
                <Row style={{ minHeight: 620 }}>
                    <Col
                        xs={24}
                        lg={7}
                        style={{
                            borderRight: "1px solid #eef1f5",
                            background: "#f8fafc",
                        }}
                    >
                        <div
                            style={{
                                height: 70,
                                padding: "0 20px",
                                display: "flex",
                                alignItems: "center",
                                borderBottom: "1px solid #eef1f5",
                                background: "#fff",
                            }}
                        >
                            <Title level={4} style={{ margin: 0 }}>
                                <MessageOutlined /> Nhóm chat
                            </Title>
                        </div>

                        {conversation ? (
                            <div
                                style={{
                                    padding: 14,
                                    background: "#e6f4ff",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #eef1f5",
                                }}
                            >
                                <Space align="start">
                                    <Avatar
                                        size={38}
                                        style={{
                                            background: "#bfbfbf",
                                            color: "#fff",
                                        }}
                                    >
                                        {conversation?.name?.charAt(0) || "C"}
                                    </Avatar>

                                    <div style={{ minWidth: 0 }}>
                                        <Text
                                            strong
                                            ellipsis
                                            style={{
                                                maxWidth: 230,
                                                display: "block",
                                            }}
                                        >
                                            {conversation?.name}
                                        </Text>

                                        <Text type="secondary" ellipsis>
                                            {lastMessage?.content ||
                                                (lastMessage?.imgUrl
                                                    ? "[File đính kèm]"
                                                    : "Phòng chat lớp học")}
                                        </Text>
                                    </div>
                                </Space>
                            </div>
                        ) : (
                            <Empty
                                description="Chưa có nhóm chat"
                                style={{ marginTop: 80 }}
                            />
                        )}
                    </Col>

                    <Col xs={24} lg={17}>
                        {!conversation ? (
                            <div
                                style={{
                                    height: 620,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Empty description="Chưa có phòng chat" />
                            </div>
                        ) : (
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
                                        display: "flex",
                                        alignItems: "center",
                                        borderBottom: "1px solid #eef1f5",
                                        background: "#fff",
                                    }}
                                >
                                    <Space>
                                        <Avatar
                                            size={46}
                                            style={{
                                                background: "#bfbfbf",
                                                color: "#fff",
                                            }}
                                        >
                                            {conversation?.name?.charAt(0) ||
                                                "C"}
                                        </Avatar>

                                        <div>
                                            <Text
                                                strong
                                                style={{ fontSize: 16 }}
                                            >
                                                {conversation?.name}
                                            </Text>
                                            <br />
                                            <Text type="secondary">
                                                Phòng chat lớp học
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
                                            padding: "24px 20px",
                                            background: "#f7f9fc",
                                            fontFamily:
                                                '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif',
                                        }}
                                    >
                                        <Spin spinning={loadingMessages}>
                                            <Space
                                                direction="vertical"
                                                size={12}
                                                style={{ width: "100%" }}
                                            >
                                                {messages.map((msg: any) => {
                                                    const isMe =
                                                        msg.senderId ===
                                                        user?.id;

                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            style={{
                                                                display: "flex",
                                                                justifyContent:
                                                                    isMe
                                                                        ? "flex-end"
                                                                        : "flex-start",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    maxWidth: 420,
                                                                    minWidth: 70,
                                                                    background:
                                                                        isMe
                                                                            ? "#1677ff"
                                                                            : "#fff",
                                                                    color: isMe
                                                                        ? "#fff"
                                                                        : "#1f1f1f",
                                                                    padding:
                                                                        "10px 14px",
                                                                    borderRadius: 16,
                                                                    boxShadow:
                                                                        "0 4px 14px rgba(0,0,0,0.06)",
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
                                                                        {msg
                                                                            .sender
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
                                                                            style={{
                                                                                width: "100%",
                                                                                maxWidth: 300,
                                                                                borderRadius: 12,
                                                                                cursor: "pointer",
                                                                                marginTop:
                                                                                    msg.content
                                                                                        ? 8
                                                                                        : 0,
                                                                            }}
                                                                            onClick={() =>
                                                                                window.open(
                                                                                    msg.imgUrl,
                                                                                    "_blank",
                                                                                )
                                                                            }
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
                                                                                padding: 12,
                                                                                borderRadius: 12,
                                                                                background:
                                                                                    isMe
                                                                                        ? "rgba(255,255,255,0.18)"
                                                                                        : "rgba(0,0,0,0.05)",
                                                                                cursor: "pointer",
                                                                                marginTop:
                                                                                    msg.content
                                                                                        ? 8
                                                                                        : 0,
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
                                        borderTop: "1px solid #eef1f5",
                                        background: "#fff",
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "center",
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
                                                            background:
                                                                "#f1f4f9",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
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
                                                        Nhập thêm nội dung rồi
                                                        bấm Gửi
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
                                                    onEmojiClick={
                                                        handleEmojiClick
                                                    }
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
                                        onPaste={(e) => {
                                            const items =
                                                e.clipboardData?.items;

                                            if (!items) return;

                                            for (const item of items) {
                                                if (
                                                    item.type.startsWith(
                                                        "image/",
                                                    )
                                                ) {
                                                    const file =
                                                        item.getAsFile();

                                                    if (file) {
                                                        handleSelectFile(file);
                                                        message.success(
                                                            "Đã dán ảnh chụp màn hình",
                                                        );
                                                    }
                                                }
                                            }
                                        }}
                                    />

                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<SendOutlined />}
                                        loading={sending}
                                        onClick={handleSendMessage}
                                        disabled={
                                            !chatInput.trim() && !pendingFile
                                        }
                                    >
                                        Gửi
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>
            </Spin>
        </Card>
    );
};

export default ChatRoomSection;
