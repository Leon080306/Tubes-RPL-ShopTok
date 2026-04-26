import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Avatar, Box, Typography, Button, Stack, Container,
  Paper, Divider, Tabs, Tab, Grid, Card, CardContent, CardMedia,
  MenuItem, Select, FormControl, InputBase, IconButton,
  List, ListItemButton, ListItemText,
} from "@mui/material";
import {
  Verified as VerifiedIcon,
  Storefront as StorefrontIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import type { Product, Rating, ShopInfo } from "../../type";
import formatPrice from "../../utils/FormatPrice";
import { startChat } from "../../utils/StartChat";
import type { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

// ─── Types ────────────────────────────────────────────────────────────────────

type NormalizedProduct = {
  id: string | undefined;
  name: string;
  price: number;
  category: string | undefined;
  rating: number;
  sales: number;
  image: string | undefined;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCount = (n: number): string | number => {
  if (n >= 1000) return (n / 1000).toFixed(1) + "RB";
  return n;
};

const getImageUrl = (path?: string | null): string => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  return `/api/${path}`;
};

const getJoinDuration = (dateString?: string): string => {
  if (!dateString) return "-";
  const created = new Date(dateString);
  const now = new Date();
  const diffYears = now.getFullYear() - created.getFullYear();
  if (diffYears > 0) return `${diffYears} Thn Lalu`;
  const diffMonths =
    now.getMonth() + 12 * now.getFullYear() - (created.getMonth() + 12 * created.getFullYear());
  if (diffMonths > 0) return `${diffMonths} Bulan Lalu`;
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return `${diffDays} Hari Lalu`;
};

// ─── SearchBar ────────────────────────────────────────────────────────────────

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
};

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => (
  <Paper
    component="form"
    onSubmit={(e) => e.preventDefault()}
    sx={{
      p: "2px 4px",
      display: "flex",
      alignItems: "center",
      width: { xs: "100%", md: 300 },
      bgcolor: "#f0f0f0",
      boxShadow: "none",
    }}
  >
    <InputBase
      sx={{ ml: 1, flex: 1, fontSize: "0.9rem" }}
      placeholder="Cari di toko ini..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <IconButton sx={{ p: "10px" }}>
      <SearchIcon />
    </IconButton>
  </Paper>
);

// ─── ProductGrid ──────────────────────────────────────────────────────────────

type ProductGridProps = {
  products: NormalizedProduct[];
  onNavigate: (id: string | undefined) => void;
};

const ProductGrid = ({ products, onNavigate }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography color="text.secondary">Tidak ada produk ditemukan</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.map((p) => (
        <Grid size={{ xs: 6, md: 2.4 }} key={p.id}>
          <Card
            onClick={() => onNavigate(p.id)}
            elevation={0}
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.25s ease",
              backgroundColor: "#fff",
              "&:hover": {
                borderColor: "#003f29",
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <Box sx={{ overflow: "hidden" }}>
              <CardMedia
                component="img"
                height="180"
                image={getImageUrl(p.image)}
                alt={p.name}
                sx={{
                  objectFit: "cover",
                  transition: "transform 0.35s ease",
                  "&:hover": { transform: "scale(1.08)" },
                }}
              />
            </Box>

            <CardContent sx={{ p: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  height: 40,
                  overflow: "hidden",
                  mb: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {p.name}
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" color="#ee4d2d">
                {formatPrice(p.price)}
              </Typography>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  ⭐ {p.rating.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {p.sales} terjual
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// ─── HalamanUtama ─────────────────────────────────────────────────────────────

type HalamanUtamaProps = {
  shop: ShopInfo;
  normalizedProducts: NormalizedProduct[];
  onNavigate: (id: string | undefined) => void;
};

const HalamanUtama = ({ shop, normalizedProducts, onNavigate }: HalamanUtamaProps) => (
  <Stack spacing={3} sx={{ mt: 3 }}>
    {/* Voucher Section */}
    <Paper elevation={0} sx={{ p: 2, bgcolor: "#fff", border: "1px solid #eee" }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="#003f29">
        Voucher Belanja
      </Typography>
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1 }}>
        {[1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              minWidth: 280,
              height: 100,
              display: "flex",
              border: "1px dashed #ff5722",
              bgcolor: "#fff8f6",
            }}
          >
            <Box sx={{ width: "70%", p: 1.5 }}>
              <Typography variant="body2" fontWeight="bold" color="#ff5722">
                Diskon Rp100RB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Min. Blj Rp0 s.d 30.04.2026
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderStyle: "dashed" }} />
            <Button sx={{ width: "30%", color: "#ff5722", fontWeight: "bold" }}>Klaim</Button>
          </Box>
        ))}
      </Stack>
    </Paper>

    {/* Banner Utama */}
    <Paper
      sx={{ height: { xs: 150, md: 300 }, bgcolor: "#e0e0e0", borderRadius: 2, overflow: "hidden" }}
    >
      <CardMedia
        component="img"
        image={getImageUrl(shop.banner)}
        alt={`${shop.name} banner`}
        sx={{ height: "100%", objectFit: "cover" }}
      />
    </Paper>

    {/* Kamu Mungkin Suka */}
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Kamu Mungkin Suka
      </Typography>
      <ProductGrid products={normalizedProducts} onNavigate={onNavigate} />
    </Box>
  </Stack>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShopProfile() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [sortValue, setSortValue] = useState("populer");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [shop, setShop] = useState<ShopInfo>();
  const [products, setProducts] = useState<Product[]>([]);

  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    const fetchShop = async () => {
      try {
        const res = await fetch(`/api/shops/${shopId}`);
        const data = await res.json();
        if (!cancelled) setShop(data.records);
      } catch (err) {
        console.error(err);
      }
    };

    fetchShop();
    return () => { cancelled = true; };
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products`);
        const data = await res.json();
        const filtered = (data.records ?? []).filter((p: Product) => p.shop_id === shopId);
        if (!cancelled) setProducts(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [shopId]);

  const normalizedProducts = useMemo<NormalizedProduct[]>(() => {
    return products
      .filter((p: Product) => !!p.ratings)
      .map((p: Product) => {
        const totalSales =
          p.variants?.reduce((accVar, variant) => {
            const variantSales =
              variant.orderItems?.reduce((accOrder, item) => accOrder + item.quantity, 0) ?? 0;
            return accVar + variantSales;
          }, 0) ?? 0;

        return {
          id: p.product_id,
          name: p.name,
          price: p.variants?.[0]?.price ?? 0,
          category: p.category?.name,
          rating:
            p.ratings!.length > 0
              ? p.ratings!.reduce((acc: number, r: Rating) => acc + r.value, 0) / p.ratings!.length
              : 0,
          sales: totalSales,
          image: p.variants?.[0]?.picture,
        };
      });
  }, [products]);

  const categories = useMemo<string[]>(() => {
    const unique = new Set(
      normalizedProducts
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c))
    );
    return Array.from(unique);
  }, [normalizedProducts]);

  const filteredAndSortedProducts = useMemo<NormalizedProduct[]>(() => {
    const result = normalizedProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory
        ? (p.category ?? "").toLowerCase() === selectedCategory.toLowerCase()
        : true;
      return matchesSearch && matchesCategory;
    });

    return [...result].sort((a, b) => {
      switch (sortValue) {
        case "terlaris":
          return b.sales - a.sales;
        case "harga-asc":
          return a.price - b.price;
        case "harga-desc":
          return b.price - a.price;
        case "populer":
        default:
          return b.rating - a.rating;
      }
    });
  }, [normalizedProducts, searchQuery, selectedCategory, sortValue]);

  const totalProducts = useMemo(() => products.length, [products]);
  const joinLabel = useMemo(() => getJoinDuration(shop?.createdAt), [shop]);

  const handleNavigate = (id: string | undefined) => navigate(`/product/${id}`);

  if (!shop) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold">
          Toko Tidak Ditemukan
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Maaf, toko dengan ID "{shopId}" tidak terdaftar di sistem kami.
        </Typography>
        <Button variant="contained" color="success" onClick={() => navigate("/")}>
          Kembali ke Beranda
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
      {/* 1. HEADER TOKO */}
      <Box sx={{ bgcolor: "#003f29", color: "white", pt: 4, pb: 8 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <Avatar
                src={getImageUrl(shop.profile_pic)}
                sx={{ width: 80, height: 80, border: "2px solid rgba(255,255,255,0.5)" }}
              >
                <StorefrontIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {shop.name}{" "}
                  {shop.is_approved && <VerifiedIcon sx={{ fontSize: 18, color: "#4caf50" }} />}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ChatIcon />}
                    sx={{ color: "white", borderColor: "white", textTransform: "none" }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!shop || !userInfo) return;
                      const success = await startChat(
                        userInfo.user_id,
                        shop.shop_id,
                        `Halo, saya ingin bertanya tentang toko ${shop.name}`
                      );
                      if (success) navigate(`/chattoko?shop_id=${shop.shop_id}`);
                    }}
                  >
                    Chat
                  </Button>
                </Stack>
              </Box>
            </Stack>

            <Grid container spacing={2} sx={{ maxWidth: 500 }}>
              {[
                { label: "Produk", val: formatCount(totalProducts) },
                { label: "Bergabung", val: joinLabel },
              ].map((stat, i) => (
                <Grid size={{ xs: 6 }} key={i}>
                  <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>
                    {stat.label}:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="#ffeb3b">
                    {stat.val}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        {/* 2. NAVBAR INTERNAL */}
        <Paper elevation={1} sx={{ borderRadius: 1 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2 }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, v) => {
                setTabValue(v);
                if (v !== 2) setSelectedCategory(null);
              }}
              TabIndicatorProps={{ sx: { bgcolor: "#003f29", height: 3 } }}
              sx={{
                "& .MuiTab-root": {
                  fontWeight: "bold",
                  color: "#555",
                  "&.Mui-selected": { color: "#003f29" },
                },
              }}
            >
              <Tab label="Halaman Utama" />
              <Tab label="Semua Produk" />
              <Tab label="Kategori" />
            </Tabs>
            <Box sx={{ py: 1 }}>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </Box>
          </Stack>
        </Paper>

        {/* 3. CONTENT AREA */}
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <HalamanUtama
              shop={shop}
              normalizedProducts={normalizedProducts}
              onNavigate={handleNavigate}
            />
          )}

          {tabValue === 1 && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2">Urutkan:</Typography>
                {["Populer", "Terbaru", "Terlaris"].map((t) => (
                  <Button
                    key={t}
                    size="small"
                    variant={sortValue === t.toLowerCase() ? "contained" : "text"}
                    onClick={() => setSortValue(t.toLowerCase())}
                    sx={{
                      bgcolor: sortValue === t.toLowerCase() ? "#003f29" : "transparent",
                      textTransform: "none",
                    }}
                  >
                    {t}
                  </Button>
                ))}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={sortValue.includes("harga") ? sortValue : "Harga"}
                    onChange={(e) => setSortValue(e.target.value)}
                    sx={{ height: 32, fontSize: "0.8rem" }}
                  >
                    <MenuItem value="Harga" disabled>
                      Harga
                    </MenuItem>
                    <MenuItem value="harga-asc">Harga: Terendah</MenuItem>
                    <MenuItem value="harga-desc">Harga: Tertinggi</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
              <ProductGrid products={filteredAndSortedProducts} onNavigate={handleNavigate} />
            </Box>
          )}

          {tabValue === 2 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography fontWeight="bold" gutterBottom>
                    Semua Kategori
                  </Typography>
                  <List>
                    <ListItemButton
                      selected={selectedCategory === null}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <ListItemText primary="Semua" />
                    </ListItemButton>
                    {categories.map((cat) => (
                      <ListItemButton
                        key={cat}
                        selected={selectedCategory === cat}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        <ListItemText
                          primary={cat}
                          primaryTypographyProps={{ fontSize: "0.9rem" }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedCategory ?? "Pilih Kategori"}
                </Typography>
                <ProductGrid products={filteredAndSortedProducts} onNavigate={handleNavigate} />
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}