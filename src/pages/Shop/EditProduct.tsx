/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
    Box, Card, CardContent, Typography, TextField,
    Button, Stack, MenuItem, IconButton, Alert, Chip
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import { useNavigate, useParams } from "react-router";

const PRIMARY = "#003f29";

interface Category {
    category_id: string;
    name: string;
}

interface Variant {
    variant_id?: string;
    name: string;
    price: number;
    stock: number;
    picture?: File | null;
    existingPicture?: string;
}

export default function EditProductPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [variants, setVariants] = useState<Variant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoryRes] = await Promise.all([
                    fetch(`/api/products/${id}`),
                    fetch("/api/category"),
                ]);

                const productData = await productRes.json();
                const categoryData = await categoryRes.json();
                const product = productData.records;

                // Flatten categories (parent + children all in one flat list)
                const flatCategories: Category[] = (categoryData.records || []).map((c: any) => ({
                    category_id: String(c.category_id),
                    name: c.name,
                }));

                const productCategoryId = String(product.category_id);

                // If product's category isn't in the list (e.g. soft-deleted),
                // add it from the included category object so the select still works
                if (!flatCategories.some(c => c.category_id === productCategoryId)) {
                    const included = product.category;
                    if (included) {
                        flatCategories.unshift({
                            category_id: String(included.category_id),
                            name: `${included.name} (archived)`,
                        });
                    }
                }

                setName(product.name);
                setDescription(product.description);
                setCategory(productCategoryId);
                setCategories(flatCategories);
                setVariants(
                    (product.variants ?? []).map((v: any) => ({
                        variant_id: v.variant_id,
                        name: v.name,
                        price: Number(v.price),
                        stock: v.stock,
                        picture: null,
                        existingPicture: v.picture,
                    }))
                );
            } catch {
                setError("Failed to load product data");
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [id]);

    const addVariant = () => {
        setVariants(prev => [...prev, { name: "", price: 0, stock: 0, picture: null }]);
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariant = <K extends keyof Variant>(index: number, field: K, value: Variant[K]) => {
        setVariants(prev => {
            const copy = [...prev];
            copy[index][field] = value;
            return copy;
        });
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            if (!name || !description || !category) return setError("Please fill all required fields");
            if (variants.length === 0) return setError("At least 1 variant required");
            if (variants.some(v => !v.name || v.price <= 0)) return setError("Each variant must have name & price > 0");

            setLoading(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("category_id", category);

            // Only append real files, track which variant maps to which file index
            let fileIdx = 0;
            const variantsData = variants.map(v => {
                const hasFile = !!v.picture;
                const obj = {
                    variant_id: v.variant_id,
                    name: v.name,
                    price: v.price,
                    stock: v.stock,
                    existingPicture: v.existingPicture,
                    fileIndex: hasFile ? fileIdx : null,
                };
                if (hasFile) fileIdx++;
                return obj;
            });

            formData.append("variants", JSON.stringify(variantsData));
            variants.forEach(v => { if (v.picture) formData.append("variant_images", v.picture); });

            const res = await fetch(`/api/products/${id}`, { method: "PUT", body: formData });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update product");
            }

            navigate("/shop/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <Typography color="text.secondary">Loading product...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            width: "100%", minHeight: "100vh",
            display: "flex", justifyContent: "center",
            bgcolor: "#f8fafc", p: { xs: 2, md: 4 },
        }}>
            <Box sx={{ width: 720, maxWidth: "100%" }}>

                {/* Header */}
                <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            bgcolor: "white", border: "1px solid #e2e8f0",
                            "&:hover": { bgcolor: "#f0fdf4", borderColor: PRIMARY },
                        }}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Box>
                        <Typography fontWeight={700} fontSize={20} color="#0d1f13">Edit Product</Typography>
                        <Typography fontSize={12} color="#94a3b8">Update product info and variants</Typography>
                    </Box>
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                {/* Product Info Card */}
                <Card sx={{ mb: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography fontWeight={600} fontSize={14} color="#64748b" mb={2} textTransform="uppercase" letterSpacing={0.8}>
                            Product Info
                        </Typography>
                        <Stack gap={2}>
                            <TextField
                                label="Product Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                            <TextField
                                label="Description"
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                            <TextField
                                select
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                fullWidth
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            >
                                {categories.map((c) => (
                                    <MenuItem key={c.category_id} value={c.category_id}>{c.name}</MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Variants Card */}
                <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                            <Box>
                                <Typography fontWeight={600} fontSize={14} color="#64748b" textTransform="uppercase" letterSpacing={0.8}>
                                    Variants
                                </Typography>
                                <Typography fontSize={12} color="#94a3b8" mt={0.3}>
                                    {variants.length} variant{variants.length !== 1 ? "s" : ""} total
                                </Typography>
                            </Box>
                            <Button
                                startIcon={<AddRoundedIcon />}
                                onClick={addVariant}
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderRadius: 99, borderColor: PRIMARY, color: PRIMARY,
                                    textTransform: "none", fontWeight: 600,
                                    "&:hover": { bgcolor: "#f0fdf4", borderColor: PRIMARY },
                                }}
                            >
                                Add Variant
                            </Button>
                        </Stack>

                        <Stack gap={2}>
                            {variants.map((variant, i) => {
                                let previewSrc = null;

                                if (variant.picture) {
                                    previewSrc = URL.createObjectURL(variant.picture);
                                } else if (variant.existingPicture) {
                                    previewSrc = `/api/${variant.existingPicture}`;
                                }
                                return (
                                    <Box
                                        key={variant.variant_id ?? i}
                                        sx={{
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            transition: "box-shadow 0.2s",
                                            "&:hover": { boxShadow: "0 4px 16px rgba(0,63,41,0.08)", borderColor: "#b6d9c8" },
                                        }}
                                    >
                                        {/* Variant header strip */}
                                        <Box sx={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            px: 2, py: 1.25, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
                                        }}>
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <DragIndicatorRoundedIcon sx={{ fontSize: 16, color: "#cbd5e1" }} />
                                                <Typography fontSize={13} fontWeight={600} color="#334155">
                                                    Variant {i + 1}
                                                </Typography>
                                                {variant.variant_id && (
                                                    <Chip
                                                        label="Existing"
                                                        size="small"
                                                        sx={{
                                                            height: 18, fontSize: 10, fontWeight: 600,
                                                            bgcolor: "#dcfce7", color: PRIMARY,
                                                            "& .MuiChip-label": { px: 0.75 },
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                            <IconButton
                                                size="small"
                                                onClick={() => removeVariant(i)}
                                                sx={{
                                                    color: "#ef4444", bgcolor: "#fff5f5",
                                                    "&:hover": { bgcolor: "#fee2e2" },
                                                    width: 28, height: 28,
                                                }}
                                            >
                                                <DeleteRoundedIcon sx={{ fontSize: 15 }} />
                                            </IconButton>
                                        </Box>

                                        {/* Variant body */}
                                        <Box sx={{ p: 2 }}>
                                            <Stack direction="row" gap={2} alignItems="flex-start" flexWrap="wrap">

                                                {/* Image preview / upload */}
                                                <Box sx={{ flexShrink: 0 }}>
                                                    <Box
                                                        component="label"
                                                        sx={{
                                                            display: "block", cursor: "pointer",
                                                            width: 80, height: 80, borderRadius: 2,
                                                            border: "2px dashed",
                                                            borderColor: previewSrc ? PRIMARY : "#cbd5e1",
                                                            overflow: "hidden", position: "relative",
                                                            bgcolor: previewSrc ? "transparent" : "#f8fafc",
                                                            transition: "all 0.2s",
                                                            "&:hover": { borderColor: PRIMARY, bgcolor: "#f0fdf4" },
                                                        }}
                                                    >
                                                        {previewSrc ? (
                                                            <Box
                                                                component="img"
                                                                src={previewSrc}
                                                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                            />
                                                        ) : (
                                                            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                                                                <ImageRoundedIcon sx={{ fontSize: 24, color: "#94a3b8" }} />
                                                                <Typography fontSize={9} color="#94a3b8" mt={0.5}>Upload</Typography>
                                                            </Stack>
                                                        )}
                                                        <input
                                                            hidden
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => updateVariant(i, "picture", e.target.files?.[0] ?? null)}
                                                        />
                                                    </Box>
                                                    <Typography fontSize={10} color="#94a3b8" mt={0.5} textAlign="center">
                                                        {variant.picture ? "New" : variant.existingPicture ? "Saved" : "No image"}
                                                    </Typography>
                                                </Box>

                                                {/* Fields */}
                                                <Stack gap={1.5} sx={{ flex: 1, minWidth: 0 }}>
                                                    <TextField
                                                        label="Variant Name"
                                                        size="small"
                                                        fullWidth
                                                        value={variant.name}
                                                        onChange={(e) => updateVariant(i, "name", e.target.value)}
                                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                    />
                                                    <Stack direction="row" gap={1.5}>
                                                        <TextField
                                                            label="Price (Rp)"
                                                            size="small"
                                                            type="number"
                                                            fullWidth
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                        />
                                                        <TextField
                                                            label="Stock"
                                                            size="small"
                                                            type="number"
                                                            fullWidth
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </Box>
                                );
                            })}

                            {variants.length === 0 && (
                                <Box sx={{
                                    border: "2px dashed #e2e8f0", borderRadius: 3,
                                    py: 5, textAlign: "center",
                                }}>
                                    <Typography fontSize={13} color="#94a3b8">No variants yet</Typography>
                                    <Typography fontSize={12} color="#cbd5e1" mt={0.5}>Click "Add Variant" to get started</Typography>
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        mt: 3, py: 1.5, borderRadius: 99,
                        bgcolor: PRIMARY, fontWeight: 700, fontSize: 15,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#00502f" },
                        "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                    }}
                >
                    {loading ? "Saving changes..." : "Save Changes"}
                </Button>

            </Box>
        </Box>
    );
}