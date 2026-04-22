import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  IconButton,
  Link,
  Paper,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LetterAvatar } from "../../components/LetterAvatar";
import type { Product } from "../../type";
import formatPrice from "../../utils/FormatPrice";
import { useAppSelector } from "../../hooks/useAppSelector";

// import banner2 from "../../assets/stock-images/home-bannerHandphone.jpg";

export default function ProductPage() {
  const [qty, setQty] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const [newRating, setNewRating] = useState<number | null>(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [picture, setPicture] = useState<File | null>(null);

  const { id } = useParams();
  const [product, setProduct] = useState<Product>();

  const { userInfo } = useAppSelector((state) => state.auth);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);

      if (!response.ok) {
        alert("Failed to reload products");
        throw new Error("Failed to reload products");
      }
      const data = await response.json();
      setProduct(data.records);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  // const handleSubmitReview = async () => {
  //   try {
  //     if (!newRating) {
  //       alert("Rating wajib diisi");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("user_id", "0cbffc5e-307c-4c4c-952f-f4e0a9bea6de"); // ganti dari auth
  //     formData.append("product_id", id!);
  //     formData.append("value", String(newRating));
  //     formData.append("title", title);
  //     formData.append("description", description);

  //     if (picture) {
  //       formData.append("picture", picture);
  //     }

  //     const response = await fetch("/api/ratings", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) throw new Error("Failed submit");

  //     alert("Ulasan berhasil dikirim");

  //     // reset form
  //     setNewRating(0);
  //     setTitle("");
  //     setDescription("");
  //     setPicture(null);

  //     // reload product biar langsung muncul
  //     fetchProduct();
  //   } catch (error) {
  //     console.error(error);
  //     alert("Gagal kirim ulasan");
  //   }
  // };

  const handleSubmitReview = async () => {
    try {
      if (!newRating) {
        alert("Rating wajib diisi");
        return;
      }

      // const formData = new FormData();
      // formData.append("user_id", "0cbffc5e-307c-4c4c-952f-f4e0a9bea6de"); // ganti dari auth
      // formData.append("product_id", id!);
      // formData.append("value", String(newRating));
      // formData.append("title", title);
      // formData.append("description", description);

      // if (picture) {
      //   formData.append("picture", picture);
      // }

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userInfo?.user_id,
          // user_id: userInfo?.user_id,
          product_id: id!,
          value: newRating,
          title: title,
          description: description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("BACKEND ERROR:", result);
        alert(result.message || "Gagal kirim ulasan");
        return;
      }

      alert("Ulasan berhasil dikirim");

      // reset form
      setNewRating(0);
      setTitle("");
      setDescription("");
      setPicture(null);

      // reload product biar langsung muncul
      fetchProduct();
    } catch (error) {
      console.error(error);
      alert("Gagal kirim ulasan");
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "0cbffc5e-307c-4c4c-952f-f4e0a9bea6de", // ganti dari auth
          variant_id: product?.variants?.[selectedVariantIndex].variant_id,
          quantity: qty,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("BACKEND ERROR:", result);
        alert(result.message || "Gagal memasukkan ke keranjang");
        return;
      }

      alert("Produk berhasil ditambahkan ke keranjang");
    } catch (error) {
      console.error(error);
      alert("Gagal memasukkan ke keranjang");
    }
  };

  const getAverageRating = (ratings?: { value: number }[]) => {
    if (!ratings || ratings.length === 0) return 0;

    const total = ratings.reduce((sum, r) => sum + Number(r.value), 0);
    return total / ratings.length;
  };

  const getMinPrice = (variants?: { price: number }[]) => {
    if (!variants || variants.length === 0) return 0;

    return Math.min(...variants.map((v) => Number(v.price)));
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // useEffect(() => {
  //   const loadUsers = async () => {
  //     if (!product?.ratings) return;

  //     const uniqueIds = [...new Set(product.ratings.map((r) => r.user_id))];

  //     const results = await Promise.all(
  //       uniqueIds.map(async (id) => {
  //         const name = await fetchUserName(id);
  //         return { id, name: name || "tes" };
  //       }),
  //     );

  //     const map: Record<string, string> = {};
  //     results.forEach((r) => {
  //       map[r.id] = r.name;
  //     });

  //     setUsersMap(map);
  //   };

  //   loadUsers();
  // }, [product]);

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariantIndex(0);
    }
  }, [product]);

  const avgRating = getAverageRating(product?.ratings);
  const price = getMinPrice(product?.variants);
  const selectedVariant = product?.variants?.[selectedVariantIndex];

  const image = selectedVariant?.picture || product?.variants?.[0]?.picture;

  const totalRating = product?.ratings?.length || 0;

  const ratingCounts = [5, 4, 3, 2, 1].reduce(
    (acc, star) => {
      acc[star] =
        product?.ratings?.filter((r) => Math.round(r.value) === star).length ||
        0;
      return acc;
    },
    {} as Record<number, number>,
  );

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
          {product?.category?.name}
        </Link>
        <Typography
          sx={{
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            fontSize: "12px",
          }}
        >
          {product?.name}
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
              src={image}
              style={{ maxHeight: "80%", objectFit: "contain" }}
            />
          </Box>

          {/* THUMBNAILS */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            {product?.variants?.map((v, i) => {
              const isActive = selectedVariantIndex === i;

              return (
                <Box
                  key={i}
                  component="img"
                  src={v.picture}
                  onClick={() => setSelectedVariantIndex(i)}
                  sx={{
                    width: 80,
                    height: 80,
                    background: "#f5f5f5",
                    borderRadius: 2,
                    objectFit: "cover",
                    cursor: "pointer",
                    border: isActive
                      ? "2px solid #16a34a"
                      : "1px solid #e5e7eb",
                    p: 0.5,
                    transition: "0.2s",
                    "&:hover": {
                      transform: "scale(1.03)",
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* RIGHT SIDE */}
        <Box sx={{ flex: 1.2 }}>
          {/* TITLE */}
          <Typography variant="h4" fontWeight={700}>
            {product?.name}
          </Typography>

          <Typography sx={{ mt: 1 }}>{product?.description}</Typography>

          {/* RATING */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Rating
              value={avgRating}
              precision={0.1}
              readOnly
              size="small"
              sx={{ color: "#16a34a" }}
            />
            <Typography sx={{ ml: 1, color: "#555" }}>
              ({product?.ratings?.length || 0} ulasan)
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* PRICE */}
          <Typography variant="h5" fontWeight={700}>
            {formatPrice(price)}
          </Typography>

          <Typography sx={{ color: "#777", mt: 1 }}>
            Pilihan:{" "}
            <strong style={{ color: "black" }}>
              {selectedVariant?.name || "-"}
            </strong>
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* SELLER PROFILE */}
          <Box
            onClick={() => navigate(`/shop/${product?.shop?.shop_id}`)}
            sx={{
              mt: 2,
              p: 2,
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": {
                borderColor: "#16a34a",
                backgroundColor: "#f0fdf4",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {product?.shop?.profile_pic ? (
                <Box
                  component="img"
                  src={product.shop.profile_pic}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <LetterAvatar
                  name={product?.shop?.name || "S"}
                  sx={{
                    width: 50,
                    height: 50,
                  }}
                />
              )}

              <Box>
                <Typography fontSize={13} color="#777">
                  Seller
                </Typography>

                <Typography fontWeight={700}>{product?.shop?.name}</Typography>
              </Box>
            </Box>

            {/* <ChevronRightIcon sx={{ color: "#777" }} /> */}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* COLOR */}
          <Typography fontWeight={600} mb={1}>
            Pilih Tipe
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {product?.variants?.map((color, i) => {
              const isActive = selectedVariantIndex === i;

              return (
                <Box
                  key={i}
                  onClick={() => setSelectedVariantIndex(i)}
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
                    border: isActive
                      ? "1px solid #22c55e"
                      : "1px solid #e5e7eb",
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
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
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

            {/* <Typography sx={{ color: "#e65100", fontSize: 14 }}>
                            Only <b>12 Items</b> Left! Don’t miss it
                        </Typography> */}
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
              onClick={handleAddToCart}
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
            <Typography fontWeight={600}>🚚 Free Delivery</Typography>
            <Typography fontSize={14} color="#777">
              Enter your Postal code for Delivery Availability
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography fontWeight={600}>↩ Return Delivery</Typography>
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
                {Number(avgRating || 0).toFixed(1)}
              </Typography>
              <Typography color="#777">/ 5.0</Typography>
            </Box>

            {/* <Typography mt={1} fontSize={14}>
                            100% pembeli merasa puas
                        </Typography> */}

            <Typography fontSize={13} color="#777" mt={0.5}>
              {totalRating} rating · {totalRating} ulasan
            </Typography>
          </Box>

          {/* RIGHT - DISTRIBUTION */}
          <Box sx={{ width: 350 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star];
              const percentage =
                totalRating === 0 ? 0 : (count / totalRating) * 100;

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

                  <StarIcon sx={{ fontSize: 16, color: "#facc15" }} />

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
                        background: count > 0 ? "#16a34a" : "#d1d5db",
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
              Menampilkan {product?.ratings?.length} ulasan
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
          {product?.ratings?.map((item, index) => (
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
                  name={
                    item.user?.first_name + " " + item.user?.last_name || "U"
                  }
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: 14,
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
                    <Rating value={item.value} readOnly size="small" />
                    <Typography fontSize={13} color="#777">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </Typography>
                  </Box>

                  {/* NAME */}
                  <Typography fontWeight={600} mt={0.5}>
                    {item.user?.first_name + " " + item.user?.last_name || "U"}
                  </Typography>

                  {/* COMMENT */}
                  <Typography mt={1}>{item.description}</Typography>
                </Box>
              </Box>

              {/* OPTIONAL MENU */}
              {/* <IconButton size="small">
                                <MoreVertIcon />
                            </IconButton> */}
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography fontWeight={700} mb={2}>
            TULIS ULASAN
          </Typography>

          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e5e7eb",
            }}
          >
            {/* RATING */}
            <Box sx={{ mb: 2 }}>
              <Typography fontSize={14} mb={0.5}>
                Rating
              </Typography>
              <Rating
                value={newRating}
                precision={0.5}
                onChange={(_, val) => setNewRating(val || 0)}
              />
            </Box>

            {/* TITLE */}
            <TextField
              fullWidth
              label="Judul ulasan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* DESCRIPTION */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Tulis pengalaman kamu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* IMAGE */}
            <Button variant="outlined" component="label" sx={{ mb: 2 }}>
              Upload Gambar
              <input
                type="file"
                hidden
                onChange={(e) => setPicture(e.target.files?.[0] || null)}
              />
            </Button>

            {/* PREVIEW IMAGE */}
            {picture && (
              <Box
                component="img"
                src={URL.createObjectURL(picture)}
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 2,
                  mb: 2,
                }}
              />
            )}

            {/* BUTTON */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmitReview}
              sx={{
                borderRadius: 50,
                backgroundColor: "#16a34a",
                "&:hover": { backgroundColor: "#15803d" },
              }}
            >
              Kirim Ulasan
            </Button>
          </Paper>
        </Box>
      </Box>
    </div>
  );
}
