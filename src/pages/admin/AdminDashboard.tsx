import { useState, useEffect } from "react";
import {
    Box, Typography, Grid, Card, CardContent, Stack,
    CircularProgress, Alert, Table, TableBody, TableCell,
    TableHead, TableRow, Chip, Avatar, LinearProgress, Divider,
} from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { ReactNode } from "react";

const PRIMARY = "#003f29";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    iconBg: string;
    iconColor: string;
    sub?: string;
}

interface UserRecord {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: "admin" | "customer" | "seller";
    status: "active" | "suspended";
    profile_pic: string | null;
    createdAt: string;
}

interface ShopRecord {
    shop_id: string;
    name: string;
    profile_pic: string | null;
    owner_id: string;
    createdAt: string;
    owner?: { first_name: string; last_name: string };
}

interface CategoryRecord {
    category_id: string;
    name: string;
    products?: { length: number }[];
}

interface Stats {
    totalUsers: number;
    totalCategories: number;
    totalShops: number;
    totalProducts: number;
    roleBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
    users: UserRecord[];
    shops: ShopRecord[];
    categories: CategoryRecord[];
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, iconBg, iconColor, sub }: StatCardProps) {
    return (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: "20px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography sx={{ fontSize: 12.5, color: "#64748b", mb: 0.5 }}>{label}</Typography>
                        <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
                            {value}
                        </Typography>
                        {sub && (
                            <Typography sx={{ fontSize: 11.5, color: "#94a3b8", mt: 0.5 }}>{sub}</Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: "12px",
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

// ─── Role Distribution Chart ──────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
    customer: "#1d4ed8",
    seller: "#16a34a",
    admin: "#9333ea",
};

function RoleDistributionChart({ roleBreakdown }: { roleBreakdown: Record<string, number> }) {
    const data = Object.entries(roleBreakdown).map(([role, count]) => ({ role, count }));
    const total = data.reduce((s, d) => s + d.count, 0);

    return (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", height: "100%" }}>
            <CardContent sx={{ p: "20px !important" }}>
                <Box mb={2}>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                        User Roles
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                        Distribution across roles
                    </Typography>
                </Box>

                <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            dataKey="count"
                            nameKey="role"
                            strokeWidth={2}
                            stroke="#fff"
                        >
                            {data.map((entry) => (
                                <Cell key={entry.role} fill={ROLE_COLORS[entry.role] ?? "#94a3b8"} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const { role, count } = payload[0].payload as { role: string; count: number };
                                return (
                                    <Box sx={{
                                        bgcolor: "#fff", px: 1.5, py: 1, borderRadius: 2,
                                        border: "1px solid #e8ecf0", fontSize: 12,
                                    }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                                            {role}
                                        </Typography>
                                        <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                                            {count} ({((count / total) * 100).toFixed(1)}%)
                                        </Typography>
                                    </Box>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <Stack gap={1} mt={1}>
                    {data.map((d) => (
                        <Stack key={d.role} direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Box sx={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    bgcolor: ROLE_COLORS[d.role] ?? "#94a3b8",
                                }} />
                                <Typography sx={{ fontSize: 13, color: "#334155", textTransform: "capitalize" }}>
                                    {d.role}
                                </Typography>
                            </Stack>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                {d.count}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}

// ─── User Status Chart ────────────────────────────────────────────────────────
function UserStatusChart({ statusBreakdown, total }: { statusBreakdown: Record<string, number>; total: number }) {
    const active = statusBreakdown["active"] ?? 0;
    const suspended = statusBreakdown["suspended"] ?? 0;
    const activeRate = total > 0 ? ((active / total) * 100).toFixed(1) : "0";

    const data = [
        { status: "Active", count: active, color: "#16a34a" },
        { status: "Suspended", count: suspended, color: "#dc2626" },
    ];

    return (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", height: "100%" }}>
            <CardContent sx={{ p: "20px !important" }}>
                <Box mb={2}>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                        Account Status
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                        Active vs suspended
                    </Typography>
                </Box>

                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                fontSize: 12, borderRadius: 8,
                                border: "1px solid #e8ecf0", boxShadow: "none",
                            }}
                        />
                        <Bar dataKey="count" name="Users" radius={[6, 6, 0, 0]}>
                            {data.map((entry) => (
                                <Cell key={entry.status} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <Grid container spacing={1.5} mt={0.5}>
                    <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: "center", p: 1.25, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
                                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>
                                    {activeRate}%
                                </Typography>
                            </Stack>
                            <Typography sx={{ fontSize: 11.5, color: "#64748b" }}>Active rate</Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: "center", p: 1.25, bgcolor: "#fef2f2", borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
                                <BlockRoundedIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>
                                    {suspended}
                                </Typography>
                            </Stack>
                            <Typography sx={{ fontSize: 11.5, color: "#64748b" }}>Suspended</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

// ─── Recent Users Table ───────────────────────────────────────────────────────
const ROLE_CHIP_SX: Record<string, object> = {
    admin: { bgcolor: "#f3e8ff", color: "#7c3aed" },
    seller: { bgcolor: "#dcfce7", color: "#15803d" },
    customer: { bgcolor: "#dbeafe", color: "#1d4ed8" },
};

const STATUS_CHIP_SX: Record<string, object> = {
    active: { bgcolor: "#dcfce7", color: "#15803d" },
    suspended: { bgcolor: "#fee2e2", color: "#b91c1c" },
};

function RecentUsersTable({ users }: { users: UserRecord[] }) {
    const recent = [...users]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    return (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: "20px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                            Recent Users
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                            Latest registrations
                        </Typography>
                    </Box>
                    <Chip
                        icon={<TrendingUpRoundedIcon sx={{ fontSize: 14 }} />}
                        label={`${users.length} total`}
                        size="small"
                        sx={{
                            height: 24, fontSize: 11.5, fontWeight: 600,
                            bgcolor: "#f0fdf4", color: PRIMARY,
                            "& .MuiChip-icon": { color: PRIMARY },
                        }}
                    />
                </Stack>

                {recent.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 3 }}>
                        No users yet
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {["User", "Role", "Status", "Joined"].map((h) => (
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
                            {recent.map((user) => (
                                <TableRow key={user.user_id}
                                    sx={{ "&:hover td": { bgcolor: "#f8fafc" }, "&:last-child td": { border: 0 } }}
                                >
                                    <TableCell sx={{ border: "none", borderBottom: "1px solid #f8fafc" }}>
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Avatar
                                                src={user.profile_pic ?? undefined}
                                                sx={{ width: 32, height: 32, bgcolor: "#e2e8f0", fontSize: 13, fontWeight: 600 }}
                                            >
                                                {user.first_name[0]}{user.last_name[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                                    {user.first_name} {user.last_name}
                                                </Typography>
                                                <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ border: "none", borderBottom: "1px solid #f8fafc" }}>
                                        <Chip label={user.role} size="small" sx={{
                                            height: 22, fontSize: 11.5, fontWeight: 600,
                                            borderRadius: 99, textTransform: "capitalize",
                                            ...(ROLE_CHIP_SX[user.role] ?? {}),
                                        }} />
                                    </TableCell>
                                    <TableCell sx={{ border: "none", borderBottom: "1px solid #f8fafc" }}>
                                        <Chip label={user.status} size="small" sx={{
                                            height: 22, fontSize: 11.5, fontWeight: 600,
                                            borderRadius: 99, textTransform: "capitalize",
                                            ...(STATUS_CHIP_SX[user.status] ?? {}),
                                        }} />
                                    </TableCell>
                                    <TableCell sx={{ border: "none", borderBottom: "1px solid #f8fafc" }}>
                                        <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
                                            {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </Typography>
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

// ─── Recent Shops Table ───────────────────────────────────────────────────────
function RecentShopsTable({ shops }: { shops: ShopRecord[] }) {
    const recent = [...shops]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: "20px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                            Recent Shops
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                            Newest stores on the platform
                        </Typography>
                    </Box>
                    <Chip
                        icon={<StorefrontRoundedIcon sx={{ fontSize: 14 }} />}
                        label={`${shops.length} total`}
                        size="small"
                        sx={{
                            height: 24, fontSize: 11.5, fontWeight: 600,
                            bgcolor: "#fef9c3", color: "#854d0e",
                            "& .MuiChip-icon": { color: "#854d0e" },
                        }}
                    />
                </Stack>

                {recent.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 3 }}>
                        No shops yet
                    </Typography>
                ) : (
                    <Stack gap={0}>
                        {recent.map((shop, i) => (
                            <Box key={shop.shop_id}>
                                <Stack direction="row" alignItems="center" gap={1.5} py={1.5}>
                                    <Avatar
                                        src={shop.profile_pic ?? undefined}
                                        sx={{
                                            width: 40, height: 40, bgcolor: "#e8f5e9",
                                            color: PRIMARY, fontSize: 14, fontWeight: 700,
                                        }}
                                    >
                                        {shop.name.slice(0, 2).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{
                                            fontSize: 13, fontWeight: 600, color: "#0f172a",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>
                                            {shop.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, color: "#94a3b8" }}>
                                            ID: {shop.shop_id.slice(0, 8)}…
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: 12, color: "#64748b", flexShrink: 0 }}>
                                        {new Date(shop.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric", month: "short",
                                        })}
                                    </Typography>
                                </Stack>
                                {i < recent.length - 1 && <Divider sx={{ borderColor: "#f8fafc" }} />}
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Platform Health ──────────────────────────────────────────────────────────
function PlatformHealth({ stats }: { stats: Stats }) {
    const metrics = [
        {
            label: "Users with shops",
            value: stats.totalShops,
            total: stats.roleBreakdown["seller"] ?? 0,
            color: "#16a34a",
        },
        {
            label: "Active accounts",
            value: stats.statusBreakdown["active"] ?? 0,
            total: stats.totalUsers,
            color: "#1d4ed8",
        },
        {
            label: "Products per shop",
            value: stats.totalShops > 0 ? Math.round(stats.totalProducts / stats.totalShops) : 0,
            total: null,
            color: "#854d0e",
        },
        {
            label: "Categories utilized",
            value: stats.totalCategories,
            total: null,
            color: "#9333ea",
        },
    ];

    return (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: "20px !important" }}>
                <Box mb={2}>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                        Platform Health
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                        Key metrics overview
                    </Typography>
                </Box>

                <Stack gap={2}>
                    {metrics.map((m) => {
                        const pct = m.total && m.total > 0 ? (m.value / m.total) * 100 : null;
                        return (
                            <Box key={m.label}>
                                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                    <Typography sx={{ fontSize: 13, color: "#334155" }}>{m.label}</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                        {m.value}{pct !== null ? ` / ${m.total}` : ""}
                                    </Typography>
                                </Stack>
                                {pct !== null ? (
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(pct, 100)}
                                        sx={{
                                            height: 6, borderRadius: 99, bgcolor: "#f0f3f7",
                                            "& .MuiLinearProgress-bar": { bgcolor: m.color, borderRadius: 99 },
                                        }}
                                    />
                                ) : (
                                    <LinearProgress
                                        variant="determinate"
                                        value={100}
                                        sx={{
                                            height: 6, borderRadius: 99, bgcolor: "#f0f3f7",
                                            "& .MuiLinearProgress-bar": { bgcolor: m.color, borderRadius: 99 },
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, categoriesRes, shopsRes, productsRes] = await Promise.all([
                    fetch("/api/user", { credentials: "include" }),
                    fetch("/api/category", { credentials: "include" }),
                    fetch("/api/shops", { credentials: "include" }),
                    fetch("/api/products", { credentials: "include" }),
                ]);

                const usersData = await usersRes.json();
                const categoriesData = await categoriesRes.json();
                const shopsData = await shopsRes.json();
                const productsData = await productsRes.json();

                const users: UserRecord[] = usersData.records ?? [];
                const shops: ShopRecord[] = shopsData.records ?? [];
                const categories: CategoryRecord[] = categoriesData.records ?? [];

                const roleBreakdown: Record<string, number> = {};
                const statusBreakdown: Record<string, number> = {};

                users.forEach((u) => {
                    roleBreakdown[u.role] = (roleBreakdown[u.role] ?? 0) + 1;
                    statusBreakdown[u.status] = (statusBreakdown[u.status] ?? 0) + 1;
                });

                setStats({
                    totalUsers: users.length,
                    totalCategories: categories.length,
                    totalShops: shops.length,
                    totalProducts: (productsData.records ?? []).length,
                    roleBreakdown,
                    statusBreakdown,
                    users,
                    shops,
                    categories,
                });
            } catch {
                setError("Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                <CircularProgress size={32} sx={{ color: "#1e293b" }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                    Admin Dashboard
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>
                    Overview of your platform
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {/* Stat Cards */}
            <Grid container spacing={2} mb={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Total Users"
                        value={stats?.totalUsers ?? 0}
                        icon={<PeopleRoundedIcon sx={{ fontSize: 22 }} />}
                        iconBg="#dbeafe" iconColor="#1d4ed8"
                        sub={`${stats?.roleBreakdown.customer ?? 0} customers · ${stats?.roleBreakdown.seller ?? 0} sellers`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Categories"
                        value={stats?.totalCategories ?? 0}
                        icon={<CategoryRoundedIcon sx={{ fontSize: 22 }} />}
                        iconBg="#dcfce7" iconColor="#16a34a"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Shops"
                        value={stats?.totalShops ?? 0}
                        icon={<StorefrontRoundedIcon sx={{ fontSize: 22 }} />}
                        iconBg="#fef9c3" iconColor="#854d0e"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Products"
                        value={stats?.totalProducts ?? 0}
                        icon={<InventoryRoundedIcon sx={{ fontSize: 22 }} />}
                        iconBg="#fce7f3" iconColor="#9d174d"
                    />
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={2} mb={2.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <RoleDistributionChart roleBreakdown={stats?.roleBreakdown ?? {}} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <UserStatusChart
                        statusBreakdown={stats?.statusBreakdown ?? {}}
                        total={stats?.totalUsers ?? 0}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    {stats && <PlatformHealth stats={stats} />}
                </Grid>
            </Grid>

            {/* Tables Row */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <RecentUsersTable users={stats?.users ?? []} />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <RecentShopsTable shops={stats?.shops ?? []} />
                </Grid>
            </Grid>
        </Box>
    );
}