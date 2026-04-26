/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Avatar,
    MenuItem,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";

type Category = {
    category_id: string;
    name: string;
    icon: string;
};

export default function EditCategoryPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [parent, setParent] = useState("");
    const [icon, setIcon] = useState<File | null>(null);
    const [preview, setPreview] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);

    /* ================= GET CATEGORY ================= */
    const getCategory = async () => {
        try {
            const res = await fetch(`/api/category/${id}`);
            const data = await res.json();

            setName(data.name);
            setParent(data.parent_id ?? "");
            setPreview(`${data.icon}`);
        } catch (error) {
            console.log(error);
        }
    };

    /* ================= GET PARENTS ================= */
    const getCategories = async () => {
        try {
            const res = await fetch("/api/category");
            const data = await res.json();

            setCategories(data.records || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCategory();
        getCategories();
    }, []);

    /* ================= IMAGE ================= */
    const handleImage = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setIcon(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    /* ================= UPDATE ================= */
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", name);
            if (parent) {
                formData.append("parent_id", parent);
            } else {
                formData.append("parent_id", "null");
            }

            if (icon) {
                formData.append("icon", icon);
            }

            const response = await fetch(`/api/category/${id}`, {
                method: "PUT",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error();

            navigate("/admin/category-management");
        } catch (error) {
            console.log(error);
            alert("Gagal update category");
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                Edit Category
            </Typography>

            <Paper sx={{ p: 4, borderRadius: "20px" }}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                        {/* NAME */}
                        <TextField
                            label="Category Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                        />

                        {/* PARENT */}
                        <TextField
                            select
                            label="Parent Category"
                            value={parent}
                            onChange={(e) => setParent(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">None</MenuItem>

                            {categories
                                .filter((c) => c.category_id !== id)
                                .map((cat) => (
                                    <MenuItem
                                        key={cat.category_id}
                                        value={cat.category_id}
                                    >
                                        {cat.name}
                                    </MenuItem>
                                ))}
                        </TextField>

                        {/* IMAGE */}
                        <Box>
                            <Typography sx={{ mb: 1 }}>
                                Category Icon
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                            >
                                Upload Icon
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleImage}
                                />
                            </Button>

                            {preview && (
                                <Box sx={{ mt: 2 }}>
                                    <Avatar
                                        src={preview}
                                        variant="rounded"
                                        sx={{
                                            width: 100,
                                            height: 100
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* BUTTON */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/admin/category-management")}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    bgcolor: "#3b82f6",
                                    textTransform: "none",
                                }}
                            >
                                Update Category
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}