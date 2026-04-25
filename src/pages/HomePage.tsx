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
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, Navigation, Pagination, Autoplay } from "swiper/modules";
import banner1 from "../assets/stock-images/home-bannerHeadset.jpg";
import banner2 from "../assets/stock-images/home-bannerHandphone.jpg";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useEffect } from "react";
import { useAppSelector } from "../hooks/useAppSelector";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Homepage() {
    const [rating, setRating] = useState<number | null>(null);
    const [sortPrice, setSortPrice] = useState<"high" | "low" | "">("");
    const [sortRating, setSortRating] = useState<"high" | "low" | "">("");

    const navigate = useNavigate();

    const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;

    const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

    // ================= FETCH WISHLIST =================
    useEffect(() => {
        if (!user_id) return;
        const getWishlist = async () => {
            try {
                const res = await fetch(`/api/wishlist?user_id=${user_id}`);
                const data = await res.json();
                setWishlistedIds(data.data.map((item: { product_id: string }) => item.product_id));
            } catch (error) {
                console.error(error);
            }
        };
        getWishlist();
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
            setWishlistedIds(prev =>
                prev.includes(product_id)
                    ? prev.filter(id => id !== product_id)
                    : [...prev, product_id]
            );
        } catch (error) {
            console.error(error);
        }
    };

    const dummy = [
        {
            id: 1,
            name: "Handphone",
            price: 100,
            rating: 4.5,
        },
        {
            name: "Headset",
            price: 80,
            rating: 4.6,
        },
        {
            name: "Keyboard",
            price: 60,
            rating: 3.2,
        },
        {
            name: "iPhone 17 Pro Max",
            price: 1000,
            rating: 5,
        },
        {
            name: "Handphone",
            price: 100,
            rating: 2.8,
        },
        {
            name: "Headset",
            price: 80,
            rating: 1.5,
        },
        {
            name: "Keyboard",
            price: 60,
            rating: 4.2,
        },
        {
            name: "iPhone 17 Pro Max",
            price: 1000,
            rating: 5,
        },
    ];

    const recentProductsDummy = [
        {
            name: "Laptop sleeve MacBook",
            price: 59,
            image: banner1,
        },
        {
            name: "AirPods Max",
            price: 559,
            image: banner1,
        },
        {
            name: "iPad Mini",
            price: 569,
            image: banner1,
        },
        {
            name: "Flower Laptop Sleeve",
            price: 39,
            image: banner1,
        },
        {
            name: "Laptop sleeve MacBook",
            price: 59,
            image: banner1,
        },
        {
            name: "AirPods Max",
            price: 559,
            image: banner1,
        },
        {
            name: "iPad Mini",
            price: 569,
            image: banner1,
        },
        {
            name: "Flower Laptop Sleeve",
            price: 39,
            image: banner1,
        },
    ];

    const filteredProducts = dummy
        .filter((item) => {
            if (!rating) return true;

            const upperBound = rating;
            const lowerBound = rating === 1 ? 0 : rating - 0.9;

            return item.rating <= upperBound && item.rating >= lowerBound;
        })
        // SORTING (MULTI CONDITION)
        .sort((a, b) => {
            // PRIORITAS 1: PRICE
            if (sortPrice === "high") return b.price - a.price;
            if (sortPrice === "low") return a.price - b.price;

            // PRIORITAS 2: RATING MANUAL
            if (sortRating === "high") return b.rating - a.rating;
            if (sortRating === "low") return a.rating - b.rating;

            return 0;
        });

    return (
        <div style={{
            width: "100%",
            minWidth: 0
        }}>
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
                                    {/* IMAGE */}
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

                                    {/* OVERLAY */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            inset: 0,
                                            background: isRight
                                                ? "linear-gradient(to left, rgba(0,0,0,0.65), rgba(0,0,0,0.2))"
                                                : "linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.2))",
                                        }}
                                    />

                                    {/* CONTENT */}
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
                {filteredProducts.map((product, index) => (
                    <Card
                        key={index}
                        // elevation={2}
                        sx={{
                            cursor: "pointer",
                            borderRadius: 4,
                            boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.27)",
                            p: 2,
                            backgroundColor: "#ffffff",
                            transition: "0.3s",
                            "&:hover": {
                                transform: "translateY(-6px)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            },
                        }}
                        onClick={() => navigate(`/product/${product.id}`)}
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
                                overflow: "hidden", // penting!
                                mb: 2,
                            }}
                        >
                            <IconButton
                                onClick={(e) => handleToggleWishlist(e, String(product.id))}
                                sx={{
                                    position: "absolute",
                                    top: 8, right: 8, zIndex: 10,
                                    backgroundColor: "white",
                                    width: 30, height: 30,
                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
                                    color: wishlistedIds.includes(String(product.id))
                                        ? "rgba(255, 0, 0, 0.79)"
                                        : "#ccc",
                                    "&:hover": { backgroundColor: "white", scale: 1.15 },
                                }}
                            >
                                <FavoriteIcon sx={{ fontSize: 16 }} />
                            </IconButton>

                            <Box
                                component="img"
                                src={banner1}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    padding: "16px",
                                    transition: "transform 0.35s ease",

                                    ".MuiCard-root:hover &": {
                                        transform: "scale(1.08)",
                                    },
                                }}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600 }}
                            >
                                {product.name}
                            </Typography>

                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700 }}
                            >
                                ${product.price}.00
                            </Typography>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{ color: "#757575", mt: 0.5 }}
                        >
                            High quality wireless audio
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
                                value={product.rating}
                                precision={0.1}
                                readOnly
                                size="small"
                                sx={{
                                    color: "#16a34a",
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{ color: "#16a34a" }}
                            >
                                (121)
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Button
                                fullWidth
                                sx={{
                                    border: "1px solid #0f5132",
                                    borderRadius: "999px",
                                    textTransform: "none",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    py: 0.8,
                                    color: "#0f5132",
                                    overflow: "hidden", // penting untuk ripple biar clipped
                                    "&:hover": {
                                        backgroundColor: "#0f5132",
                                        color: "white",
                                    },
                                }}
                            >
                                Add to Cart
                            </Button>
                        </Box>
                    </Card>
                ))}
            </Box>
            <Typography variant="h5" sx={{ mt: 8, mb: 2 }}>
                <strong>Recently Viewed</strong>
            </Typography>

            <Swiper
                slidesPerView={4.2}
                spaceBetween={20}
                modules={[Scrollbar]}
                scrollbar={{
                    draggable: true,
                    hide: false,
                }}
                style={{
                    paddingBottom: "30px", // space buat scrollbar
                }}
            >
                {recentProductsDummy.map((item, index) => (
                    <SwiperSlide key={index}>
                        <Card
                            sx={{
                                borderRadius: 4,
                                p: 2,
                                backgroundColor: "#fff",
                                transition: "all 0.3s ease",
                                cursor: "pointer",

                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                                },
                            }}
                        >
                            {/* IMAGE CONTAINER */}
                            <Box
                                sx={{
                                    position: "relative",
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: 2,
                                    height: 150,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: 2,
                                }}
                            >
                                {/* FAVORITE */}
                                <IconButton
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        backgroundColor: "white",
                                        width: 28,
                                        height: 28,
                                        border: "1px solid #ddd",
                                    }}
                                >
                                    <FavoriteBorderIcon fontSize="small" />
                                </IconButton>

                                <Box
                                    component="img"
                                    src={banner1}
                                    sx={{
                                        maxHeight: 160,
                                        objectFit: "contain",
                                        transition: "0.3s",

                                        ".MuiCard-root:hover &": {
                                            transform: "scale(1.05)",
                                        },
                                    }}
                                />
                            </Box>

                            {/* TITLE + PRICE */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                }}
                            >
                                <Typography fontSize={14} fontWeight={600}>
                                    {item.name}
                                </Typography>
                                <Typography fontSize={14} fontWeight={700}>
                                    ${item.price}.00
                                </Typography>
                            </Box>

                            {/* DESCRIPTION */}
                            <Typography
                                fontSize={12}
                                sx={{ color: "#777", mb: 1 }}
                            >
                                Organic Cotton, fairtrade certified
                            </Typography>

                            {/* RATING */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 2,
                                }}
                            >
                                <Rating
                                    value={4.5}
                                    precision={0.1}
                                    readOnly
                                    size="small"
                                    sx={{ color: "#22c55e" }}
                                />
                                <Typography
                                    fontSize={12}
                                    sx={{ color: "#22c55e", ml: 1 }}
                                >
                                    (121)
                                </Typography>
                            </Box>

                            {/* BUTTON */}
                            <Box sx={{ mt: 2 }}>
                                <Box
                                    sx={{
                                        border: "1px solid #0f5132",
                                        borderRadius: 50,
                                        textAlign: "center",
                                        py: 0.8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.25s ease",

                                        "&:hover": {
                                            backgroundColor: "#16a34a",
                                            color: "white",
                                            borderColor: "#16a34a",
                                        },
                                    }}
                                >
                                    Add to Cart
                                </Box>
                            </Box>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}