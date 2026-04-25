/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    FormControl,
    Avatar,
    Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router";

type Category = {
    category_id: string;
    name: string;
};

export default function CreateCategoryPage() {
    const navigate = useNavigate();
    const themeColor = "#16a34a";

    const [name, setName] = useState("");
    const [parent, setParent] = useState("");
    const [icon, setIcon] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    const [categories, setCategories] = useState<Category[]>([]);

    /* ================= GET PARENT ================= */
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

    /* ================= CREATE ================= */
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", name);

            if (parent) formData.append("parent_id", parent);
            if (icon) formData.append("icon", icon);

            const response = await fetch("/api/category", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error();

            navigate("/admin/category-management");
        } catch (error) {
            console.log(error);
            alert("Gagal membuat category");
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                Create Category
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
                        <FormControl fullWidth>
                            {/* <InputLabel id="parent-category-label">
                                Parent Category
                            </InputLabel> */}

                            <Autocomplete
                                options={categories}
                                getOptionLabel={(option) => option.name || ""}
                                value={
                                    categories.find((c) => c.category_id === parent) || null
                                }
                                onChange={(e, value) => {
                                    console.log(e)
                                    setParent(value?.category_id || "");
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Parent Category"
                                        fullWidth
                                    />
                                )}
                            />
                        </FormControl>

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
                                    bgcolor: themeColor,
                                    textTransform: "none",
                                }}
                            >
                                Create Category
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}