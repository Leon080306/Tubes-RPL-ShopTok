import React, { useState, useEffect, useRef } from "react"
import { Box, Typography, Paper, Stack, Avatar, TextField, IconButton, List, ListItemButton, ListItemAvatar, ListItemText, Divider, InputAdornment, } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import StorefrontIcon from "@mui/icons-material/Storefront"
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"
import { useNavigate } from "react-router"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useAppDispatch } from "../../hooks/useAppDispatch"
import { authActions } from "../../store/authSlice"
import { type ChatSession } from "../../type"

export default function ChatToko() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const scrollRef = useRef<HTMLDivElement>(null)

  const { userInfo } = useAppSelector((state) => state.auth)
  const chatSessions = userInfo?.chats || []

  const [selectedShopId, setSelectedShopId] = useState<number | null>(null)
  const [inputMsg, setInputMsg] = useState("")

  // buat nyari chat yg lagi aktif brdsrkn id
  const activeChat = chatSessions.find((c) => c.shop_id === selectedShopId)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeChat?.messages])

  // dummy
  useEffect(() => {
    if (chatSessions.length === 0) {
      const dummyData: ChatSession[] = [
        {
          shop_id: 101,
          shop_name: "Beauty Store",
          last_message: "Halo kak, barangnya udh dikirim ya",
          unread_count: 1,
          messages: [
            { chat_id: 1,
              sender_role: "customer",
              message: "Halo, apakah barang sudah dikirim?",
              created_at: new Date().toISOString()
            },
            { chat_id: 2,
              sender_role: "seller",
              message: "Halo kak, barangnya udh dikirim ya",
              created_at: new Date().toISOString()
            },
          ],
        },
      ]
      dispatch(authActions.setChats(dummyData))
    }
  }, [dispatch, chatSessions.length])

  const handleSendMessage = () => {
    if (inputMsg.trim() === "" || !selectedShopId) return

    dispatch(authActions.sendNewMessage({ 
      shopId: selectedShopId, 
      message: inputMsg 
    }))

    setInputMsg("")
  }

  return (
    <Box sx={{ 
      height: "calc(100vh - 120px)", 
      mt: { xs: 0, md: 3 }, 
      display: "flex", 
      px: { xs: 0, md: 10 },
      bgcolor: "#f9f9f9" 
    }}>
      <Paper elevation={3} sx={{ display: "flex", width: "100%", borderRadius: { xs: 0, md: 2 }, overflow: "hidden" }}>
        
        {/* sidebar toko */}
        <Box sx={{ 
          width: { xs: selectedShopId ? "0%" : "100%", md: "35%" }, 
          borderRight: "1px solid #eee", 
          display: { xs: selectedShopId ? "none" : "block", md: "block" },
          bgcolor: "white"
        }}>
          <Box sx={{ p: 2, bgcolor: "#003f29", color: "white", display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => navigate("/profile")} sx={{ color: "white", mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>Chat Toko</Typography>
          </Box>

          <List sx={{ overflowY: "auto", height: "calc(100% - 70px)", p: 0 }}>
            {chatSessions.map((chat) => (
              <React.Fragment key={chat.shop_id}>
                <ListItemButton 
                  selected={selectedShopId === chat.shop_id}
                  onClick={() => setSelectedShopId(chat.shop_id)}
                  sx={{ py: 2, "&.Mui-selected": { bgcolor: "#e8f5e9" } }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#f0f0f0" }}>
                      <StorefrontIcon sx={{ color: "#003f29" }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={chat.shop_name} 
                    secondary={chat.last_message}
                    primaryTypographyProps={{ fontWeight: 700, color: "#333" }}
                    secondaryTypographyProps={{ noWrap: true, fontSize: "0.85rem" }}
                  />
                  {chat.unread_count > 0 && (
                    <Box sx={{ 
                      bgcolor: "#d32f2f", color: "white", borderRadius: "50%", 
                      minWidth: 20, height: 20, fontSize: 11, 
                      display: "flex", alignItems: "center", justifyContent: "center", ml: 1 
                    }}>
                      {chat.unread_count}
                    </Box>
                  )}
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* chatnya */}
        <Box sx={{ 
          flexGrow: 1, 
          display: { xs: !selectedShopId ? "none" : "flex", md: "flex" }, 
          flexDirection: "column", 
          bgcolor: "#f0f2f5" 
        }}>
          {activeChat ? (
            <>
              <Box sx={{ p: 2, bgcolor: "white", borderBottom: "1px solid #eee", display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => setSelectedShopId(null)} sx={{ display: { md: "none" }, mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <Avatar sx={{ mr: 2, bgcolor: "#003f29" }}>{activeChat.shop_name[0]}</Avatar>
                <Typography variant="subtitle1" fontWeight={700}>{activeChat.shop_name}</Typography>
              </Box>

              <Box ref={scrollRef}
                sx={{ flexGrow: 1, p: 3, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                {activeChat.messages.map((m, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      alignSelf: m.sender_role === "customer" ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      bgcolor: m.sender_role === "customer" ? "#003f29" : "white",
                      color: m.sender_role === "customer" ? "white" : "#333",
                      p: "10px 16px",
                      borderRadius: m.sender_role === "customer" ? "18px 18px 0 18px" : "18px 18px 18px 0",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography variant="body2">{m.message}</Typography>
                    <Typography variant="caption" sx={{ 
                      display: "block", mt: 0.5, textAlign: "right", 
                      opacity: 0.7, fontSize: "0.7rem" 
                    }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Input Bar */}
              <Box sx={{ p: 2, bgcolor: "white", borderTop: "1px solid #eee" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Send message..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  autoComplete="off"
                  InputProps={{
                    sx: { borderRadius: 5, bgcolor: "#f0f2f5" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleSendMessage} 
                          disabled={!inputMsg.trim()}
                          sx={{ color: inputMsg.trim() ? "#003f29" : "#ccc" }}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          ) : (
            /* kalo blm pilih roomchat */
            <Stack sx={{ height: "100%", justifyContent: "center", alignItems: "center", textAlign: "center", color: "text.secondary", p: 3 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
              <Typography variant="body2">Pilih salah satu toko untuk chat</Typography>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  )
}