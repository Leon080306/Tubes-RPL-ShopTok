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
  Button,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// redux
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { fetchOrderDetail, cancelOrder } from "../../store/orderSlice";
import formatPrice from "../../utils/FormatPrice";

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
    const { order_id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { currentOrder, status } = useAppSelector(state => state.order);

    useEffect(() => {
        if (order_id) {
            dispatch(fetchOrderDetail(order_id));
        }
    }, [order_id, dispatch]);

    const handleCancel = async () => {
        if (!order_id) return;
        if (!window.confirm("Yakin mau cancel order ini?")) return;

        const result = await dispatch(cancelOrder(order_id));
        if (cancelOrder.fulfilled.match(result)) {
            alert("Order berhasil dicancel");
            navigate("/orders");
        }
    };

    if (status === 'loading' || !currentOrder) {
        return (
            <Box display="flex" justifyContent="center" p={5}>
                <CircularProgress />
            </Box>
        );
    }

    const { address, orderItems, status: orderStatus, amount_paid, createdAt } = currentOrder;

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString("id-ID", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" gap={3}>
                {/* LEFT — ADDRESS */}
                <Box flex={4}>
                    <Typography variant="h6">Delivery Address</Typography>
                    <Box mt={2}>
                        <Typography fontWeight={600}>{address.full_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {address.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {address.city}, {address.province}
                        </Typography>
                    </Box>

                    {/* Tombol Cancel — cuma muncul kalau status pending */}
                    {orderStatus === "pending" && (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleCancel}
                            sx={{ mt: 2, textTransform: "none" }}
                        >
                            Cancel Order
                        </Button>
                    )}
                </Box>

                {/* RIGHT — TIMELINE */}
                <Box flex={8}>
                    <Stack spacing={0}>
                        <TimelineItem
                            active={orderStatus === "completed"}
                            time={orderStatus === "completed" ? formatDate(currentOrder.updatedAt) : ""}
                            title="Completed"
                            desc="Parcel has been completed."
                        />
                        <TimelineItem
                            active={orderStatus === "pending" || orderStatus === "completed"}
                            time={formatDate(createdAt)}
                            title="Pending"
                            desc="Order is being processed."
                        />
                        <TimelineItem
                            active
                            time={formatDate(createdAt)}
                            title="Order Placed"
                            desc="Order successfully placed."
                        />
                    </Stack>
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* PRODUCTS */}
            {orderItems.map((item) => (
                <Box key={item.variant_id} display="flex" justifyContent="space-between" mb={2}>
                    <Box display="flex" gap={2}>
                        <Avatar
                            variant="rounded"
                            src={item.variant.picture || "https://via.placeholder.com/80"}
                            sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                            <Typography>{item.variant.product.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Variation: {item.variant.name}
                            </Typography>
                            <Typography variant="body2">x{item.quantity}</Typography>
                        </Box>
                    </Box>
                    <Typography>
                        {formatPrice(Number(item.variant.price) * item.quantity)}
                    </Typography>
                </Box>
            ))}

            {/* PRICE SUMMARY TABLE */}
            <Box mb={3} sx={{ mx: -3 }}>
                <TableContainer component={Paper} sx={{ width: "100%", boxShadow: "none", borderRadius: 0 }}>
                    <Table
                        size="small"
                        sx={{
                            borderTop: "2px solid #e0e0e0",
                            borderBottom: "2px solid #e0e0e0",
                            "& td": { borderBottom: "2px solid #f0f0f0" },
                            "& tr:last-child td": { borderBottom: "none" },
                            "& td:first-of-type": { borderRight: "2px solid #e0e0e0" },
                        }}
                    >
                        <TableBody>
                            <TableRow>
                                <TableCell align="right" sx={{ color: "text.secondary" }}>
                                    Merchandise Subtotal
                                </TableCell>
                                <TableCell width="30%" align="right">
                                    {formatPrice(amount_paid)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* TOTAL */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={600}>Order Total</Typography>
                <Typography fontSize={20} color="error" fontWeight={700}>
                    {formatPrice(amount_paid)}
                </Typography>
            </Box>
        </Paper>
    );
}