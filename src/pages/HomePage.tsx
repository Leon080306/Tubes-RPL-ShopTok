import {
    Alert,
    Box,
    Button,
    Card,
    FormControl,
    IconButton,
    MenuItem,
    Rating,
    Select,
    Snackbar,
    Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import banner1 from "../assets/stock-images/home-bannerHeadset.jpg";
import banner2 from "../assets/stock-images/home-bannerHandphone.jpg";
import formatPrice from "../utils/FormatPrice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../hooks/useAppSelector";
import type { Category, Product } from "../type";

export default function Homepage() {
    const [rating, setRating] = useState<number | null>(null);
    const [sortPrice, setSortPrice] = useState<"high" | "low" | "">("");
    const [sortRating, setSortRating] = useState<"high" | "low" | "">("");
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    // Snackbar state
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMessage, setSnackMessage] = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

    const navigate = useNavigate();
    const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;

    const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

    const getAverageRating = (ratings?: { value: number }[]) => {
        if (!ratings || ratings.length === 0) return 0;
        const total = ratings.reduce((sum, r) => sum + r.value, 0);
        return total / ratings.length;
    };

    const getMinPrice = (variants?: { price: number }[]) => {
        if (!variants || variants.length === 0) return 0;
        return Math.min(...variants.map((v) => Number(v.price)));
    };

    // ================= ADD TO CART =================
    const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();

        if (!user_id) {
            setSnackMessage("Login dulu untuk menambahkan ke keranjang");
            setSnackSeverity("error");
            setSnackOpen(true);
            return;
        }

        // Find first variant with stock > 0
        const availableVariant = product.variants?.find((v) => (v.stock ?? 0) > 0);

        if (!availableVariant) {
            setSnackMessage("Produk sedang tidak tersedia");
            setSnackSeverity("error");
            setSnackOpen(true);
            return;
        }

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id,
                    variant_id: availableVariant.variant_id,
                    quantity: 1,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setSnackMessage(result.message || "Gagal memasukkan ke keranjang");
                setSnackSeverity("error");
                setSnackOpen(true);
                return;
            }

            setSnackMessage(`${product.name} berhasil ditambahkan ke keranjang!`);
            setSnackSeverity("success");
            setSnackOpen(true);
            window.dispatchEvent(new Event("cart-updated"));
        } catch (error) {
            console.error(error);
            setSnackMessage("Gagal memasukkan ke keranjang");
            setSnackSeverity("error");
            setSnackOpen(true);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/category", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setCategories(data.records || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!user_id) return;
        const getWishlist = async () => {
            try {
                const res = await fetch(`/api/wishlist?user_id=${user_id}`);
                const data = await res.json();
                setWishlistedIds(
                    data.data.map((item: { product_id: string }) => item.product_id)
                );
            } catch (error) {
                console.error(error);
            }
        };
        getWishlist();
    }, [user_id]);

    const handleToggleWishlist = async (
        e: React.MouseEvent,
        product_id: string
    ) => {
        e.stopPropagation();
        if (!user_id) return;
        try {
            await fetch(`/api/wishlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, product_id }),
            });
            setWishlistedIds((prev) =>
                prev.includes(product_id)
                    ? prev.filter((id) => id !== product_id)
                    : [...prev, product_id]
            );
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/products");
            if (response.status !== 200) {
                alert("Failed to reload products");
                throw new Error("Failed to reload products");
            }
            const data = await response.json();
            setProducts(data.records);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products
        .filter((item) => {
            if (selectedCategory && item.category?.name !== selectedCategory)
                return false;
            if (!rating) return true;
            const avg = getAverageRating(item.ratings);
            const upperBound = rating;
            const lowerBound = rating === 1 ? 0 : rating - 0.9;
            return avg >= lowerBound && avg <= upperBound;
        })
        .sort((a, b) => {
            let result = 0;
            if (sortPrice) {
                result =
                    sortPrice === "high"
                        ? getMinPrice(b.variants) - getMinPrice(a.variants)
                        : getMinPrice(a.variants) - getMinPrice(b.variants);
            }
            if (result === 0 && sortRating) {
                result =
                    sortRating === "high"
                        ? getAverageRating(b.ratings) -
                        getAverageRating(a.ratings)
                        : getAverageRating(a.ratings) -
                        getAverageRating(b.ratings);
            }
            return result;
        });

    const prices = products.map((p) => getMinPrice(p.variants));
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;

    const getRecommendationScore = (product: Product) => {
        const rating = getAverageRating(product.ratings);
        const price = getMinPrice(product.variants);
        const normalizedRating = rating / 5;
        const normalizedPrice =
            (price - minPrice) / (maxPrice - minPrice || 1);
        const priceScore = 1 - normalizedPrice;
        const reviewCount = product.ratings?.length || 0;
        const reviewScore = Math.min(reviewCount / 50, 1);
        return normalizedRating * 0.5 + priceScore * 0.3 + reviewScore * 0.2;
    };

    const isFiltering =
        rating !== null || sortPrice || sortRating || selectedCategory;

    const finalProducts = isFiltering
        ? filteredProducts
        : [...products].sort(
            (a, b) =>
                getRecommendationScore(b) - getRecommendationScore(a)
        );

    // Helper: check if product has any stock
    const hasStock = (product: Product) =>
        product.variants?.some((v) => (v.stock ?? 0) > 0) ?? false;

    return (
        <div style={{ width: "100%", minWidth: 0 }}>
            {/* SNACKBAR */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={5000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackOpen(false)}
                    severity={snackSeverity}
                    variant="filled"
                    sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                    }}
                    action={
                        snackSeverity === "success" ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setSnackOpen(false);
                                    navigate("/cart");
                                }}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    textDecoration: "underline",
                                }}
                            >
                                View Cart →
                            </Button>
                        ) : undefined
                    }
                >
                    {snackMessage}
                </Alert>
            </Snackbar>

            <Box sx={{ mt: 10 }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000 }}
                    style={{
                        borderRadius: "24px",
                        overflow: "hidden",
                    }}
                >
                    {[banner1, banner2].map((banner, index) => {
                        const isRight = index === 0;

                        return (
                            <SwiperSlide key={index}>
                                <Box
                                    sx={{
                                        position: "relative",
                                        height: 420,
                                        width: "100%",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={banner}
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            objectPosition: "50% 20%",
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            position: "absolute",
                                            inset: 0,
                                            background: isRight
                                                ? "linear-gradient(to left, rgba(0,0,0,0.65), rgba(0,0,0,0.2))"
                                                : "linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.2))",
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "white",
                                            maxWidth: 500,
                                            textAlign: isRight
                                                ? "right"
                                                : "left",
                                            right: isRight ? 60 : "auto",
                                            left: isRight ? "auto" : 60,
                                        }}
                                    >
                                        <Typography
                                            variant="h3"
                                            sx={{ fontWeight: 700, mb: 2 }}
                                        >
                                            {isRight
                                                ? "Premium Audio Experience"
                                                : "Premium Smartphone You Can Explore"}
                                        </Typography>

                                        <Typography
                                            variant="body1"
                                            sx={{ opacity: 0.85, mb: 3 }}
                                        >
                                            Discover high quality wireless
                                            headphones with immersive sound
                                            technology.
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "inline-block",
                                                px: 4,
                                                py: 1.2,
                                                borderRadius: 50,
                                                backgroundColor: "#16a34a",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                transition: "0.3s",
                                                "&:hover": {
                                                    backgroundColor: "#15803d",
                                                },
                                            }}
                                            onClick={() => navigate("/products")}
                                        >
                                            Shop Now
                                        </Box>
                                    </Box>
                                </Box>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </Box>

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
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        renderValue={(selected) =>
                            !selected ? (
                                <span style={{ opacity: 0.6 }}>Category</span>
                            ) : (
                                selected
                            )
                        }
                    >
                        <MenuItem value="" sx={{ opacity: 0.6 }}>
                            <em>All Category</em>
                        </MenuItem>
                        {categories.map((c) => (
                            <MenuItem key={c.category_id} value={c.name}>
                                <em>{c.name}</em>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ width: 110 }}>
                    <Select
                        displayEmpty
                        value={sortPrice}
                        onChange={(e) => {
                            const value = e.target.value as
                                | "high"
                                | "low"
                                | "";
                            setSortPrice(value);
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
                        <MenuItem value={"high"}>Highest Price</MenuItem>
                        <MenuItem value={"low"}>Lowest Price</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ width: 150 }}>
                    <Select
                        displayEmpty
                        value={rating ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (typeof value === "string" && value === "") {
                                setRating(null);
                            } else {
                                setRating(Number(value));
                            }
                        }}
                        renderValue={(selected) => {
                            if (!selected) {
                                return (
                                    <span style={{ opacity: 0.6 }}>
                                        Rating
                                    </span>
                                );
                            }
                            return (
                                <Rating
                                    sx={{ color: "#16a34a" }}
                                    value={Number(selected)}
                                    readOnly
                                    size="small"
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={
                                        <StarIcon fontSize="inherit" />
                                    }
                                />
                            );
                        }}
                        MenuProps={{ disableAutoFocusItem: true }}
                    >
                        <MenuItem value="" sx={{ opacity: 0.4 }}>
                            <em>All Rating</em>
                        </MenuItem>
                        <MenuItem
                            disableRipple
                            sx={{
                                cursor: "default",
                                "&:hover": {
                                    backgroundColor: "transparent",
                                },
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
                                    emptyIcon={
                                        <StarIcon fontSize="inherit" />
                                    }
                                    sx={{ color: "#16a34a" }}
                                />
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Typography variant="h5" marginTop={5}>
                <strong>Recomended For You!</strong>
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 4,
                    marginTop: 5,
                }}
            >
                {finalProducts.map((product) => {
                    const avgRating = getAverageRating(product.ratings);
                    const price = getMinPrice(product.variants);
                    const image =
                        product.variants?.[0]?.picture || banner1;
                    const inStock = hasStock(product);

                    return (
                        <Card
                            key={product.product_id}
                            sx={{
                                cursor: "pointer",
                                borderRadius: 4,
                                boxShadow:
                                    "0px 0px 20px rgba(0, 0, 0, 0.27)",
                                p: 2,
                                backgroundColor: "#ffffff",
                                transition: "0.3s",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow:
                                        "0 8px 24px rgba(0,0,0,0.08)",
                                },
                            }}
                            onClick={() =>
                                navigate(
                                    `/product/${product.product_id}`
                                )
                            }
                        >
                            <Box
                                sx={{
                                    position: "relative",
                                    backgroundColor: "#f3f3f3",
                                    borderRadius: 3,
                                    height: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    mb: 2,
                                }}
                            >
                                <IconButton
                                    onClick={(e) => {
                                        handleToggleWishlist(
                                            e,
                                            product.product_id
                                        );
                                    }}
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        zIndex: 2,
                                        backgroundColor: "white",
                                        width: 30,
                                        height: 30,
                                        boxShadow:
                                            "0 2px 6px rgba(0, 0, 0, 0.35)",
                                        color: wishlistedIds.includes(
                                            product.product_id
                                        )
                                            ? "rgba(255, 0, 0, 0.79)"
                                            : "#ccc",
                                        "&:hover": {
                                            backgroundColor: "white",
                                        },
                                    }}
                                >
                                    ❤
                                </IconButton>

                                {/* Out of Stock badge */}
                                {!inStock && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            left: 8,
                                            zIndex: 2,
                                            bgcolor: "#d32f2f",
                                            color: "white",
                                            px: 1,
                                            py: 0.3,
                                            borderRadius: 1,
                                            fontSize: 11,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Out of Stock
                                    </Box>
                                )}

                                <Box
                                    component="img"
                                    src={image ? `/api/${image}` : "/placeholder.png"}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        padding: "16px",
                                        transition:
                                            "transform 0.35s ease",
                                        ".MuiCard-root:hover &": {
                                            transform: "scale(1.08)",
                                        },
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 500,
                                        lineHeight: 1.2,
                                        fontSize: 15,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                    title={product.name}
                                >
                                    {product.name}
                                </Typography>

                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700, mt: 0.5 }}
                                >
                                    {formatPrice(price)}
                                </Typography>
                            </Box>

                            <Typography
                                variant="body2"
                                sx={{ color: "#757575", mt: 0.5 }}
                            >
                                {product.description}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 1,
                                }}
                            >
                                <Rating
                                    value={avgRating}
                                    precision={0.1}
                                    readOnly
                                    size="small"
                                    sx={{ color: "#16a34a" }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{ color: "#16a34a" }}
                                >
                                    ({product.ratings?.length || 0})
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    disabled={!inStock}
                                    onClick={(e) =>
                                        handleAddToCart(e, product)
                                    }
                                    sx={{
                                        border: "1px solid #0f5132",
                                        borderRadius: "999px",
                                        textTransform: "none",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        py: 0.8,
                                        color: "#0f5132",
                                        "&:hover": {
                                            backgroundColor: "#0f5132",
                                            color: "white",
                                        },
                                        "&.Mui-disabled": {
                                            borderColor: "#ccc",
                                            color: "#999",
                                        },
                                    }}
                                >
                                    {inStock
                                        ? "Add to Cart"
                                        : "Out of Stock"}
                                </Button>
                            </Box>
                        </Card>
                    );
                })}
            </Box>
        </div>
    );
}