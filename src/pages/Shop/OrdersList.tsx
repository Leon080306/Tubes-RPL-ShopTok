/**
 * GreenMart — Orders Page
 *
 * Drop-in companion to ProductsPage.tsx.
 * Uses the same theme/color tokens as SellerDashboard.tsx.
 *
 * Features:
 *  - Orders table with search + status / date-range filters
 *  - View order drawer  (customer info, line items, timeline)
 *  - Edit order dialog  (update status + tracking number)
 *  - Delete / cancel confirmation dialog
 *  - Summary KPI cards
 *  - Pagination (8 rows / page)
 *
 * Usage (inside SellerDashboard, swap the content area):
 *   import OrdersPage from './OrdersPage';
 *   {activeNav === "orders" && <OrdersPage />}
 */

import { useState, useMemo, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
    Box, Stack, Grid, Typography, Card, CardContent,
    InputBase, IconButton, Chip, Button, Avatar,
    Table, TableHead, TableBody, TableRow, TableCell,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Drawer, Divider, TextField, Select, MenuItem,
    FormControl, Tooltip, Pagination,
} from "@mui/material";
import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useAppSelector } from "../../hooks/useAppSelector";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const PRIMARY = "#003f29" as const;
const ACCENT = "#4ade80" as const;
const BG = "#f0f3f7" as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "Paid" | "Pending" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
type PaymentMethod = "Transfer" | "COD" | "E-Wallet" | "Credit Card";

interface OrderItem {
    name: string;
    emoji: string;
    qty: number;
    price: number; // Rp K
}

interface Order {
    id: string;
    customer: string;
    avatar: string;       // initials
    city: string;
    phone: string;
    date: string;         // ISO date string
    items: OrderItem[];
    total: number;        // Rp K
    status: OrderStatus;
    payment: PaymentMethod;
    tracking: string;
    notes: string;
}

interface EditDraft {
    status: OrderStatus;
    tracking: string;
    notes: string;
}

const EMPTY_DRAFT: EditDraft = { status: "Pending", tracking: "", notes: "" };

const ALL_STATUSES: OrderStatus[] = ["Paid", "Pending", "Shipped", "Delivered", "Cancelled", "Refunded"];

const fmtPrice = (n: number) =>
    `Rp ${n >= 1000 ? `${(n / 1000).toFixed(1)}Jt` : `${n}K`}`;

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });


// ─── Status style map ──────────────────────────────────────────────────────────
const STATUS_SX: Record<OrderStatus, SxProps<Theme>> = {
    Paid: { bgcolor: "#dcfce7", color: "#15803d" },
    Pending: { bgcolor: "#fef9c3", color: "#854d0e" },
    Shipped: { bgcolor: "#dbeafe", color: "#1d4ed8" },
    Delivered: { bgcolor: "#f0fdf4", color: "#166534" },
    Cancelled: { bgcolor: "#fee2e2", color: "#b91c1c" },
    Refunded: { bgcolor: "#f3e8ff", color: "#7e22ce" },
};

// timeline step colours per status
const STATUS_STEPS: Record<OrderStatus, number> = {
    Pending: 1, Paid: 2, Shipped: 3, Delivered: 4, Cancelled: 0, Refunded: 0,
};

// ─── Avatar colour helper ─────────────────────────────────────────────────────
const AVATAR_COLORS = [
    { bg: "#dbeafe", color: "#1d4ed8" },
    { bg: "#dcfce7", color: "#15803d" },
    { bg: "#fef9c3", color: "#854d0e" },
    { bg: "#fce7f3", color: "#9d174d" },
    { bg: "#f3e8ff", color: "#7e22ce" },
    { bg: "#ffedd5", color: "#9a3412" },
];
const avatarColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Sub-components ───────────────────────────────────────────────────────────

