import { useState } from "react";
import type { ReactNode } from "react";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
  LinearProgress, Divider, Stack, Grid
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell,
} from "recharts";
import ProductsList from "./ProductsList";
import OrdersList from "./OrdersList";
import { useNavigate } from "react-router-dom";

// ─── Brand colors ────────────────────────────────────────────────────────────
const PRIMARY = "#003f29" as const;
const PRIMARY_LIGHT = "#00613f" as const;
const ACCENT = "#4ade80" as const;
const BG = "#f0f3f7" as const;

// ─── MUI Theme ───────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: PRIMARY, light: PRIMARY_LIGHT, contrastText: "#fff" },
    background: { default: BG, paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"DM Sans", "Inter", "Segoe UI", sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "none", border: "1px solid #e8ecf0" },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 2,
          color: "rgba(255,255,255,0.62)",
          "&:hover": { background: "rgba(255,255,255,0.08)", color: "#fff" },
          "&.Mui-selected": {
            background: "rgba(74,222,128,0.15)",
            color: ACCENT,
            "&:hover": { background: "rgba(74,222,128,0.2)" },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { minWidth: 34, color: "inherit" } },
    },
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
type NavId =
  | "dashboard" | "orders" | "products" | "messages";

type OrderStatus = "Paid" | "Shipped" | "Pending" | "Cancelled";

interface NavItem {
  id: NavId;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface StatItem {
  label: string;
  value: string;
  change: string;
  up: boolean;
  sub: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface OrderStatusDataPoint {
  status: OrderStatus;
  count: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: OrderStatus;
}

interface TopProduct {
  emoji: string;
  name: string;
  category: string;
  revenue: string;
  units: string;
  pct: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 224;

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <DashboardRoundedIcon fontSize="small" /> },
      { id: "orders", label: "Orders", icon: <ShoppingBagRoundedIcon fontSize="small" />, badge: 12 },
      { id: "products", label: "Products", icon: <InventoryRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Store",
    items: [
      { id: "messages", label: "Messages", icon: <ChatBubbleRoundedIcon fontSize="small" />, badge: 3 },
    ],
  },
];

const STATS: StatItem[] = [
  {
    label: "Total Revenue",
    value: "Rp 84.2M",
    change: "+12.4%",
    up: true,
    sub: "vs last month",
    icon: <AttachMoneyRoundedIcon sx={{ fontSize: 20 }} />,
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
  },
  {
    label: "Total Orders",
    value: "1,847",
    change: "+8.1%",
    up: true,
    sub: "vs last month",
    icon: <ShoppingBagRoundedIcon sx={{ fontSize: 20 }} />,
    iconBg: "#dbeafe",
    iconColor: "#1d4ed8",
  },
  {
    label: "Products Listed",
    value: "243",
    change: "+5",
    up: true,
    sub: "new this week",
    icon: <InventoryRoundedIcon sx={{ fontSize: 20 }} />,
    iconBg: "#fef9c3",
    iconColor: "#854d0e",
  },
  {
    label: "Store Visitors",
    value: "28.9K",
    change: "-2.3%",
    up: false,
    sub: "vs last month",
    icon: <PeopleRoundedIcon sx={{ fontSize: 20 }} />,
    iconBg: "#fce7f3",
    iconColor: "#9d174d",
  },
];

const REVENUE_DATA: RevenueDataPoint[] = [
  { date: "Apr 15", revenue: 8.2, orders: 110 },
  { date: "Apr 16", revenue: 9.1, orders: 128 },
  { date: "Apr 17", revenue: 7.8, orders: 98 },
  { date: "Apr 18", revenue: 11.4, orders: 155 },
  { date: "Apr 19", revenue: 10.2, orders: 142 },
  { date: "Apr 20", revenue: 13.1, orders: 178 },
  { date: "Apr 21", revenue: 12.7, orders: 163 },
];

const ORDER_STATUS_DATA: OrderStatusDataPoint[] = [
  { status: "Paid", count: 842 },
  { status: "Shipped", count: 631 },
  { status: "Pending", count: 287 },
  { status: "Cancelled", count: 87 },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  Paid: "#003f29",
  Shipped: "#1d4ed8",
  Pending: "#854d0e",
  Cancelled: "#b91c1c",
};

const RECENT_ORDERS: RecentOrder[] = [
  { id: "#INV-0091", customer: "Budi Santoso", amount: "Rp 420K", status: "Paid" },
  { id: "#INV-0090", customer: "Siti Rahayu", amount: "Rp 189K", status: "Shipped" },
  { id: "#INV-0089", customer: "Ahmad Fauzi", amount: "Rp 750K", status: "Pending" },
  { id: "#INV-0088", customer: "Dewi Lestari", amount: "Rp 215K", status: "Paid" },
  { id: "#INV-0087", customer: "Rizal Maulana", amount: "Rp 93K", status: "Cancelled" },
];

const STATUS_CHIP_SX: Record<OrderStatus, SxProps<Theme>> = {
  Paid: { bgcolor: "#dcfce7", color: "#15803d" },
  Shipped: { bgcolor: "#dbeafe", color: "#1d4ed8" },
  Pending: { bgcolor: "#fef9c3", color: "#854d0e" },
  Cancelled: { bgcolor: "#fee2e2", color: "#b91c1c" },
};

const TOP_PRODUCTS: TopProduct[] = [
  { emoji: "👟", name: "Sneakers Pro Max", category: "Footwear", revenue: "Rp 18.4M", units: "312 sold", pct: 88 },
  { emoji: "👜", name: "Canvas Tote Bag", category: "Accessories", revenue: "Rp 12.1M", units: "241 sold", pct: 72 },
  { emoji: "🎧", name: "Wireless Earbuds X3", category: "Electronics", revenue: "Rp 9.7M", units: "89 sold", pct: 61 },
  { emoji: "🧴", name: "Skincare Starter Kit", category: "Beauty", revenue: "Rp 7.2M", units: "180 sold", pct: 45 },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  active: NavId;
  onSelect: (id: NavId) => void;
}

function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          background: PRIMARY,
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT }} />
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>
            GreenMart
          </Typography>
        </Stack>
        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 11, mt: 0.3 }}>
          Seller Dashboard
        </Typography>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.label} sx={{ mb: 1 }}>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.32)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                px: 1,
                py: 1,
              }}
            >
              {section.label}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={active === item.id}
                    onClick={() => onSelect(item.id)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13.5,
                        fontWeight: active === item.id ? 600 : 400,
                      }}
                    />
                    {item.badge !== undefined && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          bgcolor: "#ef4444",
                          color: "#fff",
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* User */}
      <Box sx={{ px: 1.5, pb: 2, borderTop: "1px solid rgba(255,255,255,0.08)", pt: 1.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1.25}
          sx={{
            px: 1, py: 0.75, borderRadius: 2, cursor: "pointer",
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
          }}
        >
          <Avatar
            sx={{
              width: 34, height: 34,
              bgcolor: ACCENT, color: PRIMARY,
              fontSize: 13, fontWeight: 700,
            }}
          >
            LN
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Leon</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Store Owner</Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon sx={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }} />
        </Stack>
      </Box>
    </Drawer>
  );
}
// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, up, sub, icon, iconBg, iconColor }: StatItem) {
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
          <Box
            sx={{
              width: 40, height: 40, borderRadius: "10px",
              bgcolor: iconBg, color: iconColor,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
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
      </CardContent>
    </Card>
  );
}

