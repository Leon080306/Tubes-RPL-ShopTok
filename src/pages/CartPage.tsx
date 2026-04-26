import { useEffect, useState, useMemo } from "react";
import {
    Box, Button, Checkbox, IconButton, Paper,
    Typography, Avatar, Divider, Stack,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import formatPrice from "../utils/FormatPrice";
import type { CartItem } from "../type";
import { useAppSelector } from "../hooks/useAppSelector";
import { useNavigate } from "react-router";
import { startChat } from "../utils/StartChat";

const PRIMARY = "#003f29";

type ShopGroup = {
    shop_id: string;
    shop_name: string;
    items: CartItem[];
    profile_pic: string;
};

export default function CartPage() {
    const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;
    const navigate = useNavigate();

    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    // ─── Fetch ────────────────────────────────────────────────
    const getCart = async () => {
        if (!user_id) return;
        try {
            const res = await fetch(`/api/cart?user_id=${user_id}`);
            const data = await res.json();
            const valid = (data.data ?? []).filter(
                (item: CartItem) => item.variant !== null && item.variant !== undefined
            );
            setItems(valid);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getCart(); }, [user_id]);

    // ─── Group by shop ────────────────────────────────────────
    const shopGroups = useMemo<ShopGroup[]>(() => {
        const map = new Map<string, ShopGroup>();
        for (const item of items) {
            const shop = item.variant?.product?.shop;
            const shop_id = shop?.shop_id ?? "unknown";
            const shop_name = shop?.name ?? "Toko";
            const profile_pic = shop?.profile_pic ?? "";
            if (!map.has(shop_id)) map.set(shop_id, { shop_id, shop_name, items: [], profile_pic });
            map.get(shop_id)!.items.push(item);
        }
        return Array.from(map.values());
    }, [items]);

    // ─── Update helper ────────────────────────────────────────
    const updateItem = async (variant_id: string, body: { quantity?: number; is_selected?: boolean }) => {
        if (!user_id) return;
        await fetch(`/api/cart/${variant_id}?user_id=${user_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    };

    const handleIncrement = async (variant_id: string, qty: number, stock: number) => {
        if (qty >= stock) return;
        await updateItem(variant_id, { quantity: qty + 1 });
        setItems(prev => prev.map(i => i.variant_id === variant_id ? { ...i, quantity: qty + 1 } : i));
    };

    const handleDecrement = async (variant_id: string, qty: number) => {
        if (qty <= 1) return;
        await updateItem(variant_id, { quantity: qty - 1 });
        setItems(prev => prev.map(i => i.variant_id === variant_id ? { ...i, quantity: qty - 1 } : i));
    };

    const handleToggleSelect = async (variant_id: string, current: boolean) => {
        await updateItem(variant_id, { is_selected: !current });
        setItems(prev => prev.map(i => i.variant_id === variant_id ? { ...i, is_selected: !current } : i));
    };

    const handleDelete = async (variant_id: string) => {
        if (!user_id) return;
        await fetch(`/api/cart/${variant_id}?user_id=${user_id}`, { method: "DELETE" });
        window.dispatchEvent(new Event("cart-updated"));
        setItems(prev => prev.filter(i => i.variant_id !== variant_id));
    };

    const handleShopSelectAll = async (group: ShopGroup) => {
        const newVal = !group.items.every(i => i.is_selected);
        await Promise.all(group.items.map(i => updateItem(i.variant_id, { is_selected: newVal })));
        setItems(prev => prev.map(i =>
            group.items.some(gi => gi.variant_id === i.variant_id) ? { ...i, is_selected: newVal } : i
        ));
    };

    const allSelected = items.length > 0 && items.every(i => i.is_selected);
    const handleSelectAll = async () => {
        const newVal = !allSelected;
        await Promise.all(items.map(i => updateItem(i.variant_id, { is_selected: newVal })));
        setItems(prev => prev.map(i => ({ ...i, is_selected: newVal })));
    };

    const selectedItems = items.filter(i => i.is_selected && i.variant);
    const total = selectedItems.reduce((sum, i) => sum + Number(i.variant?.price ?? 0) * i.quantity, 0);

    const handleChat = async (e: React.MouseEvent, shop_id: string) => {
        e.stopPropagation();
        if (!user_id || !shop_id) return;
        const success = await startChat(user_id, shop_id, "Halo, saya ingin bertanya tentang pesanan saya");
        if (success) navigate(`/chattoko?shop_id=${shop_id}`);
    };

    // ─── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 104px)" }}>
                <Typography color="text.secondary">Memuat keranjang...</Typography>
            </Box>
        );
    }

    // ─── Empty ────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <Box sx={{
                width: "100%", height: "calc(100vh - 104px)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
            }}>
                <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: "#ccc" }} />
                <Typography variant="h6" fontWeight={700} color="#333">Keranjang kamu kosong</Typography>
                <Typography color="text.secondary" fontSize={14}>Yuk, mulai belanja sekarang!</Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{ bgcolor: PRIMARY, borderRadius: 99, px: 4, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#002a1c" } }}
                >
                    Mulai Belanja
                </Button>
            </Box>
        );
    }

    // ─── Main ─────────────────────────────────────────────────
    return (
        <Box sx={{
            width: "100%",
            height: "calc(100vh - 104px)",
            display: "flex",
            gap: 3,
            overflow: "hidden",
            py: 2,
        }}>

            {/* ═══════════ LEFT: CART ITEMS ═══════════ */}
            <Box sx={{
                flex: 2.8,
                height: "100%",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pr: 0.5,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#d1d5db", borderRadius: 2 },
            }}>
                {/* Global select all */}
                <Paper elevation={0} sx={{
                    border: "1px solid #e8ecf0", borderRadius: 2,
                    px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.5,
                    flexShrink: 0,
                }}>
                    <Checkbox
                        checked={allSelected}
                        onChange={handleSelectAll}
                        sx={{ p: 0, color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
                    />
                    <Typography fontSize={14} fontWeight={600} color="#334155">
                        Pilih Semua ({items.length} produk)
                    </Typography>
                </Paper>

                {/* Shop groups */}
                {shopGroups.map((group) => {
                    const shopAllSelected = group.items.every(i => i.is_selected);
                    const shopSomeSelected = group.items.some(i => i.is_selected);

                    return (
                        <Paper key={group.shop_id} elevation={0} sx={{
                            border: "1px solid #e8ecf0", borderRadius: 2,
                            overflow: "hidden", flexShrink: 0,
                        }}>
                            {/* Shop header */}
                            <Box sx={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                px: 2.5, py: 1.5, bgcolor: "#f8fafc", borderBottom: "1px solid #e8ecf0",
                            }}>
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <Checkbox
                                        checked={shopAllSelected}
                                        indeterminate={shopSomeSelected && !shopAllSelected}
                                        onChange={() => handleShopSelectAll(group)}
                                        sx={{
                                            p: 0, color: PRIMARY,
                                            "&.Mui-checked": { color: PRIMARY },
                                            "&.MuiCheckbox-indeterminate": { color: PRIMARY },
                                        }}
                                    />
                                    {group.profile_pic ? (
                                        <Avatar sx={{ width: 28, height: 28 }} src={group.profile_pic ? `/api/${group.profile_pic}` : "/placeholder.png"} />
                                    ) : (
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: "#e8f5e9" }}>
                                            <StorefrontIcon sx={{ fontSize: 16, color: PRIMARY }} />
                                        </Avatar>
                                    )}
                                    <Typography
                                        fontSize={14} fontWeight={700} color="#1e293b"
                                        sx={{ cursor: "pointer", "&:hover": { color: PRIMARY } }}
                                        onClick={() => navigate(`/shop/${group.shop_id}`)}
                                    >
                                        {group.shop_name}
                                    </Typography>
                                </Stack>
                                <Button
                                    size="small"
                                    startIcon={<ChatIcon sx={{ fontSize: 14 }} />}
                                    onClick={(e) => handleChat(e, group.shop_id)}
                                    sx={{
                                        textTransform: "none", fontSize: 12, fontWeight: 600,
                                        color: PRIMARY, border: "1px solid", borderColor: PRIMARY,
                                        borderRadius: 99, px: 1.5, py: 0.4,
                                        "&:hover": { bgcolor: "#e8f5e9" },
                                    }}
                                >
                                    Chat
                                </Button>
                            </Box>

                            {/* Items */}
                            <Box sx={{ px: 2.5 }}>
                                {group.items.map((item, idx) => {
                                    const stock = item.variant?.stock ?? 0;
                                    const isOutOfStock = stock === 0;
                                    const exceedsStock = item.quantity > stock;
                                    const price = Number(item.variant?.price ?? 0);

                                    return (
                                        <Box key={item.variant_id}>
                                            <Box sx={{
                                                display: "flex", alignItems: "center", gap: 2,
                                                py: 2, opacity: isOutOfStock ? 0.5 : 1,
                                            }}>
                                                <Checkbox
                                                    checked={item.is_selected}
                                                    onChange={() => handleToggleSelect(item.variant_id, item.is_selected)}
                                                    disabled={isOutOfStock}
                                                    sx={{ p: 0, flexShrink: 0, color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
                                                />
                                                <Box
                                                    component="img"
                                                    src={item.variant.picture ? `/api/${item.variant.picture}` : "/placeholder.png"}
                                                    alt={item.variant?.name}
                                                    sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: "cover", border: "1px solid #f1f5f9", flexShrink: 0 }}
                                                />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography fontSize={14} fontWeight={500} noWrap color="#1e293b">
                                                        {item.variant?.product?.name}
                                                    </Typography>
                                                    <Typography fontSize={12} color="#94a3b8" mt={0.3}>
                                                        {item.variant?.name}
                                                    </Typography>
                                                    {isOutOfStock && (
                                                        <Typography fontSize={11} color="#d32f2f" fontWeight={600} mt={0.5}>Stok habis</Typography>
                                                    )}
                                                    {!isOutOfStock && exceedsStock && (
                                                        <Typography fontSize={11} color="#e65100" fontWeight={600} mt={0.5}>Sisa stok: {stock}</Typography>
                                                    )}
                                                    {!isOutOfStock && !exceedsStock && stock <= 5 && (
                                                        <Typography fontSize={11} color="#e65100" mt={0.5}>Sisa stok: {stock}</Typography>
                                                    )}
                                                </Box>

                                                {/* Price + controls */}
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5, flexShrink: 0 }}>
                                                    <Typography fontSize={14} fontWeight={700} color={PRIMARY}>
                                                        {formatPrice(price * item.quantity)}
                                                    </Typography>
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(item.variant_id)}
                                                            sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "#fff5f5" }, p: 0.5 }}
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                        <Box sx={{
                                                            display: "flex", alignItems: "center",
                                                            border: "1px solid #e2e8f0", borderRadius: 99, overflow: "hidden",
                                                        }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDecrement(item.variant_id, item.quantity)}
                                                                disabled={isOutOfStock || item.quantity <= 1}
                                                                sx={{ borderRadius: 0, width: 28, height: 28 }}
                                                            >
                                                                <RemoveIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                            <Typography sx={{ minWidth: 28, textAlign: "center", fontSize: 13, fontWeight: 600 }}>
                                                                {isOutOfStock ? 0 : item.quantity}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleIncrement(item.variant_id, item.quantity, stock)}
                                                                disabled={isOutOfStock || item.quantity >= stock}
                                                                sx={{ borderRadius: 0, width: 28, height: 28 }}
                                                            >
                                                                <AddIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Box>
                                            {idx < group.items.length - 1 && (
                                                <Divider sx={{ borderColor: "#f1f5f9" }} />
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Paper>
                    );
                })}

                <Box sx={{ flexShrink: 0, height: 8 }} />
            </Box>

            {/* ═══════════ RIGHT: SUMMARY ═══════════ */}
            <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
                <Paper
                    elevation={0}
                    sx={{
                        border: "1px solid #e8ecf0",
                        borderRadius: 2,
                        maxHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Header – fixed */}
                    <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #e8ecf0", bgcolor: "#f8fafc", flexShrink: 0 }}>
                        <Typography fontSize={15} fontWeight={700} color="#1e293b">Ringkasan Belanja</Typography>
                    </Box>

                    {/* Scrollable items list */}
                    <Box
                        sx={{
                            px: 2.5,
                            py: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            overflowY: "auto",
                            flexGrow: 1,
                            minHeight: 0,
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        {selectedItems.length === 0 ? (
                            <Typography fontSize={13} color="#94a3b8" fontStyle="italic" textAlign="center" py={1}>
                                Belum ada item yang dipilih
                            </Typography>
                        ) : (
                            selectedItems.map((item) => (
                                <Box key={item.variant_id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography fontSize={12} color="#64748b" noWrap>{item.variant?.product?.name}</Typography>
                                        <Typography fontSize={11} color="#94a3b8">{item.variant?.name} × {item.quantity}</Typography>
                                    </Box>
                                    <Typography fontSize={12} fontWeight={600} color="#1e293b" whiteSpace="nowrap">
                                        {formatPrice(Number(item.variant?.price ?? 0) * item.quantity)}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* Footer – fixed */}
                    <Box sx={{ flexShrink: 0 }}>
                        <Box sx={{ px: 2.5, pb: 1.5 }}>
                            <Divider sx={{ borderStyle: "dashed", borderColor: "#e2e8f0", mb: 1.5 }} />
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography fontSize={14} fontWeight={600} color="#1e293b">Total</Typography>
                                <Typography fontSize={18} fontWeight={800} color={PRIMARY}>{formatPrice(total)}</Typography>
                            </Box>
                            {selectedItems.length > 0 && (
                                <Typography fontSize={11} color="#94a3b8" textAlign="right" mt={0.5}>
                                    {selectedItems.length} item terpilih
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ px: 2.5, pb: 2.5 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                disabled={selectedItems.length === 0}
                                onClick={() => navigate("/orders/checkout")}
                                sx={{
                                    bgcolor: PRIMARY, borderRadius: 99,
                                    textTransform: "none", fontWeight: 700, fontSize: 14, py: 1.25,
                                    "&:hover": { bgcolor: "#002a1c" },
                                    "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                                }}
                            >
                                Checkout ({selectedItems.length} item)
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}