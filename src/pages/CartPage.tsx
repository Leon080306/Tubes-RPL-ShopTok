import { useState, useEffect } from "react";
import { Box, Button, Card, CardContent, Checkbox, IconButton, Paper, Typography } from "@mui/material"
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import formatPrice from "../utils/FormatPrice";

import { useAppSelector } from "../hooks/useAppSelector";
import type { CartItem } from "../type";

export default function CartPage() {
const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;

    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    // ================= FETCH CART =================
    const getCart = async () => {
        if (!user_id) return;
        try {
            const res = await fetch(`/api/cart?user_id=${user_id}`);
            const data = await res.json();
            setItems(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCart();
    }, [user_id]);

    // ================= UPDATE (qty / is_selected) =================
    const updateItem = async (variant_id: string, body: { quantity?: number; is_selected?: boolean }) => {
        if (!user_id) return;
        try {
            await fetch(`/api/cart/${variant_id}?user_id=${user_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleIncrement = async (variant_id: string, currentQty: number) => {
        await updateItem(variant_id, { quantity: currentQty + 1 });
        setItems(prev =>
            prev.map(item => item.variant_id === variant_id ? { ...item, quantity: currentQty + 1 } : item)
        );
    };

    const handleDecrement = async (variant_id: string, currentQty: number) => {
        if (currentQty <= 1) return;
        await updateItem(variant_id, { quantity: currentQty - 1 });
        setItems(prev =>
            prev.map(item => item.variant_id === variant_id ? { ...item, quantity: currentQty - 1 } : item)
        );
    };

    const handleToggleSelect = async (variant_id: string, currentSelect: boolean) => {
        await updateItem(variant_id, { is_selected: !currentSelect });
        setItems(prev =>
            prev.map(item => item.variant_id === variant_id ? { ...item, is_selected: !currentSelect } : item)
        );
    };

    // ================= SELECT ALL =================
    const allSelected = items.length > 0 && items.every(item => item.is_selected);

    const handleSelectAll = async () => {
        const newValue = !allSelected;
        await Promise.all(items.map(item => updateItem(item.variant_id, { is_selected: newValue })));
        setItems(prev => prev.map(item => ({ ...item, is_selected: newValue })));
    };

    // ================= DELETE =================
    const handleDelete = async (variant_id: string) => {
        if (!window.confirm("Hapus barang dari keranjang?")) return;
        if (!user_id) return;
        try {
            await fetch(`/api/cart/${variant_id}?user_id=${user_id}`, {
                method: "DELETE",
            });
            setItems(prev => prev.filter(item => item.variant_id !== variant_id));
        } catch (error) {
            console.error(error);
        }
    };

    // ================= TOTAL =================
    const total = items
        .filter(item => item.is_selected)
        .reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

    if (loading) return <Typography>Loading keranjang...</Typography>;


    return <Box sx={{
        width: "100%",
        height: "calc(100vh - 104px)",
        display: "flex",
        gap: "24px",
    }}>
        <Paper elevation={0} sx={{
            flex: 2.8,
            backgroundColor: "transparent",
            overflow: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
        }}>
            <Card elevation={0} sx={{
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: "8px",
                paddingInline: "12px",
                marginBottom: "24px",
            }}>
                <CardContent>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                        width: "100%",
                        paddingBottom: "8px",
                        gap: "12px"
                    }}>
                        <Checkbox checked={allSelected} onChange={handleSelectAll} sx={{ color: "#89a471", '&.Mui-checked': { color: "#89a471" }, padding: 0 }} />
                        <Box sx={{ height: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <StorefrontIcon sx={{ fontSize: "24px" }} />
                                <Typography variant="body1" sx={{ fontSize: "14px", fontWeight: "600", margin: "0", padding: "0" }}>
                                    {items[0]?.variant?.product?.shop?.name || "Toko"}
                                </Typography>
                            </Box>
                            <Button startIcon={<ChatIcon />} variant="contained" sx={{
                                padding: "4px 12px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "white",
                                borderColor: "#89a471",
                                backgroundColor: "#89a471"
                            }}>Chat</Button>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {items.map((item, index) => (
                            <Box key={item.variant_id} sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                paddingBlock: "18px",
                                paddingBottom: index === items.length - 1 ? "0" : "18px",
                                width: "100%",
                                borderBottom: index === items.length - 1 ? "none" : "1px solid rgba(0, 0, 0, 0.2)",
                                gap: "12px",
                            }}>
                                <Checkbox 
                                    checked={item.is_selected}
                                    onChange={() => handleToggleSelect(item.variant_id, item.is_selected)}
                                    sx={{ color: "#89a471", '&.Mui-checked': { color: "#89a471" }, padding: "0" }} 
                                />
                                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "stretch", flex: 1 }}>
                                    <Box sx={{ display: "flex", justifyContent: "start", alignItems: "flex-start", gap: "18px" }}>
                                        <img
                                            src={item.variant.picture}
                                            style={{ width: "80px", height: "80px", borderRadius: "6px" }}
                                            alt=""
                                        />
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            <Typography sx={{ fontSize: "14px" }}>{item.variant?.product?.name}</Typography>
                                            <Typography sx={{ fontSize: "14px", color: "#666" }}>
                                              {item.variant.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch" }}>
                                        <Typography>{formatPrice(Number(item.variant.price) * item.quantity)}</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <IconButton sx={{ padding: 0 }}>
                                                <FavoriteBorderIcon />
                                            </IconButton>
                                            <IconButton sx={{ padding: 0 }} onClick={() => handleDelete(item.variant_id)}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 50 }}>
                                                <IconButton size="small" onClick={() => handleDecrement(item.variant_id, item.quantity)}>
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <Typography sx={{ minWidth: "24px", textAlign: "center", userSelect: "none" }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton size="small" onClick={() => handleIncrement(item.variant_id, item.quantity)}>
                                                    <AddIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Paper>

        <Paper elevation={0} sx={{
            flex: 1,
            height: "500px",
            maxHeight: "calc(100vh - 104px)",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
        }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>Ringkasan belanja</Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item) => (
                    <Box key={item.variant_id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "13px", color: "text.secondary", flex: 1 }}>
                            {item.variant.name}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "text.secondary", whiteSpace: "nowrap", mx: "8px" }}>
                            x{item.quantity}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {formatPrice(Number(item.variant.price) * item.quantity)}
                        </Typography>
                    </Box>
                ))}
                <Box sx={{ borderTop: "1px dashed rgba(0,0,0,0.15)", mt: "4px", pt: "8px" }} />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
                <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>Total</Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>{formatPrice(total)}</Typography>
            </Box>
        </Paper>
    </Box>
    
}