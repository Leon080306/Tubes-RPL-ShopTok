import { Box, Typography, Paper, Avatar, Stack, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Button, Badge, } from "@mui/material";
import { useAppSelector } from "../../../hooks/useAppSelector";
import { useNavigate } from "react-router";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ChatIcon from "@mui/icons-material/Chat";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

import { useEffect } from "react";
import { fetchMyOrders } from "../../../store/orderSlice";
import { useAppDispatch } from "../../../hooks/useAppDispatch";

export default function ProfilePage() {
  const { userInfo } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);  // ← tambah
  const dispatch = useAppDispatch();  // ← tambah
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchMyOrders('all'));
    }
  }, [userInfo, dispatch]);


  if (!userInfo) {
    return (
      <Box sx={{ p: 5, textAlign: "center", mt: 10 }}>
        <Typography variant="h5">Please Login First</Typography>
        <Button size="large" onClick={() => navigate("/login")}>
          Go to Login Page
        </Button>
      </Box>
    );
  }

  const stats = {
    unpaid: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'pending').length,
    shipped: 0,  // backend belum punya status 'shipped', nanti update kalau sudah ada
    toReview: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "0 auto",
        pb: 5,
        bgcolor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      {/* atasnya yg logo setting, cart, chat */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ pt: 3, px: 3, pb: 2, bgcolor: "white" }}
      >
        <IconButton onClick={() => navigate("/settings")}>
          <SettingsIcon sx={{ color: "#003f29", fontSize: 32 }} />
        </IconButton>
        <IconButton onClick={() => navigate("/cart")}>
          <ShoppingCartIcon sx={{ color: "#003f29", fontSize: 32 }} />
        </IconButton>
        <IconButton onClick={() => navigate("/chattoko")}>
          <ChatIcon sx={{ color: "#003f29", fontSize: 32 }} />
        </IconButton>
      </Stack>

      {/* profilenya */}
      <Paper
        elevation={0}
        sx={{ p: 4, cursor: "pointer", bgcolor: "white", borderRadius: 0 }}
        onClick={() => navigate("/profile/edit")}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            sx={{ width: 100, height: 100, bgcolor: "#003f29", fontSize: 40 }}
          >
            {userInfo.first_name[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              {userInfo.first_name} {userInfo.last_name}
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400}>
              {userInfo.email}
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 30 }} color="action" />
        </Stack>
      </Paper>

      {/* perbayaran */}
      <Paper
        elevation={0}
        sx={{ mt: 1.5, p: 3, bgcolor: "white", borderRadius: 0 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {[
            {
              label: "ShopTok Pay",
              val: userInfo.shopTok_Pay
                ? `Rp${userInfo.shopTok_Pay.toLocaleString("id-ID")}`
                : "Rp0",
              icon: (
                <AccountBalanceWalletIcon
                  sx={{ color: "#003f29", fontSize: 35 }}
                />
              ),
            },
            {
              label: "Koin ShopTok",
              val: userInfo.coins || "0",
              icon: (
                <MonetizationOnIcon sx={{ color: "#fbc02d", fontSize: 35 }} />
              ),
            },
            {
              label: "Voucher",
              val: `${userInfo.vouchers || 0} Voucher`,
              icon: (
                <ConfirmationNumberIcon
                  sx={{ color: "#ff5722", fontSize: 35 }}
                />
              ),
            },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                textAlign: "center",
                borderRight: i < 2 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {item.icon}
              <Typography variant="body1" display="block" sx={{ mt: 1 }}>
                {item.label}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {item.val}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* tracking orderan */}
      <Paper elevation={0} sx={{ mt: 1.5, bgcolor: "white", borderRadius: 0 }}>
        <ListItemButton sx={{ p: 3 }} onClick={() => navigate("/orders")}>
          <ListItemText
            primary="Pesanan Saya"
            primaryTypographyProps={{ variant: "h6", fontWeight: 700 }}
          />
          <Typography variant="body1" color="text.secondary">
            Lihat Riwayat{" "}
            <ChevronRightIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />
          </Typography>
        </ListItemButton>

        <Box sx={{ display: "flex", py: 4 }}>
          {[
            {
              label: "Belum Bayar",
              icon: <PaymentIcon sx={{ fontSize: 40 }} />,
              count: stats.unpaid,
            },
            {
              label: "Dikemas",
              icon: <InventoryIcon sx={{ fontSize: 40 }} />,
              count: stats.processing,
            },
            {
              label: "Dikirim",
              icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
              count: stats.shipped,
            },
            {
              label: "Beri Rating",
              icon: <StarOutlineIcon sx={{ fontSize: 40 }} />,
              count: stats.toReview,
            },
          ].map((item, i) => (
            <Box key={i} sx={{ flex: 1, textAlign: "center" }}>
              <IconButton sx={{ color: "#555", mb: 1 }}>
                <Badge badgeContent={item.count} color="error">
                  {item.icon}
                </Badge>
              </IconButton>
              <Typography variant="body1" display="block">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* cust service */}
      <List sx={{ mt: 1.5, bgcolor: "white", p: 0 }}>
        <ListItemButton
          sx={{ p: 3 }}
          onClick={() => navigate("/chatcs")}
        >
          <ListItemIcon sx={{ minWidth: 50 }}>
            <HelpOutlineIcon sx={{ color: "#003f29", fontSize: 35 }} />
          </ListItemIcon>
          <ListItemText
            primary="Pusat Bantuan"
            primaryTypographyProps={{ variant: "h6" }}
          />
          <ChevronRightIcon sx={{ fontSize: 30 }} color="action" />
        </ListItemButton>
      </List>
    </Box>
  );
}