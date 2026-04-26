import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Typography,
    Stack,
    Avatar,
    TextField,
    IconButton,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Divider,
    InputAdornment,
    InputBase,
    CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { useAppSelector } from "../../hooks/useAppSelector";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
    chat_id: string;
    sender_role: "customer" | "seller";
    message: string;
    created_at: string;
}

interface SellerChatSession {
    user_id: string;
    customer_name: string;
    customer_pic: string;
    shop_id: string;
    last_message: string;
    unread_count: number;
    messages: ChatMessage[];
}

const PRIMARY = "#003f29";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatCustomerEmbed() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [chatSessions, setChatSessions] = useState<SellerChatSession[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [inputMsg, setInputMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const { userInfo } = useAppSelector((state) => state.auth);
    const seller_id = userInfo?.user_id;
    const shop_id = userInfo?.shop_info?.shop_id;

    const activeChat = chatSessions.find((c) => c.user_id === selectedUserId);

    const filteredSessions = chatSessions.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.customer_name.toLowerCase().includes(q) ||
            c.last_message.toLowerCase().includes(q)
        );
    });

    // ─── Auto Scroll ──────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeChat?.messages]);

    // ─── Fetch Sessions ───────────────────────────────────────
    const fetchSessions = useCallback(async () => {
        if (!seller_id || !shop_id) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(
                `/api/chats/shop?shop_id=${shop_id}&seller_id=${seller_id}`,
                { credentials: "include" }
            );
            if (!res.ok) throw new Error("Failed to fetch chats");
            const data = await res.json();
            setChatSessions(data.records ?? []);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
        }
    }, [seller_id, shop_id]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        pollRef.current = setInterval(fetchSessions, 5000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchSessions]);

    // ─── Send Message ─────────────────────────────────────────
    const handleSendMessage = async () => {
        if (!inputMsg.trim() || !selectedUserId || !seller_id || !shop_id) return;

        const messageText = inputMsg.trim();
        setInputMsg("");
        setSending(true);

        setChatSessions((prev) =>
            prev.map((session) => {
                if (session.user_id !== selectedUserId) return session;
                return {
                    ...session,
                    last_message: messageText,
                    messages: [
                        ...session.messages,
                        {
                            chat_id: `temp-${Date.now()}`,
                            sender_role: "seller" as const,
                            message: messageText,
                            created_at: new Date().toISOString(),
                        },
                    ],
                };
            })
        );

        try {
            const res = await fetch("/api/chats/seller", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    seller_id,
                    shop_id,
                    user_id: selectedUserId,
                    message: messageText,
                }),
            });
            if (!res.ok) throw new Error("Failed to send message");
            await fetchSessions();
        } catch (error) {
            console.error("Error sending message:", error);
            await fetchSessions();
        } finally {
            setSending(false);
        }
    };

    // ─── Format Time ──────────────────────────────────────────
    const formatTime = (iso: string) => {
        const date = new Date(iso);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleDateString([], { day: "2-digit", month: "short" });
    };

    const getLastMessageTime = (session: SellerChatSession) => {
        const msgs = session.messages;
        if (msgs.length === 0) return "";
        return formatTime(msgs[msgs.length - 1].created_at);
    };

    const groupMessagesByDate = (messages: ChatMessage[]) => {
        const groups: { date: string; messages: ChatMessage[] }[] = [];
        for (const msg of messages) {
            const dateStr = new Date(msg.created_at).toLocaleDateString([], {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            });
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.date === dateStr) {
                lastGroup.messages.push(msg);
            } else {
                groups.push({ date: dateStr, messages: [msg] });
            }
        }
        return groups;
    };

    // ─── Unread count for sidebar badge ───────────────────────
    const totalUnread = chatSessions.reduce((acc, c) => acc + c.unread_count, 0);

    return (
        <Box
            sx={{
                height: "calc(100vh - 48px)", // fit inside dashboard content area (p:3 = 24px * 2)
                display: "flex",
                borderRadius: 2.5,
                overflow: "hidden",
                border: "1px solid #e8ecf0",
                bgcolor: "white",
            }}
        >
            {/* ═══════════ SIDEBAR ═══════════ */}
            <Box
                sx={{
                    width: { xs: selectedUserId ? 0 : "100%", md: 320 },
                    minWidth: { md: 320 },
                    borderRight: "1px solid #e8ecf0",
                    display: {
                        xs: selectedUserId ? "none" : "flex",
                        md: "flex",
                    },
                    flexDirection: "column",
                    bgcolor: "white",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2.5, py: 2,
                        borderBottom: "1px solid #e8ecf0",
                    }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#0d1f13" }}>
                        Messages
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                        {totalUnread > 0
                            ? `${totalUnread} unread message${totalUnread !== 1 ? "s" : ""}`
                            : `${chatSessions.length} conversation${chatSessions.length !== 1 ? "s" : ""}`
                        }
                    </Typography>
                </Box>

                {/* Search */}
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <Box
                        sx={{
                            display: "flex", alignItems: "center",
                            bgcolor: "#f0f3f7", borderRadius: 2, px: 1.5, py: 0.6,
                        }}
                    >
                        <SearchIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 18 }} />
                        <InputBase
                            placeholder="Search customers…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, fontSize: 13 }}
                        />
                    </Box>
                </Box>

                {/* Session List */}
                <List
                    sx={{
                        flex: 1, overflowY: "auto", p: 0,
                        "&::-webkit-scrollbar": { width: 4 },
                        "&::-webkit-scrollbar-thumb": { bgcolor: "#e2e8f0", borderRadius: 2 },
                    }}
                >
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress size={24} sx={{ color: PRIMARY }} />
                        </Box>
                    ) : filteredSessions.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>
                                {searchQuery ? "No results found" : "No messages yet"}
                            </Typography>
                        </Box>
                    ) : (
                        filteredSessions.map((chat) => (
                            <React.Fragment key={chat.user_id}>
                                <ListItemButton
                                    selected={selectedUserId === chat.user_id}
                                    onClick={() => setSelectedUserId(chat.user_id)}
                                    sx={{
                                        py: 1.5, px: 2,
                                        "&.Mui-selected": {
                                            bgcolor: "#f0fdf4",
                                            borderRight: `3px solid ${PRIMARY}`,
                                        },
                                        "&:hover": { bgcolor: "#f8fafc" },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={chat.customer_pic ? `/api/${chat.customer_pic}` : "/placeholder.png"}
                                            sx={{ bgcolor: "#dcfce7", width: 42, height: 42 }}
                                        >
                                            <PersonIcon sx={{ color: PRIMARY, fontSize: 20 }} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 13.5,
                                                        fontWeight: chat.unread_count > 0 ? 700 : 600,
                                                        color: "#0d1f13",
                                                    }}
                                                    noWrap
                                                >
                                                    {chat.customer_name}
                                                </Typography>
                                                <Typography sx={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, ml: 1 }}>
                                                    {getLastMessageTime(chat)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 12.5,
                                                        color: chat.unread_count > 0 ? "#475569" : "#94a3b8",
                                                        fontWeight: chat.unread_count > 0 ? 600 : 400,
                                                    }}
                                                    noWrap
                                                >
                                                    {chat.last_message}
                                                </Typography>
                                                {chat.unread_count > 0 && (
                                                    <Box
                                                        sx={{
                                                            bgcolor: PRIMARY, color: "white",
                                                            borderRadius: "50%",
                                                            minWidth: 20, height: 20,
                                                            fontSize: 10, fontWeight: 700,
                                                            display: "flex", alignItems: "center",
                                                            justifyContent: "center", flexShrink: 0, ml: 1,
                                                        }}
                                                    >
                                                        {chat.unread_count}
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                                <Divider sx={{ borderColor: "#f8fafc" }} />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Box>

            {/* ═══════════ CHAT AREA ═══════════ */}
            <Box
                sx={{
                    flex: 1,
                    display: {
                        xs: !selectedUserId ? "none" : "flex",
                        md: "flex",
                    },
                    flexDirection: "column",
                    bgcolor: "#fafbfc",
                }}
            >
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <Box
                            sx={{
                                px: 2.5, py: 1.75,
                                bgcolor: "white",
                                borderBottom: "1px solid #e8ecf0",
                                display: "flex", alignItems: "center",
                            }}
                        >
                            <IconButton
                                onClick={() => setSelectedUserId(null)}
                                size="small"
                                sx={{
                                    display: { md: "none" }, mr: 1,
                                    color: "#64748b",
                                    "&:hover": { bgcolor: "#f0f3f7" },
                                }}
                            >
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                            <Avatar
                                src={activeChat.customer_pic ? `/api/${activeChat.customer_pic}` : "/placeholder.png"}
                                sx={{ mr: 1.5, bgcolor: PRIMARY, width: 38, height: 38, fontSize: 14, fontWeight: 700 }}
                            >
                                {activeChat.customer_name[0]}
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0d1f13", lineHeight: 1.2 }}>
                                    {activeChat.customer_name}
                                </Typography>
                                <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                                    Customer
                                </Typography>
                            </Box>
                        </Box>

                        {/* Messages */}
                        <Box
                            ref={scrollRef}
                            sx={{
                                flex: 1, px: 3, py: 2,
                                overflowY: "auto",
                                display: "flex", flexDirection: "column", gap: 0.75,
                                "&::-webkit-scrollbar": { width: 4 },
                                "&::-webkit-scrollbar-thumb": { bgcolor: "#e2e8f0", borderRadius: 2 },
                            }}
                        >
                            {groupMessagesByDate(activeChat.messages).map((group) => (
                                <React.Fragment key={group.date}>
                                    <Box sx={{ display: "flex", justifyContent: "center", my: 1.5 }}>
                                        <Typography
                                            sx={{
                                                fontSize: 11, color: "#94a3b8",
                                                bgcolor: "white", px: 2, py: 0.5,
                                                borderRadius: 5,
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                            }}
                                        >
                                            {group.date}
                                        </Typography>
                                    </Box>

                                    {group.messages.map((m, idx) => {
                                        const isSeller = m.sender_role === "seller";
                                        return (
                                            <Box
                                                key={m.chat_id ?? idx}
                                                sx={{
                                                    alignSelf: isSeller ? "flex-end" : "flex-start",
                                                    maxWidth: "70%",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        bgcolor: isSeller ? PRIMARY : "white",
                                                        color: isSeller ? "white" : "#334155",
                                                        px: 2, py: 1.25,
                                                        borderRadius: isSeller
                                                            ? "16px 16px 4px 16px"
                                                            : "16px 16px 16px 4px",
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: 13, lineHeight: 1.5,
                                                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                                                        }}
                                                    >
                                                        {m.message}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 10.5, mt: 0.5,
                                                            textAlign: "right",
                                                            opacity: 0.6,
                                                        }}
                                                    >
                                                        {formatTime(m.created_at)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </Box>

                        {/* Input */}
                        <Box
                            sx={{
                                px: 2.5, py: 1.5,
                                bgcolor: "white", borderTop: "1px solid #e8ecf0",
                            }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type a message…"
                                value={inputMsg}
                                onChange={(e) => setInputMsg(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                multiline
                                maxRows={4}
                                autoComplete="off"
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 3, bgcolor: "#f8fafc", fontSize: 13 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleSendMessage}
                                                    disabled={!inputMsg.trim() || sending}
                                                    size="small"
                                                    sx={{
                                                        color: inputMsg.trim() && !sending ? PRIMARY : "#cbd5e1",
                                                        "&:hover": { bgcolor: "#f0fdf4" },
                                                    }}
                                                >
                                                    {sending ? (
                                                        <CircularProgress size={18} sx={{ color: PRIMARY }} />
                                                    ) : (
                                                        <SendIcon sx={{ fontSize: 20 }} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Box>
                    </>
                ) : (
                    <Stack
                        sx={{
                            height: "100%", justifyContent: "center",
                            alignItems: "center", textAlign: "center", p: 3,
                        }}
                    >
                        <Box
                            sx={{
                                width: 80, height: 80, borderRadius: "50%",
                                bgcolor: "#f0f3f7", display: "flex",
                                alignItems: "center", justifyContent: "center", mb: 2.5,
                            }}
                        >
                            <ChatBubbleOutlineIcon sx={{ fontSize: 36, color: "#cbd5e1" }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#0d1f13", mb: 0.5 }}>
                            Customer Messages
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#94a3b8", maxWidth: 280 }}>
                            Select a conversation from the left to start replying to your customers
                        </Typography>
                    </Stack>
                )}
            </Box>
        </Box>
    );
}