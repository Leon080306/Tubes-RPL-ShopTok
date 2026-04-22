import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router"
import {
  Avatar, Box, Typography, Button, Stack, Container,
  Paper, Divider, Tabs, Tab, Grid, Card, CardContent, CardMedia,
  MenuItem, Select, FormControl, InputBase, IconButton,
  List, ListItemButton, ListItemText
} from "@mui/material";
import {
  Verified as VerifiedIcon,
  Storefront as StorefrontIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/useAppSelector";
import type { Product, Rating, ShopInfo } from "../../type";
import formatPrice from "../../utils/FormatPrice";

const ALL_SHOPS_MOCK = [
  {
    shop_id: "samsung-official",
    name: "Samsung Official Shop",
    profile_pic: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    banner: "https://images.samsung.com/is/image/samsung/assets/id/p6_otla/p6_otla_banner_pc.jpg",
    is_approved: true,
    description: "Toko Resmi Samsung Indonesia"
  },
  {
    shop_id: "apple-official",
    name: "Apple Store",
    profile_pic: "https://via.placeholder.com/150",
    banner: "https://via.placeholder.com/800x300",
    is_approved: true,
    description: "Official Apple Store"
  }
];

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
};

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <Paper
      component="form"
      onSubmit={(e) => e.preventDefault()}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: { xs: '100%', md: 300 },
        bgcolor: '#f0f0f0',
        boxShadow: 'none'
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
        placeholder="Cari di toko ini..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <IconButton sx={{ p: '10px' }}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default function ShopProfile() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  // const shop = useMemo(() => {
  //   if (userInfo?.shop_info?.shop_id === shopId) {
  //     return userInfo?.shop_info;
  //   }
  //   return ALL_SHOPS_MOCK.find((s) => s.shop_id === shopId);
  // }, [shopId, userInfo]);

  const [tabValue, setTabValue] = useState(0);
  const [sortValue, setSortValue] = useState("populer");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [shop, setShop] = useState<ShopInfo>();
  const [products, setProducts] = useState<Product[]>([]);

  // --- MOCK DATA ---
  // const dummyProducts = [
  //   { id: 1, name: "Samsung Galaxy A16 8/128GB - Gray", price: 2759000, category: "Smartphone", sales: "10RB+", rating: 4.9, image: "https://via.placeholder.com/200" },
  //   { id: 2, name: "Samsung Galaxy Buds Pro - Black", price: 799000, category: "Accessories", sales: "1RB+", rating: 4.9, image: "https://via.placeholder.com/200" },
  //   { id: 3, name: "Crystal UHD 4K TV 43 Inch", price: 3309000, category: "Electronics", sales: "3RB+", rating: 4.9, image: "https://via.placeholder.com/200" },
  // ];

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch(`/api/shops/${shopId}`);
        const data = await res.json();
        setShop(data.records);
      } catch (err) {
        console.error(err);
      }
    };

    fetchShop();
  }, [shopId]);

  useEffect(() => {
  const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products`);
        const data = await res.json();

        // filter berdasarkan shop_id
        const filtered = data.records.filter(
          (p: Product) => p.shop_id === shopId
        );

        setProducts(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, [shopId]);

  const normalizedProducts = products.map((p: Product) => {
    const totalSales = p.variants?.reduce((accVar, variant) => {
      const variantSales = variant.orderItems?.reduce(
        (accOrder, item) => accOrder + item.quantity,
        0
      ) || 0;

      return accVar + variantSales;
    }, 0) || 0;

    return {
      id: p.product_id,
      name: p.name,
      price: p.variants?.[0]?.price || 0,
      category: p.category?.name,
      rating:
        p.ratings.length > 0
          ? p.ratings.reduce((acc: number, r: Rating) => acc + r.value, 0) /
            p.ratings.length
          : 0,
      sales: totalSales,
      image: p.variants?.[0]?.picture,
    };
  });


  
  const categories = useMemo(() => {
    const unique = new Set(
      normalizedProducts
        .map((p) => p.category)
        .filter(Boolean)
    );

    return Array.from(unique);
  }, [normalizedProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filter berdasarkan Search Query & Kategori
    const result = normalizedProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory
        ? (p.category || "").toLowerCase() === selectedCategory.toLowerCase()
        : true;
      return matchesSearch && matchesCategory;
    });

    // 2. Sort berdasarkan sortValue
    return [...result].sort((a, b) => {
      switch (sortValue) {
        // case "terbaru":
        //   return b.id - a.id;
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

  const totalProducts = useMemo(() => {
    return products.length;
  }, [products]);

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "RB";
    return n;
  };

  const getJoinDuration = (dateString?: string) => {
    if (!dateString) return "-";

    const created = new Date(dateString);
    const now = new Date();

    const diffYears = now.getFullYear() - created.getFullYear();

    if (diffYears > 0) return `${diffYears} Thn Lalu`;

    const diffMonths =
      (now.getMonth() + 12 * now.getFullYear()) -
      (created.getMonth() + 12 * created.getFullYear());

    if (diffMonths > 0) return `${diffMonths} Bulan Lalu`;

    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );

    return `${diffDays} Hari Lalu`;
  };

  const joinLabel = useMemo(() => {
    return getJoinDuration(shop?.createdAt);
  }, [shop]);

  if (!shop) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold">Toko Tidak Ditemukan</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Maaf, toko dengan ID "{shopId}" tidak terdaftar di sistem kami.
        </Typography>
        <Button variant="contained" color="success" onClick={() => navigate("/")}>
          Kembali ke Beranda
        </Button>
      </Container>
    );
  }

  // --- TAB 0: HALAMAN UTAMA ---
  const HalamanUtama = () => (
    <Stack spacing={3} sx={{ mt: 3 }}>
      {/* Voucher Section */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', border: '1px solid #eee' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="#003f29">Voucher Belanja</Typography>
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
          {[1, 2].map((i) => (
            <Box key={i} sx={{ minWidth: 280, height: 100, display: 'flex', border: '1px dashed #ff5722', bgcolor: '#fff8f6' }}>
              <Box sx={{ width: '70%', p: 1.5 }}>
                <Typography variant="body2" fontWeight="bold" color="#ff5722">Diskon Rp100RB</Typography>
                <Typography variant="caption" color="text.secondary">Min. Blj Rp0 s.d 30.04.2026</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
              <Button sx={{ width: '30%', color: '#ff5722', fontWeight: 'bold' }}>Klaim</Button>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Banner Utama */}
      <Paper sx={{ height: { xs: 150, md: 300 }, bgcolor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <CardMedia component="img" image={shop.banner} sx={{ height: '100%', objectFit: 'cover' }} />
      </Paper>

      {/* Kamu Mungkin Suka */}
      <Box>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Kamu Mungkin Suka</Typography>
        <ProductGrid products={normalizedProducts} />
      </Box>
    </Stack>
  );

  // --- REUSABLE PRODUCT GRID ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ProductGrid = ({ products }: { products: any[] }) => (
    <Grid container spacing={2}>
      {products.map((p) => (
        <Grid size={{ xs: 6, md: 2.4 }} key={p.id}>
          <Card
            onClick={() => navigate(`/product/${p.id}`)}
            elevation={0}
            sx={{
              border: '1px solid #eee',
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              backgroundColor: '#fff',

              '&:hover': {
                borderColor: '#003f29',
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box sx={{ overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="180"
                image={p.image}
                sx={{
                  transition: 'transform 0.35s ease',
                  '&:hover': {
                    transform: 'scale(1.08)',
                  },
                }}
              />
            </Box>

            <CardContent sx={{ p: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  height: 40,
                  overflow: 'hidden',
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {p.name}
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" color="#ee4d2d">
                {formatPrice(p.price)}
              </Typography>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  ⭐ {p.rating}
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

  return (
    <Box sx={{ width: '100%', bgcolor: '#f5f5f5', minHeight: '100vh', pb: 5 }}>
      {/* 1. HEADER TOKO  */}
      <Box sx={{ bgcolor: '#003f29', color: 'white', pt: 4, pb: 8 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            {/* Kiri: Avatar & Nama */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <Avatar src={shop.profile_pic} sx={{ width: 80, height: 80, border: '2px solid rgba(255,255,255,0.5)' }}>
                <StorefrontIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {shop.name} {shop.is_approved && <VerifiedIcon sx={{ fontSize: 18, color: '#4caf50' }} />}
                </Typography>
                {/* <Typography variant="caption" sx={{ opacity: 0.8 }}>Aktif 2 menit lalu</Typography> */}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {/* <Button size="small" variant="outlined" startIcon={<AddIcon />} sx={{ color: 'white', borderColor: 'white', textTransform: 'none' }}>Ikuti</Button> */}
                  <Button size="small" variant="outlined" startIcon={<ChatIcon />} sx={{ color: 'white', borderColor: 'white', textTransform: 'none' }}>Chat</Button>
                </Stack>
              </Box>
            </Stack>

            {/* Kanan: Statistik Ringkas */}
            <Grid container spacing={2} sx={{ maxWidth: 500 }}>
              {[
                { label: 'Produk', val: formatCount(totalProducts) },
                // { label: 'Mengikuti', val: '0' },
                // { label: 'Performa Chat', val: '100%' },
                // { label: 'Pengikut', val: '3,1JT' },
                // { label: 'Penilaian', val: '4.9' },
                { label: 'Bergabung', val: joinLabel },
              ].map((stat, i) => (
                <Grid size={{ xs: 20 }} key={i}>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>{stat.label}:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="#ffeb3b">{stat.val}</Typography>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        {/* 2. NAVBAR INTERNAL */}
        <Paper elevation={1} sx={{ borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ px: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(_, v) => {
                setTabValue(v);

                // reset filter saat keluar dari tab kategori
                if (v !== 2) {
                  setSelectedCategory(null);
                }
              }}
              TabIndicatorProps={{ sx: { bgcolor: '#003f29', height: 3 } }}
              sx={{ '& .MuiTab-root': { fontWeight: 'bold', color: '#555', '&.Mui-selected': { color: '#003f29' } } }}
            >
              <Tab label="Halaman Utama" />
              <Tab label="Semua Produk" />
              <Tab label="Kategori" />
            </Tabs>
            <Box sx={{ py: 1 }}>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </Box>
          </Stack>
        </Paper>

        {/* 3. CONTENT AREA */}
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && <HalamanUtama />}

          {tabValue === 1 && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Urutkan:</Typography>
                {['Populer', 'Terbaru', 'Terlaris'].map((t) => (
                  <Button key={t} size="small" variant={sortValue === t.toLowerCase() ? "contained" : "text"}
                    onClick={() => setSortValue(t.toLowerCase())}
                    sx={{ bgcolor: sortValue === t.toLowerCase() ? '#003f29' : 'transparent', textTransform: 'none' }}>
                    {t}
                  </Button>
                ))}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select value={sortValue.includes('harga') ? sortValue : "Harga"} onChange={(e) => setSortValue(e.target.value)} sx={{ height: 32, fontSize: '0.8rem' }}>
                    <MenuItem value="Harga" disabled>Harga</MenuItem>
                    <MenuItem value="harga-asc">Harga: Terendah</MenuItem>
                    <MenuItem value="harga-desc">Harga: Tertinggi</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
              <ProductGrid products={filteredAndSortedProducts} />
            </Box>
          )}

          {tabValue === 2 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography fontWeight="bold" gutterBottom>Semua Kategori</Typography>
                  <List>
                    <ListItemButton
                      selected={selectedCategory === null}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <ListItemText primary="Semua" />
                    </ListItemButton>
                    {categories.map((cat) => (
                      <ListItemButton key={cat} selected={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                        <ListItemText primary={cat} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{selectedCategory || "Pilih Kategori"}</Typography>
                <ProductGrid products={filteredAndSortedProducts} />
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}