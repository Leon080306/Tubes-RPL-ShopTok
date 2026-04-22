/* eslint-disable react-hooks/set-state-in-effect */
import {
  AppBar,
  Box,
  Button,
  InputAdornment,
  Paper,
  Rating,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { Link, Outlet } from "react-router";
import AppLogoInline from "../assets/logos/AppLogo-inline.png";
import AppLogoOnly from "../assets/logos/AppLogo-iconOnly.png";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import "../assets/styles/navbar.css";
import BasicMenu from "./BasicMenu";
import { useAppSelector } from "../hooks/useAppSelector";
// import { useAppDispatch } from "../hooks/useAppDispatch";
// import { authActions } from "../store/authSlice";
import { useNavigate } from "react-router";
// import { Avatar, Menu, MenuItem } from "@mui/material";

interface BackendVariant {
  price?: number;
}

interface BackendRating {
  value: number;
}

interface BackendProduct {
  product_id: string;
  name: string;
  variants?: BackendVariant[];
  ratings?: BackendRating[];
}

// Shape yang dipakai UI search result
interface SearchProduct {
  name: string;
  rating: number;       // rata-rata
  totalReviews: number;
  price: number;        // min price dari variants (IDR asli)
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function adaptToSearchProduct(p: BackendProduct): SearchProduct {
  const variants = p.variants ?? [];
  const ratings = p.ratings ?? [];

  const prices = variants.map((v) => v.price ?? 0).filter((x) => x > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
      : 0;

  return {
    name: p.name,
    rating: avgRating,
    totalReviews: ratings.length,
    price: minPrice,
  };
}

export function Layout() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Categories");
  const [search, setSearch] = useState("");

  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);

  // const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        const raw: BackendProduct[] = Array.isArray(data.records) ? data.records : [];
        setAllProducts(raw.map(adaptToSearchProduct));
      } catch (err) {
        console.error("Failed to fetch products for search:", err);
      }
    };
    fetchProducts();
  }, []);

    const searchResults = useMemo(() => {
      const q = search.trim().toLowerCase();
      if (!q) return [];
      return allProducts
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, 5);
    }, [search, allProducts]);

  const handleProfileNavigation = () => {
    navigate("/profile")
  };

  const categories = [
    {
      name: "All Products",
    },
    {
      name: "Electronics",
    },
    {
      name: "Computers & Laptops",
    },
    {
      name: "Phones & Tablets",
    },
    {
      name: "Accessories",
    },
    {
      name: "Home & Living",
    },
    {
      name: "Fashion",
    },
    {
      name: "Books",
    },
    {
      name: "Sports",
    },
    {
      name: "Health & Beauty",
    },
  ];

  const products = [
    {
      name: "Wireless Earbuds",
      rating: 5,
      totalReviews: 121,
      price: 120000,
    },
    {
      name: "Wireless Earbuds",
      rating: 5,
      totalReviews: 121,
      price: 120000,
    },
    {
      name: "Wireless Earbuds",
      rating: 5,
      totalReviews: 121,
      price: 120000,
    },
    {
      name: "Wireless Earbuds",
      rating: 5,
      totalReviews: 121,
      price: 120000,
    },
    {
      name: "Wireless Earbuds",
      rating: 5,
      totalReviews: 121,
      price: 120000,
    },
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  console.log("ISI USER INFO:", userInfo);

  return (
    <Stack>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#003f29",
          height: "80px",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            height: "100%",
            paddingInline: "64px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "64px",
            }}
          >
            <Link
              to="/"
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={AppLogoInline}
                alt=""
                style={{
                  width: "130px",
                }}
              />
            </Link>

            <nav
              style={{
                display: "flex",
                gap: "32px",
                fontSize: "14px",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <BasicMenu
                className="nav-link"
                label={selectedCategory}
                onSelect={handleCategorySelect}
                menuItems={categories}
              />
              <Box
                sx={{
                  maxWidth: searchFocused ? "0px" : "400px",
                  transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  gap: "32px",
                  alignItems: "center",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <Link className="nav-link" to="/">
                  Home
                </Link>
                <Link className="nav-link" to="/">
                  Products
                </Link>
                <Link className="nav-link" to="/">
                  Orders
                </Link>
              </Box>
            </nav>
          </Box>

          <Box
            sx={{
              fontSize: "13px",
              display: "flex",
              gap: "32px",
              alignItems: "center",
              flexGrow: 1,
              justifyContent: "flex-end",
              height: "100%",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: searchFocused ? "100%" : "400px",
                transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                maxWidth: "100%",
              }}
            >
              <TextField
                fullWidth
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onFocus={() => {
                  setSearchFocused(true);
                }}
                onBlur={() => {
                  setSearchFocused(false);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ fontSize: "20px", color: "#888" }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                placeholder="Search products"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "100px",

                  "& fieldset": {
                    border: "none",
                  },

                  "&:hover fieldset": {
                    border: "none",
                  },

                  "&.Mui-focused fieldset": {
                    border: "none",
                  },

                  "&.Mui-focused": {
                    boxShadow: "none",
                  },

                  "& .MuiOutlinedInput-root": {
                    borderRadius: "100px",
                    height: "38px",
                  },

                  "& .MuiOutlinedInput-input": {
                    padding: "6px 14px",
                    fontSize: "12px",

                    "&::placeholder": {
                      fontSize: "12px",
                      opacity: 0.5,
                    },
                  },
                }}
              />
              {searchFocused && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    mt: 1,
                    height: "100px",
                    zIndex: 10,
                    borderRadius: 2,
                  }}
                >
                  <Paper
                    elevation={5}
                    sx={{
                      backgroundColor: "white",
                      width: "100%",
                      padding: "18px 12px",
                    }}
                  >
                    {search.trim() === "" ? (
                      <>
                        {/* Popular Categories — tidak berubah */}
                        <h2 style={{ fontSize: "18px", margin: "0", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(0, 0, 0, 0.2)" }}>
                          Popular Categories
                        </h2>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                          {categories.map((category) => (
                            <Paper
                              key={category.name}
                              elevation={0}
                              onClick={() => {}}
                              sx={{
                                display: "flex", gap: "18px", alignItems: "center",
                                backgroundColor: "#f6f6f6", borderRadius: "12px",
                                padding: "12px", transition: "all 0.25s ease", cursor: "pointer",
                                "&:hover": { transform: "scale(1.02)", boxShadow: 5 },
                              }}
                            >
                              <img src={AppLogoOnly} style={{ width: "60px", height: "60px", borderRadius: "6px" }} alt="" />
                              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "50px", flexGrow: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                  {category.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.2 }}>
                                  12 products available
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      </>
                    ) : searchResults.length === 0 ? (
                      // ── Tidak ada hasil ──────────────────────────────────────────────────────
                      <Box sx={{ py: 3, textAlign: "center" }}>
                        <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
                          No products found for "<strong>{search}</strong>"
                        </Typography>
                      </Box>
                    ) : (
                      // ── Hasil search dari backend ────────────────────────────────────────────
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {searchResults.map((product, index) => (
                          <Box
                            key={`${product.name}-${index}`}
                            sx={{
                              display: "flex", flexDirection: "row",
                              justifyContent: "space-between", alignItems: "center",
                              padding: "18px 12px",
                              borderTop: index === 0 ? "none" : "1px solid rgba(0, 0, 0, 0.2)",
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "#f9f9f9" },
                              borderRadius: index === 0 ? "8px 8px 0 0" : 0,
                            }}
                          >
                            {/* Nama produk */}
                            <Box sx={{ display: "flex", justifyContent: "start", alignItems: "center", gap: "18px" }}>
                              <img
                                src={AppLogoOnly}
                                style={{ width: "60px", height: "60px", borderRadius: "6px" }}
                                alt=""
                              />
                              <Typography sx={{ fontSize: "14px" }}>{product.name}</Typography>
                            </Box>

                            {/* Rating */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Rating
                                name="read-only"
                                value={product.rating}
                                readOnly
                                precision={0.5}           // ← tambah precision buat avg rating
                                sx={{ color: "#003f29" }}
                              />
                              <Typography>({product.totalReviews})</Typography>
                            </Box>

                            {/* Harga */}
                            <Typography>
                              {product.price > 0
                                ? `Rp. ${product.price.toLocaleString("de-DE")}`
                                : "Harga tidak tersedia"}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: "24px",
                alignItems: "center"
              }}
            >
              {userInfo ? (
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  onClick={handleProfileNavigation}
                >
                  Hi, {userInfo.first_name || "User"}
                </Typography>
              ) : (
                <Link to="/signup">
                  <Button
                    className="nav-link"
                    startIcon={<PersonOutlinedIcon />}
                    sx={{
                      color: "white",
                      textDecoration: "none",
                      letterSpacing: "0.5px",
                      textTransform: "none",
                    }}
                  >
                    Account
                  </Button>
                </Link>
              )}

              <Link to="/cart">
                <Button
                  className="nav-link"
                  startIcon={<ShoppingCartOutlinedIcon />}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    letterSpacing: "0.5px",
                    textTransform: "none",
                  }}
                >
                  Cart
                </Button>
              </Link>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          paddingInline: "64px",
          paddingBlock: "12px",
          backgroundColor: "#f0f3f7",
          height: "calc(100vh - 80px)",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Stack>
  );

  console.log(userInfo)

}
