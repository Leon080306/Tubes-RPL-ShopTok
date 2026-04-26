/* eslint-disable react-hooks/set-state-in-effect */
import {
  AppBar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  Rating,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import AppLogoInline from "../assets/logos/AppLogo-inline.png";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import "../assets/styles/navbar.css";
import BasicMenu from "./BasicMenu";
import { useAppSelector } from "../hooks/useAppSelector";
import type { CartItem, Category } from "../type";
import formatPrice from "../utils/FormatPrice";

// ─── Types ────────────────────────────────────────────────────
interface BackendVariant {
  variant_id: string;
  name: string;
  price?: number;
  picture?: string;
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

interface SearchProduct {
  product_id: string;
  name: string;
  rating: number;
  totalReviews: number;
  price: number;
  picture: string;
}

// ─── Helper ───────────────────────────────────────────────────
function adaptToSearchProduct(p: BackendProduct): SearchProduct {
  const variants = p.variants ?? [];
  const ratings = p.ratings ?? [];

  const prices = variants.map((v) => v.price ?? 0).filter((x) => x > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
      : 0;

  const picture = variants.find((v) => v.picture)?.picture ?? "";

  return {
    product_id: p.product_id,
    name: p.name,
    rating: avgRating,
    totalReviews: ratings.length,
    price: minPrice,
    picture,
  };
}

export function Layout() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Categories");
  const [search, setSearch] = useState("");

  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartHovered, setCartHovered] = useState(false);
  const cartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  // ─── Fetch All Products (once) ───────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        const raw: BackendProduct[] = Array.isArray(data.records)
          ? data.records
          : [];
        setAllProducts(raw.map(adaptToSearchProduct));
      } catch (err) {
        console.error("Failed to fetch products for search:", err);
      }
    };
    fetchProducts();
  }, []);

  // ─── Client-side Filter ──────────────────────────────────
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [search, allProducts]);

  // ─── Fetch Categories ────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/category", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setCategories(data.records || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // ─── Fetch Cart Items ────────────────────────────────────
  const fetchCartItems = useCallback(async () => {
    if (!userInfo?.user_id) {
      setCartItems([]);
      return;
    }
    try {
      const res = await fetch(`/api/cart?user_id=${userInfo.user_id}`);
      if (!res.ok) return;
      const data = await res.json();
      setCartItems(data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }, [userInfo?.user_id]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => fetchCartItems();
    const handleCartUpdate = () => fetchCartItems();

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("focus", handleFocus);
    }
  }, [fetchCartItems]);

  const cartCount = cartItems.length;

  // ─── Cart Hover Handlers ─────────────────────────────────
  const handleCartMouseEnter = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }
    setCartHovered(true);
  };

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setCartHovered(false);
    }, 200);
  };

  // ─── Handlers ────────────────────────────────────────────
  const handleProfileNavigation = () => {
    if (userInfo?.role === "customer") {
      navigate("/profile");
    } else {
      navigate("/shop/dashboard");
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    const selected = categories.find((c) => c.name === categoryName);
    if (!selected) return;
    setSelectedCategory(selected.name);
    navigate(`/products?category=${selected.name}`);
  };

  const handleSearchNavigate = (productId?: string) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
    setSearchFocused(false);
    setSearch("");
  };

  // Show max 5 items in preview
  const previewItems = cartItems.slice(0, 5);
  const remainingCount = cartItems.length - previewItems.length;

  return (
    <Stack>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#003f29", height: "80px" }}
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
          {/* LEFT NAV */}
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
                style={{ width: "130px" }}
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
                  transition:
                    "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
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
                <Link className="nav-link" to="/products">
                  Products
                </Link>
                {userInfo?.role === "customer" ? (
                  <Link className="nav-link" to="/orders">
                    Orders
                  </Link>
                ) : (
                  <Link
                    className="nav-link"
                    to="/shop/dashboard"
                  >
                    Shop
                  </Link>
                )}
              </Box>
            </nav>
          </Box>

          {/* RIGHT NAV */}
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
            {/* SEARCH BOX */}
            <Box
              sx={{
                position: "relative",
                width: searchFocused ? "100%" : "400px",
                transition:
                  "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                maxWidth: "100%",
              }}
            >
              <TextField
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setSearchFocused(false);
                  }, 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    handleSearchNavigate();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        sx={{
                          fontSize: "20px",
                          color: "#888",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleSearchNavigate()
                        }
                      />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                placeholder="Search products"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "100px",
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused": { boxShadow: "none" },
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

              {/* SEARCH DROPDOWN */}
              {searchFocused && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    mt: 1,
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
                        <h2
                          style={{
                            fontSize: "18px",
                            margin: "0",
                            marginBottom: "16px",
                            paddingBottom: "12px",
                            borderBottom:
                              "1px solid rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          Popular Categories
                        </h2>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(2, 1fr)",
                            gap: 2,
                            height: "500px",
                            overflowY: "auto",
                            overflowX: "hidden",
                            "&::-webkit-scrollbar":
                            {
                              width: "0",
                            },
                          }}
                        >
                          {loadingCategories ? (
                            <CircularProgress />
                          ) : (
                            categories.map(
                              (category) => (
                                <Paper
                                  key={
                                    category.category_id
                                  }
                                  elevation={
                                    0
                                  }
                                  onClick={() => {
                                    handleCategorySelect(
                                      category.name ??
                                      ""
                                    );
                                    setTimeout(
                                      () =>
                                        setSearchFocused(
                                          false
                                        ),
                                      100
                                    );
                                  }}
                                  sx={{
                                    display:
                                      "flex",
                                    gap: "18px",
                                    alignItems:
                                      "center",
                                    backgroundColor:
                                      "#f6f6f6",
                                    borderRadius:
                                      "12px",
                                    padding:
                                      "12px",
                                    transition:
                                      "all 0.25s ease",
                                    cursor: "pointer",
                                    "&:hover":
                                    {
                                      transform:
                                        "scale(1.02)",
                                      boxShadow: 5,
                                    },
                                  }}
                                >
                                  <img
                                    src={`/api/${category.icon}`}
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      borderRadius:
                                        "6px",
                                    }}
                                    alt=""
                                  />
                                  <Box
                                    sx={{
                                      display:
                                        "flex",
                                      flexDirection:
                                        "column",
                                      justifyContent:
                                        "space-between",
                                      height: "50px",
                                      flexGrow: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {
                                        category.name
                                      }
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "text.secondary",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {
                                        category.totalProducts
                                      }{" "}
                                      products
                                      available
                                    </Typography>
                                  </Box>
                                </Paper>
                              )
                            )
                          )}
                        </Box>
                      </>
                    ) : searchResults.length === 0 ? (
                      <Typography
                        color="text.secondary"
                        textAlign="center"
                        py={3}
                      >
                        No products found for "{search}"
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {searchResults.map(
                          (product, index) => (
                            <Box
                              key={
                                product.product_id
                              }
                              onClick={() =>
                                handleSearchNavigate(
                                  product.product_id
                                )
                              }
                              sx={{
                                display: "flex",
                                flexDirection:
                                  "row",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "center",
                                padding:
                                  "18px 12px",
                                cursor: "pointer",
                                borderTop:
                                  index === 0
                                    ? "none"
                                    : "1px solid rgba(0, 0, 0, 0.2)",
                                "&:hover": {
                                  backgroundColor:
                                    "#f6f6f6",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "18px",
                                }}
                              >
                                <img
                                  src={`/api/${product.picture}`}
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius:
                                      "6px",
                                    objectFit:
                                      "cover",
                                  }}
                                  alt={
                                    product.name
                                  }
                                />
                                <Typography
                                  sx={{
                                    fontSize:
                                      "14px",
                                  }}
                                >
                                  {
                                    product.name
                                  }
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "8px",
                                }}
                              >
                                <Rating
                                  value={
                                    product.rating
                                  }
                                  readOnly
                                  precision={
                                    0.5
                                  }
                                  size="small"
                                  sx={{
                                    color: "#003f29",
                                  }}
                                />
                                <Typography
                                  fontSize={
                                    13
                                  }
                                >
                                  (
                                  {
                                    product.totalReviews
                                  }
                                  )
                                </Typography>
                              </Box>

                              <Typography
                                fontWeight={500}
                              >
                                {product.price >
                                  0
                                  ? `Rp. ${product.price.toLocaleString("de-DE")}`
                                  : "Harga tidak tersedia"}
                              </Typography>
                            </Box>
                          )
                        )}

                        <Box
                          onClick={() =>
                            handleSearchNavigate()
                          }
                          sx={{
                            textAlign: "center",
                            pt: 1.5,
                            borderTop:
                              "1px solid rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor:
                                "#f6f6f6",
                            },
                          }}
                        >
                          <Typography
                            fontSize={13}
                            color="#003f29"
                            fontWeight={600}
                            py={1}
                          >
                            View all results for "
                            {search}"
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>

            {/* ACCOUNT & CART */}
            <Box
              sx={{
                display: "flex",
                gap: "24px",
                alignItems: "center",
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

              {/* ═══════════ CART WITH HOVER PREVIEW ═══════════ */}
              <Box
                sx={{ position: "relative" }}
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleCartMouseLeave}
              >
                <Link to="/cart" style={{ textDecoration: "none" }}>
                  <Button
                    className="nav-link"
                    startIcon={
                      <Badge
                        badgeContent={cartCount}
                        color="error"
                        max={99}
                        invisible={cartCount === 0}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "10px",
                            minWidth: "18px",
                            height: "18px",
                            top: -2,
                            right: -2,
                          },
                        }}
                      >
                        <ShoppingCartOutlinedIcon />
                      </Badge>
                    }
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

                {/* ── Cart Floating Preview ── */}
                {cartHovered && userInfo && cartItems.length > 0 && (
                  <Paper
                    elevation={8}
                    onMouseEnter={handleCartMouseEnter}
                    onMouseLeave={handleCartMouseLeave}
                    sx={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      mt: 0.5,
                      width: 380,
                      zIndex: 100,
                      borderRadius: 2,
                      overflow: "hidden",
                      animation: "fadeIn 0.15s ease",
                      "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(-4px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                        py: 1.5,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography
                        fontSize={15}
                        fontWeight={700}
                      >
                        Keranjang{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            color: "#888",
                          }}
                        >
                          ({cartCount})
                        </span>
                      </Typography>
                      <Typography
                        fontSize={13}
                        fontWeight={600}
                        color="#003f29"
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration:
                              "underline",
                          },
                        }}
                        onClick={() => {
                          setCartHovered(false);
                          navigate("/cart");
                        }}
                      >
                        Lihat
                      </Typography>
                    </Box>

                    {/* Items */}
                    {cartItems.length === 0 ? (
                      <Box
                        sx={{
                          py: 4,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          fontSize={13}
                          color="text.secondary"
                        >
                          Keranjang kosong
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          maxHeight: 320,
                          overflowY: "auto",
                          "&::-webkit-scrollbar": {
                            width: 4,
                          },
                          "&::-webkit-scrollbar-thumb":
                          {
                            bgcolor: "#ccc",
                            borderRadius: 2,
                          },
                        }}
                      >
                        {previewItems.map(
                          (item, index) => (
                            <Box
                              key={
                                item.variant_id
                              }
                              onClick={() => {
                                setCartHovered(
                                  false
                                );
                                navigate(
                                  "/cart"
                                );
                              }}
                              sx={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: 1.5,
                                px: 2,
                                py: 1.5,
                                cursor: "pointer",
                                borderTop:
                                  index === 0
                                    ? "none"
                                    : "1px solid #f0f0f0",
                                "&:hover": {
                                  bgcolor:
                                    "#fafafa",
                                },
                              }}
                            >
                              {/* Image */}
                              <Box
                                component="img"
                                src={`/api/${item.variant.picture}`}
                                alt={
                                  item.variant
                                    ?.product
                                    ?.name
                                }
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1,
                                  objectFit:
                                    "cover",
                                  border: "1px solid #eee",
                                  flexShrink: 0,
                                }}
                              />

                              {/* Name + Variant */}
                              <Box
                                sx={{
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <Typography
                                  fontSize={
                                    13
                                  }
                                  fontWeight={
                                    500
                                  }
                                  noWrap
                                >
                                  {item
                                    .variant
                                    ?.product
                                    ?.name ??
                                    "Product"}
                                </Typography>
                                {item.variant
                                  ?.name && (
                                    <Typography
                                      fontSize={
                                        11
                                      }
                                      color="text.secondary"
                                      noWrap
                                    >
                                      {
                                        item
                                          .variant
                                          .name
                                      }
                                    </Typography>
                                  )}
                              </Box>

                              {/* Qty x Price */}
                              <Box
                                sx={{
                                  textAlign:
                                    "right",
                                  flexShrink: 0,
                                }}
                              >
                                <Typography
                                  fontSize={
                                    13
                                  }
                                  fontWeight={
                                    700
                                  }
                                  noWrap
                                >
                                  {
                                    item.quantity
                                  }
                                  x{" "}
                                  {formatPrice(
                                    Number(
                                      item
                                        .variant
                                        ?.price ??
                                      0
                                    )
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          )
                        )}

                        {/* Remaining items indicator */}
                        {remainingCount > 0 && (
                          <>
                            <Divider />
                            <Box
                              sx={{
                                textAlign:
                                  "center",
                                py: 1,
                              }}
                            >
                              <Typography
                                fontSize={12}
                                color="text.secondary"
                              >
                                +
                                {
                                  remainingCount
                                }{" "}
                                produk lainnya
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    )}

                    {/* Footer Button */}
                    {cartItems.length > 0 && (
                      <Box
                        sx={{
                          p: 1.5,
                          borderTop: "1px solid #eee",
                        }}
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => {
                            setCartHovered(false);
                            navigate("/cart");
                          }}
                          sx={{
                            bgcolor: "#003f29",
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: 13,
                            "&:hover": {
                              bgcolor: "#002a1c",
                            },
                          }}
                        >
                          Lihat Keranjang
                        </Button>
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        ref={scrollRef}
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
}