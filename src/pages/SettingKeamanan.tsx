import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { authActions } from "../store/authSlice";

export default function SettingSecurity() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);

  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (passwords.old !== userInfo?.password) {
      setError("Password lama salah!");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setError("Password tidak cocok!");
      return;
    }
    if (passwords.new.length < 8) {
      setError("Password baru minimal 8 karakter!");
      return;
    }

    dispatch(authActions.changePassword(passwords.new));
    setSuccess(true);
    setPasswords({ old: "", new: "", confirm: "" });
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus akun?",
      )
    ) {
      dispatch(authActions.deleteAccount());
      navigate("/login");
    }
  };

  return (
    <Box sx={{ maxWidth: "600px", margin: "0 auto", p: 2 }}>
      <Paper
        elevation={0}
        sx={{ p: 2, display: "flex", alignItems: "center", mb: 3 }}
      >
        <IconButton onClick={() => navigate("/settings")} sx={{ mr: 2 }}>
          <ArrowBackIcon sx={{ color: "#003f29" }} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Keamanan Akun
        </Typography>
      </Paper>

      {/* FORM GANTI PASSWORD */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Ubah Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password berhasil diperbarui!
          </Alert>
        )}

        <Stack component="form" onSubmit={handleChangePassword} spacing={3}>
          <TextField
            label="Password Lama"
            type="password"
            fullWidth
            required
            value={passwords.old}
            onChange={(e) =>
              setPasswords({ ...passwords, old: e.target.value })
            }
          />
          <TextField
            label="Password Baru"
            type="password"
            fullWidth
            required
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
          />
          <TextField
            label="Konfirmasi Password Baru"
            type="password"
            fullWidth
            required
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: "#003f29", fontWeight: 700 }}
          >
            Simpan Password Baru
          </Button>
        </Stack>
      </Paper>

      {/* DANGER ZONE */}
      <Box
        sx={{
          mt: 5,
          p: 2,
          border: "1px solid #ffcdd2",
          borderRadius: 2,
          bgcolor: "#fff5f5",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="error"
          sx={{ mb: 1 }}
        >
          Zona Bahaya
        </Typography>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleDeleteAccount}
          sx={{ fontWeight: 700 }}
        >
          Hapus Akun Saya
        </Button>
      </Box>
    </Box>
  );
}
