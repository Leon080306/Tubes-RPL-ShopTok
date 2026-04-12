import { useState } from "react";
import { Box, Button, Card, CardContent, Checkbox, IconButton, Paper, Typography } from "@mui/material"
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import formatPrice from "../utils/FormatPrice";

type CartItem = {
    id: number;
    name: string;
    rating: number;
    totalReviews: number;
    price: number;
    qty: number;
};

const initialProducts: CartItem[] = [
    { id: 1, name: "Wireless Earbuds", rating: 5, totalReviews: 121, price: 120000, qty: 4 },
    { id: 2, name: "Wireless Earbuds", rating: 5, totalReviews: 121, price: 120000, qty: 4 },
];

export default function CartPage() {
    const [products, setProducts] = useState<CartItem[]>(initialProducts);

    const handleIncrement = (id: number) =>
        setProducts(prev => prev.map(p => p.id === id ? { ...p, qty: p.qty + 1 } : p));

    const handleDecrement = (id: number) =>
        setProducts(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p));

    const handleDelete = (id: number) =>
        setProducts(prev => prev.filter(p => p.id !== id));

    const total = products.reduce((sum, p) => sum + p.price * p.qty, 0);

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
                        <Checkbox sx={{ color: "#89a471", '&.Mui-checked': { color: "#89a471" }, padding: 0 }} />
                        <Box sx={{ height: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <StorefrontIcon sx={{ fontSize: "24px" }} />
                                <Typography variant="body1" sx={{ fontSize: "14px", fontWeight: "600", margin: "0", padding: "0" }}>
                                    Product Toko
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
                        {products.map((product, index) => (
                            <Box key={product.id} sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                paddingBlock: "18px",
                                paddingBottom: index === products.length - 1 ? "0" : "18px",
                                width: "100%",
                                borderBottom: index === products.length - 1 ? "none" : "1px solid rgba(0, 0, 0, 0.2)",
                                gap: "12px",
                            }}>
                                <Checkbox sx={{ color: "#89a471", '&.Mui-checked': { color: "#89a471" }, padding: "0" }} />
                                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "stretch", flex: 1 }}>
                                    <Box sx={{ display: "flex", justifyContent: "start", alignItems: "flex-start", gap: "18px" }}>
                                        <img
                                            src="/src/assets/logos/AppLogo-iconOnly.png"
                                            style={{ width: "80px", height: "80px", borderRadius: "6px" }}
                                            alt=""
                                        />
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            <Typography sx={{ fontSize: "14px" }}>{product.name}</Typography>
                                            <Typography sx={{ fontSize: "14px" }}>VARIANT</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch" }}>
                                        <Typography>{formatPrice(product.price * product.qty)}</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <IconButton sx={{ padding: 0 }}>
                                                <FavoriteBorderIcon />
                                            </IconButton>
                                            <IconButton sx={{ padding: 0 }} onClick={() => handleDelete(product.id)}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 50 }}>
                                                <IconButton size="small" onClick={() => handleDecrement(product.id)}>
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <Typography sx={{ minWidth: "24px", textAlign: "center", userSelect: "none" }}>
                                                    {product.qty}
                                                </Typography>
                                                <IconButton size="small" onClick={() => handleIncrement(product.id)}>
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
                {products.map((product) => (
                    <Box key={product.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "13px", color: "text.secondary", flex: 1 }}>
                            {product.name}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "text.secondary", whiteSpace: "nowrap", mx: "8px" }}>
                            x{product.qty}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {formatPrice(product.price * product.qty)}
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