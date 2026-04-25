import {
    Box, Button, Card, CardActions, CardContent,
    CircularProgress, Divider, Paper, Tab, Tabs,
    TextField, Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChatIcon from '@mui/icons-material/Chat';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useNavigate } from "react-router";

import { useAppSelector } from "../../hooks/useAppSelector";
import type { OrderDetail } from "../../type";
import formatPrice from "../../utils/FormatPrice";
import { startChat } from "../../utils/StartChat";

const TABS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABEL: Record<string, string> = {
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
};

const SHIPPING_MESSAGE: Record<string, string> = {
    pending: "Order is being processed.",
    completed: "Parcel has been delivered.",
    cancelled: "Order was cancelled.",
};

export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;

    const [orders, setOrders] = useState<OrderDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState("all");
    const [search, setSearch] = useState("");

    // ================= FETCH ORDERS =================
    useEffect(() => {
        if (!user_id) return;

        const getOrders = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ customer_id: user_id });
                if (tabValue !== "all") {
                    params.append("status", tabValue);
                }

                const res = await fetch(`/api/orders?${params.toString()}`);
                const data = await res.json();

                if (!res.ok) {
                    console.error("Fetch orders failed:", data.message);
                    setOrders([]);
                    return;
                }

                setOrders(data.data ?? []);
            } catch (error) {
                console.error("Fetch orders error:", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        getOrders();
    }, [tabValue, user_id]);

    // ================= HANDLERS =================
    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    const handleNavigateDetail = (orderId: string) => {
        navigate(`/orders/detail/${orderId}`);
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!user_id) return;
        const confirm = window.confirm("Yakin ingin membatalkan order ini?");
        if (!confirm) return;

        try {
            const res = await fetch(`/api/orders/cancel/${orderId}?customer_id=${user_id}`, {
                method: "PATCH",
            });
            const data = await res.json();

            if (!res.ok) {
                alert("Gagal cancel: " + data.message);
                return;
            }

            alert("Order berhasil dibatalkan");
            setOrders((prev) =>
                prev.map((o) =>
                    o.order_id === orderId ? { ...o, status: "cancelled" } : o
                )
            );
        } catch (error) {
            console.error("Cancel order error:", error);
            alert("Terjadi kesalahan saat membatalkan order");
        }
    };

    const handleStartChat = async (e: React.MouseEvent, order: OrderDetail) => {
        e.stopPropagation();
        if (!user_id || !order.shop_id) return;

        const success = await startChat(
            user_id,
            order.shop_id,
            `Halo, saya ingin bertanya tentang order #${order.order_id.slice(0, 8)}`
        );

        if (success) {
            navigate(`/chattoko?shop_id=${order.shop_id}`);
        } else {
            alert("Gagal memulai chat");
        }
    };

    // ================= LOCAL SEARCH FILTER =================
    const filteredOrders = orders.filter((order) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const matchShop = order.shop?.name?.toLowerCase().includes(q);
        const matchId = order.order_id.toLowerCase().includes(q);
        const matchProduct = order.orderItems.some((item) =>
            item.variant.product.name.toLowerCase().includes(q)
        );
        return matchShop || matchId || matchProduct;
    });

    // ================= RENDER =================
    return (
        <Paper
            sx={{
                height: "100%",
                flex: 4,
                boxSizing: "border-box",
                overflow: "auto",
                boxShadow: "none",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                paddingInline: "64px",
            }}
        >
            {/* TABS */}
            <Paper elevation={2} sx={{ width: "100%", border: "1px solid rgba(0, 0, 0, 0.2)" }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        "& .MuiTab-root": { color: "#89a471" },
                        "& .MuiTab-root.Mui-selected": { color: "#003f29" },
                        "& .MuiTabs-indicator": { backgroundColor: "#003f29" },
                    }}
                >
                    {TABS.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                    ))}
                </Tabs>
            </Paper>

            {/* SEARCH */}
            <TextField
                label="Search by Seller Name, Order ID, or Product Name"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                    "& .MuiInputLabel-root": { fontWeight: "500", color: "grey" },
                }}
            />

            {/* ORDER LIST */}
            <Paper
                sx={{
                    flex: 1,
                    overflow: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {loading && (
                    <Box display="flex" justifyContent="center" p={5}>
                        <CircularProgress sx={{ color: "#89a471" }} />
                    </Box>
                )}

                {!loading && filteredOrders.length === 0 && (
                    <Box display="flex" justifyContent="center" p={5}>
                        <Typography color="text.secondary">
                            Tidak ada order ditemukan.
                        </Typography>
                    </Box>
                )}

                {!loading &&
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.order_id}
                            order={order}
                            onNavigateDetail={handleNavigateDetail}
                            onCancelOrder={handleCancelOrder}
                            onNavigateShop={(shopId) => navigate(`/shop/${shopId}`)}
                            onStartChat={handleStartChat}
                        />
                    ))}
            </Paper>
        </Paper>
    );
}

