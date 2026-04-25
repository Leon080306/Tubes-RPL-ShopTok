/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, LinearProgress, Divider, Stack, Grid, CircularProgress, Alert
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell,
} from "recharts";
import ProductsList from "./ProductsList";
import OrdersList from "./OrdersList";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/useAppSelector";
import React from "react";

// ─── Brand colors ─────────────────────────────────────────────────────────────
const PRIMARY = "#003f29" as const;
const PRIMARY_LIGHT = "#00613f" as const;
const ACCENT = "#4ade80" as const;
const BG = "#f0f3f7" as const;

// ─── MUI Theme ────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: PRIMARY, light: PRIMARY_LIGHT, contrastText: "#fff" },
    background: { default: BG, paper: "#ffffff" },
  },
  typography: { fontFamily: '"DM Sans", "Inter", "Segoe UI", sans-serif' },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: { root: { boxShadow: "none", border: "1px solid #e8ecf0" } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, marginBottom: 2, color: "rgba(255,255,255,0.62)",
          "&:hover": { background: "rgba(255,255,255,0.08)", color: "#fff" },
          "&.Mui-selected": {
            background: "rgba(74,222,128,0.15)", color: ACCENT,
            "&:hover": { background: "rgba(74,222,128,0.2)" },
          },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 34, color: "inherit" } } },
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
type NavId = "dashboard" | "orders" | "products" | "messages";
type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";
type ChartTab = "7D" | "30D" | "3M";

interface NavItem { id: NavId; label: string; icon: ReactNode; badge?: number; }
interface NavSection { label: string; items: NavItem[]; }

interface ShopInfo {
  shop_id: string;
  name: string;
  profile_pic: string | null;
  owner_id: string;
}

interface ShopStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  statusBreakdown: Record<string, number>;
}

