import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

type FormState = {
    first_name: string;
    last_name: string;
    email: string;
    rawPassword: string;
    phone_number: string;
    role: string;
    status: string;
};

const INITIAL_FORM: FormState = {
    first_name: "",
    last_name: "",
    email: "",
    rawPassword: "",
    phone_number: "",
    role: "",
    status: "",
};

export default function EditUserPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const themeColor = "#16a34a";

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState<Partial<FormState>>({});

    /* ================= FETCH USER ================= */
    const getUser = async () => {
        try {
            const response = await fetch(`/api/user/${id}`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to fetch user");

            const data = await response.json();

            setForm({
                first_name: data.first_name ?? "",
                last_name: data.last_name ?? "",
                email: data.email ?? "",
                rawPassword: "",
                phone_number: data.phone_number ?? "",
                role: data.role ?? "",
                status: data.status ?? "",
            });
        } catch (error) {
            console.error("Error fetching user:", error);
            alert("Gagal memuat data user");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        getUser();
    }, [id]);

    /* ================= VALIDATION ================= */
    const validate = (): boolean => {
        const newErrors: Partial<FormState> = {};

        if (!form.first_name.trim()) newErrors.first_name = "Nama depan wajib diisi";
        if (!form.last_name.trim()) newErrors.last_name = "Nama belakang wajib diisi";
        if (!form.email.trim()) newErrors.email = "Email wajib diisi";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Format email tidak valid";
        if (form.rawPassword && form.rawPassword.length < 8)
            newErrors.rawPassword = "Password minimal 8 karakter";
        if (!form.phone_number.trim()) newErrors.phone_number = "Nomor HP wajib diisi";
        if (!form.role) newErrors.role = "Role wajib dipilih";
        if (!form.status) newErrors.status = "Status wajib dipilih";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const body: Partial<FormState> = { ...form };
            if (!body.rawPassword) delete body.rawPassword; // jangan kirim kalau kosong

            const response = await fetch(`/api/user/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Failed to update user");

            navigate("/admin/user-management");
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Gagal mengupdate user");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    if (fetching) return <Box sx={{ p: 4 }}>Memuat data...</Box>;

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* HEADER */}
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => navigate("/admin/user-management")}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Edit User
                    </Typography>
                    <Typography sx={{ color: "#666" }}>
                        Ubah data user yang dipilih
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
                        label="Password Baru (opsional)"
                        type={showPassword ? "text" : "password"}
                        value={form.rawPassword}
                        onChange={(e) => handleChange("rawPassword", e.target.value)}
                        error={!!errors.rawPassword}
                        helperText={errors.rawPassword || "Kosongkan jika tidak ingin mengubah password"}
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
                        <TextField
                            select
                            value={form.role}
                            onChange={(e) => handleChange("role", e.target.value)}
                            error={!!errors.role}
                            helperText={errors.role}
                            fullWidth
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="seller">Seller</MenuItem>
                        </TextField>
                    </Box>

                    {/* STATUS */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#444", ml: 0.5 }}>
                            Status
                        </Typography>
                        <TextField
                            select
                            value={form.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                            error={!!errors.status}
                            helperText={errors.status}
                            fullWidth
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                        </TextField>
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
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}