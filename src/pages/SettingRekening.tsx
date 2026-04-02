import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAppSelector } from "../hooks/useAppSelector";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export default function SettingRekening() {
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  const cards = userInfo?.cards || [];
  const bankAccounts = userInfo?.bankAccounts || [];

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "100vh",
        bgcolor: "#f9f9f9",
        pb: 5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        <IconButton onClick={() => navigate("/settings")} sx={{ mr: 2 }}>
          <ArrowBackIcon sx={{ color: "#003f29" }} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Rekening / Kartu Saya
        </Typography>
      </Paper>

      <Box sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography fontWeight={700} variant="subtitle1">
            Kartu Kredit / Debit
          </Typography>
          <Button
            startIcon={<AddIcon />}
            size="small"
            sx={{ color: "#003f29" }}
            onClick={() => navigate("/settings/bank/add-card")}
          >
            Tambah Kartu
          </Button>
        </Stack>

        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
          {cards.length > 0 ? (
            <List disablePadding>
              {cards.map((card, index) => (
                <Box key={card.id}>
                  <ListItem secondaryAction={<CreditCardIcon color="action" />}>
                    <ListItemText
                      primary={card.cardNumber}
                      secondary={card.cardHolderName}
                    />
                  </ListItem>
                  {index < cards.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Typography
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
                fontSize: "0.9rem",
              }}
            >
              Belum Ada Kartu
            </Typography>
          )}
        </Paper>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography fontWeight={700} variant="subtitle1">
            Rekening Bank
          </Typography>
          <Button
            startIcon={<AddIcon />}
            size="small"
            sx={{ color: "#003f29" }}
            onClick={() => navigate("/settings/bank/add-rekening")}
          >
            Tambah Rekening
          </Button>
        </Stack>

        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
          {bankAccounts.length > 0 ? (
            <List disablePadding>
              {bankAccounts.map((bank, index) => (
                <Box key={bank.id}>
                  <ListItem
                    secondaryAction={<AccountBalanceIcon color="action" />}
                  >
                    <ListItemText
                      primary={bank.bankName}
                      secondary={`${bank.accountNumber} a/n ${bank.accountHolderName}`}
                    />
                  </ListItem>
                  {index < bankAccounts.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Typography
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
                fontSize: "0.9rem",
              }}
            >
              Belum Ada Rekening
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