// ─── RevenueChart ─────────────────────────────────────────────────────────────
type ChartTab = "7D" | "30D" | "3M";

function RevenueChart() {
  const [tab, setTab] = useState<ChartTab>("7D");

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>
              Revenue & Orders
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
              April 2026 — daily trend
            </Typography>
          </Box>
          <Stack direction="row" gap={0.5}>
            {(["7D", "30D", "3M"] as ChartTab[]).map((t) => (
              <Box
                key={t}
                onClick={() => setTab(t)}
                sx={{
                  px: 1.5, py: 0.6, borderRadius: 1.5, cursor: "pointer", fontSize: 12,
                  bgcolor: tab === t ? PRIMARY : "transparent",
                  color: tab === t ? "#fff" : "#64748b",
                  border: "1px solid",
                  borderColor: tab === t ? PRIMARY : "transparent",
                  "&:hover": { bgcolor: tab === t ? PRIMARY : "#f0f3f7" },
                  transition: "all 0.15s",
                }}
              >
                {t}
              </Box>
            ))}
          </Stack>
        </Stack>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="rev"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `Rp${v}M`}
            />
            <YAxis
              yAxisId="ord"
              orientation="right"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12, borderRadius: 8,
                border: "1px solid #e8ecf0", boxShadow: "none",
              }}
              formatter={(value, name) =>
                name === "revenue"
                  ? [`Rp ${value ?? 0}M`, "Revenue"]
                  : [value ?? 0, "Orders"]
              }
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Area
              yAxisId="rev"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke={PRIMARY}
              strokeWidth={2}
              fill="url(#revGrad)"
              dot={{ r: 3, fill: PRIMARY }}
            />
            <Area
              yAxisId="ord"
              type="monotone"
              dataKey="orders"
              name="orders"
              stroke={ACCENT}
              strokeWidth={2}
              fill="url(#ordGrad)"
              dot={{ r: 3, fill: ACCENT }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── OrderStatusChart ─────────────────────────────────────────────────────────
function OrderStatusChart() {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: "20px !important" }}>
        <Box mb={2}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>
            Order Status
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>This month</Typography>
        </Box>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ORDER_STATUS_DATA} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="status"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12, borderRadius: 8,
                border: "1px solid #e8ecf0", boxShadow: "none",
              }}
            />
            <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
              {ORDER_STATUS_DATA.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <Grid container spacing={1.5} mt={0.5}>
          {(
            [
              { label: "Fulfillment rate", value: "94.2%" },
              { label: "Avg. ship time", value: "1.8 days" },
            ] as const
          ).map((m) => (
            <Grid size={6} key={m.label}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1.25,
                  bgcolor: "#f8fafc",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0d1f13",
                  }}
                >
                  {m.value}
                </Typography>

                <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                  {m.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

// ─── RecentOrders ─────────────────────────────────────────────────────────────
const TABLE_HEADERS = ["Order ID", "Customer", "Amount", "Status"] as const;


function RecentOrders() {
  return (
    <Card>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>
              Recent Orders
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
              Last 5 transactions
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: PRIMARY, fontWeight: 600, cursor: "pointer" }}>
            View all →
          </Typography>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              {TABLE_HEADERS.map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontSize: 11.5, color: "#94a3b8", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: 0.5,
                    borderBottom: "1px solid #f1f5f9", pb: 1,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {RECENT_ORDERS.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:hover td": { bgcolor: "#f8fafc" }, "&:last-child td": { border: 0 } }}
              >
                <TableCell
                  sx={{
                    fontSize: 13, fontWeight: 600, color: PRIMARY,
                    border: "none", borderBottom: "1px solid #f8fafc",
                  }}
                >
                  {row.id}
                </TableCell>
                <TableCell
                  sx={{ fontSize: 13, color: "#334155", border: "none", borderBottom: "1px solid #f8fafc" }}
                >
                  {row.customer}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13, fontWeight: 600, color: "#0d1f13",
                    border: "none", borderBottom: "1px solid #f8fafc",
                  }}
                >
                  {row.amount}
                </TableCell>
                <TableCell sx={{ border: "none", borderBottom: "1px solid #f8fafc" }}>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11.5,
                      fontWeight: 600,
                      borderRadius: "99px",
                      ...STATUS_CHIP_SX[row.status],
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── TopProducts ──────────────────────────────────────────────────────────────
function TopProducts() {
  return (
    <Card>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0d1f13" }}>
              Top Products
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
              By revenue this month
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: PRIMARY, fontWeight: 600, cursor: "pointer" }}>
            Manage →
          </Typography>
        </Stack>

        <Stack gap={0}>
          {TOP_PRODUCTS.map((p, i) => (
            <Box key={p.name}>
              <Stack direction="row" alignItems="center" gap={1.5} py={1.25}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2, bgcolor: BG,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}
                >
                  {p.emoji}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0d1f13" }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>{p.category}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={p.pct}
                    sx={{
                      mt: 0.75, height: 4, borderRadius: 99,
                      bgcolor: "#f0f3f7",
                      "& .MuiLinearProgress-bar": { bgcolor: PRIMARY, borderRadius: 99 },
                    }}
                  />
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0d1f13" }}>
                    {p.revenue}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>{p.units}</Typography>
                </Box>
              </Stack>
              {i < TOP_PRODUCTS.length - 1 && <Divider sx={{ borderColor: "#f8fafc" }} />}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  return (
    <>
      {/* Page header */}
      <Box mb={2.5}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0d1f13" }}>
          Welcome back, Leon 👋
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>
          Here's what's happening in your store today
        </Typography>
      </Box>

      {/* KPI stats */}
      <Grid container spacing={1.75} mb={2.25}>
        {STATS.map((s) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={1.75} mb={2.25}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RevenueChart />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <OrderStatusChart />
        </Grid>
      </Grid>

      {/* Bottom */}
      <Grid container spacing={1.75}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RecentOrders />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TopProducts />
        </Grid>
      </Grid>
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", bgcolor: BG, overflow: "hidden" }}>
        <Sidebar
          active={activeNav}
          onSelect={(id) => {
            if (id === "messages") {
              navigate("/chattoko");
            } else {
              setActiveNav(id);
            }
          }}
        />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* ✅ CONTENT AREA */}
          <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
            {activeNav === "dashboard" && <DashboardContent />}
            {activeNav === "products" && <ProductsList />}
            {activeNav === "orders" && <OrdersList />}
          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  );
}