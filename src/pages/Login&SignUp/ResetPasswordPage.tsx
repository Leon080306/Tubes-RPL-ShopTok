import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Box, Card, TextField, Button, Typography } from "@mui/material";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirm) return alert("Passwords don't match");

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
        });

        if (res.ok) {
            alert("Password reset! Please log in.");
            navigate("/login");
        } else {
            const data = await res.json();
            alert(data.message);
        }
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <Card sx={{ p: 4, width: "100%", maxWidth: 400, borderRadius: 4, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" }}>
                <Typography variant="h5" fontWeight={800} mb={1} textAlign="center" color="#003f29">
                    Reset Password
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
                    Enter your new password below.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <TextField label="New Password" type="password" fullWidth required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <TextField label="Confirm Password" type="password" fullWidth required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, borderRadius: "12px", fontWeight: "bold", backgroundColor: "#003f29", "&:hover": { backgroundColor: "#002a1b" } }}>
                        Reset Password
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}