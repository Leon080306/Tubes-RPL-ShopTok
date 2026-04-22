/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Stack,
    MenuItem,
    IconButton,
    Divider,
    Alert
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../hooks/useAppSelector";

const PRIMARY = "#003f29";

interface Category {
    category_id: string;
    name: string;
}

interface Variant {
    name: string;
    price: number;
    stock: number;
    picture?: File | null;
}

export default function AddProductPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

    const [variants, setVariants] = useState<Variant[]>([
        { name: "", price: 0, stock: 0, picture: null }
    ]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { userInfo } = useAppSelector((state) => state.auth);

    // ─── Fetch Categories ─────────────────────────────────────
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/category");
                const data = await res.json();
                setCategories(data.records || []);
            } catch {
                setError("Failed to load categories");
            }
        };

        fetchCategories();
    }, []);

    // ─── Variant Handlers ─────────────────────────────────────
    const addVariant = () => {
        setVariants(prev => [...prev, { name: "", price: 0, stock: 0, picture: null }]);
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariant = <K extends keyof Variant>(
        index: number,
        field: K,
        value: Variant[K]
    ) => {
        setVariants(prev => {
            const copy = [...prev];
            copy[index][field] = value;
            return copy;
        });
    };

    // ─── Submit ───────────────────────────────────────────────
    const handleSubmit = async () => {
        try {
            setError(null);

            // ─── Validation ───────────────────────────────────
            if (!name || !description || !category) {
                return setError("Please fill all required fields");
            }

            if (variants.length === 0) {
                return setError("At least 1 variant required");
            }

            if (variants.some(v => !v.name || v.price <= 0)) {
                return setError("Each variant must have name & price > 0");
            }

            setLoading(true);

            const formData = new FormData();

            formData.append("name", name);
            formData.append("description", description);
            formData.append("category_id", category);

            // ⚠️ sementara hardcode (karena kamu ga pakai auth)
            formData.append("user_id", userInfo?.user_id ?? "");

            formData.append(
                "variants",
                JSON.stringify(
                    variants.map(v => ({
                        name: v.name,
                        price: v.price,
                        stock: v.stock
                    }))
                )
            );

            // ✅ penting: jaga index tetap sinkron
            variants.forEach((v) => {
                formData.append("variant_images", v.picture ?? new Blob());
            });

            const res = await fetch("/api/products", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to create product");

            navigate("/shop/dashboard");

        } catch (err: any) {
            console.log(err.response?.data); // ← shows exact backend message
            alert(err.response?.data?.message || "Failed");
        } finally {
            setLoading(false);
        }
    };

    // ─── UI ───────────────────────────────────────────────────
    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#f8fafc",
                p: 2
            }}
        >
            <Box sx={{ width: 700, maxWidth: "100%" }}>

                {/* Header */}
                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>

                    <Typography fontWeight={700} fontSize={20}>
                        Add Product
                    </Typography>
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Card>
                    <CardContent>
                        <Stack gap={2}>

                            {/* Product Info */}
                            <TextField
                                label="Product Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                            />

                            <TextField
                                label="Description"
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                            />

                            <TextField
                                select
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                fullWidth
                            >
                                {categories.map((c) => (
                                    <MenuItem key={c.category_id} value={c.category_id}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Divider />

                            {/* Variants Header */}
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={600}>
                                    Variants
                                </Typography>

                                <Button
                                    startIcon={<AddRoundedIcon />}
                                    onClick={addVariant}
                                >
                                    Add Variant
                                </Button>
                            </Stack>

                            {/* Variants List */}
                            {variants.map((variant, i) => (
                                <Card key={i} variant="outlined">
                                    <CardContent>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 2,
                                                flexWrap: "wrap",
                                                alignItems: "center"
                                            }}
                                        >
                                            <Box sx={{ flex: "1 1 200px" }}>
                                                <TextField
                                                    label="Variant Name"
                                                    fullWidth
                                                    value={variant.name}
                                                    onChange={(e) =>
                                                        updateVariant(i, "name", e.target.value)
                                                    }
                                                />
                                            </Box>

                                            <Box sx={{ width: 140 }}>
                                                <TextField
                                                    label="Price"
                                                    type="number"
                                                    fullWidth
                                                    value={variant.price}
                                                    onChange={(e) =>
                                                        updateVariant(i, "price", Number(e.target.value))
                                                    }
                                                />
                                            </Box>

                                            <Box sx={{ width: 120 }}>
                                                <TextField
                                                    label="Stock"
                                                    type="number"
                                                    fullWidth
                                                    value={variant.stock}
                                                    onChange={(e) =>
                                                        updateVariant(i, "stock", Number(e.target.value))
                                                    }
                                                />
                                            </Box>

                                            <Box sx={{ width: 150 }}>
                                                <Button
                                                    component="label"
                                                    variant="outlined"
                                                    fullWidth
                                                >
                                                    {variant.picture ? "Change" : "Upload"}
                                                    <input
                                                        hidden
                                                        type="file"
                                                        onChange={(e) =>
                                                            updateVariant(
                                                                i,
                                                                "picture",
                                                                e.target.files?.[0] ?? null
                                                            )
                                                        }
                                                    />
                                                </Button>
                                            </Box>
                                        </Box>

                                        <Box mt={2}>
                                            <Button
                                                color="error"
                                                startIcon={<DeleteRoundedIcon />}
                                                onClick={() => removeVariant(i)}
                                            >
                                                Remove
                                            </Button>
                                        </Box>

                                    </CardContent>
                                </Card>
                            ))}

                            {/* Submit */}
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    bgcolor: PRIMARY,
                                    "&:hover": { bgcolor: "#00502f" }
                                }}
                            >
                                {loading ? "Creating..." : "Create Product"}
                            </Button>

                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}