interface RevenuePoint { date: string; revenue: number; orders: number; }
interface TopProduct {
  product_id: string;
  name: string;
  picture: string | null;
  totalRevenue: number;
  totalUnits: number;
  pct: number;
}
interface RecentOrder {
  order_id: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 224;

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <DashboardRoundedIcon fontSize="small" /> },
      { id: "orders", label: "Orders", icon: <ShoppingBagRoundedIcon fontSize="small" /> },
      { id: "products", label: "Products", icon: <InventoryRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Store",
    items: [
      { id: "messages", label: "Messages", icon: <ChatBubbleRoundedIcon fontSize="small" /> },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  paid: "#003f29", shipped: "#1d4ed8", pending: "#854d0e", cancelled: "#b91c1c",
};

const STATUS_CHIP_SX: Record<string, SxProps<Theme>> = {
  paid: { bgcolor: "#dcfce7", color: "#15803d" },
  shipped: { bgcolor: "#dbeafe", color: "#1d4ed8" },
  pending: { bgcolor: "#fef9c3", color: "#854d0e" },
  cancelled: { bgcolor: "#fee2e2", color: "#b91c1c" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (n: number) => {
  if (n === 0) return "—";
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return `Rp ${n}`;
};

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  active: NavId;
  onSelect: (id: NavId) => void;
  shop: ShopInfo | null;
}
function Sidebar({ active, onSelect, shop }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH, boxSizing: "border-box",
          background: PRIMARY, borderRight: "none",
          display: "flex", flexDirection: "column",
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT }} />
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>
            {shop?.name ?? "GreenMart"}
          </Typography>
        </Stack>
        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 11, mt: 0.3 }}>
          Seller Dashboard
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.label} sx={{ mb: 1 }}>
            <Typography sx={{
              color: "rgba(255,255,255,0.32)", fontSize: 10, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase", px: 1, py: 1,
            }}>
              {section.label}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton selected={active === item.id} onClick={() => onSelect(item.id)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 13.5, fontWeight: active === item.id ? 600 : 400 }}
                    />
                    {item.badge !== undefined && (
                      <Chip label={item.badge} size="small" sx={{
                        height: 18, fontSize: 10, bgcolor: "#ef4444",
                        color: "#fff", "& .MuiChip-label": { px: 0.75 },
                      }} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 1.5, pb: 2, borderTop: "1px solid rgba(255,255,255,0.08)", pt: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={1.25} sx={{
          px: 1, py: 0.75, borderRadius: 2, cursor: "pointer",
          "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
        }}>
          <Avatar
            src={shop?.profile_pic ?? undefined}
            sx={{ width: 34, height: 34, bgcolor: ACCENT, color: PRIMARY, fontSize: 13, fontWeight: 700 }}
          >
            {shop ? initials(shop.name) : "?"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {shop?.name ?? "—"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Store Owner</Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon sx={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }} />
        </Stack>
      </Box>
    </Drawer>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string; icon: ReactNode;
  iconBg: string; iconColor: string;
  change?: string; up?: boolean; sub?: string;
}
function StatCard({ label, value, icon, iconBg, iconColor, change, up, sub }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: "18px 20px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box>
            <Typography sx={{ fontSize: 12.5, color: "#64748b", mb: 0.5 }}>{label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0d1f13", lineHeight: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{
            width: 40, height: 40, borderRadius: "10px",
            bgcolor: iconBg, color: iconColor,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {icon}
          </Box>
        </Stack>
        {change !== undefined && (
          <Stack direction="row" alignItems="center" gap={0.4}>
            {up
              ? <ArrowUpwardRoundedIcon sx={{ fontSize: 13, color: "#16a34a" }} />
              : <ArrowDownwardRoundedIcon sx={{ fontSize: 13, color: "#ef4444" }} />
            }
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: up ? "#16a34a" : "#ef4444" }}>
              {change}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>{sub}</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ─── RevenueChart ─────────────────────────────────────────────────────────────
interface RevenueChartProps { shopId: string; }
function RevenueChart({ shopId }: RevenueChartProps) {
  const [tab, setTab] = useState<ChartTab>("7D");
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders/shop/${shopId}/revenue?range=${tab}`)
      .then((r) => r.json())
      .then((d) => setData(d.records ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shopId, tab]);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>
              Revenue & Orders
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>Daily trend</Typography>
          </Box>
          <Stack direction="row" gap={0.5}>
            {(["7D", "30D", "3M"] as ChartTab[]).map((t) => (
              <Box key={t} onClick={() => setTab(t)} sx={{
                px: 1.5, py: 0.6, borderRadius: 1.5, cursor: "pointer", fontSize: 12,
                bgcolor: tab === t ? PRIMARY : "transparent",
                color: tab === t ? "#fff" : "#64748b",
                border: "1px solid", borderColor: tab === t ? PRIMARY : "transparent",
                "&:hover": { bgcolor: tab === t ? PRIMARY : "#f0f3f7" }, transition: "all 0.15s",
              }}>
                {t}
              </Box>
            ))}
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <CircularProgress size={24} sx={{ color: PRIMARY }} />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}Jt`} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8ecf0", boxShadow: "none" }}
                formatter={(value: any, name: any) => {
                  const num = Number(value ?? 0);
                  return name === "revenue" ? [fmtPrice(num), "Revenue"] : [num, "Orders"];
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="revenue"
                stroke={PRIMARY} strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3, fill: PRIMARY }} />
              <Area yAxisId="ord" type="monotone" dataKey="orders" name="orders"
                stroke={ACCENT} strokeWidth={2} fill="url(#ordGrad)" dot={{ r: 3, fill: ACCENT }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── OrderStatusChart ─────────────────────────────────────────────────────────
interface OrderStatusChartProps { stats: ShopStats | null; }
function OrderStatusChart({ stats }: OrderStatusChartProps) {
  const chartData = stats
    ? Object.entries(stats.statusBreakdown).map(([status, count]) => ({ status, count }))
    : [];

  const fulfillmentRate = stats && stats.totalOrders > 0
    ? (((stats.statusBreakdown.paid ?? 0) + (stats.statusBreakdown.shipped ?? 0)) / stats.totalOrders * 100).toFixed(1)
    : "—";

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: "20px !important" }}>
        <Box mb={2}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>Order Status</Typography>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>All time</Typography>
        </Box>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8ecf0", boxShadow: "none" }} />
            <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <Grid container spacing={1.5} mt={0.5}>
          {[
            { label: "Fulfillment rate", value: fulfillmentRate !== "—" ? `${fulfillmentRate}%` : "—" },
            { label: "Total orders", value: stats?.totalOrders.toLocaleString() ?? "—" },
          ].map((s) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
              <Box sx={{ textAlign: "center", p: 1.25, bgcolor: "#f8fafc", borderRadius: 2 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#0d1f13" }}>{s.value}</Typography>
                <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>{s.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

// ─── RecentOrders ─────────────────────────────────────────────────────────────
interface RecentOrdersProps { shopId: string; }
function RecentOrders({ shopId }: RecentOrdersProps) {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/shop/${shopId}/recent?limit=5`)
      .then((r) => r.json())
      .then((d) => setOrders(d.records ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shopId]);

  return (
    <Card>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>Recent Orders</Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>Last 5 transactions</Typography>
          </Box>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} sx={{ color: PRIMARY }} />
          </Box>
        ) : orders.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 3 }}>
            No orders yet
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Order ID", "Customer", "Amount", "Status"].map((h) => (
                  <TableCell key={h} sx={{
                    fontSize: 11.5, color: "#94a3b8", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: 0.5,
                    borderBottom: "1px solid #f1f5f9", pb: 1,
                  }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((row) => (
                <TableRow key={row.order_id}
                  sx={{ "&:hover td": { bgcolor: "#f8fafc" }, "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, border: "none", borderBottom: "1px solid #f8fafc" }}>
                    #{row.order_id.slice(0, 8)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "#334155", border: "none", borderBottom: "1px solid #f8fafc" }}>
                    {row.customer || "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13", border: "none", borderBottom: "1px solid #f8fafc" }}>
                    {fmtPrice(row.amount)}
                  </TableCell>
                  <TableCell sx={{ border: "none", borderBottom: "1px solid #f8fafc" }}>
                    <Chip label={row.status} size="small" sx={{
                      height: 22, fontSize: 11.5, fontWeight: 600, borderRadius: "99px",
                      ...(STATUS_CHIP_SX[row.status] ?? {}),
                    }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── TopProducts ──────────────────────────────────────────────────────────────
interface TopProductsProps { shopId: string; }
function TopProducts({ shopId }: TopProductsProps) {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/shop/${shopId}/top-products`)
      .then((r) => r.json())
      .then((d) => setProducts(d.records ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shopId]);

  return (
    <Card>
      <CardContent sx={{ p: "20px !important" }}>
        <Box mb={2}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>Top Products</Typography>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>By revenue all time</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} sx={{ color: PRIMARY }} />
          </Box>
        ) : products.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 3 }}>
            No sales data yet
          </Typography>
        ) : (
          <Stack gap={0}>
            {products.map((p, i) => (
              <React.Fragment key={p.product_id ?? i}>
                <Stack direction="row" alignItems="center" gap={1.5} py={1.25}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2, bgcolor: BG, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                  }}>
                    {p.picture
                      ? <Box component="img" src={p.picture} alt={p.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <Typography fontSize={20}>📦</Typography>
                    }
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                      fontSize: 13, fontWeight: 600, color: "#0d1f13",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {p.name}
                    </Typography>
                    <LinearProgress variant="determinate" value={p.pct} sx={{
                      mt: 0.75, height: 4, borderRadius: 99, bgcolor: "#f0f3f7",
                      "& .MuiLinearProgress-bar": { bgcolor: PRIMARY, borderRadius: 99 },
                    }} />
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0d1f13" }}>
                      {fmtPrice(p.totalRevenue)}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>{p.totalUnits} sold</Typography>
                  </Box>
                </Stack>
                {i < products.length - 1 && <Divider sx={{ borderColor: "#f8fafc" }} />}
              </React.Fragment>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ─── DashboardContent ─────────────────────────────────────────────────────────
interface DashboardContentProps { shop: ShopInfo; }
function DashboardContent({ shop }: DashboardContentProps) {
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/shop/${shop.shop_id}/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d.records))
      .catch(() => setStatsError("Failed to load stats"))
      .finally(() => setStatsLoading(false));
  }, [shop.shop_id]);

  return (
    <>
      <Box mb={2.5}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13" }}>
          Welcome back, {shop.name} 👋
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>
          Here's what's happening in your store today
        </Typography>
      </Box>

      {statsError && <Alert severity="error" sx={{ mb: 2 }}>{statsError}</Alert>}

      {/* KPI Stats */}
      <Grid container spacing={1.75} mb={2.25}>
        {[
          {
            label: "Total Revenue",
            value: statsLoading ? "…" : fmtPrice(stats?.totalRevenue ?? 0),
            icon: <AttachMoneyRoundedIcon sx={{ fontSize: 20 }} />,
            iconBg: "#dcfce7", iconColor: "#16a34a",
          },
          {
            label: "Total Orders",
            value: statsLoading ? "…" : (stats?.totalOrders ?? 0).toLocaleString(),
            icon: <ShoppingBagRoundedIcon sx={{ fontSize: 20 }} />,
            iconBg: "#dbeafe", iconColor: "#1d4ed8",
          },
          {
            label: "Products Listed",
            value: statsLoading ? "…" : (stats?.totalProducts ?? 0).toString(),
            icon: <InventoryRoundedIcon sx={{ fontSize: 20 }} />,
            iconBg: "#fef9c3", iconColor: "#854d0e",
          },
          {
            label: "Store Visitors",
            value: statsLoading ? "…" : (stats?.totalViews ?? 0).toLocaleString(),
            icon: <PeopleRoundedIcon sx={{ fontSize: 20 }} />,
            iconBg: "#fce7f3", iconColor: "#9d174d",
          },
        ].map((s) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={1.75} mb={2.25}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RevenueChart shopId={shop.shop_id} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <OrderStatusChart stats={stats} />
        </Grid>
      </Grid>

      {/* Bottom */}
      <Grid container spacing={1.75}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RecentOrders shopId={shop.shop_id} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TopProducts shopId={shop.shop_id} />
        </Grid>
      </Grid>
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo?.user_id) return;

    fetch(`/api/shops/user/${userInfo.user_id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.records) setShop(d.records);
        else setShopError("Shop not found");
      })
      .catch(() => setShopError("Failed to load shop"))
      .finally(() => setShopLoading(false));
  }, [userInfo]);

  if (shopLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  if (shopError || !shop) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{shopError ?? "Shop not found"}</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", bgcolor: BG, overflow: "hidden" }}>
        <Sidebar
          active={activeNav}
          shop={shop}
          onSelect={(id) => {
            if (id === "messages") navigate("/chat-customer");
            else setActiveNav(id);
          }}
        />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
            {activeNav === "dashboard" && <DashboardContent shop={shop} />}
            {activeNav === "products" && <ProductsList />}
            {activeNav === "orders" && <OrdersList />}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}