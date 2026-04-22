// ProductsList.tsx — backend integrated (GET only)

import { useState, useMemo, useEffect } from "react";
import type { ReactNode, ChangeEvent } from "react";
import {
    Box, Stack, Grid, Typography, Card, CardContent,
    InputBase, IconButton, Button, Avatar,
    Table, TableHead, TableBody, TableRow, TableCell,
    Drawer, 
    FormControl, LinearProgress, Tooltip,
    Pagination, Select, MenuItem, CircularProgress, Alert,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const PRIMARY = "#003f29" as const;
const BG = "#f0f3f7" as const;

// ─── Backend types ────────────────────────────────────────────────────────────
interface Rating {
    value: number;
}

interface ProductVariant {
    variant_id?: string;
    product_id?: string;
    name?: string;
    picture?: string;
    stock?: number;
    price?: number;
}

interface Category {
    category_id: string;
    name: string;
    icon?: string;
    parent?: Category;
}

interface BackendProduct {
    product_id: string;
    shop_id: string;
    category_id: string;
    name: string;
    description: string;
    view_count: number;
    ratings?: Rating[];
    variants?: ProductVariant[];
    category?: Category;
}

// ─── UI-normalized product ────────────────────────────────────────────────────
// Adapter layer: backend → apa yang dibutuhkan UI
interface UIProduct {
    id: string;                 // product_id
    name: string;
    description: string;
    category: string;           // category.name atau category.parent.name
    price: number;              // min price dari variants (dalam ribuan IDR)
    stock: number;              // total stock dari semua variants
    sold: number;               // placeholder — backend belum expose ini
    avgRating: number;          // rata-rata ratings
    ratingCount: number;
    picture: string | null;     // picture dari variant pertama
    viewCount: number;
    raw: BackendProduct;        // simpan raw untuk detail drawer
}

// ─── Adapter function ─────────────────────────────────────────────────────────
function adaptProduct(p: BackendProduct): UIProduct {
    const variants = p.variants ?? [];
    const ratings = p.ratings ?? [];

    const prices = variants.map((v) => v.price ?? 0).filter((x) => x > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    const totalStock = variants.reduce((acc, v) => acc + (v.stock ?? 0), 0);

    const avgRating =
        ratings.length > 0
            ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
            : 0;

    // Ambil nama kategori: prefer parent (level atas) kalau ada
    const categoryName =
        p.category?.name ?? p.category?.parent?.name ?? "Uncategorized";

    const firstPic = variants.find((v) => v.picture)?.picture ?? null;

    return {
        id: p.product_id,
        name: p.name,
        description: p.description,
        category: categoryName,
        price: minPrice,           // sudah dalam satuan asli (IDR)
        stock: totalStock,
        sold: 0,                   // backend belum expose
        avgRating,
        ratingCount: ratings.length,
        picture: firstPic,
        viewCount: p.view_count,
        raw: p,
    };
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const stockLevel = (stock: number) => {
    if (stock === 0) return { label: "Empty", color: "#b91c1c", barColor: "#ef4444" };
    if (stock <= 10) return { label: "Low", color: "#854d0e", barColor: "#f59e0b" };
    if (stock <= 50) return { label: "Medium", color: "#1d4ed8", barColor: "#3b82f6" };
    return { label: "In Stock", color: "#15803d", barColor: PRIMARY };
};

// Harga dalam IDR asli (dari backend), format ke Rp
const fmtPrice = (n: number) => {
    if (n === 0) return "—";
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
    return `Rp ${n}`;
};

// ─── Komponen kecil ───────────────────────────────────────────────────────────
interface SummaryCardProps {
    icon: ReactNode;
    iconBg: string;
    iconColor: string;
    label: string;
    value: string | number;
    sub?: string;
}
function SummaryCard({ icon, iconBg, iconColor, label, value, sub }: SummaryCardProps) {
    return (
        <Card>
            <CardContent sx={{ p: "16px 18px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>{label}</Typography>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13", lineHeight: 1 }}>
                            {value}
                        </Typography>
                        {sub && (
                            <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.5 }}>{sub}</Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            width: 38, height: 38, borderRadius: "9px",
                            bgcolor: iconBg, color: iconColor,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

// ─── View Drawer ───────────────────────────────────────────────────────────────
interface ViewDrawerProps {
    product: UIProduct | null;
    onClose: () => void;
    onEdit: (p: UIProduct) => void;
}
function ViewDrawer({ product, onClose, onEdit }: ViewDrawerProps) {
    if (!product) return null;
    const sl = stockLevel(product.stock);
    const variants = product.raw.variants ?? [];

    return (
        <Drawer
            anchor="right"
            open={!!product}
            onClose={onClose}
            PaperProps={{ sx: { width: 360, p: 0 } }}
        >
            {/* Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e8ecf0" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13" }}>
                        Product Details
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <Box sx={{ px: 3, py: 2.5, flex: 1, overflowY: "auto" }}>
                {/* Hero */}
                <Box
                    sx={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        py: 2.5, bgcolor: BG, borderRadius: 3, mb: 2.5,
                    }}
                >
                    {product.picture ? (
                        <Box
                            component="img"
                            src={product.picture}
                            alt={product.name}
                            sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: 2, mb: 1.5 }}
                        />
                    ) : (
                        <Box sx={{ fontSize: 52, lineHeight: 1, mb: 1.5 }}>📦</Box>
                    )}
                    <Typography
                        sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13", textAlign: "center", px: 1 }}
                    >
                        {product.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.3 }}>
                        ID: {product.id}
                    </Typography>
                </Box>

                {/* Info grid */}
                <Grid container spacing={1.5} mb={2.5}>
                    {[
                        { label: "Min Price", value: fmtPrice(product.price) },
                        { label: "Category", value: product.category },
                        { label: "Avg Rating", value: product.avgRating > 0 ? `⭐ ${product.avgRating.toFixed(1)} (${product.ratingCount})` : "No ratings" },
                        { label: "Views", value: product.viewCount.toLocaleString() },
                    ].map((row) => (
                        <Grid size={6} key={row.label}>
                            <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                                <Typography sx={{ fontSize: 11, color: "#94a3b8", mb: 0.3 }}>{row.label}</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13" }}>
                                    {row.value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Stock bar */}
                <Box sx={{ mb: 2.5, p: 1.75, border: "1px solid #e8ecf0", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0d1f13" }}>
                            Total Stock
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: sl.color }}>
                            {product.stock} units — {sl.label}
                        </Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min((product.stock / 200) * 100, 100)}
                        sx={{
                            height: 6, borderRadius: 99,
                            bgcolor: "#f0f3f7",
                            "& .MuiLinearProgress-bar": { bgcolor: sl.barColor, borderRadius: 99 },
                        }}
                    />
                    {product.stock <= 10 && product.stock > 0 && (
                        <Stack direction="row" alignItems="center" gap={0.5} mt={1}>
                            <WarningAmberRoundedIcon sx={{ fontSize: 13, color: "#f59e0b" }} />
                            <Typography sx={{ fontSize: 11.5, color: "#854d0e" }}>
                                Low stock — consider restocking
                            </Typography>
                        </Stack>
                    )}
                </Box>

                {/* Variants */}
                {variants.length > 0 && (
                    <Box mb={2.5}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0d1f13", mb: 1 }}>
                            Variants ({variants.length})
                        </Typography>
                        <Stack gap={1}>
                            {variants.map((v, i) => (
                                <Box
                                    key={v.variant_id ?? i}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.5,
                                        p: 1.25, bgcolor: "#f8fafc", borderRadius: 2,
                                    }}
                                >
                                    {v.picture && (
                                        <Box
                                            component="img"
                                            src={v.picture}
                                            alt={v.name}
                                            sx={{ width: 36, height: 36, objectFit: "cover", borderRadius: 1 }}
                                        />
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0d1f13" }}>
                                            {v.name ?? `Variant ${i + 1}`}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                                            Stock: {v.stock ?? 0} · {fmtPrice(v.price ?? 0)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Description */}
                <Box mb={3}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0d1f13", mb: 0.75 }}>
                        Description
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                        {product.description || "—"}
                    </Typography>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e8ecf0" }}>
                <Button
                    fullWidth variant="contained" size="small"
                    startIcon={<EditRoundedIcon fontSize="small" />}
                    onClick={() => onEdit(product)}
                    sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" },
                        textTransform: "none", fontWeight: 600,
                    }}
                >
                    Edit Product
                </Button>
            </Box>
        </Drawer>
    );
}

// ─── Konstanta ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

// Kategori diambil dinamis dari data, tapi fallback ke semua
const ALL_LABEL = "All";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductsList() {
    // ── State ──────────────────────────────────────────────────────────────────
    const [products, setProducts] = useState<UIProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState(ALL_LABEL);
    const [page, setPage] = useState(1);

    const [viewProduct, setViewProduct] = useState<UIProduct | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/api/products");   // sesuaikan base URL jika perlu

                if (!res.ok) throw new Error(`Server error: ${res.status}`);

                const data = await res.json();

                // Backend response: { message, records: BackendProduct[] }
                const raw: BackendProduct[] = Array.isArray(data.records)
                    ? data.records
                    : [];

                setProducts(raw.map(adaptProduct));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // ── Derived ────────────────────────────────────────────────────────────────
    // Kategori unik dari data
    const categories = useMemo(() => {
        const cats = [...new Set(products.map((p) => p.category))].sort();
        return [ALL_LABEL, ...cats];
    }, [products]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return products.filter((p) => {
            const matchQ = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
            const matchCat = catFilter === ALL_LABEL || p.category === catFilter;
            return matchQ && matchCat;
        });
    }, [products, search, catFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Summary stats
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    // ── Render: loading / error ────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                <Stack alignItems="center" gap={1.5}>
                    <CircularProgress size={32} sx={{ color: PRIMARY }} />
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>Loading products…</Typography>
                </Stack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    Failed to load products: {error}
                </Alert>
            </Box>
        );
    }

    // ── Render: main ──────────────────────────────────────────────────────────
    return (
        <Box sx={{ flex: 1, overflowY: "auto", bgcolor: BG }}>
            {/* Page header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13" }}>Products</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>
                        Manage your store inventory
                    </Typography>
                </Box>
                {/* Add Product — disabled untuk sekarang (perlu multer setup) */}
                <Tooltip title="Coming soon — requires file upload setup">
                    <span>
                        <Button
                            variant="contained"
                            startIcon={<AddRoundedIcon />}
                            disabled
                            sx={{
                                bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" },
                                textTransform: "none", fontWeight: 600, borderRadius: 2,
                            }}
                        >
                            Add Product
                        </Button>
                    </span>
                </Tooltip>
            </Stack>

            {/* Summary cards */}
            <Grid container spacing={1.75} mb={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<InventoryRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#dcfce7" iconColor="#16a34a"
                        label="Total Products" value={products.length}
                        sub={`${products.length - outOfStock} with stock`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#dbeafe" iconColor="#1d4ed8"
                        label="Total Stock" value={totalStock.toLocaleString()}
                        sub="across all variants"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<WarningAmberRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#fef9c3" iconColor="#854d0e"
                        label="Low Stock" value={lowStockCount}
                        sub="need restocking"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<TrendingUpRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#fce7f3" iconColor="#9d174d"
                        label="Out of Stock" value={outOfStock}
                        sub="no stock available"
                    />
                </Grid>
            </Grid>

            {/* Table card */}
            <Card>
                <CardContent sx={{ p: "0 !important" }}>

                    {/* Toolbar */}
                    <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} alignItems={{ sm: "center" }}>
                            {/* Search */}
                            <Box
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1,
                                    bgcolor: BG, borderRadius: 2, px: 1.5, py: 0.85,
                                    flex: 1, maxWidth: 320,
                                }}
                            >
                                <SearchRoundedIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                                <InputBase
                                    placeholder="Search by name or ID…"
                                    sx={{ fontSize: 13, flex: 1 }}
                                    value={search}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </Box>

                            {/* Category filter */}
                            <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                                <FilterListRoundedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <Select
                                        value={catFilter}
                                        onChange={(e: SelectChangeEvent) => {
                                            setCatFilter(e.target.value);
                                            setPage(1);
                                        }}
                                        displayEmpty
                                        sx={{ fontSize: 12.5, borderRadius: 1.5, bgcolor: "#fff" }}
                                    >
                                        {categories.map((c) => (
                                            <MenuItem key={c} value={c} sx={{ fontSize: 12.5 }}>
                                                {c === ALL_LABEL ? "All Categories" : c}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Typography sx={{ fontSize: 12, color: "#94a3b8", ml: "auto", whiteSpace: "nowrap" }}>
                                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Table */}
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#fafafa" }}>
                                {["Product", "ID", "Category", "Min Price", "Stock", "Rating", "Actions"].map((h) => (
                                    <TableCell
                                        key={h}
                                        sx={{
                                            fontSize: 11, color: "#94a3b8", fontWeight: 600,
                                            textTransform: "uppercase", letterSpacing: 0.5,
                                            borderBottom: "1px solid #f1f5f9", py: 1.25,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        sx={{ textAlign: "center", py: 5, color: "#94a3b8", fontSize: 13 }}
                                    >
                                        No products match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((p) => {
                                    const sl = stockLevel(p.stock);
                                    return (
                                        <TableRow
                                            key={p.id}
                                            sx={{
                                                "&:hover td": { bgcolor: "#f8fafc" },
                                                "&:last-child td": { border: 0 },
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setViewProduct(p)}
                                        >
                                            {/* Product */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 1.25 }}>
                                                <Stack direction="row" alignItems="center" gap={1.25}>
                                                    <Avatar
                                                        src={p.picture ?? undefined}
                                                        sx={{
                                                            width: 34, height: 34,
                                                            bgcolor: BG, fontSize: 17, borderRadius: 1.5,
                                                        }}
                                                    >
                                                        📦
                                                    </Avatar>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 13, fontWeight: 600, color: "#0d1f13",
                                                            whiteSpace: "nowrap", maxWidth: 180,
                                                            overflow: "hidden", textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {p.name}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>

                                            {/* ID */}
                                            <TableCell
                                                sx={{
                                                    fontSize: 11.5, color: "#94a3b8",
                                                    fontFamily: "monospace",
                                                    borderBottom: "1px solid #f8fafc",
                                                    maxWidth: 100,
                                                    overflow: "hidden", textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {p.id.slice(0, 8)}…
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell
                                                sx={{
                                                    fontSize: 12.5, color: "#475569",
                                                    borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap",
                                                }}
                                            >
                                                {p.category}
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell
                                                sx={{
                                                    fontSize: 13, fontWeight: 600, color: "#0d1f13",
                                                    borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap",
                                                }}
                                            >
                                                {fmtPrice(p.price)}
                                            </TableCell>

                                            {/* Stock */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc", minWidth: 90 }}>
                                                <Stack gap={0.4}>
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: sl.color }}>
                                                        {p.stock}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min((p.stock / 200) * 100, 100)}
                                                        sx={{
                                                            height: 3, borderRadius: 99, width: 60,
                                                            bgcolor: "#f0f3f7",
                                                            "& .MuiLinearProgress-bar": {
                                                                bgcolor: sl.barColor, borderRadius: 99,
                                                            },
                                                        }}
                                                    />
                                                </Stack>
                                            </TableCell>

                                            {/* Rating */}
                                            <TableCell
                                                sx={{ fontSize: 12.5, color: "#475569", borderBottom: "1px solid #f8fafc" }}
                                            >
                                                {p.avgRating > 0
                                                    ? `⭐ ${p.avgRating.toFixed(1)}`
                                                    : <Typography sx={{ fontSize: 12, color: "#cbd5e1" }}>—</Typography>
                                                }
                                            </TableCell>

                                            {/* Views */}
                                            {/* <TableCell
                                                sx={{ fontSize: 12.5, color: "#475569", borderBottom: "1px solid #f8fafc" }}
                                            >
                                                {p.viewCount.toLocaleString()}
                                            </TableCell> */}

                                            {/* Actions */}
                                            <TableCell
                                                sx={{ borderBottom: "1px solid #f8fafc" }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Stack direction="row" gap={0.25}>
                                                    <Tooltip title="View" placement="top">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setViewProduct(p)}
                                                            sx={{ color: "#94a3b8", "&:hover": { color: PRIMARY, bgcolor: "#f0fdf4" } }}
                                                        >
                                                            <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit (coming soon)" placement="top">
                                                        <span>
                                                            <IconButton size="small" disabled
                                                                sx={{ color: "#94a3b8" }}>
                                                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Delete (coming soon)" placement="top">
                                                        <span>
                                                            <IconButton size="small" disabled
                                                                sx={{ color: "#94a3b8" }}>
                                                                <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box
                            sx={{
                                display: "flex", justifyContent: "flex-end",
                                px: 2.5, py: 2, borderTop: "1px solid #f1f5f9",
                            }}
                        >
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, v) => setPage(v)}
                                size="small"
                                sx={{
                                    "& .MuiPaginationItem-root": { fontSize: 12 },
                                    "& .Mui-selected": { bgcolor: `${PRIMARY} !important`, color: "#fff" },
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* View Drawer */}
            <ViewDrawer
                product={viewProduct}
                onClose={() => setViewProduct(null)}
                onEdit={(p) => {
                    // TODO: sambungkan ke edit flow dengan multer
                    setViewProduct(null);
                    console.log("Edit product:", p.id);
                }}
            />
        </Box>
    );
}