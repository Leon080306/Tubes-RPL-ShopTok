import { Navigate } from "react-router";
import { useAppSelector } from "../hooks/useAppSelector";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { authActions } from "../store/authSlice";
import type { ReactNode } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate } from "react-router";

type AllowedRole = "admin" | "customer" | "seller";

interface RouteGuardProps {
    children: ReactNode;
    allowed: AllowedRole[];
    redirectTo?: string;
}

export default function RouteGuard({ children, allowed, redirectTo }: RouteGuardProps) {
    const { userInfo } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Not logged in → login page
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    // ─── Suspended user → block access ────────────────────
    if (userInfo.status === "suspended") {
        const handleLogout = async () => {
            try {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });
            } catch (err) {
                console.error(err);
            }
            dispatch(authActions.logout());
            localStorage.removeItem("isLoggedIn");
            navigate("/login");
        };

        return (
            <>
                {/* Blocked background */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        bgcolor: "#f8fafc",
                    }}
                />

                {/* Suspended dialog */}
                <Dialog
                    open
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            maxWidth: 420,
                            px: 1,
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            pt: 3,
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                bgcolor: "#fef2f2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 0.5,
                            }}
                        >
                            <BlockIcon sx={{ fontSize: 34, color: "#dc2626" }} />
                        </Box>
                        <Typography fontSize={20} fontWeight={700} color="#1e293b">
                            Account Suspended
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography
                            fontSize={14}
                            color="#64748b"
                            textAlign="center"
                            lineHeight={1.7}
                        >
                            Your account has been suspended by an administrator.
                            You no longer have access to this platform.
                            Please contact support if you believe this is a mistake.
                        </Typography>
                        <Box
                            sx={{
                                mt: 2,
                                p: 1.5,
                                bgcolor: "#fef2f2",
                                borderRadius: 2,
                                border: "1px solid #fecaca",
                            }}
                        >
                            <Typography fontSize={12} color="#991b1b" textAlign="center">
                                Email: support@shoptok.com
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            justifyContent: "center",
                            pb: 3,
                            px: 3,
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleLogout}
                            sx={{
                                bgcolor: "#dc2626",
                                borderRadius: 99,
                                textTransform: "none",
                                fontWeight: 600,
                                py: 1.2,
                                "&:hover": { bgcolor: "#b91c1c" },
                            }}
                        >
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
    // ──────────────────────────────────────────────────────

    // Logged in but wrong role → redirect based on their actual role
    if (!allowed.includes(userInfo.role)) {
        const fallback =
            redirectTo ??
            (userInfo.role === "seller"
                ? "/shop/dashboard"
                : userInfo.role === "admin"
                    ? "/admin/dashboard"
                    : "/");

        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
}