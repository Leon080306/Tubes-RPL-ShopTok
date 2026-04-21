/**
 * GreenMart — Products Page
 *
 * Drop-in replacement for the dashboard content area.
 * Uses the same theme/color tokens as SellerDashboard.tsx.
 *
 * Features:
 *  - Product table with search + category/status filters
 *  - View product drawer (read-only detail panel)
 *  - Add / Edit product dialog (shared form)
 *  - Delete confirmation dialog
 *  - Stock status badges + low-stock warning
 *
 * Usage (inside SellerDashboard, swap the content area):
 *   import ProductsPage from './ProductsPage';
 *   // render <ProductsPage /> instead of the dashboard grid
 */

import { useState, useMemo } from "react";
import type { ReactNode, ChangeEvent } from "react";
import {
    Box, Stack, Grid, Typography, Card, CardContent,
    InputBase, IconButton, Chip, Button, Avatar,
    Table, TableHead, TableBody, TableRow, TableCell,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Drawer, Divider, TextField, Select, MenuItem,
    FormControl, InputLabel, LinearProgress, Tooltip,
    Pagination,
} from "@mui/material";
import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

// ─── Brand tokens (must match SellerDashboard.tsx) ────────────────────────────
const PRIMARY = "#003f29" as const;
const BG = "#f0f3f7" as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductStatus = "Active" | "Draft" | "Out of Stock";
type ProductCategory =
    | "Footwear"
    | "Accessories"
    | "Electronics"
    | "Beauty"
    | "Clothing"
    | "Home & Living";

interface Product {
    id: string;
    name: string;
    category: ProductCategory;
    price: number;         // in thousands IDR (e.g. 420 = Rp 420.000)
    stock: number;
    sold: number;
    status: ProductStatus;
    emoji: string;
    sku: string;
    description: string;
    weight: number;        // grams
}

type FormDraft = Omit<Product, "id" | "sold">;

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_PRODUCTS: Product[] = [
    { id: "P001", emoji: "👟", name: "Sneakers Pro Max", sku: "FW-001", category: "Footwear", price: 420, stock: 84, sold: 312, status: "Active", description: "Premium running sneakers with ultra-cushion sole.", weight: 620 },
    { id: "P002", emoji: "👜", name: "Canvas Tote Bag", sku: "AC-019", category: "Accessories", price: 89, stock: 210, sold: 241, status: "Active", description: "Eco-friendly canvas tote, reinforced handles.", weight: 280 },
    { id: "P003", emoji: "🎧", name: "Wireless Earbuds X3", sku: "EL-042", category: "Electronics", price: 349, stock: 17, sold: 89, status: "Active", description: "True wireless earbuds, 30h battery, ANC.", weight: 55 },
    { id: "P004", emoji: "🧴", name: "Skincare Starter Kit", sku: "BE-007", category: "Beauty", price: 185, stock: 53, sold: 180, status: "Active", description: "3-step morning routine: cleanser, toner, moisturiser.", weight: 420 },
    { id: "P005", emoji: "👕", name: "Essential Cotton Tee", sku: "CL-033", category: "Clothing", price: 65, stock: 0, sold: 408, status: "Out of Stock", description: "100% cotton heavyweight tee, unisex fit.", weight: 180 },
    { id: "P006", emoji: "🕯️", name: "Soy Wax Candle Set", sku: "HL-011", category: "Home & Living", price: 120, stock: 6, sold: 67, status: "Active", description: "Set of 3 hand-poured soy candles, vanilla & amber.", weight: 750 },
    { id: "P007", emoji: "🎒", name: "Commuter Backpack", sku: "AC-024", category: "Accessories", price: 310, stock: 38, sold: 155, status: "Active", description: "15\" laptop compartment, waterproof 30L.", weight: 900 },
    { id: "P008", emoji: "💄", name: "Matte Lip Collection", sku: "BE-021", category: "Beauty", price: 95, stock: 142, sold: 230, status: "Active", description: "6-shade matte liquid lipstick set, long-wearing.", weight: 90 },
    { id: "P009", emoji: "📱", name: "Phone Stand Adjustable", sku: "EL-067", category: "Electronics", price: 45, stock: 3, sold: 312, status: "Active", description: "Aluminium foldable phone & tablet stand.", weight: 110 },
    { id: "P010", emoji: "🧢", name: "Structured Cap", sku: "CL-055", category: "Clothing", price: 75, stock: 90, sold: 189, status: "Draft", description: "6-panel structured cap, embroidered logo.", weight: 130 },
    { id: "P011", emoji: "🪴", name: "Ceramic Plant Pot S/3", sku: "HL-028", category: "Home & Living", price: 145, stock: 22, sold: 44, status: "Active", description: "Set of 3 glazed ceramic pots with drainage holes.", weight: 1100 },
    { id: "P012", emoji: "⌚", name: "Minimalist Watch", sku: "AC-031", category: "Accessories", price: 550, stock: 0, sold: 76, status: "Out of Stock", description: "Japanese movement, sapphire glass, mesh strap.", weight: 95 },
];

