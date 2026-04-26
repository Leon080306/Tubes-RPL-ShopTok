import { useState, useMemo, useEffect, useCallback } from "react";
import type { ReactNode, ChangeEvent } from "react";
import {
    Box, Stack, Grid, Typography, Card, CardContent,
    IconButton, Chip, Button, Avatar, InputBase,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Drawer, Divider, Table, TableHead, TableBody, TableRow, TableCell,
    Select, MenuItem, FormControl, Tooltip, Pagination,
    CircularProgress, Alert,
} from "@mui/material";
import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { useAppSelector } from "../../hooks/useAppSelector";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const PRIMARY = "#003f29" as const;
const ACCENT = "#4ade80" as const;
const BG = "#f0f3f7" as const;

// ─── Types ────────────────────────────────────────────────────────────────────
// Backend only has 3 statuses
type OrderStatus = "pending" | "completed" | "cancelled";
type StatusFilter = OrderStatus | "all";

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "completed", "cancelled"];

interface OrderItem {
    name: string;
    variantName: string;
    picture: string | null;
    qty: number;
    price: number;
}

interface Order {
    id: string;
    customer: string;
    avatar: string;
    city: string;
    phone: string;
    email: string;
    date: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    shopName: string;
}

interface EditDraft {
    status: OrderStatus;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (n: number) => {
    if (n === 0) return "Rp 0";
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
    return `Rp ${n}`;
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });

const STATUS_SX: Record<OrderStatus, SxProps<Theme>> = {
    pending: { bgcolor: "#fef9c3", color: "#854d0e" },
    completed: { bgcolor: "#dcfce7", color: "#15803d" },
    cancelled: { bgcolor: "#fee2e2", color: "#b91c1c" },
};

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

// ─── Backend response types ──────────────────────────────────────────────────
interface BackendProduct {
    product_id: string;
    name: string;
    shop_id: string;
}

interface BackendVariant {
    variant_id: string;
    name: string;
    picture: string | null;
    price: number | string;
    stock: number;
    product: BackendProduct;
}

interface BackendOrderItem {
    order_id: string;
    variant_id: string;
    quantity: number;
    variant: BackendVariant;
}

interface BackendAddress {
    address_id: string;
    city?: string;
    province?: string;
    street?: string;
}

interface BackendCustomer {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_pic: string | null;
}

interface BackendShop {
    shop_id: string;
    name: string;
    profile_pic: string | null;
}

interface BackendOrder {
    order_id: string;
    customer_id: string;
    shop_id: string;
    address_id: string;
    status: OrderStatus;
    amount_paid: number | string;
    createdAt: string;
    orderItems: BackendOrderItem[];
    address: BackendAddress | null;
    customer: BackendCustomer | null;
    shop?: BackendShop | null;
}

// ─── Adapt backend order → UI order ──────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptOrder(o: BackendOrder): Order {
    const firstName = o.customer?.first_name ?? "";
    const lastName = o.customer?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || "Customer";

    return {
        id: o.order_id,
        customer: fullName,
        avatar: [firstName[0] ?? "C", lastName[0] ?? ""].join("").toUpperCase(),
        city: o.address?.city ?? "—",
        phone: o.customer?.phone_number ?? "—",
        email: o.customer?.email ?? "—",
        date: o.createdAt ?? "",
        items: (o.orderItems ?? []).map((item: BackendOrderItem) => ({
            name: item.variant?.product?.name ?? "Unknown",
            variantName: item.variant?.name ?? "",
            picture: item.variant?.picture ?? null,
            qty: item.quantity,
            price: Number(item.variant?.price ?? 0),
        })),
        total: Number(o.amount_paid ?? 0),
        status: o.status,
        shopName: o.shop?.name ?? "",
    };
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
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

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE_LABELS = [
    { step: 1, label: "Order Placed", icon: <ReceiptRoundedIcon sx={{ fontSize: 14 }} /> },
    { step: 2, label: "Completed", icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> },
];

