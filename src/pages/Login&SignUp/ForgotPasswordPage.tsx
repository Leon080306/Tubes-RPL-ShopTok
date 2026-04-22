import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    Link as MuiLink,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useState } from "react";
import { Link } from "react-router";

type Step = "find" | "sent";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState<Step>("find");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setStep("sent"); // always go to sent step regardless
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
                width: "100%",
            }}
        >
            <Card
                sx={{
                    p: 4,
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 4,
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <LockResetIcon sx={{ fontSize: 48, color: "#003f29" }} />
                </Box>

                <Typography variant="h5" fontWeight={800} mb={1} textAlign="center" color="#003f29">
                    Trouble Logging In?
                </Typography>

                {step === "find" ? (
                    <>
                        <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
                            Enter your email and we'll send you a link to get back into your account.
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                        >
                            <TextField
                                label="Email Address"
                                name="email"
                                type="email"
                                fullWidth
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    borderRadius: "12px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#003f29",
                                    "&:hover": { backgroundColor: "#002a1b" },
                                }}
                            >
                                Send Reset Link
                            </Button>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
                            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e0e0" }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>OR</Typography>
                            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e0e0" }} />
                        </Box>

                        <Box sx={{ textAlign: "center" }}>
                            <MuiLink
                                component={Link}
                                to="/signup"
                                sx={{ color: "#003f29", fontWeight: "bold", textDecoration: "none" }}
                            >
                                Create New Account
                            </MuiLink>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
                            We sent a reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            component={Link}
                            to="/login"
                            sx={{
                                py: 1.5,
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                backgroundColor: "#003f29",
                                "&:hover": { backgroundColor: "#002a1b" },
                            }}
                        >
                            Back to Login
                        </Button>
                    </>
                )}

                {step === "find" && (
                    <Typography variant="body2" textAlign="center" mt={3}>
                        Remembered your password?{" "}
                        <MuiLink
                            component={Link}
                            to="/login"
                            sx={{ color: "#16a34a", fontWeight: "bold", textDecoration: "none" }}
                        >
                            Log In
                        </MuiLink>
                    </Typography>
                )}
            </Card>
        </Box>
    );
}