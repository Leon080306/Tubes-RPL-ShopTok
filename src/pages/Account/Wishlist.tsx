import {
    Box,
    Button,
    Card,
    FormControl,
    IconButton,
    MenuItem,
    Rating,
    Select,
    Snackbar,
    Tooltip,
    Typography,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import StarIcon from "@mui/icons-material/Star";
import "swiper/swiper-bundle.css";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useEffect } from "react";
import { useAppSelector } from "../../hooks/useAppSelector";
import FavoriteIcon from "@mui/icons-material/Favorite";

type WishlistVariant = {
    variant_id: string;
    name: string;
    price: string;
    picture: string;
    stock: number;
}

type WishlistProduct = {
    product_id: string;
    name: string;
    variants?: WishlistVariant[];
}

type WishlistItem = {
    user_id: string;
    product_id: string;
    product: WishlistProduct;
}

export default function Wishlist() {
    const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;
    const navigate = useNavigate();

    const [items, setItems] = useState<WishlistItem[]>([]);
    const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
    const [rating, setRating] = useState<number | null>(null);
    const [sortPrice, setSortPrice] = useState<"high" | "low" | "">("");
    const [sortRating, setSortRating] = useState<"high" | "low" | "">("");

    useEffect(() => {
        if (!user_id) return;

        let cancelled = false;

        const fetchWishlist = async () => {
            try {
                const res = await fetch(`/api/wishlist?user_id=${user_id}`);
                const data = await res.json();
                console.log("Wishlist API response:", data); // ← Debug this
                if (!cancelled) {
                    const records = data.records ?? data.data ?? [];
                    setItems(records);
                    // ← Initialize wishlistedIds from fetched data
                    setWishlistedIds(records.map((item: WishlistItem) => item.product_id));
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchWishlist();

        return () => {
            cancelled = true;
        };
    }, [user_id]);

    // ================= TOGGLE WISHLIST =================
    const handleToggleWishlist = async (e: React.MouseEvent, product_id: string) => {
        e.stopPropagation();
        if (!user_id) return;
        try {
            await fetch(`/api/wishlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, product_id }),
            });

            // update state lokal
            const isWishlisted = wishlistedIds.includes(product_id);
            if (isWishlisted) {
                setItems(prev => prev.filter(item => item.product_id !== product_id));
                setWishlistedIds(prev => prev.filter(id => id !== product_id));
            } else {
                setWishlistedIds(prev => [...prev, product_id]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Tambah handler ini di Wishlist.tsx
    const handleAddToCart = async (e: React.MouseEvent, product: { id: string, variants?: WishlistVariant[] }) => {
        e.stopPropagation();
        if (!user_id) return;

        const variant_id = product.variants?.[0]?.variant_id;
        if (!variant_id) return alert("Produk tidak memiliki varian");

        try {
            const res = await fetch(`/api/cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, variant_id, quantity: 1 }),
            });

            if (!res.ok) {
                const data = await res.json();
                return alert(data.message);
            }

            alert("Berhasil ditambah ke cart!");
        } catch (error) {
            console.error(error);
        }
    };

    // ================= FILTER + SORT =================
    const products = items.map(item => ({
        id: item.product_id,
        name: item.product.name,
        price: item.product.variants?.[0]?.price
            ? Number(item.product.variants[0].price)
            : 0,
        picture: item.product.variants?.[0]?.picture ?? '',
        rating: 0,
        variants: item.product.variants,
    }));

    const filteredProducts = products
        .filter(item => {
            if (!rating) return true;
            return item.rating <= rating && item.rating >= (rating === 1 ? 0 : rating - 0.9);
        })
        .sort((a, b) => {
            if (sortPrice === "high") return b.price - a.price;
            if (sortPrice === "low") return a.price - b.price;
            if (sortRating === "high") return b.rating - a.rating;
            if (sortRating === "low") return a.rating - b.rating;
            return 0;
        });

    return (
        <div style={{
            width: "100%",
            minWidth: 0
        }}>

            <Box
                sx={{
                    mt: 7,
                    display: "flex",
                    gap: 2,
                    width: "fit-content",
                }}
            >
                <FormControl size="small" sx={{ width: 140 }}>
                    <Select
                        displayEmpty
                        defaultValue=""
                        renderValue={(selected) =>
                            !selected ? (
                                <span style={{ opacity: 0.6 }}>Category</span>
                            ) : (
                                selected
                            )
                        }
                    >
                        <MenuItem value="" sx={{ opacity: 0.4 }}>
                            <em>All Category</em>
                        </MenuItem>
                        <MenuItem value={"Smartphone"}>Smartphone</MenuItem>
                        <MenuItem value={"Headphone"}>Headphone</MenuItem>
                        <MenuItem value={"Earbuds"}>Earbuds</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ width: 110 }}>
                    <Select
                        displayEmpty
                        value={sortPrice}
                        onChange={(e) => {
                            const value = e.target.value as "high" | "low" | "";
                            setSortPrice(value);

                            // optional: reset sort rating biar tidak bentrok
                            setSortRating("");
                        }}
                        renderValue={(selected) =>
                            !selected ? (
                                <span style={{ opacity: 0.6 }}>Price</span>
                            ) : selected === "high" ? (
                                "Highest"
                            ) : (
                                "Lowest"
                            )
                        }
                    >
                        <MenuItem value="" sx={{ opacity: 0.4 }}>
                            <em>All Price</em>
                        </MenuItem>
                        <MenuItem value={"Highest"}>Highest Price</MenuItem>
                        <MenuItem value={"Lowest"}>Lowest Price</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ width: 150 }}>
                    <Select
                        displayEmpty
                        value={rating ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            setRating(value === 0 ? null : Number(value));
                        }}
                        renderValue={(selected) => {
                            if (!selected) {
                                return (
                                    <span style={{ opacity: 0.6 }}>Rating</span>
                                );
                            }

                            return (
                                <Rating
                                    sx={{
                                        color: "#16a34a",
                                    }}
                                    value={Number(selected)}
                                    readOnly
                                    size="small"
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" />}
                                />
                            );
                        }}
                        MenuProps={{
                            disableAutoFocusItem: true,
                        }}
                    >
                        <MenuItem value="" sx={{ opacity: 0.4 }}>
                            <em>All Rating</em>
                        </MenuItem>

                        <MenuItem
                            disableRipple
                            sx={{
                                cursor: "default",
                                "&:hover": { backgroundColor: "transparent" },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    width: "100%",
                                    py: 1,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Rating
                                    value={rating ?? 0}
                                    onChange={(_, newValue) => {
                                        setRating(newValue);
                                    }}
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" />}
                                    sx={{
                                        color: "#16a34a",
                                    }}
                                />
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>

                <Tooltip title="Apply Filter">
                    <IconButton
                        sx={{
                            backgroundColor: "#1976d2",
                            color: "white",
                            height: 36,
                            width: 36,
                            borderRadius: 5,
                            "&:hover": {
                                backgroundColor: "#1565c0",
                            },
                        }}
                    >
                        <TuneIcon />
                    </IconButton>
                </Tooltip>
                <Snackbar></Snackbar>
            </Box>

            <Typography variant="h5" marginTop={5}><strong>Wishlist</strong></Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: 5 }}>
                {filteredProducts.map((product) => (
                    <Card key={product.id}
                        sx={{ cursor: "pointer", borderRadius: 4, boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.27)", p: 2, backgroundColor: "#ffffff", transition: "0.3s", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" } }}
                        onClick={() => navigate(`/product/${product.id}`)}>
                        <Box sx={{ position: "relative", backgroundColor: "#f3f3f3", borderRadius: 3, height: 200, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", mb: 2 }}>
                            <IconButton
                                onClick={(e) => handleToggleWishlist(e, product.id)}
                                sx={{ position: "absolute", top: 8, right: 8, zIndex: 10, backgroundColor: "white", width: 30, height: 30, boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)", color: wishlistedIds.includes(product.id) ? "rgba(255, 0, 0, 0.79)" : "#ccc", "&:hover": { backgroundColor: "white", scale: 1.15 } }}>
                                <FavoriteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <Box component="img" src={`/api/${product.picture}`}
                                sx={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px", transition: "transform 0.35s ease", ".MuiCard-root:hover &": { transform: "scale(1.08)" } }} />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>${product.price}.00</Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                            <Rating value={product.rating} precision={0.1} readOnly size="small" sx={{ color: "#16a34a" }} />
                            <Typography variant="caption" sx={{ color: "#16a34a" }}>(121)</Typography>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Button fullWidth onClick={(e) => handleAddToCart(e, product)} sx={{ border: "1px solid #0f5132", borderRadius: "999px", textTransform: "none", fontSize: 13, fontWeight: 600, py: 0.8, color: "#0f5132", overflow: "hidden", "&:hover": { backgroundColor: "#0f5132", color: "white" } }}>
                                Add to Cart
                            </Button>
                        </Box>
                    </Card>
                ))}
            </Box>
        </div>
    );
}
