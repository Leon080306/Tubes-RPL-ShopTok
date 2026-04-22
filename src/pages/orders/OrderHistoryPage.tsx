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
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { fetchMyOrders } from "../../store/orderSlice";
import type { OrderDetail } from "../../type";
import formatPrice from "../../utils/FormatPrice";

const TAB_TO_STATUS: Record<string, string> = {
    'all': 'all',
    'to-pay': 'pending',
    'to-ship': 'pending',
    'to-receive': 'pending',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'return-refund': 'cancelled',
}

const STATUS_LABEL: Record<string, string> = {
    pending: 'To Pay',
    completed: 'Completed',
    cancelled: 'Cancelled',
}

export default function OrderHistoryPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { orders, status } = useAppSelector(state => state.order);

    const [tabValue, setTabValue] = useState('all');
    const [search, setSearch] = useState('');

    // Fetch ulang tiap kali tab berubah
    useEffect(() => {
        const mappedStatus = TAB_TO_STATUS[tabValue] ?? 'all';
        dispatch(fetchMyOrders(mappedStatus));
    }, [tabValue, dispatch]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    // Filter lokal by search
    const filteredOrders = orders.filter(order => {
        if (!search) return true;
        const q = search.toLowerCase();
        const matchShop = order.shop?.name?.toLowerCase().includes(q);
        const matchId = order.order_id.toLowerCase().includes(q);
        const matchProduct = order.orderItems.some(item =>
            item.variant.product.name.toLowerCase().includes(q)
        );
        return matchShop || matchId || matchProduct;
    });

    return (
        <Paper sx={{
            height: "100%",
            flex: 4,
            boxSizing: "border-box",
            overflow: "auto",
            boxShadow: "none",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            paddingInline: "64px"
        }}>
            {/* TABS */}
            <Paper elevation={2} sx={{ width: '100%', border: '1px solid rgba(0, 0, 0, 0.2)' }}>
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
                    <Tab value="all" label="All" />
                    <Tab value="to-pay" label="To Pay" />
                    <Tab value="to-ship" label="To Ship" />
                    <Tab value="to-receive" label="To Receive" />
                    <Tab value="completed" label="Completed" />
                    <Tab value="cancelled" label="Cancelled" />
                    <Tab value="return-refund" label="Returned" />
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

            {/* LIST */}
            <Paper sx={{
                flex: 1,
                overflow: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}>
                {status === 'loading' && (
                    <Box display="flex" justifyContent="center" p={5}>
                        <CircularProgress sx={{ color: "#89a471" }} />
                    </Box>
                )}

                {status !== 'loading' && filteredOrders.length === 0 && (
                    <Box display="flex" justifyContent="center" p={5}>
                        <Typography color="text.secondary">Tidak ada order ditemukan.</Typography>
                    </Box>
                )}

                {status !== 'loading' && filteredOrders.map((order: OrderDetail) => (
                    <Card
                        key={order.order_id}
                        onClick={() => navigate(`/orders/detail/${order.order_id}`)}
                        sx={{
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            paddingInline: "12px",
                            marginBottom: "24px",
                            cursor: "pointer",
                            "&:hover": { boxShadow: 3 }
                        }}
                    >
                        <CardContent>
                            {/* HEADER — shop info + status */}
                            <Box sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                                width: "100%",
                                paddingBottom: "8px"
                            }}>
                                <Box sx={{ height: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
                                    <StorefrontIcon sx={{ fontSize: "24px" }} />
                                    <Typography variant="body1" sx={{ fontSize: "14px", fontWeight: "600" }}>
                                        {order.shop?.name ?? "Toko"}
                                    </Typography>
                                    <Button
                                        startIcon={<ChatIcon />}
                                        variant="contained"
                                        onClick={(e) => e.stopPropagation()} // biar klik chat ga trigger navigate
                                        sx={{
                                            padding: "4px 12px", height: "fit-content",
                                            textTransform: "none", color: "white",
                                            borderColor: "#89a471", backgroundColor: "#89a471"
                                        }}
                                    >Chat</Button>
                                    <Button
                                        startIcon={<StorefrontIcon />}
                                        variant="outlined"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/shop/${order.shop_id}`);
                                        }}
                                        sx={{
                                            padding: "4px 8px", height: "fit-content",
                                            textTransform: "none", color: "#89a471", borderColor: "#89a471"
                                        }}
                                    >View Shop</Button>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Button
                                        startIcon={<LocalShippingIcon />}
                                        variant="text"
                                        sx={{ height: "fit-content", textTransform: "none", color: "#89a471" }}
                                    >
                                        {order.status === 'completed'
                                            ? 'Parcel has been delivered.'
                                            : order.status === 'cancelled'
                                            ? 'Order was cancelled.'
                                            : 'Order is being processed.'}
                                    </Button>
                                    <Divider orientation="vertical" flexItem />
                                    <Typography sx={{ textTransform: "uppercase", color: "#89a471", fontWeight: "500", fontSize: "13px" }}>
                                        {STATUS_LABEL[order.status] ?? order.status}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* ITEMS */}
                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                {order.orderItems.map((item, index) => (
                                    <Box key={item.variant_id} sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "18px 12px",
                                        borderBottom: index === order.orderItems.length - 1
                                            ? "none"
                                            : "1px solid rgba(0, 0, 0, 0.2)"
                                    }}>
                                        <Box sx={{ display: "flex", gap: "18px" }}>
                                            <img
                                                src={item.variant.picture || "/src/assets/logos/AppLogo-iconOnly.png"}
                                                style={{ width: "60px", height: "60px", borderRadius: "6px", objectFit: "cover" }}
                                                alt=""
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

                        <CardActions sx={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "24px" }}>
                            {/* TOTAL */}
                            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end", width: "100%", gap: "8px" }}>
                                <Typography variant="body1" sx={{ paddingBottom: "4px" }}>Order Total:</Typography>
                                <Typography variant="body1" sx={{ fontSize: "24px", color: "#89a471", fontWeight: "600" }}>
                                    {formatPrice(order.amount_paid)}
                                </Typography>
                            </Box>

                            {/* ACTION BUTTONS */}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", gap: "16px" }}
                                onClick={(e) => e.stopPropagation()} // biar klik tombol ga trigger navigate ke detail
                            >
                                {order.status === 'completed' && (
                                    <Button variant="outlined" sx={{
                                        textTransform: "none", color: "white",
                                        borderColor: "#89a471", backgroundColor: "#89a471", width: "160px"
                                    }}>Rate</Button>
                                )}
                                <Button variant="outlined" sx={{
                                    textTransform: "none", color: "#89a471",
                                    borderColor: "#89a471", width: "160px"
                                }}>Contact Seller</Button>
                                {order.status === 'completed' && (
                                    <Button variant="outlined" sx={{
                                        textTransform: "none", color: "#89a471",
                                        borderColor: "#89a471", width: "160px"
                                    }}>Buy Again</Button>
                                )}
                                {order.status === 'pending' && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => navigate(`/orders/detail/${order.order_id}`)}
                                        sx={{ textTransform: "none", width: "160px" }}
                                    >View & Cancel</Button>
                                )}
                            </Box>
                        </CardActions>
                    </Card>
                ))}
            </Paper>
        </Paper>
    );
}