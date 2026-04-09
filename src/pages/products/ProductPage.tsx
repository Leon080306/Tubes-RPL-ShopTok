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
import StarIcon from "@mui/icons-material/Star";
import { useState } from "react";
import { useNavigate } from "react-router";
import { LetterAvatar } from "../../components/LetterAvatar";

// import banner2 from "../../assets/stock-images/home-bannerHandphone.jpg";

export default function ProductPage() {
    // const colors = ["#e57373", "#424242", "#a5d6a7", "#e0e0e0", "#547da6"];
    const colors = [
      { name: "Merah" },
      { name: "Abu-abu" },
      { name: "Hijau" },
      { name: "Putih" },
      { name: "Biru" },
      { name: "Kuning" },
    ];
    const [qty, setQty] = useState(1);
    const [selectedColor, setSelectedColor] = useState(0);

    const comments = [
        {
            name: "jordan",
            rating: 5,
            time: "2 bulan lalu",
            comment: "mantabb 😁 makasih gan",
        },
        {
            name: "leon",
            rating: 4,
            time: "1 bulan lalu",
            comment: "bagus tapi pengiriman lama",
        },
    ];

    const ratingData: Record<number, number> = {
        5: 3,
        4: 1,
        3: 0,
        2: 0,
        1: 0,
    };

    const totalRating = Object.values(ratingData).reduce(
        (acc, val) => acc + val,
        0,
    );

    const totalScore = Object.entries(ratingData).reduce(
        (acc, [star, count]) => acc + Number(star) * count,
        0,
    );

    // final rating (1 desimal)
    const averageRating =
        totalRating === 0 ? 0 : (totalScore / totalRating).toFixed(1);

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
                            src="/src/assets/stock-images/airpod.webp"
                            style={{ maxHeight: "80%", objectFit: "contain" }}
                        />
                    </Box>

                    {/* THUMBNAILS */}
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <Box
                                key={i}
                                component="img"
                                sx={{
                                    width: 80,
                                    height: 80,
                                    background: "#f5f5f5",
                                    borderRadius: 2,
                                }}
                                src="/src/assets/stock-images/airpod.webp"
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
                        $549.00
                    </Typography>

                    <Typography sx={{ color: "#777", mt: 1 }}>
                        Pilihan:{" "}
                        <strong style={{ color: "black" }}>
                            {colors[selectedColor].name}
                        </strong>
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    {/* COLOR */}
                    <Typography fontWeight={600} mb={1}>
                        Pilih Tipe
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      {colors.map((color, i) => {
                        const isActive = selectedColor === i;

                        return (
                          <Box
                            key={i}
                            onClick={() => setSelectedColor(i)}
                            sx={{
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              px: 1.5,
                              py: 1,
                              borderRadius: "999px",
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: "pointer",
                              border: isActive ? "1px solid #22c55e" : "1px solid #e5e7eb",
                              backgroundColor: isActive ? "#dcfce7" : "#f3f4f6",
                              color: isActive ? "#15803d" : "#6b7280",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {/* ICON (optional sepatu kecil) */}
                            <Box
                              component="img"
                              src="/shoe.png" // ganti sesuai asset kamu
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: 0.5,
                                objectFit: "cover",
                                opacity: isActive ? 1 : 0.6,
                              }}
                            />

                            {/* TEXT */}
                            {color.name}

                          </Box>
                        );
                      })}
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
            <Box sx={{ px: 5, pb: 6 }}>
                {/* TITLE */}
                <Typography fontWeight={700} fontSize={18} mb={2}>
                    ULASAN PEMBELI
                </Typography>

                {/* SUMMARY BOX */}
                <Box
                    sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 3,
                        p: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* LEFT */}
                    <Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <StarIcon sx={{ color: "#facc15" }} />
                            <Typography fontSize={28} fontWeight={700}>
                                {averageRating}
                            </Typography>
                            <Typography color="#777">/ 5.0</Typography>
                        </Box>

                        {/* <Typography mt={1} fontSize={14}>
                            100% pembeli merasa puas
                        </Typography> */}

                        <Typography fontSize={13} color="#777" mt={0.5}>
                            2 rating · 2 ulasan
                        </Typography>
                    </Box>

                    {/* RIGHT - DISTRIBUTION */}
                    <Box sx={{ width: 350 }}>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingData[star];
                            const percentage =
                                totalRating === 0
                                    ? 0
                                    : (count / totalRating) * 100;

                            return (
                                <Box
                                    key={star}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 0.8,
                                    }}
                                >
                                    <Typography fontSize={13} width={10}>
                                        {star}
                                    </Typography>

                                    <StarIcon
                                        sx={{ fontSize: 16, color: "#facc15" }}
                                    />

                                    {/* BAR */}
                                    <Box
                                        sx={{
                                            flex: 1,
                                            height: 6,
                                            background: "#e5e7eb",
                                            borderRadius: 10,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${percentage}%`,
                                                height: "100%",
                                                background:
                                                    count > 0
                                                        ? "#16a34a"
                                                        : "#d1d5db",
                                                transition: "0.3s ease",
                                            }}
                                        />
                                    </Box>

                                    {/* COUNT */}
                                    <Typography fontSize={12} color="#777">
                                        ({count})
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* HEADER LIST */}
                <Box
                    sx={{
                        mt: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box>
                        <Typography fontWeight={700}>ULASAN PILIHAN</Typography>
                        <Typography fontSize={13} color="#777">
                            Menampilkan 2 ulasan
                        </Typography>
                    </Box>
                </Box>

                {/* REVIEW CARD */}
                <Box
                    sx={{
                        mt: 3,
                        display: "flex",
                        flexDirection: "column", // 🔥 INI KUNCI UTAMA
                        gap: 3,
                    }}
                >
                    {comments.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            {/* LEFT */}
                            <Box sx={{ display: "flex", gap: 2 }}>
                                {/* AVATAR */}
                                <LetterAvatar
                                  name={item.name}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    fontSize: 14
                                  }}
                                />

                                {/* CONTENT */}
                                <Box>
                                    {/* RATING + TIME */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Rating
                                            value={item.rating}
                                            readOnly
                                            size="small"
                                        />
                                        <Typography fontSize={13} color="#777">
                                            {item.time}
                                        </Typography>
                                    </Box>

                                    {/* NAME */}
                                    <Typography fontWeight={600} mt={0.5}>
                                        {item.name}
                                    </Typography>

                                    {/* COMMENT */}
                                    <Typography mt={1}>
                                        {item.comment}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* OPTIONAL MENU */}
                            {/* <IconButton size="small">
                                <MoreVertIcon />
                            </IconButton> */}
                        </Box>
                    ))}
                </Box>
            </Box>
        </div>
    );
}
