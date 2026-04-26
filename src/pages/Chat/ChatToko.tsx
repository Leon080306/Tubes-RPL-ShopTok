import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
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
import StorefrontIcon from "@mui/icons-material/Storefront";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useSearchParams } from "react-router";
import type { ChatSession } from "../../type";
import { useAppSelector } from "../../hooks/useAppSelector";

export default function ChatToko() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const { userInfo } = useAppSelector((state) => state.auth);
  const user_id = userInfo?.user_id;

  const activeChat = chatSessions.find((c) => c.shop_id === selectedShopId);

  // ─── Filtered Sessions ────────────────────────────────────
  const filteredSessions = chatSessions.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.shop_name.toLowerCase().includes(q) ||
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
    if (!user_id) return;
    try {
      const res = await fetch(`/api/chats?user_id=${user_id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChatSessions(data.records ?? []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto-select shop from query param once sessions are loaded
  useEffect(() => {
    if (loading) return;
    const shopId = searchParams.get("shop_id");
    if (shopId) setSelectedShopId(shopId);
  }, [loading, searchParams]);

  // Polling: refresh every 5s
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchSessions();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSessions]);

  // ─── Send Message ─────────────────────────────────────────
  const handleSendMessage = async () => {
    if (inputMsg.trim() === "" || !selectedShopId || !user_id) return;

    const messageText = inputMsg.trim();
    setInputMsg("");
    setSending(true);

    // Optimistic update
    setChatSessions((prev) =>
      prev.map((session) => {
        if (session.shop_id !== selectedShopId) return session;
        return {
          ...session,
          last_message: messageText,
          messages: [
            ...session.messages,
            {
              chat_id: `temp-${Date.now()}`,
              sender_role: "customer",
              message: messageText,
              created_at: new Date().toISOString(),
            },
          ],
        };
      })
    );

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          shop_id: selectedShopId,
          message: messageText,
          sender_role: "customer",
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Refresh to get real chat_id
      await fetchSessions();
    } catch (error) {
      console.error("Error sending message:", error);
      // Revert optimistic update on failure
      await fetchSessions();
    } finally {
      setSending(false);
    }
  };

  // ─── Format Time ──────────────────────────────────────────
  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  // ─── Format Last Message Time ─────────────────────────────
  const getLastMessageTime = (session: ChatSession) => {
    const msgs = session.messages;
    if (msgs.length === 0) return "";
    return formatTime(msgs[msgs.length - 1].created_at);
  };

  // ─── Group Messages by Date ───────────────────────────────
  const groupMessagesByDate = (messages: ChatSession["messages"]) => {
    const groups: { date: string; messages: ChatSession["messages"] }[] = [];

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

  // ─── Render ───────────────────────────────────────────────
  return (
    <Box
      sx={{
        height: "calc(100vh - 120px)",
        mt: { xs: 0, md: 3 },
        display: "flex",
        px: { xs: 0, md: 10 },
        bgcolor: "#f9f9f9",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          width: "100%",
          borderRadius: { xs: 0, md: 2 },
          overflow: "hidden",
        }}
      >
        {/* ═══════════ SIDEBAR ═══════════ */}
        <Box
          sx={{
            width: { xs: selectedShopId ? "0%" : "100%", md: "35%" },
            borderRight: "1px solid #eee",
            display: { xs: selectedShopId ? "none" : "block", md: "block" },
            bgcolor: "white",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#003f29",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton onClick={() => navigate(-1)} sx={{ color: "white", mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              Chat Toko
            </Typography>
          </Box>

          {/* Search */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #eee" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f0f2f5",
                borderRadius: 5,
                px: 1.5,
                py: 0.5,
              }}
            >
              <SearchIcon sx={{ color: "#999", mr: 1, fontSize: 20 }} />
              <InputBase
                placeholder="Cari toko..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: 13 }}
              />
            </Box>
          </Box>

          {/* Session List */}
          <List
            sx={{
              overflowY: "auto",
              height: "calc(100% - 130px)",
              p: 0,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#ccc", borderRadius: 2 },
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress size={24} sx={{ color: "#003f29" }} />
              </Box>
            ) : filteredSessions.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? "Tidak ada hasil" : "Belum ada chat"}
                </Typography>
              </Box>
            ) : (
              filteredSessions.map((chat) => (
                <React.Fragment key={chat.shop_id}>
                  <ListItemButton
                    selected={selectedShopId === chat.shop_id}
                    onClick={() => setSelectedShopId(chat.shop_id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&.Mui-selected": { bgcolor: "#e8f5e9" },
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#e8f5e9", width: 44, height: 44 }}>
                        <StorefrontIcon sx={{ color: "#003f29" }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography fontSize={14} fontWeight={700} color="#333" noWrap>
                            {chat.shop_name}
                          </Typography>
                          <Typography fontSize={11} color="text.secondary">
                            {getLastMessageTime(chat)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            fontSize={13}
                            color="text.secondary"
                            noWrap
                            sx={{ flex: 1, mr: 1 }}
                          >
                            {chat.last_message}
                          </Typography>
                          {chat.unread_count > 0 && (
                            <Box
                              sx={{
                                bgcolor: "#d32f2f",
                                color: "white",
                                borderRadius: "50%",
                                minWidth: 20,
                                height: 20,
                                fontSize: 11,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {chat.unread_count}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Box>

        {/* ═══════════ CHAT AREA ═══════════ */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: !selectedShopId ? "none" : "flex", md: "flex" },
            flexDirection: "column",
            bgcolor: "#f0f2f5",
          }}
        >
          {activeChat ? (
            <>
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={() => setSelectedShopId(null)}
                  sx={{ display: { md: "none" }, mr: 1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar sx={{ mr: 2, bgcolor: "#003f29", width: 40, height: 40 }}>
                  {activeChat.shop_name[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                    {activeChat.shop_name}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {activeChat.messages.length > 0 ? "Online" : ""}
                  </Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box
                ref={scrollRef}
                sx={{
                  flexGrow: 1,
                  p: 3,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": { bgcolor: "#ccc", borderRadius: 2 },
                }}
              >
                {groupMessagesByDate(activeChat.messages).map((group) => (
                  <React.Fragment key={group.date}>
                    {/* Date Separator */}
                    <Box sx={{ display: "flex", justifyContent: "center", my: 1.5 }}>
                      <Typography
                        fontSize={11}
                        color="text.secondary"
                        sx={{
                          bgcolor: "white",
                          px: 2,
                          py: 0.5,
                          borderRadius: 5,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        }}
                      >
                        {group.date}
                      </Typography>
                    </Box>

                    {/* Messages in group */}
                    {group.messages.map((m, idx) => {
                      const isCustomer = m.sender_role === "customer";

                      return (
                        <Box
                          key={m.chat_id ?? idx}
                          sx={{
                            alignSelf: isCustomer ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: isCustomer ? "#003f29" : "white",
                              color: isCustomer ? "white" : "#333",
                              p: "10px 16px",
                              borderRadius: isCustomer
                                ? "18px 18px 0 18px"
                                : "18px 18px 18px 0",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                            >
                              {m.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                textAlign: "right",
                                opacity: 0.7,
                                fontSize: "0.7rem",
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
              <Box sx={{ p: 2, bgcolor: "white", borderTop: "1px solid #eee" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tulis pesan..."
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
                  InputProps={{
                    sx: { borderRadius: 5, bgcolor: "#f0f2f5" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendMessage}
                          disabled={!inputMsg.trim() || sending}
                          sx={{
                            color: inputMsg.trim() && !sending ? "#003f29" : "#ccc",
                          }}
                        >
                          {sending ? (
                            <CircularProgress size={20} sx={{ color: "#003f29" }} />
                          ) : (
                            <SendIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          ) : (
            /* Empty State */
            <Stack
              sx={{
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: "text.secondary",
                p: 3,
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
              <Typography fontWeight={600} mb={0.5}>
                Chat Toko
              </Typography>
              <Typography variant="body2">
                Pilih salah satu toko untuk mulai chat
              </Typography>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}