import { Navigate } from "react-router";
import { useAppSelector } from "../hooks/useAppSelector";
import type { ReactNode } from "react";

type AllowedRole = "admin" | "customer" | "seller";

interface RouteGuardProps {
    children: ReactNode;
    allowed: AllowedRole[];
    redirectTo?: string;
}

export default function RouteGuard({ children, allowed, redirectTo }: RouteGuardProps) {
    const { userInfo } = useAppSelector((state) => state.auth);

    // Not logged in → login page
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

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