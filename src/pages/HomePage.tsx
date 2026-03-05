import {
    Box,
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
import { Swiper, SwiperSlide } from "swiper/react";
import banner1 from "../assets/stock-images/home-bannerHeadset.jpg";
import banner2 from "../assets/stock-images/home-bannerHandphone.jpg";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useState } from "react";

export default function Homepage() {
    const [rating, setRating] = useState<number | null>(null);
    const dummy = [
        {
            name: "Handphone",
            rating: 4.5,
        },
        {
            name: "Headset",
            rating: 4.6,
        },
        {
            name: "Keyboard",
            rating: 4.2,
        },
        {
            name: "iPhone 17 Pro Max",
            rating: 5,
        },
        {
            name: "Handphone",
            rating: 4.5,
        },
        {
            name: "Headset",
            rating: 4.8,
        },
        {
            name: "Keyboard",
            rating: 4.2,
        },
        {
            name: "iPhone 17 Pro Max",
            rating: 5,
        },
    ];

    return (
        <div>
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
                                            objectPosition: "50% 20%"
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
                        defaultValue=""
                        renderValue={(selected) =>
                            !selected ? (
                                <span style={{ opacity: 0.6 }}>Price</span>
                            ) : (
                                selected
                            )
                        }
                    >
                        <MenuItem value="" sx={{ opacity: 0.4 }}>
                            <em>All Price</em>
                        </MenuItem>
                        <MenuItem value={"Highest"}>Highset Price</MenuItem>
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
                {dummy.map((product, index) => (
                    <Card
                        key={index}
                        // elevation={2}
                        sx={{
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
                                mb: 2,
                            }}
                        >
                            <IconButton
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    backgroundColor: "white",
                                    width: 30,
                                    height: 30,
                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
                                    "&:hover": {
                                        color: "rgba(255, 0, 0, 0.79)",
                                        backgroundColor: "white",
                                        scale: 1.15,
                                    },
                                }}
                            >
                                ❤
                            </IconButton>

                            <Box
                                component="img"
                                src={banner1}
                                sx={{
                                    maxHeight: 160,
                                    objectFit: "contain",
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
                                $89.00
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
                            <Box
                                sx={{
                                    border: "1px solid #0f5132",
                                    borderRadius: 50,
                                    textAlign: "center",
                                    py: 0.8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "0.2s",
                                    "&:hover": {
                                        backgroundColor: "#0f5132",
                                        color: "white",
                                    },
                                }}
                            >
                                Add to Cart
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>
        </div>
    );
}
