import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../hooks/useAppSelector";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function SettingAddress() {
  const navigate = useNavigate();

  const { userInfo } = useAppSelector((state) => state.auth);

  const addresses = userInfo?.addresses || [];

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "100vh",
        bgcolor: "#f9f9f9",
        pb: 10,
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
        <IconButton onClick={() => navigate("/settings")} sx={{ mr: 2 }}>
          <ArrowBackIcon sx={{ color: "#003f29" }} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Alamat Saya
        </Typography>
      </Paper>

      <Stack spacing={2} sx={{ p: 2 }}>
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <Paper
              key={addr.id}
              sx={{
                p: 3,
                borderRadius: 2,
                border: addr.isDefault ? "1px solid #003f29" : "none",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography fontWeight={700}>{addr.receiver}</Typography>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ height: 16, my: "auto" }}
                    />
                    <Typography color="text.secondary">{addr.phone}</Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: 700 }}
                  >
                    {addr.name}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {addr.fullAddress}, {addr.district}, {addr.city},{" "}
                    {addr.province}
                  </Typography>

                  {addr.isDefault && (
                    <Chip
                      label="Utama"
                      size="small"
                      sx={{
                        mt: 2,
                        bgcolor: "#e6f4ea",
                        color: "#003f29",
                        fontWeight: 700,
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Box>

                <Stack direction="row">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      navigate(`/settings/address/edit/${addr.id}`)
                    }
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))
        ) : (
          // klo gaada adress
          <Box sx={{ textAlign: "center", mt: 10, px: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Belum Ada Alamat
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tambah alamat sekarang.
            </Typography>
          </Box>
        )}
      </Stack>

      {/* button buat add adsress */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "800px",
          px: 2,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#003f29",
            py: 1.5,
            fontWeight: 700,
            borderRadius: 2,
            "&:hover": { bgcolor: "#002a1c" },
          }}
          onClick={() => navigate("/settings/address/add")}
        >
          Tambah Alamat Baru
        </Button>
      </Box>
    </Box>
  );
}
