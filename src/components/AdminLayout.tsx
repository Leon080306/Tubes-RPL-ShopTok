import { useState } from "react";
import type { ReactNode } from "react";
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography, Avatar, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, CircularProgress,
} from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useNavigate, useLocation, Outlet } from "react-router";
import { useAppSelector } from "../hooks/useAppSelector";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { authActions } from "../store/authSlice";

const PRIMARY = "#1e293b";
const ACCENT = "#3b82f6";
const BG = "#f1f5f9";
const DRAWER_WIDTH = 240;

interface NavItem {
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        label: "Overview",
        items: [
            {
                id: "dashboard",
                label: "Dashboard",
                icon: <DashboardRoundedIcon fontSize="small" />,
                path: "/admin/dashboard",
            },
        ],
    },
    {
        label: "Management",
        items: [
            {
                id: "categories",
                label: "Categories",
                icon: <CategoryRoundedIcon fontSize="small" />,
                path: "/admin/category-management",
            },
            {
                id: "users",
                label: "Users",
                icon: <PeopleRoundedIcon fontSize="small" />,
                path: "/admin/user-management",
            },
        ],
    },
];

// ─── Logout Dialog ────────────────────────────────────────────────────────────
interface LogoutDialogProps {
    open: boolean;
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}
function LogoutDialog({ open, loading, onConfirm, onClose }: LogoutDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            PaperProps={{ sx: { borderRadius: 3, maxWidth: 380, width: "100%" } }}
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
                        <LogoutRoundedIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                            Logout
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.2 }}>
                            You'll need to login again
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
                <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                    Are you sure you want to logout from the admin panel?
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
                    Cancel
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
                            Logging out…
                        </Stack>
                    ) : (
                        "Logout"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { userInfo } = useAppSelector((state) => state.auth);

    const [logoutOpen, setLogoutOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const isActive = (path: string) => location.pathname.startsWith(path);

    const handleLogout = async () => {
        try {
            setLogoutLoading(true);
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            dispatch(authActions.logout());
            navigate("/login");
        } catch (error) {
            console.error(error);
        } finally {
            setLogoutLoading(false);
        }
    };

    const adminName = userInfo
        ? `${userInfo.first_name ?? ""} ${userInfo.last_name ?? ""}`.trim() || "Admin"
        : "Admin";

    const adminInitials = adminName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <>
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
                {/* Logo */}
                <Box sx={{ px: 2.5, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <ShieldRoundedIcon sx={{ color: ACCENT, fontSize: 22 }} />
                        <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>
                            Admin Panel
                        </Typography>
                    </Stack>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 11, mt: 0.3 }}>
                        GreenMart Management
                    </Typography>
                </Box>

                {/* Nav */}
                <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
                    {NAV_SECTIONS.map((section) => (
                        <Box key={section.label} sx={{ mb: 1 }}>
                            <Typography
                                sx={{
                                    color: "rgba(255,255,255,0.32)", fontSize: 10, fontWeight: 600,
                                    letterSpacing: 1, textTransform: "uppercase", px: 1, py: 1,
                                }}
                            >
                                {section.label}
                            </Typography>
                            <List dense disablePadding>
                                {section.items.map((item) => {
                                    const active = isActive(item.path);
                                    return (
                                        <ListItem key={item.id} disablePadding>
                                            <ListItemButton
                                                selected={active}
                                                onClick={() => navigate(item.path)}
                                                sx={{
                                                    borderRadius: 2, mb: 0.25,
                                                    color: active ? ACCENT : "rgba(255,255,255,0.62)",
                                                    bgcolor: active ? "rgba(59,130,246,0.15)" : "transparent",
                                                    "&:hover": {
                                                        bgcolor: active
                                                            ? "rgba(59,130,246,0.2)"
                                                            : "rgba(255,255,255,0.08)",
                                                        color: active ? ACCENT : "#fff",
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.label}
                                                    primaryTypographyProps={{
                                                        fontSize: 13.5,
                                                        fontWeight: active ? 600 : 400,
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    ))}
                </Box>

                {/* Bottom: Profile + Logout */}
                <Box sx={{ px: 1.5, pb: 2, borderTop: "1px solid rgba(255,255,255,0.08)", pt: 1.5 }}>
                    {/* Profile */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap={1.25}
                        sx={{ px: 1, py: 0.75, borderRadius: 2 }}
                    >
                        <Avatar
                            src={userInfo?.profile_pic ?? undefined}
                            sx={{
                                width: 34, height: 34, bgcolor: ACCENT,
                                color: PRIMARY, fontSize: 13, fontWeight: 700,
                            }}
                        >
                            {adminInitials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                sx={{
                                    color: "#fff", fontSize: 13, fontWeight: 600,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}
                            >
                                {adminName}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                                Administrator
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Logout */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap={1.25}
                        onClick={() => setLogoutOpen(true)}
                        sx={{
                            px: 1, py: 0.75, mt: 0.5, borderRadius: 2, cursor: "pointer",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.12)" },
                            transition: "all 0.15s",
                        }}
                    >
                        <Box
                            sx={{
                                width: 34, height: 34, borderRadius: "50%",
                                bgcolor: "rgba(239,68,68,0.15)", color: "#ef4444",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <LogoutRoundedIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography sx={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
                            Logout
                        </Typography>
                    </Stack>
                </Box>
            </Drawer>

            <LogoutDialog
                open={logoutOpen}
                loading={logoutLoading}
                onConfirm={handleLogout}
                onClose={() => { if (!logoutLoading) setLogoutOpen(false); }}
            />
        </>
    );
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
    return (
        <Box sx={{ display: "flex", height: "100vh", bgcolor: BG, overflow: "hidden" }}>
            <AdminSidebar />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}