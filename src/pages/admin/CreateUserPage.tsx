import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Select,
    MenuItem,
    IconButton,
    InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useNavigate } from "react-router";

type FormState = {
    first_name: string;
    last_name: string;
    email: string;
    rawPassword: string;
    phone_number: string;
    role: string;
};

const INITIAL_FORM: FormState = {
    first_name: "",
    last_name: "",
    email: "",
    rawPassword: "",
    phone_number: "",
    role: "",
};

export default function CreateUserPage() {
    const navigate = useNavigate();
    const themeColor = "#16a34a";

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<FormState>>({});

    /* ================= VALIDATION ================= */
    const validate = (): boolean => {
        const newErrors: Partial<FormState> = {};

        if (!form.first_name.trim()) newErrors.first_name = "Nama depan wajib diisi";
        if (!form.last_name.trim()) newErrors.last_name = "Nama belakang wajib diisi";
        if (!form.email.trim()) newErrors.email = "Email wajib diisi";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Format email tidak valid";
        if (!form.rawPassword) newErrors.rawPassword = "Password wajib diisi";
        else if (form.rawPassword.length < 8)
            newErrors.rawPassword = "Password minimal 8 karakter";
        if (!form.phone_number.trim()) newErrors.phone_number = "Nomor HP wajib diisi";
        if (!form.role) newErrors.role = "Role wajib dipilih";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch("/api/user", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!response.ok) throw new Error("Failed to create user");

            navigate("/admin/user-management");
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Gagal membuat user baru");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* HEADER */}
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => navigate("/admin/user-management")}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Tambah User Baru
                    </Typography>
                    <Typography sx={{ color: "#666" }}>
                        Isi form berikut untuk membuat user baru
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ p: 4, borderRadius: "20px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* NAMA */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Nama Depan"
                            value={form.first_name}
                            onChange={(e) => handleChange("first_name", e.target.value)}
                            error={!!errors.first_name}
                            helperText={errors.first_name}
                            fullWidth
                        />
                        <TextField
                            label="Nama Belakang"
                            value={form.last_name}
                            onChange={(e) => handleChange("last_name", e.target.value)}
                            error={!!errors.last_name}
                            helperText={errors.last_name}
                            fullWidth
                        />
                    </Box>

                    {/* EMAIL */}
                    <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        fullWidth
                    />

                    {/* PASSWORD */}
                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={form.rawPassword}
                        onChange={(e) => handleChange("rawPassword", e.target.value)}
                        error={!!errors.rawPassword}
                        helperText={errors.rawPassword}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* PHONE */}
                    <TextField
                        label="Nomor HP"
                        value={form.phone_number}
                        onChange={(e) => handleChange("phone_number", e.target.value)}
                        error={!!errors.phone_number}
                        helperText={errors.phone_number}
                        fullWidth
                    />

                    {/* ROLE */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#444", ml: 0.5 }}>
                            Role
                        </Typography>
                        <Select
                            value={form.role}
                            displayEmpty
                            onChange={(e) => handleChange("role", e.target.value)}
                            sx={{
                                borderRadius: "8px",
                                ...(errors.role && { "& fieldset": { borderColor: "#d32f2f" } }),
                            }}
                        >
                            <MenuItem value="" disabled sx={{ color: "#aaa" }}>Pilih role</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="seller">Seller</MenuItem>
                        </Select>
                        {errors.role && (
                            <Typography variant="caption" sx={{ color: "#d32f2f", ml: 0.5 }}>
                                {errors.role}
                            </Typography>
                        )}
                    </Box>

                    {/* ACTIONS */}
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate("/admin/user-management")}
                            sx={{ borderRadius: "10px", textTransform: "none", py: 1.5 }}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{
                                bgcolor: themeColor,
                                borderRadius: "10px",
                                textTransform: "none",
                                py: 1.5,
                                "&:hover": { bgcolor: "#15803d" },
                            }}
                        >
                            {loading ? "Menyimpan..." : "Simpan User"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}