const CATEGORIES: ProductCategory[] = [
    "Footwear", "Accessories", "Electronics", "Beauty", "Clothing", "Home & Living",
];

const ALL_STATUSES: ProductStatus[] = ["Active", "Draft", "Out of Stock"];

const EMPTY_FORM: FormDraft = {
    emoji: "📦",
    name: "",
    sku: "",
    category: "Footwear",
    price: 0,
    stock: 0,
    status: "Active",
    description: "",
    weight: 0,
};

// ─── Style helpers ────────────────────────────────────────────────────────────
const STATUS_SX: Record<ProductStatus, SxProps<Theme>> = {
    "Active": { bgcolor: "#dcfce7", color: "#15803d" },
    "Draft": { bgcolor: "#f1f5f9", color: "#475569" },
    "Out of Stock": { bgcolor: "#fee2e2", color: "#b91c1c" },
};

const stockLevel = (stock: number): { label: string; color: string; barColor: string } => {
    if (stock === 0) return { label: "Empty", color: "#b91c1c", barColor: "#ef4444" };
    if (stock <= 10) return { label: "Low", color: "#854d0e", barColor: "#f59e0b" };
    if (stock <= 50) return { label: "Medium", color: "#1d4ed8", barColor: "#3b82f6" };
    return { label: "In Stock", color: "#15803d", barColor: PRIMARY };
};

const fmtPrice = (n: number) =>
    `Rp ${n >= 1000 ? `${(n / 1000).toFixed(1)}Jt` : `${n}K`}`;

