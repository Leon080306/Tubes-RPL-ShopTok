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
    Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppSelector } from "../../hooks/useAppSelector";
import formatPrice from "../../utils/FormatPrice";
import type { OrderDetail } from "../../type";

// ================= HELPERS =================
const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const STATUS_COLOR: Record<string, "success" | "warning" | "error"> = {
    completed: "success",
    pending: "warning",
    cancelled: "error",
};

// ================= TIMELINE ITEM =================
interface TimelineItemProps {
    time: string;
    title: string;
    desc: string;
    active: boolean;
    isLast?: boolean;
    isCancelled?: boolean;
}

function TimelineItem({ time, title, desc, active, isLast = false, isCancelled = false }: TimelineItemProps) {
    return (
        <Box display="flex" gap={2}>
            <Box display="flex" flexDirection="column" alignItems="center">
                {isCancelled ? (
                    <CancelIcon color="error" />
                ) : active ? (
                    <CheckCircleIcon color="success" />
                ) : (
                    <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                )}
                {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: "grey.300", minHeight: 30 }} />}
            </Box>
            <Box pb={2}>
                {time && (
                    <Typography variant="body2" color="text.secondary">
                        {time}
                    </Typography>
                )}
                <Typography fontWeight={600}>{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {desc}
                </Typography>
            </Box>
        </Box>
    );
}

// ================= MAIN PAGE =================
export default function OrderDetailPage() {
    const { order_id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;

    const [currentOrder, setCurrentOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // ================= FETCH ORDER DETAIL =================
    useEffect(() => {
        if (!order_id || !user_id) return;

        const getOrderDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `/api/orders/${order_id}?customer_id=${user_id}`
                );
                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Gagal memuat order");
                    return;
                }

                setCurrentOrder(data.data);
            } catch (err) {
                console.error(err);
                setError("Terjadi kesalahan saat memuat order");
            } finally {
                setLoading(false);
            }
        };

        getOrderDetail();
    }, [order_id, user_id]);

    // ================= CANCEL ORDER =================
    const handleCancel = async () => {
        if (!order_id || !user_id) return;
        if (!window.confirm("Yakin mau cancel order ini?")) return;

        setIsCancelling(true);
        try {
            const res = await fetch(
                `/api/orders/cancel/${order_id}?customer_id=${user_id}`,
                { method: "PATCH" }
            );
            const data = await res.json();

            if (!res.ok) {
                alert("Gagal cancel: " + data.message);
                return;
            }

            alert("Order berhasil dicancel");
            setCurrentOrder((prev) =>
                prev ? { ...prev, status: "cancelled" } : prev
            );
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat membatalkan order");
        } finally {
            setIsCancelling(false);
        }
    };

    // ================= LOADING & ERROR STATES =================
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={5} minHeight="50vh">
                <CircularProgress sx={{ color: "#89a471" }} />
            </Box>
        );
    }

    if (error || !currentOrder) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" p={5} gap={2}>
                <Typography color="error">{error ?? "Order tidak ditemukan"}</Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/orders")}
                    sx={{ textTransform: "none", color: "#89a471" }}
                >
                    Kembali ke Order List
                </Button>
            </Box>
        );
    }

    const { address, shop, orderItems, status: orderStatus, amount_paid, createdAt, updatedAt } = currentOrder;

    // Calculate subtotal from items
    const subtotal = orderItems.reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity,
        0
    );

    return (
        <Paper sx={{ p: 3 }}>
            {/* BACK BUTTON + ORDER ID */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/orders")}
                    sx={{ textTransform: "none", color: "#89a471" }}
                >
                    Back to Orders
                </Button>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                        Order ID: {currentOrder.order_id}
                    </Typography>
                    <Chip
                        label={orderStatus.toUpperCase()}
                        color={STATUS_COLOR[orderStatus] ?? "default"}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box display="flex" gap={3}>
                {/* LEFT — ADDRESS & SHOP */}
                <Box flex={4}>
                    {/* Shop Info */}
                    {shop && (
                        <Box mb={3}>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                SHOP
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Avatar
                                    src={shop.profile_pic}
                                    sx={{ width: 36, height: 36 }}
                                >
                                    {shop.name?.[0]}
                                </Avatar>
                                <Typography fontWeight={600}>{shop.name}</Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Address */}
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                        DELIVERY ADDRESS
                    </Typography>
                    {address ? (
                        <Box>
                            <Typography fontWeight={600}>{address.full_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {address.phone_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {address.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {[address.sub_district, address.city, address.province]
                                    .filter(Boolean)
                                    .join(", ")}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Alamat tidak tersedia
                        </Typography>
                    )}

                    {/* Cancel Button */}
                    {orderStatus === "pending" && (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            disabled={isCancelling}
                            onClick={handleCancel}
                            sx={{ mt: 2, textTransform: "none" }}
                        >
                            {isCancelling ? "Membatalkan..." : "Cancel Order"}
                        </Button>
                    )}
                </Box>

                {/* RIGHT — TIMELINE */}
                <Box flex={8}>
                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        ORDER TIMELINE
                    </Typography>
                    <Stack spacing={0}>
                        {orderStatus === "cancelled" ? (
                            <>
                                <TimelineItem
                                    isCancelled
                                    active={false}
                                    time={formatDate(updatedAt)}
                                    title="Cancelled"
                                    desc="Order has been cancelled."
                                />
                                <TimelineItem
                                    active
                                    time={formatDate(createdAt)}
                                    title="Order Placed"
                                    desc="Order successfully placed."
                                    isLast
                                />
                            </>
                        ) : (
                            <>
                                <TimelineItem
                                    active={orderStatus === "completed"}
                                    time={
                                        orderStatus === "completed"
                                            ? formatDate(updatedAt)
                                            : ""
                                    }
                                    title="Completed"
                                    desc="Parcel has been delivered."
                                />
                                <TimelineItem
                                    active={
                                        orderStatus === "pending" ||
                                        orderStatus === "completed"
                                    }
                                    time={formatDate(createdAt)}
                                    title="Pending"
                                    desc="Order is being processed."
                                />
                                <TimelineItem
                                    active
                                    time={formatDate(createdAt)}
                                    title="Order Placed"
                                    desc="Order successfully placed."
                                    isLast
                                />
                            </>
                        )}
                    </Stack>
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* PRODUCTS */}
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
                ORDER ITEMS
            </Typography>
            {orderItems.map((item) => (
                <Box
                    key={item.variant_id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    p={1.5}
                    sx={{
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#f9f9f9" },
                    }}
                >
                    <Box display="flex" gap={2}>
                        <Avatar
                            variant="rounded"
                            src={item.variant.picture || "/placeholder.png"}
                            sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                            <Typography fontWeight={500}>
                                {item.variant.product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Variation: {item.variant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                x{item.quantity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                @ {formatPrice(Number(item.variant.price))}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography fontWeight={500}>
                        {formatPrice(Number(item.variant.price) * item.quantity)}
                    </Typography>
                </Box>
            ))}

            {/* PRICE SUMMARY */}
            <Box mb={3} sx={{ mx: -3 }}>
                <TableContainer
                    component={Paper}
                    sx={{ width: "100%", boxShadow: "none", borderRadius: 0 }}
                >
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
                                    {formatPrice(subtotal)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ color: "text.secondary" }}>
                                    Shipping
                                </TableCell>
                                <TableCell width="30%" align="right">
                                    {formatPrice(0)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    Total Paid
                                </TableCell>
                                <TableCell width="30%" align="right" sx={{ fontWeight: 600 }}>
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