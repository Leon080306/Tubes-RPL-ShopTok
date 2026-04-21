import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router";
// import { useAppSelector } from "../../hooks/useAppSelector";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { authActions } from "../../store/authSlice";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LockIcon from "@mui/icons-material/Lock";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
// import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

export default function SettingsPage() {
  const navigate = useNavigate();
  // const { userInfo } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // penting untuk cookie
      });

      dispatch(authActions.logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "100vh",
        bgcolor: "#f9f9f9",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          bgcolor: "white",
          borderRadius: 0,
          borderBottom: "1px solid #eee",
        }}
      >
        <IconButton onClick={() => navigate("/profile")} sx={{ mr: 2 }}>
          <ArrowBackIcon sx={{ color: "#003f29" }} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Pengaturan
        </Typography>
      </Paper>

      <Typography
        variant="subtitle2"
        sx={{ p: 2, color: "text.secondary", fontWeight: 700 }}
      >
        PENGATURAN AKUN
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: 0 }}>
        <List sx={{ p: 0 }}>
          <ListItemButton
            onClick={() => navigate("/settings/address")}
            sx={{ py: 2 }}
          >
            <ListItemIcon>
              <LocationOnIcon sx={{ color: "#003f29" }} />
            </ListItemIcon>
            <ListItemText
              primary="Alamat Saya"
              secondary="Atur alamat pengiriman"
            />
            <ChevronRightIcon color="action" />
          </ListItemButton>
          <Divider variant="inset" component="li" />
          <ListItemButton
            onClick={() => navigate("/settings/bank")}
            sx={{ py: 2 }}
          >
            <ListItemIcon>
              <AccountBalanceIcon sx={{ color: "#003f29" }} />
            </ListItemIcon>
            <ListItemText
              primary="Rekening"
              secondary="Atur metode pembayaran"
            />
            <ChevronRightIcon color="action" />
          </ListItemButton>
          <Divider variant="inset" component="li" />
          <ListItemButton
            onClick={() => navigate("/settings/security")}
            sx={{ py: 2 }}
          >
            <ListItemIcon>
              <LockIcon sx={{ color: "#003f29" }} />
            </ListItemIcon>
            <ListItemText
              primary="Keamanan Akun"
              secondary="Ganti password / hapus akun"
            />
            <ChevronRightIcon color="action" />
          </ListItemButton>
        </List>
      </Paper>

      {/* <Typography
        variant="subtitle2"
        sx={{ p: 2, mt: 1, color: "text.secondary", fontWeight: 700 }}
      >
        PENGATURAN APLIKASI
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: 0 }}>
        <List sx={{ p: 0 }}>
          <ListItemButton
            onClick={() => navigate("/settings/chat")}
            sx={{ py: 2 }}
          >
            <ListItemIcon>
              <ChatIcon sx={{ color: "#003f29" }} />
            </ListItemIcon>
            <ListItemText primary="Pengaturan Chat" />
            <ChevronRightIcon color="action" />
          </ListItemButton>
          <Divider variant="inset" component="li" />
          <ListItemButton
            onClick={() => navigate("/settings/notifications")}
            sx={{ py: 2 }}
          >
            <ListItemIcon>
              <NotificationsIcon sx={{ color: "#003f29" }} />
            </ListItemIcon>
            <ListItemText primary="Pengaturan Notifikasi" />
            <ChevronRightIcon color="action" />
          </ListItemButton>
        </List>
      </Paper> */}

      <Stack spacing={1.5} sx={{ p: 3, mt: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{
            bgcolor: "#d32f2f",
            "&:hover": { bgcolor: "#b71c1c" },
            py: 1.5,
            fontWeight: 700,
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
}