// Summary card (reused pattern from ProductsPage)
interface SummaryCardProps {
    icon: React.ReactNode;
    iconBg: string; iconColor: string;
    label: string; value: string | number; sub?: string;
}
function SummaryCard({ icon, iconBg, iconColor, label, value, sub }: SummaryCardProps) {
    return (
        <Card>
            <CardContent sx={{ p: "16px 18px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>{label}</Typography>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13", lineHeight: 1 }}>{value}</Typography>
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

// ─── View Drawer ──────────────────────────────────────────────────────────────
interface ViewDrawerProps {
    order: Order | null;
    onClose: () => void;
    onEdit: (o: Order) => void;
    onDelete: (o: Order) => void;
}

const TIMELINE_LABELS: { step: number; label: string; icon: React.ReactNode }[] = [
    { step: 1, label: "Order Placed", icon: <ReceiptRoundedIcon sx={{ fontSize: 14 }} /> },
    { step: 2, label: "Payment Confirmed", icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> },
    { step: 3, label: "Shipped", icon: <LocalShippingRoundedIcon sx={{ fontSize: 14 }} /> },
    { step: 4, label: "Delivered", icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> },
];

function ViewDrawer({ order, onClose, onEdit, onDelete }: ViewDrawerProps) {
    if (!order) return null;
    const ac = avatarColor(order.customer);
    const reached = STATUS_STEPS[order.status] ?? 0;
    const isFinal = order.status === "Cancelled" || order.status === "Refunded";

    return (
        <Drawer anchor="right" open={!!order} onClose={onClose}
            PaperProps={{ sx: { width: 360, display: "flex", flexDirection: "column" } }}>

            {/* Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e8ecf0", flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13" }}>Order Detail</Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>{order.id}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose}><CloseRoundedIcon fontSize="small" /></IconButton>
                </Stack>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>

                {/* Status + date */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Chip label={order.status} size="small"
                        sx={{ height: 22, fontSize: 11.5, fontWeight: 600, borderRadius: "99px", ...STATUS_SX[order.status] }} />
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(order.date)}</Typography>
                </Stack>

                {/* Customer card */}
                <Box sx={{ p: 1.75, bgcolor: BG, borderRadius: 2.5, mb: 2.5 }}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: ac.bg, color: ac.color, fontSize: 13, fontWeight: 700, borderRadius: 2 }}>
                            {order.avatar}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0d1f13" }}>{order.customer}</Typography>
                            <Typography sx={{ fontSize: 12, color: "#64748b" }}>{order.city} · {order.phone}</Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Order items */}
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, mb: 1 }}>
                    Items
                </Typography>
                <Box sx={{ border: "1px solid #e8ecf0", borderRadius: 2, overflow: "hidden", mb: 2.5 }}>
                    {order.items.map((item, i) => (
                        <Box key={i}>
                            <Stack direction="row" alignItems="center" gap={1.5} px={1.75} py={1.25}>
                                <Box sx={{ width: 34, height: 34, bgcolor: BG, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                                    {item.emoji}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13" }}>{item.name}</Typography>
                                    <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>Qty {item.qty}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13", whiteSpace: "nowrap" }}>
                                    {fmtPrice(item.price * item.qty)}
                                </Typography>
                            </Stack>
                            {i < order.items.length - 1 && <Divider sx={{ borderColor: "#f1f5f9" }} />}
                        </Box>
                    ))}
                    <Divider sx={{ borderColor: "#e8ecf0" }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" px={1.75} py={1.25} sx={{ bgcolor: "#fafafa" }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0d1f13" }}>Total</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: PRIMARY }}>{fmtPrice(order.total)}</Typography>
                    </Stack>
                </Box>

                {/* Meta row */}
                <Grid container spacing={1.5} mb={2.5}>
                    {[
                        { label: "Payment", value: order.payment },
                        { label: "Tracking", value: order.tracking || "—" },
                    ].map((row) => (
                        <Grid size={6} key={row.label}>
                            <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                                <Typography sx={{ fontSize: 11, color: "#94a3b8", mb: 0.3 }}>{row.label}</Typography>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0d1f13", wordBreak: "break-all" }}>{row.value}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Notes */}
                {order.notes && (
                    <Box sx={{ p: 1.5, bgcolor: "#fef9c3", border: "1px solid #fde68a", borderRadius: 2, mb: 2.5 }}>
                        <Typography sx={{ fontSize: 11, color: "#854d0e", fontWeight: 600, mb: 0.3 }}>Note</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#78350f" }}>{order.notes}</Typography>
                    </Box>
                )}

                {/* Timeline */}
                {!isFinal && (
                    <>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                            Order Timeline
                        </Typography>
                        <Stack gap={0} mb={2}>
                            {TIMELINE_LABELS.map((tl, i) => {
                                const done = reached >= tl.step;
                                const current = reached === tl.step;
                                return (
                                    <Stack key={tl.step} direction="row" gap={1.5} alignItems="flex-start">
                                        <Stack alignItems="center" sx={{ flexShrink: 0 }}>
                                            <Box sx={{
                                                width: 28, height: 28, borderRadius: "50%",
                                                bgcolor: done ? PRIMARY : "#f1f5f9",
                                                color: done ? ACCENT : "#cbd5e1",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                border: current ? `2px solid ${ACCENT}` : "none",
                                            }}>
                                                {tl.icon}
                                            </Box>
                                            {i < TIMELINE_LABELS.length - 1 && (
                                                <Box sx={{ width: 2, height: 22, bgcolor: done && reached > tl.step ? PRIMARY : "#e8ecf0", my: 0.25 }} />
                                            )}
                                        </Stack>
                                        <Box sx={{ pt: 0.5, pb: i < TIMELINE_LABELS.length - 1 ? 0 : 0 }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? "#0d1f13" : "#94a3b8" }}>
                                                {tl.label}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </>
                )}

                {isFinal && (
                    <Box sx={{ p: 1.5, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2, mb: 2 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#b91c1c" }}>
                            This order has been {order.status.toLowerCase()}.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e8ecf0", flexShrink: 0 }}>
                <Stack direction="row" gap={1}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<DeleteRoundedIcon fontSize="small" />}
                        onClick={() => onDelete(order)}
                        sx={{ borderColor: "#fecaca", color: "#ef4444", "&:hover": { bgcolor: "#fef2f2", borderColor: "#f87171" }, textTransform: "none", fontWeight: 600 }}>
                        Delete
                    </Button>
                    <Button fullWidth variant="contained" size="small" startIcon={<EditRoundedIcon fontSize="small" />}
                        onClick={() => onEdit(order)}
                        sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" }, textTransform: "none", fontWeight: 600 }}>
                        Edit Order
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────
interface EditDialogProps {
    open: boolean;
    draft: EditDraft;
    orderId: string;
    onChange: (field: keyof EditDraft, value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}
function EditDialog({ open, draft, orderId, onChange, onSubmit, onClose }: EditDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13" }}>Edit Order</Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>{orderId}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose}><CloseRoundedIcon fontSize="small" /></IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2.5 }}>
                <Stack gap={2}>
                    <FormControl fullWidth size="small">
                        <Select
                            value={draft.status}
                            onChange={(e: SelectChangeEvent) => onChange("status", e.target.value)}
                            displayEmpty
                        >
                            {ALL_STATUSES.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Tracking Number"
                        fullWidth size="small"
                        value={draft.tracking}
                        onChange={(e) => onChange("tracking", e.target.value)}
                        placeholder="e.g. JNE-881234"
                    />

                    <TextField
                        label="Notes"
                        fullWidth size="small" multiline rows={2}
                        value={draft.notes}
                        onChange={(e) => onChange("notes", e.target.value)}
                    />
                </Stack>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" size="small"
                    sx={{ borderColor: "#e2e8f0", color: "#64748b", "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} variant="contained" size="small"
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" }, textTransform: "none", fontWeight: 600 }}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
interface DeleteDialogProps {
    open: boolean;
    orderId: string;
    onConfirm: () => void;
    onClose: () => void;
}
function DeleteDialog({ open, orderId, onConfirm, onClose }: DeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13" }}>Delete Order</Typography>
                    <IconButton size="small" onClick={onClose}><CloseRoundedIcon fontSize="small" /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ fontSize: 13.5, color: "#334155" }}>
                    Are you sure you want to permanently delete order{" "}
                    <Box component="span" sx={{ fontWeight: 700 }}>{orderId}</Box>?
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

// ─── Main Orders Page ──────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export default function OrdersPage() {
     const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;
    const shopId = userInfo?.shop_info?.shop_id ?? '';

    // ganti useState(SEED_ORDERS) → useState([])
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState<OrderStatus | "All">("All");
    const [page, setPage] = useState(1);

    const [viewOrder, setViewOrder] = useState<Order | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<string>("");
    const [draft, setDraft] = useState<EditDraft>(EMPTY_DRAFT);
    const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

    // ================= FETCH SHOP ORDERS =================
    useEffect(() => {
        if (!shopId || !user_id) return;
        const getOrders = async () => {
            try {
                const backendStatus =
                    statusFilter === "All" ? "all"
                    : statusFilter === "Pending" ? "pending"
                    : statusFilter === "Delivered" ? "completed"
                    : statusFilter === "Cancelled" ? "cancelled"
                    : "all";

                const params = backendStatus !== 'all'
                    ? `?seller_id=${user_id}&status=${backendStatus}`
                    : `?seller_id=${user_id}`;

                const res = await fetch(`/api/order/shop/${shopId}${params}`);
                const data = await res.json();

                const mapped: Order[] = data.data.map((o: any) => ({
                    id: o.order_id,
                    customer: `${o.customer?.first_name ?? ''} ${o.customer?.last_name ?? ''}`.trim() || 'Customer',
                    avatar: [
                        o.customer?.first_name?.[0] ?? 'C',
                        o.customer?.last_name?.[0] ?? ''
                    ].join('').toUpperCase(),
                    city: o.address?.city ?? '—',
                    phone: o.customer?.phone_number ?? '—',
                    date: o.createdAt ?? '',
                    items: o.orderItems.map((item: any) => ({
                        name: item.variant.product.name,
                        emoji: '📦',
                        qty: item.quantity,
                        price: Number(item.variant.price),
                    })),
                    total: o.amount_paid,
                    status: (
                        o.status === 'completed' ? 'Delivered'
                        : o.status === 'cancelled' ? 'Cancelled'
                        : 'Pending'
                    ) as OrderStatus,
                    payment: '—' as PaymentMethod,
                    tracking: '',
                    notes: '',
                }));

                setOrders(mapped);
            } catch (error) {
                console.error(error);
            }
        };
        getOrders();
    }, [shopId, statusFilter, user_id]);

    // ================= UPDATE STATUS =================
    const handleEditSubmit = async () => {
        const backendStatus =
            draft.status === 'Delivered' ? 'completed'
            : draft.status === 'Cancelled' ? 'cancelled'
            : 'pending';

        try {
            await fetch(`/api/order/status/${editingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: backendStatus, seller_id: user_id }),
            });
            // update state lokal
            setOrders(prev => prev.map(o =>
                o.id === editingId
                    ? { ...o, status: draft.status, tracking: draft.tracking, notes: draft.notes }
                    : o
            ));
        } catch (error) {
            console.error(error);
        }
        setEditOpen(false);
    };

    // ================= CANCEL/DELETE =================
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await fetch(`/api/order/cancel/${deleteTarget.id}?customer_id=${user_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: 'cancelled', seller_id: user_id }),
            });
            // tandai cancelled di state lokal
            setOrders(prev => prev.map(o =>
                o.id === deleteTarget.id ? { ...o, status: 'Cancelled' } : o
            ));
        } catch (error) {
            console.error(error);
        }
        setDeleteTarget(null);
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return orders.filter((o) => {
            const matchQ = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
            const matchSt = statusFilter === "All" || o.status === statusFilter;
            return matchQ && matchSt;
        });
    }, [orders, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const pendingCount = orders.filter((o) => o.status === "Pending").length;
    const shippedCount = orders.filter((o) => o.status === "Shipped").length;
    const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

    // ── Handlers ───────────────────────────────────────────────────────────────
    const openEdit = (o: Order) => {
        setDraft({ status: o.status, tracking: o.tracking, notes: o.notes });
        setEditingId(o.id);
        setViewOrder(null);
        setEditOpen(true);
    };

    const handleDraftChange = (field: keyof EditDraft, value: string) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
    };

    const openDelete = (o: Order) => {
        setViewOrder(null);
        setDeleteTarget(o);
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
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13" }}>Orders</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>
                        Manage and track all customer orders
                    </Typography>
                </Box>
            </Stack>

            {/* Summary cards */}
            <Grid container spacing={1.75} mb={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<ShoppingBagRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#dcfce7" iconColor="#16a34a"
                        label="Total Orders" value={orders.length}
                        sub={`${deliveredCount} delivered`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<AttachMoneyRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#dbeafe" iconColor="#1d4ed8"
                        label="Total Revenue" value={fmtPrice(totalRevenue)}
                        sub="all orders"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<HourglassTopRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#fef9c3" iconColor="#854d0e"
                        label="Pending" value={pendingCount}
                        sub="awaiting action"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<LocalShippingRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#f3e8ff" iconColor="#7e22ce"
                        label="In Transit" value={shippedCount}
                        sub="currently shipping"
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
                                    placeholder="Search by order ID or customer…"
                                    sx={{ fontSize: 13, flex: 1 }}
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </Box>

                            {/* Status filter */}
                            <Stack direction="row" gap={1} alignItems="center">
                                <FilterListRoundedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e: SelectChangeEvent) => {
                                            setStatus(e.target.value as OrderStatus | "All");
                                            setPage(1);
                                        }}
                                        displayEmpty
                                        sx={{ fontSize: 12.5, borderRadius: 1.5, bgcolor: "#fff" }}
                                    >
                                        <MenuItem value="All">All Statuses</MenuItem>
                                        {ALL_STATUSES.map((s) => (
                                            <MenuItem key={s} value={s} sx={{ fontSize: 12.5 }}>{s}</MenuItem>
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
                                {["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h) => (
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
                                        No orders match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((o) => {
                                    const ac = avatarColor(o.customer);
                                    return (
                                        <TableRow key={o.id}
                                            sx={{
                                                "&:hover td": { bgcolor: "#f8fafc" },
                                                "&:last-child td": { border: 0 },
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setViewOrder(o)}
                                        >
                                            {/* Order ID */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 1.4 }}>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: PRIMARY, fontFamily: "monospace" }}>
                                                    {o.id}
                                                </Typography>
                                            </TableCell>

                                            {/* Customer */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                                                <Stack direction="row" alignItems="center" gap={1.25}>
                                                    <Avatar sx={{ width: 30, height: 30, bgcolor: ac.bg, color: ac.color, fontSize: 11, fontWeight: 700, borderRadius: 1.5 }}>
                                                        {o.avatar}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13", whiteSpace: "nowrap" }}>
                                                            {o.customer}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{o.city}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell sx={{ fontSize: 12.5, color: "#64748b", borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap" }}>
                                                {fmtDate(o.date)}
                                            </TableCell>

                                            {/* Items preview */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                                                <Stack direction="row" alignItems="center" gap={0.5}>
                                                    <Box sx={{ fontSize: 16, lineHeight: 1 }}>{o.items[0].emoji}</Box>
                                                    {o.items.length > 1 && (
                                                        <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                                                            +{o.items.length - 1}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>

                                            {/* Total */}
                                            <TableCell sx={{ fontSize: 13, fontWeight: 700, color: "#0d1f13", borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap" }}>
                                                {fmtPrice(o.total)}
                                            </TableCell>

                                            {/* Payment */}
                                            <TableCell sx={{ fontSize: 12.5, color: "#475569", borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap" }}>
                                                {o.payment}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                                                <Chip label={o.status} size="small"
                                                    sx={{ height: 21, fontSize: 11, fontWeight: 600, borderRadius: "99px", ...STATUS_SX[o.status] }} />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}
                                                onClick={(e) => e.stopPropagation()}>
                                                <Stack direction="row" gap={0.25}>
                                                    <Tooltip title="View" placement="top">
                                                        <IconButton size="small" onClick={() => setViewOrder(o)}
                                                            sx={{ color: "#94a3b8", "&:hover": { color: PRIMARY, bgcolor: "#f0fdf4" } }}>
                                                            <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit" placement="top">
                                                        <IconButton size="small" onClick={() => openEdit(o)}
                                                            sx={{ color: "#94a3b8", "&:hover": { color: "#1d4ed8", bgcolor: "#eff6ff" } }}>
                                                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" placement="top">
                                                        <IconButton size="small" onClick={() => openDelete(o)}
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
                order={viewOrder}
                onClose={() => setViewOrder(null)}
                onEdit={openEdit}
                onDelete={openDelete}
            />

            <EditDialog
                open={editOpen}
                draft={draft}
                orderId={editingId}
                onChange={handleDraftChange}
                onSubmit={handleEditSubmit}
                onClose={() => setEditOpen(false)}
            />

            <DeleteDialog
                open={!!deleteTarget}
                orderId={deleteTarget?.id ?? ""}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    );
}