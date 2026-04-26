/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    IconButton,
    Button,
    Select,
    MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import InputBase from "@mui/material/InputBase";
import SortIcon from "@mui/icons-material/Sort";
import { useNavigate } from "react-router";

type Category = {
    id: string;
    name: string;
    icon: string;
    parent?: string;
};

export default function CategoryManagementPage() {
    const navigate = useNavigate();
    const themeColor = "#3b82f6";

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sortNama, setSortNama] = useState("");

    /* ================= FETCH ================= */
    const getCategories = async () => {
        try {
            const response = await fetch("/api/category", {
                credentials: "include",
            });

            const data = await response.json();

            const mapped: Category[] = data.records.map((c: any) => ({
                id: c.category_id,
                name: c.name,
                icon: c.icon,
                parent: c.parent?.name || "-",
            }));

            setCategories(mapped);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    /* ================= DELETE ================= */
    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus category?")) return;

        try {
            const response = await fetch(`/api/category/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) throw new Error();

            setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (error) {
            alert("Gagal delete" + error);
        }
    };

    /* ================= FILTER + SORT ================= */
    const filteredCategories = useMemo(() => {
        return categories
            .filter((c) =>
                c.name.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => {
                if (sortNama === "asc") return a.name.localeCompare(b.name);
                if (sortNama === "desc") return b.name.localeCompare(a.name);
                return 0;
            });
    }, [categories, search, sortNama]);

    if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* HEADER */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between" }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Category Management
                    </Typography>
                    <Typography sx={{ color: "#666", mt: 1 }}>
                        Kelola semua kategori
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/admin/create-category")}
                    sx={{
                        bgcolor: themeColor,
                        borderRadius: "10px",
                        textTransform: "none",
                        height: "40px",
                    }}
                >
                    Tambah Category
                </Button>
            </Box>

            {/* SEARCH */}
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        border: "1px solid #E0E0E0",
                        borderRadius: "14px",
                    }}
                >
                    <SearchIcon sx={{ color: "#999", mr: 1 }} />
                    <InputBase
                        placeholder="Cari kategori..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flex: 1 }}
                    />
                    {search && (
                        <IconButton onClick={() => setSearch("")}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* SORT */}
            <Box sx={{ mb: 3 }}>
                <Select
                    value={sortNama}
                    onChange={(e) => setSortNama(e.target.value)}
                    displayEmpty
                    IconComponent={SortIcon}
                >
                    <MenuItem value="">Urutkan</MenuItem>
                    <MenuItem value="asc">A-Z</MenuItem>
                    <MenuItem value="desc">Z-A</MenuItem>
                </Select>
            </Box>

            {/* TABLE */}
            <Paper sx={{ borderRadius: "20px", overflow: "hidden" }}>
                <Box sx={{ display: "flex", px: 3, py: 2, bgcolor: "#FAFAFA" }}>
                    <Box sx={{ width: "40%" }}>Category</Box>
                    <Box sx={{ width: "30%" }}>Parent</Box>
                    <Box sx={{ width: "30%", textAlign: "right" }}>Aksi</Box>
                </Box>

                {filteredCategories.map((cat) => (
                    <Box key={cat.id} sx={{ display: "flex", px: 3, py: 2 }}>
                        <Box sx={{ width: "40%", display: "flex", gap: 2 }}>
                            <img src={`/api/${cat.icon}`} alt="" style={{
                                width: "56px",
                                height: "56px",
                            }} />

                            <Box>
                                <Typography sx={{ fontWeight: 700 }}>
                                    {cat.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ width: "30%" }}>
                            <Typography>{cat.parent}</Typography>
                        </Box>

                        <Box
                            sx={{
                                width: "30%",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                            }}
                        >
                            <IconButton
                                onClick={() =>
                                    navigate(`/admin/edit-category/${cat.id}`)
                                }
                            >
                                <EditIcon />
                            </IconButton>

                            <IconButton
                                onClick={() => handleDelete(cat.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ))}

                {filteredCategories.length === 0 && (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography>
                            Tidak ada category ditemukan
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}