// ─── Summary stats ─────────────────────────────────────────────────────────────
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
                        {sub && <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.5 }}>{sub}</Typography>}
                    </Box>
                    <Box sx={{ width: 38, height: 38, borderRadius: "9px", bgcolor: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

// ─── Product Form Dialog ───────────────────────────────────────────────────────
interface ProductFormDialogProps {
    open: boolean;
    mode: "add" | "edit";
    draft: FormDraft;
    onChange: (field: keyof FormDraft, value: string | number) => void;
    onSubmit: () => void;
    onClose: () => void;
}

function ProductFormDialog({ open, mode, draft, onChange, onSubmit, onClose }: ProductFormDialogProps) {
    const title = mode === "add" ? "Add New Product" : "Edit Product";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#0d1f13" }}>{title}</Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2.5 }}>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <TextField
                            label="Product Name"
                            fullWidth size="small"
                            value={draft.name}
                            onChange={(e) => onChange("name", e.target.value)}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="SKU"
                            fullWidth size="small"
                            value={draft.sku}
                            onChange={(e) => onChange("sku", e.target.value)}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Emoji / Icon"
                            fullWidth size="small"
                            value={draft.emoji}
                            onChange={(e) => onChange("emoji", e.target.value)}
                            inputProps={{ maxLength: 2 }}
                        />
                    </Grid>
                    <Grid size={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                label="Category"
                                value={draft.category}
                                onChange={(e: SelectChangeEvent) =>
                                    onChange("category", e.target.value as ProductCategory)
                                }
                            >
                                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                value={draft.status}
                                onChange={(e: SelectChangeEvent) =>
                                    onChange("status", e.target.value as ProductStatus)
                                }
                            >
                                {ALL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            label="Price (Rp K)"
                            fullWidth size="small" type="number"
                            value={draft.price}
                            onChange={(e) => onChange("price", Number(e.target.value))}
                            helperText="e.g. 420 = Rp 420K"
                        />
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            label="Stock (units)"
                            fullWidth size="small" type="number"
                            value={draft.stock}
                            onChange={(e) => onChange("stock", Number(e.target.value))}
                        />
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            label="Weight (g)"
                            fullWidth size="small" type="number"
                            value={draft.weight}
                            onChange={(e) => onChange("weight", Number(e.target.value))}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            label="Description"
                            fullWidth size="small" multiline rows={3}
                            value={draft.description}
                            onChange={(e) => onChange("description", e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" size="small"
                    sx={{ borderColor: "#e2e8f0", color: "#64748b", "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} variant="contained" size="small"
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" }, textTransform: "none", fontWeight: 600 }}>
                    {mode === "add" ? "Add Product" : "Save Changes"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
interface DeleteDialogProps {
    open: boolean;
    productName: string;
    onConfirm: () => void;
    onClose: () => void;
}
function DeleteDialog({ open, productName, onConfirm, onClose }: DeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13" }}>Delete Product</Typography>
                    <IconButton size="small" onClick={onClose}><CloseRoundedIcon fontSize="small" /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ fontSize: 13.5, color: "#334155" }}>
                    Are you sure you want to delete{" "}
                    <Box component="span" sx={{ fontWeight: 700 }}>{productName}</Box>?
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" size="small"
                    sx={{ borderColor: "#e2e8f0", color: "#64748b", "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} variant="contained" size="small"
                    sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, textTransform: "none", fontWeight: 600 }}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── View Drawer ───────────────────────────────────────────────────────────────
interface ViewDrawerProps {
    product: Product | null;
    onClose: () => void;
    onEdit: (p: Product) => void;
}
function ViewDrawer({ product, onClose, onEdit }: ViewDrawerProps) {
    if (!product) return null;
    const sl = stockLevel(product.stock);

    return (
        <Drawer anchor="right" open={!!product} onClose={onClose}
            PaperProps={{ sx: { width: 340, p: 0 } }}>

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
                {/* Product hero */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2.5, bgcolor: BG, borderRadius: 3, mb: 2.5 }}>
                    <Box sx={{ fontSize: 52, lineHeight: 1, mb: 1.5 }}>{product.emoji}</Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13", textAlign: "center", px: 1 }}>
                        {product.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.3 }}>{product.sku}</Typography>
                    <Chip label={product.status} size="small"
                        sx={{ mt: 1.25, height: 22, fontSize: 11.5, fontWeight: 600, borderRadius: "99px", ...STATUS_SX[product.status] }} />
                </Box>

                {/* Price + stock */}
                <Grid container spacing={1.5} mb={2.5}>
                    {[
                        { label: "Price", value: fmtPrice(product.price) },
                        { label: "Category", value: product.category },
                        { label: "Total Sold", value: `${product.sold} units` },
                        { label: "Weight", value: `${product.weight} g` },
                    ].map((row) => (
                        <Grid size={6} key={row.label}>
                            <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                                <Typography sx={{ fontSize: 11, color: "#94a3b8", mb: 0.3 }}>{row.label}</Typography>
                                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#0d1f13" }}>{row.value}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Stock bar */}
                <Box sx={{ mb: 2.5, p: 1.75, border: "1px solid #e8ecf0", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0d1f13" }}>Stock Level</Typography>
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
                            <Typography sx={{ fontSize: 11.5, color: "#854d0e" }}>Low stock — consider restocking</Typography>
                        </Stack>
                    )}
                </Box>

                {/* Description */}
                <Box mb={3}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0d1f13", mb: 0.75 }}>Description</Typography>
                    <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{product.description}</Typography>
                </Box>
            </Box>

            {/* Footer actions */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e8ecf0" }}>
                <Button fullWidth variant="contained" size="small" startIcon={<EditRoundedIcon fontSize="small" />}
                    onClick={() => onEdit(product)}
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" }, textTransform: "none", fontWeight: 600 }}>
                    Edit Product
                </Button>
            </Box>
        </Drawer>
    );
}

// ─── Main Products Page ────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState<ProductCategory | "All">("All");
    const [statusFilter, setStatus] = useState<ProductStatus | "All">("All");
    const [page, setPage] = useState(1);

    // dialogs / drawer
    const [viewProduct, setViewProduct] = useState<Product | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<FormDraft>(EMPTY_FORM);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    // ── Derived ────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return products.filter((p) => {
            const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
            const matchCat = catFilter === "All" || p.category === catFilter;
            const matchSt = statusFilter === "All" || p.status === statusFilter;
            return matchQ && matchCat && matchSt;
        });
    }, [products, search, catFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const activeCount = products.filter((p) => p.status === "Active").length;
    const totalRevenue = products.reduce((acc, p) => acc + p.price * p.sold, 0);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const openAdd = () => {
        setDraft(EMPTY_FORM);
        setFormMode("add");
        setEditingId(null);
        setFormOpen(true);
    };

    const openEdit = (p: Product) => {
        const { id, ...rest } = p;
        setDraft(rest);
        setEditingId(id);
        setFormMode("edit");
        setViewProduct(null);
        setFormOpen(true);
    };

    const handleDraftChange = (field: keyof FormDraft, value: string | number) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormSubmit = () => {
        if (!draft.name.trim()) return;
        if (formMode === "add") {
            const newProduct: Product = {
                ...draft,
                id: `P${String(products.length + 1).padStart(3, "0")}`,
                sold: 0,
            };
            setProducts((prev) => [newProduct, ...prev]);
        } else if (editingId) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === editingId ? { ...p, ...draft } : p
                )
            );
        }
        setFormOpen(false);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: BG }}>

            {/* Page header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13" }}>Products</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>
                        Manage your store inventory
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={openAdd}
                    sx={{
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" },
                        textTransform: "none", fontWeight: 600, borderRadius: 2,
                    }}
                >
                    Add Product
                </Button>
            </Stack>

            {/* Summary cards */}
            <Grid container spacing={1.75} mb={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<InventoryRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#dcfce7" iconColor="#16a34a"
                        label="Total Products" value={products.length}
                        sub={`${activeCount} active`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#dbeafe" iconColor="#1d4ed8"
                        label="Total Stock" value={totalStock.toLocaleString()}
                        sub="across all products"
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
                        label="Est. Revenue" value={fmtPrice(totalRevenue)}
                        sub="lifetime sold"
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
                                    placeholder="Search by name or SKU…"
                                    sx={{ fontSize: 13, flex: 1 }}
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </Box>

                            {/* Filters */}
                            <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                                <FilterListRoundedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                    <Select
                                        value={catFilter}
                                        onChange={(e: SelectChangeEvent) => {
                                            setCatFilter(e.target.value as ProductCategory | "All");
                                            setPage(1);
                                        }}
                                        displayEmpty
                                        sx={{ fontSize: 12.5, borderRadius: 1.5, bgcolor: "#fff" }}
                                    >
                                        <MenuItem value="All">All Categories</MenuItem>
                                        {CATEGORIES.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: 12.5 }}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e: SelectChangeEvent) => {
                                            setStatus(e.target.value as ProductStatus | "All");
                                            setPage(1);
                                        }}
                                        displayEmpty
                                        sx={{ fontSize: 12.5, borderRadius: 1.5, bgcolor: "#fff" }}
                                    >
                                        <MenuItem value="All">All Statuses</MenuItem>
                                        {ALL_STATUSES.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: 12.5 }}>{s}</MenuItem>)}
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
                                {["Product", "SKU", "Category", "Price", "Stock", "Sold", "Status", "Actions"].map((h) => (
                                    <TableCell key={h}
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
                                    <TableCell colSpan={8} sx={{ textAlign: "center", py: 5, color: "#94a3b8", fontSize: 13 }}>
                                        No products match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((p) => {
                                    const sl = stockLevel(p.stock);
                                    return (
                                        <TableRow key={p.id}
                                            sx={{
                                                "&:hover td": { bgcolor: "#f8fafc" },
                                                "&:last-child td": { border: 0 },
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setViewProduct(p)}
                                        >
                                            {/* Product name */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 1.25 }}>
                                                <Stack direction="row" alignItems="center" gap={1.25}>
                                                    <Avatar
                                                        sx={{
                                                            width: 34, height: 34, bgcolor: BG,
                                                            fontSize: 17, borderRadius: 1.5,
                                                        }}
                                                    >
                                                        {p.emoji}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13", whiteSpace: "nowrap" }}>
                                                        {p.name}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>

                                            {/* SKU */}
                                            <TableCell sx={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", borderBottom: "1px solid #f8fafc" }}>
                                                {p.sku}
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell sx={{ fontSize: 12.5, color: "#475569", borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap" }}>
                                                {p.category}
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13", borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap" }}>
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
                                                            "& .MuiLinearProgress-bar": { bgcolor: sl.barColor, borderRadius: 99 },
                                                        }}
                                                    />
                                                </Stack>
                                            </TableCell>

                                            {/* Sold */}
                                            <TableCell sx={{ fontSize: 12.5, color: "#475569", borderBottom: "1px solid #f8fafc" }}>
                                                {p.sold.toLocaleString()}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                                                <Chip label={p.status} size="small"
                                                    sx={{ height: 21, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...STATUS_SX[p.status] }} />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}
                                                onClick={(e) => e.stopPropagation()}>
                                                <Stack direction="row" gap={0.25}>
                                                    <Tooltip title="View" placement="top">
                                                        <IconButton size="small" onClick={() => setViewProduct(p)}
                                                            sx={{ color: "#94a3b8", "&:hover": { color: PRIMARY, bgcolor: "#f0fdf4" } }}>
                                                            <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit" placement="top">
                                                        <IconButton size="small" onClick={() => openEdit(p)}
                                                            sx={{ color: "#94a3b8", "&:hover": { color: "#1d4ed8", bgcolor: "#eff6ff" } }}>
                                                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" placement="top">
                                                        <IconButton size="small" onClick={() => setDeleteTarget(p)}
                                                            sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                                                            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
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
                        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2.5, py: 2, borderTop: "1px solid #f1f5f9" }}>
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

            {/* ── Overlays ─────────────────────────────────────────────────────────── */}
            <ViewDrawer
                product={viewProduct}
                onClose={() => setViewProduct(null)}
                onEdit={openEdit}
            />

            <ProductFormDialog
                open={formOpen}
                mode={formMode}
                draft={draft}
                onChange={handleDraftChange}
                onSubmit={handleFormSubmit}
                onClose={() => setFormOpen(false)}
            />

            <DeleteDialog
                open={!!deleteTarget}
                productName={deleteTarget?.name ?? ""}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    );
}