// ================= ORDER CARD COMPONENT =================
interface OrderCardProps {
    order: OrderDetail;
    onNavigateDetail: (orderId: string) => void;
    onCancelOrder: (orderId: string) => void;
    onNavigateShop: (shopId: string) => void;
    onStartChat: (e: React.MouseEvent, order: OrderDetail) => void;
}

function OrderCard({
    order,
    onNavigateDetail,
    onCancelOrder,
    onNavigateShop,
    onStartChat,
}: OrderCardProps) {
    const shippingMsg = SHIPPING_MESSAGE[order.status] ?? "Order is being processed.";

    return (
        <Card
            onClick={() => onNavigateDetail(order.order_id)}
            sx={{
                border: "1px solid rgba(0, 0, 0, 0.2)",
                paddingInline: "12px",
                marginBottom: "24px",
                cursor: "pointer",
                "&:hover": { boxShadow: 3 },
            }}
        >
            <CardContent>
                {/* HEADER */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                        width: "100%",
                        paddingBottom: "8px",
                    }}
                >
                    <Box sx={{ height: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <StorefrontIcon sx={{ fontSize: "24px" }} />
                        <Typography variant="body1" sx={{ fontSize: "14px", fontWeight: "600" }}>
                            {order.shop?.name ?? "Toko"}
                        </Typography>
                        <Button
                            startIcon={<ChatIcon />}
                            variant="contained"
                            onClick={(e) => onStartChat(e, order)}
                            sx={{
                                padding: "4px 12px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "white",
                                borderColor: "#89a471",
                                backgroundColor: "#89a471",
                                "&:hover": { backgroundColor: "#7a9562" },
                            }}
                        >
                            Chat
                        </Button>
                        <Button
                            startIcon={<StorefrontIcon />}
                            variant="outlined"
                            onClick={(e) => {
                                e.stopPropagation();
                                onNavigateShop(order.shop_id);
                            }}
                            sx={{
                                padding: "4px 8px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                                borderColor: "#89a471",
                            }}
                        >
                            View Shop
                        </Button>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Button
                            startIcon={<LocalShippingIcon />}
                            variant="text"
                            sx={{
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                            }}
                        >
                            {shippingMsg}
                        </Button>
                        <Divider orientation="vertical" flexItem />
                        <Typography
                            sx={{
                                textTransform: "uppercase",
                                color: "#89a471",
                                fontWeight: "500",
                                fontSize: "13px",
                            }}
                        >
                            {STATUS_LABEL[order.status] ?? order.status}
                        </Typography>
                    </Box>
                </Box>

                {/* ITEMS */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {order.orderItems.map((item, index) => (
                        <Box
                            key={item.variant_id}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "18px 12px",
                                borderBottom:
                                    index === order.orderItems.length - 1
                                        ? "none"
                                        : "1px solid rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            <Box sx={{ display: "flex", gap: "18px" }}>
                                <img
                                    src={item.variant.picture || "/src/assets/logos/AppLogo-iconOnly.png"}
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        borderRadius: "6px",
                                        objectFit: "cover",
                                    }}
                                    alt={item.variant.product.name}
                                />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <Typography sx={{ fontSize: "14px" }}>
                                        {item.variant.product.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
                                        {item.variant.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px" }}>
                                        {item.quantity}x
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography>
                                {formatPrice(Number(item.variant.price) * item.quantity)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>

            {/* FOOTER */}
            <CardActions
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    paddingBottom: "24px",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        width: "100%",
                        gap: "8px",
                    }}
                >
                    <Typography variant="body1" sx={{ paddingBottom: "4px" }}>
                        Order Total:
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ fontSize: "24px", color: "#89a471", fontWeight: "600" }}
                    >
                        {formatPrice(order.amount_paid)}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        width: "100%",
                        gap: "16px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {order.status === "completed" && (
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                color: "white",
                                borderColor: "#89a471",
                                backgroundColor: "#89a471",
                                width: "160px",
                                "&:hover": { backgroundColor: "#7a9562" },
                            }}
                        >
                            Rate
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        onClick={(e) => onStartChat(e, order)}
                        sx={{
                            textTransform: "none",
                            color: "#89a471",
                            borderColor: "#89a471",
                            width: "160px",
                        }}
                    >
                        Contact Seller
                    </Button>

                    {order.status === "completed" && (
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                color: "#89a471",
                                borderColor: "#89a471",
                                width: "160px",
                            }}
                        >
                            Buy Again
                        </Button>
                    )}

                    {order.status === "pending" && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => onCancelOrder(order.order_id)}
                            sx={{ textTransform: "none", width: "160px" }}
                        >
                            Cancel Order
                        </Button>
                    )}
                </Box>
            </CardActions>
        </Card>
    );
}