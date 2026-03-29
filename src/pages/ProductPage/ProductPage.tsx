import {
    Box,
    Breadcrumbs,
    Button,
    Divider,
    IconButton,
    Link,
    Rating,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import HomeIcon from "@mui/icons-material/Home";
import { useState } from "react";
import { useNavigate } from "react-router";


// import banner2 from "../../assets/stock-images/home-bannerHandphone.jpg";

export default function ProductPage() {
    const colors = ["#e57373", "#424242", "#a5d6a7", "#e0e0e0", "#547da6"];
    const [qty, setQty] = useState(1);
    const [selectedColor, setSelectedColor] = useState(0);

    const navigate = useNavigate();

    return (
        <div>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 2, ml: 5 }}>
                <Link
                    onClick={() => navigate("/")}
                    underline="hover"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                    }}
                    color="inherit"
                    href="/"
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                </Link>
                <Link
                    underline="hover"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                    }}
                    color="inherit"
                    href="/material-ui/getting-started/installation/"
                >
                    Category
                </Link>
                <Typography
                    sx={{
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                    }}
                >
                    Airpods-Max
                </Typography>
            </Breadcrumbs>
            <Box sx={{ display: "flex", gap: 6, p: 5 }}>
                {/* LEFT SIDE - IMAGE */}
                <Box sx={{ flex: 1 }}>
                    <Box
                        sx={{
                            background: "#f5f5f5",
                            borderRadius: 4,
                            height: 420,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src="/your-image.png"
                            style={{ maxHeight: "80%", objectFit: "contain" }}
                        />
                    </Box>

                    {/* THUMBNAILS */}
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    background: "#f5f5f5",
                                    borderRadius: 2,
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* RIGHT SIDE */}
                <Box sx={{ flex: 1.2 }}>
                    {/* TITLE */}
                    <Typography variant="h4" fontWeight={700}>
                        Airpods- Max
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                        a perfect balance of exhilarating high-fidelity audio
                        and the effortless magic of AirPods.
                    </Typography>

                    {/* RATING */}
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <Rating
                            value={5}
                            readOnly
                            size="small"
                            sx={{ color: "#16a34a" }}
                        />
                        <Typography sx={{ ml: 1, color: "#555" }}>
                            (121)
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* PRICE */}
                    <Typography variant="h5" fontWeight={700}>
                        $549.00 or 99.99/month
                    </Typography>

                    <Typography sx={{ color: "#777", mt: 1 }}>
                        Suggested payments with 6 months special financing
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    {/* COLOR */}
                    <Typography fontWeight={600} mb={1}>
                        Choose a Color
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        {colors.map((color_pallete, i) => (
                            <Box
                                key={i}
                                onClick={() => setSelectedColor(i)}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: color_pallete,
                                    border:
                                        selectedColor === i
                                            ? "3px solid #16a34a"
                                            : "1px solid #ccc",
                                    cursor: "pointer",
                                }}
                            />
                        ))}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* QTY */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                border: "1px solid #ddd",
                                borderRadius: 50,
                                px: 2,
                                py: 0.5,
                                gap: 2,
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() =>
                                    setQty((prev) => Math.max(1, prev - 1))
                                }
                            >
                                <RemoveIcon fontSize="small" />
                            </IconButton>

                            <Typography>{qty}</Typography>

                            <IconButton
                                size="small"
                                onClick={() => setQty((prev) => prev + 1)}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Typography sx={{ color: "#e65100", fontSize: 14 }}>
                            Only <b>12 Items</b> Left! Don’t miss it
                        </Typography>
                    </Box>

                    {/* BUTTON */}
                    <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                        <Button
                            variant="contained"
                            sx={{
                                flex: 1,
                                borderRadius: 50,
                                backgroundColor: "#0f5132",
                                "&:hover": { backgroundColor: "#0b3d27" },
                            }}
                        >
                            Buy Now
                        </Button>

                        <Button
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderRadius: 50,
                                borderColor: "#0f5132",
                                color: "#0f5132",
                                "&:hover": {
                                    borderColor: "#0f5132",
                                    backgroundColor: "#f0fdf4",
                                },
                            }}
                        >
                            Add to Cart
                        </Button>
                    </Box>

                    {/* INFO BOX */}
                    <Box
                        sx={{
                            mt: 4,
                            border: "1px solid #eee",
                            borderRadius: 3,
                            p: 2,
                        }}
                    >
                        <Typography fontWeight={600}>
                            🚚 Free Delivery
                        </Typography>
                        <Typography fontSize={14} color="#777">
                            Enter your Postal code for Delivery Availability
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography fontWeight={600}>
                            ↩ Return Delivery
                        </Typography>
                        <Typography fontSize={14} color="#777">
                            Free 30days Delivery Returns. Details
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </div>
    );
}
