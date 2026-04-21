import {
  Box,
  Typography,
  Divider,
  Avatar,
  Paper,
  Stack,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const TimelineItem = ({ time, title, desc, active }: any) => {
  return (
    <Box display="flex" gap={2}>
      <Box display="flex" flexDirection="column" alignItems="center">
        {active ? (
          <CheckCircleIcon color="success" />
        ) : (
          <RadioButtonUncheckedIcon fontSize="small" />
        )}
        <Box sx={{ width: 2, flex: 1, bgcolor: "grey.300" }} />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {time}
        </Typography>
        <Typography fontWeight={600}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {desc}
        </Typography>
      </Box>
    </Box>
  );
};

export default function OrderDetailPage() {
  return (
    // <Box p={3} bgcolor="#f5f5f5">
    <Paper sx={{ p: 3 }}>
      <Box display="flex" gap={3}>
        {/* LEFT ADDRESS */}
        <Box flex={4}>
          <Typography variant="h6">Delivery Address</Typography>
          <Box mt={2}>
            <Typography fontWeight={600}>hervanti</Typography>
            <Typography variant="body2" color="text.secondary">
              (+62) 838 2913 7025
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Taman Kopo indah 2 A3 28 (Patung kuda masuk),
            </Typography>
            <Typography variant="body2" color="text.secondary">
              KAB. BANDUNG, MARGAASIH, JAWA BARAT, ID, 40218
            </Typography>
          </Box>
        </Box>

        {/* TIMELINE */}
        <Box flex={8}>
          <Stack spacing={2}>
            <TimelineItem
              active
              time="08-04-2026 11:13"
              title="Completed"
              desc="Parcel has been completed."
            />
            <TimelineItem
              time="08-04-2026 07:40"
              title="Pending"
              desc="Parcel is being processed."
            />
            <TimelineItem
              time="08-04-2026 05:05"
              title=""
              desc="Parcel is already placed."
            />
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* PRODUCT */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box display="flex" gap={2}>
          <Avatar
            variant="rounded"
            src="https://via.placeholder.com/80"
            sx={{ width: 80, height: 80 }}
          />
          <Box>
            <Typography>
              Stiker Pelindung Pelapis Kaca Helm Anti Air Fog Embun
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Variation: Bening
            </Typography>
            <Typography variant="body2">x1</Typography>
          </Box>
        </Box>
        <Typography>Rp23.100</Typography>
      </Box>

      {/* <  sx={{ my: 3 }} /> */}

      {/* PRICE DETAIL */}
      <Box
        mb={3}
        sx={{
          mx: -3, // ⬅️ INI KUNCI
          backgroundColor: "red",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{ width: "100%", boxShadow: "none", borderRadius: 0 }}
        >
          <Table
            size="small"
            sx={{
              width: "100%",
              borderTop: "2px solid #e0e0e0",
              borderBottom: "2px solid #e0e0e0",
              borderCollapse: "collapse",
              "& td": {
                borderBottom: "2px solid #f0f0f0",
              },
              "& tr:last-child td": {
                borderBottom: "none",
              },
              "& td:first-of-type": {
                borderRight: "2px solid #e0e0e0",
              },
            }}
          >
            <TableBody>
              <TableRow>
                <TableCell
                  align="right"
                  sx={{
                    // border: "2px solid #e0e0e0",
                    color: "text.secondary",
                  }}
                >
                  Merchandise Subtotal
                </TableCell>
                <TableCell
                  width="30%"
                  align="right"
                  // sx={{ border: "2px solid #e0e0e0" }}
                >
                  Rp23.100
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="right"
                  sx={{
                    // border: "2px solid #e0e0e0",
                    color: "text.secondary",
                  }}
                >
                  Shipping Fee
                </TableCell>
                <TableCell align="right">Rp3.500</TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="right"
                  sx={{
                    // border: "2px solid #e0e0e0",
                    color: "text.secondary",
                  }}
                >
                  Shipping Discount Subtotal
                </TableCell>
                <TableCell align="right">-Rp3.500</TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="right"
                  sx={{
                    // border: "2px solid #e0e0e0",
                    color: "text.secondary",
                  }}
                >
                  Shop Voucher Applied
                </TableCell>
                <TableCell align="right">-Rp100</TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="right"
                  sx={{
                    // border: "2px solid #e0e0e0",
                    color: "text.secondary",
                  }}
                >
                  Buyer Service Fee
                </TableCell>
                <TableCell align="right">Rp2.000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* <Divider sx={{ my: 2 }} /> */}

      {/* TOTAL */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={600}>Order Total</Typography>
        <Typography fontSize={20} color="error" fontWeight={700}>
          Rp25.000
        </Typography>
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Typography variant="body2">Payment Method: Bank BCA</Typography>
      </Box>
    </Paper>
    // </Box>
  );
}