// ─── View Drawer ──────────────────────────────────────────────────────────────
interface ViewDrawerProps {
    order: Order | null;
    onClose: () => void;
    onEdit: (o: Order) => void;
    onCancel: (o: Order) => void;
}
function ViewDrawer({ order, onClose, onEdit, onCancel }: ViewDrawerProps) {
    if (!order) return null;
    const ac = avatarColor(order.customer);
    const isCancelled = order.status === "cancelled";
    const isCompleted = order.status === "completed";

    const reached = isCancelled ? 0 : isCompleted ? 2 : 1;

    return (
        <Drawer
            anchor="right"
            open={!!order}
            onClose={onClose}
            PaperProps={{ sx: { width: 380, display: "flex", flexDirection: "column" } }}
        >
            {/* Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e8ecf0", flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13" }}>
                            Order Detail
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#94a3b8", mt: 0.2, fontFamily: "monospace" }}>
                            #{order.id.slice(0, 8)}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose}>
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
                {/* Status + date */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Chip
                        label={STATUS_LABELS[order.status]}
                        size="small"
                        sx={{
                            height: 22, fontSize: 11.5, fontWeight: 600,
                            borderRadius: "99px", ...STATUS_SX[order.status],
                        }}
                    />
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(order.date)}</Typography>
                </Stack>

                {/* Customer card */}
                <Box sx={{ p: 1.75, bgcolor: BG, borderRadius: 2.5, mb: 2.5 }}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar
                            sx={{
                                width: 40, height: 40, bgcolor: ac.bg, color: ac.color,
                                fontSize: 13, fontWeight: 700, borderRadius: 2,
                            }}
                        >
                            {order.avatar}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0d1f13" }}>
                                {order.customer}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                                {order.city} · {order.phone}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Order items */}
                <Typography
                    sx={{
                        fontSize: 12, fontWeight: 600, color: "#94a3b8",
                        textTransform: "uppercase", letterSpacing: 0.5, mb: 1,
                    }}
                >
                    Items ({order.items.length})
                </Typography>
                <Box sx={{ border: "1px solid #e8ecf0", borderRadius: 2, overflow: "hidden", mb: 2.5 }}>
                    {order.items.map((item, i) => (
                        <Box key={i}>
                            <Stack direction="row" alignItems="center" gap={1.5} px={1.75} py={1.25}>
                                <Box
                                    sx={{
                                        width: 36, height: 36, borderRadius: 1.5, overflow: "hidden",
                                        bgcolor: BG, display: "flex", alignItems: "center",
                                        justifyContent: "center", flexShrink: 0,
                                    }}
                                >
                                    {item.picture ? (
                                        <Box
                                            component="img"
                                            src={item.picture ? `/api/${item.picture}` : "/placeholder.png"}
                                            alt={item.name}
                                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <Typography sx={{ fontSize: 18 }}>📦</Typography>
                                    )}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 13, fontWeight: 600, color: "#0d1f13",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                                        {item.variantName} · Qty {item.qty}
                                    </Typography>
                                </Box>
                                <Typography
                                    sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13", whiteSpace: "nowrap" }}
                                >
                                    {fmtPrice(item.price * item.qty)}
                                </Typography>
                            </Stack>
                            {i < order.items.length - 1 && <Divider sx={{ borderColor: "#f1f5f9" }} />}
                        </Box>
                    ))}
                    <Divider sx={{ borderColor: "#e8ecf0" }} />
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        px={1.75}
                        py={1.25}
                        sx={{ bgcolor: "#fafafa" }}
                    >
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0d1f13" }}>Total</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: PRIMARY }}>
                            {fmtPrice(order.total)}
                        </Typography>
                    </Stack>
                </Box>

                {/* Timeline */}
                {!isCancelled && (
                    <>
                        <Typography
                            sx={{
                                fontSize: 12, fontWeight: 600, color: "#94a3b8",
                                textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5,
                            }}
                        >
                            Order Timeline
                        </Typography>
                        <Stack gap={0} mb={2}>
                            {TIMELINE_LABELS.map((tl, i) => {
                                const done = reached >= tl.step;
                                const current = reached === tl.step;
                                return (
                                    <Stack key={tl.step} direction="row" gap={1.5} alignItems="flex-start">
                                        <Stack alignItems="center" sx={{ flexShrink: 0 }}>
                                            <Box
                                                sx={{
                                                    width: 28, height: 28, borderRadius: "50%",
                                                    bgcolor: done ? PRIMARY : "#f1f5f9",
                                                    color: done ? ACCENT : "#cbd5e1",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    border: current ? `2px solid ${ACCENT}` : "none",
                                                }}
                                            >
                                                {tl.icon}
                                            </Box>
                                            {i < TIMELINE_LABELS.length - 1 && (
                                                <Box
                                                    sx={{
                                                        width: 2, height: 22,
                                                        bgcolor: done && reached > tl.step ? PRIMARY : "#e8ecf0",
                                                        my: 0.25,
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                        <Box sx={{ pt: 0.5 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: 13,
                                                    fontWeight: done ? 600 : 400,
                                                    color: done ? "#0d1f13" : "#94a3b8",
                                                }}
                                            >
                                                {tl.label}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </>
                )}

                {isCancelled && (
                    <Box
                        sx={{
                            p: 1.5, bgcolor: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: 2, mb: 2,
                        }}
                    >
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#b91c1c" }}>
                            This order has been cancelled.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e8ecf0", flexShrink: 0 }}>
                <Stack direction="row" gap={1}>
                    {order.status === "pending" && (
                        <>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<DeleteRoundedIcon fontSize="small" />}
                                onClick={() => onCancel(order)}
                                sx={{
                                    borderColor: "#fecaca", color: "#ef4444",
                                    "&:hover": { bgcolor: "#fef2f2", borderColor: "#f87171" },
                                    textTransform: "none", fontWeight: 600,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                startIcon={<EditRoundedIcon fontSize="small" />}
                                onClick={() => onEdit(order)}
                                sx={{
                                    bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" },
                                    textTransform: "none", fontWeight: 600,
                                }}
                            >
                                Update Status
                            </Button>
                        </>
                    )}
                    {order.status !== "pending" && (
                        <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            onClick={onClose}
                            sx={{
                                borderColor: "#e2e8f0", color: "#64748b",
                                "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                                textTransform: "none", fontWeight: 600,
                            }}
                        >
                            Close
                        </Button>
                    )}
                </Stack>
            </Box>
        </Drawer>
    );
}

// ─── Edit Status Dialog ──────────────────────────────────────────────────────
interface EditDialogProps {
    open: boolean;
    draft: EditDraft;
    orderId: string;
    loading: boolean;
    onChange: (status: OrderStatus) => void;
    onSubmit: () => void;
    onClose: () => void;
}
function EditDialog({ open, draft, orderId, loading, onChange, onSubmit, onClose }: EditDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d1f13" }}>
                            Update Order Status
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
                            #{orderId.slice(0, 8)}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} disabled={loading}>
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2.5 }}>
                <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1.5 }}>
                    Select the new status for this order:
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={draft.status}
                        onChange={(e: SelectChangeEvent) => onChange(e.target.value as OrderStatus)}
                        sx={{ borderRadius: 2 }}
                    >
                        {ALL_STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Box
                                        sx={{
                                            width: 8, height: 8, borderRadius: "50%",
                                            bgcolor: s === "pending" ? "#f59e0b"
                                                : s === "completed" ? "#16a34a"
                                                    : "#ef4444",
                                        }}
                                    />
                                    {STATUS_LABELS[s]}
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        flex: 1, textTransform: "none", fontWeight: 600, borderRadius: 2,
                        color: "#475569", fontSize: 13, border: "1px solid #e2e8f0",
                        "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        flex: 1, textTransform: "none", fontWeight: 600, borderRadius: 2, fontSize: 13,
                        bgcolor: PRIMARY, "&:hover": { bgcolor: "#00502f" },
                        "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                    }}
                >
                    {loading ? (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <CircularProgress size={16} sx={{ color: "#fff" }} />
                            Saving…
                        </Stack>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Cancel Confirmation Dialog ──────────────────────────────────────────────
interface CancelDialogProps {
    open: boolean;
    order: Order | null;
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}
function CancelDialog({ open, order, loading, onConfirm, onClose }: CancelDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: "12px",
                            bgcolor: "#fee2e2", color: "#dc2626",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <ErrorOutlineRoundedIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#0d1f13" }}>
                            Cancel Order
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                            Stock will be restored automatically
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
                {order && (
                    <Box
                        sx={{
                            p: 1.5, bgcolor: "#fef2f2", borderRadius: 2,
                            border: "1px solid #fecaca", mb: 2,
                        }}
                    >
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.3 }}>Order</Typography>
                        <Typography
                            sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13", fontFamily: "monospace" }}
                        >
                            #{order.id.slice(0, 8)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5 }}>
                            {order.customer} · {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {fmtPrice(order.total)}
                        </Typography>
                    </Box>
                )}
                <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                    Are you sure you want to cancel this order? The customer will be notified
                    and product stock will be restored.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        flex: 1, textTransform: "none", fontWeight: 600, borderRadius: 2,
                        color: "#475569", fontSize: 13, border: "1px solid #e2e8f0",
                        "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                    }}
                >
                    Keep Order
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        flex: 1, textTransform: "none", fontWeight: 600, borderRadius: 2, fontSize: 13,
                        bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" },
                        "&.Mui-disabled": { bgcolor: "#fca5a5", color: "#fff" },
                    }}
                >
                    {loading ? (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <CircularProgress size={16} sx={{ color: "#fff" }} />
                            Cancelling…
                        </Stack>
                    ) : (
                        "Cancel Order"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrdersList() {
    const { userInfo } = useAppSelector((state) => state.auth);
    const userId = userInfo?.user_id ?? "";
    const shopId = userInfo?.shop_info?.shop_id ?? "";

    // Data
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [page, setPage] = useState(1);

    // View drawer
    const [viewOrder, setViewOrder] = useState<Order | null>(null);

    // Edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editDraft, setEditDraft] = useState<EditDraft>({ status: "pending" });
    const [editLoading, setEditLoading] = useState(false);

    // Cancel dialog
    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    // Alerts
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // ── Fetch orders ───────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        if (!shopId || !userId) return;

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({ seller_id: userId });
            if (statusFilter !== "all") {
                params.set("status", statusFilter);
            }

            const res = await fetch(`/api/orders/shop/${shopId}?${params}`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            const mapped = (data.data ?? []).map(adaptOrder);
            setOrders(mapped);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [shopId, userId, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // ── Update status ──────────────────────────────────────────────────────────
    const openEdit = (o: Order) => {
        setViewOrder(null);
        setEditingOrder(o);
        setEditDraft({ status: o.status });
        setEditOpen(true);
        setActionError(null);
    };

    const handleEditSubmit = async () => {
        if (!editingOrder) return;

        try {
            setEditLoading(true);
            setActionError(null);

            const res = await fetch(`/api/orders/status/${editingOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: editDraft.status,
                    seller_id: userId,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update status");
            }

            // Update local state
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === editingOrder.id ? { ...o, status: editDraft.status } : o
                )
            );

            setSuccessMsg(`Order #${editingOrder.id.slice(0, 8)} updated to ${STATUS_LABELS[editDraft.status]}`);
            setTimeout(() => setSuccessMsg(null), 4000);

            setEditOpen(false);
            setEditingOrder(null);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setEditLoading(false);
        }
    };

    // ── Cancel order ───────────────────────────────────────────────────────────
    const openCancel = (o: Order) => {
        setViewOrder(null);
        setCancelTarget(o);
        setActionError(null);
    };

    const handleCancel = async () => {
        if (!cancelTarget) return;

        try {
            setCancelLoading(true);
            setActionError(null);

            const res = await fetch(
                `/api/orders/status/${cancelTarget.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "cancelled",
                        seller_id: userId,
                    }),
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to cancel order");
            }

            // Update local state
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === cancelTarget.id ? { ...o, status: "cancelled" as OrderStatus } : o
                )
            );

            setSuccessMsg(`Order #${cancelTarget.id.slice(0, 8)} has been cancelled`);
            setTimeout(() => setSuccessMsg(null), 4000);

            setCancelTarget(null);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to cancel");
        } finally {
            setCancelLoading(false);
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return orders.filter((o) => {
            const matchQ =
                !q ||
                o.id.toLowerCase().includes(q) ||
                o.customer.toLowerCase().includes(q);
            return matchQ;
        });
    }, [orders, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const completedCount = orders.filter((o) => o.status === "completed").length;
    const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

    // ── Loading / Error ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                <Stack alignItems="center" gap={1.5}>
                    <CircularProgress size={32} sx={{ color: PRIMARY }} />
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>Loading orders…</Typography>
                </Stack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    Failed to load orders: {error}
                </Alert>
            </Box>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ flex: 1, overflowY: "auto", bgcolor: BG }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13" }}>Orders</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>
                        Manage and track all customer orders
                    </Typography>
                </Box>
            </Stack>

            {/* Alerts */}
            {successMsg && (
                <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 2, borderRadius: 2 }}>
                    {successMsg}
                </Alert>
            )}
            {actionError && !editOpen && !cancelTarget && (
                <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2, borderRadius: 2 }}>
                    {actionError}
                </Alert>
            )}

            {/* Summary cards */}
            <Grid container spacing={1.75} mb={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        icon={<ShoppingBagRoundedIcon sx={{ fontSize: 18 }} />}
                        iconBg="#dcfce7" iconColor="#16a34a"
                        label="Total Orders" value={orders.length}
                        sub={`${completedCount} completed`}
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
                        iconBg="#fee2e2" iconColor="#b91c1c"
                        label="Cancelled" value={cancelledCount}
                        sub="cancelled orders"
                    />
                </Grid>
            </Grid>

            {/* Table Card */}
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
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </Box>

                            {/* Status filter */}
                            <Stack direction="row" gap={1} alignItems="center">
                                <FilterListRoundedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e: SelectChangeEvent) => {
                                            setStatusFilter(e.target.value as StatusFilter);
                                            setPage(1);
                                        }}
                                        sx={{ fontSize: 12.5, borderRadius: 1.5, bgcolor: "#fff" }}
                                    >
                                        <MenuItem value="all" sx={{ fontSize: 12.5 }}>All Statuses</MenuItem>
                                        {ALL_STATUSES.map((s) => (
                                            <MenuItem key={s} value={s} sx={{ fontSize: 12.5 }}>
                                                {STATUS_LABELS[s]}
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
                                {["Order ID", "Customer", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
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
                                        colSpan={7}
                                        sx={{ textAlign: "center", py: 5, color: "#94a3b8", fontSize: 13 }}
                                    >
                                        No orders match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((o) => {
                                    const ac = avatarColor(o.customer);
                                    return (
                                        <TableRow
                                            key={o.id}
                                            sx={{
                                                "&:hover td": { bgcolor: "#f8fafc" },
                                                "&:last-child td": { border: 0 },
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setViewOrder(o)}
                                        >
                                            {/* Order ID */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 1.4 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 12.5, fontWeight: 700, color: PRIMARY,
                                                        fontFamily: "monospace",
                                                    }}
                                                >
                                                    #{o.id.slice(0, 8)}
                                                </Typography>
                                            </TableCell>

                                            {/* Customer */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                                                <Stack direction="row" alignItems="center" gap={1.25}>
                                                    <Avatar
                                                        sx={{
                                                            width: 30, height: 30,
                                                            bgcolor: ac.bg, color: ac.color,
                                                            fontSize: 11, fontWeight: 700, borderRadius: 1.5,
                                                        }}
                                                    >
                                                        {o.avatar}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontSize: 13, fontWeight: 600, color: "#0d1f13",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {o.customer}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                                                            {o.city}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell
                                                sx={{
                                                    fontSize: 12.5, color: "#64748b",
                                                    borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap",
                                                }}
                                            >
                                                {fmtDate(o.date)}
                                            </TableCell>

                                            {/* Items preview */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                                                <Stack direction="row" alignItems="center" gap={0.5}>
                                                    {o.items[0]?.picture ? (
                                                        <Box
                                                            component="img"
                                                            src={o.items[0].picture ? `/api/${o.items[0].picture}` : "/placeholder.png"}
                                                            alt=""
                                                            sx={{
                                                                width: 24, height: 24, borderRadius: 0.75,
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box sx={{ fontSize: 16, lineHeight: 1 }}>📦</Box>
                                                    )}
                                                    {o.items.length > 1 && (
                                                        <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                                                            +{o.items.length - 1}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>

                                            {/* Total */}
                                            <TableCell
                                                sx={{
                                                    fontSize: 13, fontWeight: 700, color: "#0d1f13",
                                                    borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap",
                                                }}
                                            >
                                                {fmtPrice(o.total)}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell sx={{ borderBottom: "1px solid #f8fafc" }}>
                                                <Chip
                                                    label={STATUS_LABELS[o.status]}
                                                    size="small"
                                                    sx={{
                                                        height: 21, fontSize: 11, fontWeight: 600,
                                                        borderRadius: "99px", ...STATUS_SX[o.status],
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell
                                                sx={{ borderBottom: "1px solid #f8fafc" }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Stack direction="row" gap={0.25}>
                                                    <Tooltip title="View" placement="top">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setViewOrder(o)}
                                                            sx={{
                                                                color: "#94a3b8",
                                                                "&:hover": { color: PRIMARY, bgcolor: "#f0fdf4" },
                                                            }}
                                                        >
                                                            <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {o.status === "pending" && (
                                                        <>
                                                            <Tooltip title="Update Status" placement="top">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => openEdit(o)}
                                                                    sx={{
                                                                        color: "#94a3b8",
                                                                        "&:hover": { color: "#1d4ed8", bgcolor: "#eff6ff" },
                                                                    }}
                                                                >
                                                                    <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel Order" placement="top">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => openCancel(o)}
                                                                    sx={{
                                                                        color: "#94a3b8",
                                                                        "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                                                                    }}
                                                                >
                                                                    <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
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

            {/* ── Overlays ─────────────────────────────────────────────────────── */}
            <ViewDrawer
                order={viewOrder}
                onClose={() => setViewOrder(null)}
                onEdit={openEdit}
                onCancel={openCancel}
            />

            <EditDialog
                open={editOpen}
                draft={editDraft}
                orderId={editingOrder?.id ?? ""}
                loading={editLoading}
                onChange={(status) => setEditDraft({ status })}
                onSubmit={handleEditSubmit}
                onClose={() => {
                    if (!editLoading) {
                        setEditOpen(false);
                        setEditingOrder(null);
                    }
                }}
            />

            <CancelDialog
                open={!!cancelTarget}
                order={cancelTarget}
                loading={cancelLoading}
                onConfirm={handleCancel}
                onClose={() => {
                    if (!cancelLoading) setCancelTarget(null);
                }}
            />
        </Box>
    );
}