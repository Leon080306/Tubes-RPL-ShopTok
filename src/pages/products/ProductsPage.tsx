import {
    Box,
    Card,
    Typography,
    Rating,
    IconButton,
    Button,
    FormControl,
    Select,
    MenuItem,
    InputBase,
    Pagination,
    Chip,
    Tooltip,
    Skeleton,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import banner1 from "../../assets/stock-images/home-bannerHeadset.jpg";

type Product = {
    id: string;
    name: string;
    price: number;
    rating: number;
    description: string;
    category: string;
    image: string;
};

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortPrice, setSortPrice] = useState<"high" | "low" | "">("");
    const [sortRating, setSortRating] = useState<"high" | "low" | "">("");
    const [minRating, setMinRating] = useState<number>(0);
    const [page, setPage] = useState(1);
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "");

    // and add this useEffect to sync if URL changes (e.g. user clicks category again from navbar):
    useEffect(() => {
        setSearch(searchParams.get("search") ?? "");
        setSelectedCategory(searchParams.get("category") ?? "");
        setPage(1);
    }, [searchParams]);

    /* ================= FETCH ================= */
    const getProducts = async () => {
        try {
            const response = await fetch("/api/products", {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();
            setProducts(data.records);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);

    /* ================= FILTER + SORT ================= */
    const filteredProducts = useMemo(() => {
        return products
            .filter((p) => {
                const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
                const matchCategory = selectedCategory ? p.category === selectedCategory : true;
                const matchRating = minRating ? p.rating >= minRating : true;
                return matchSearch && matchCategory && matchRating;
            })
            .sort((a, b) => {
                if (sortPrice === "high") return b.price - a.price;
                if (sortPrice === "low") return a.price - b.price;
                if (sortRating === "high") return b.rating - a.rating;
                if (sortRating === "low") return a.rating - b.rating;
                return 0;
            });
    }, [products, search, selectedCategory, sortPrice, sortRating, minRating]);

    const paginatedProducts = filteredProducts.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const activeFilters = [
        selectedCategory && { label: selectedCategory, clear: () => setSelectedCategory("") },
        sortPrice && { label: sortPrice === "high" ? "Price: High" : "Price: Low", clear: () => setSortPrice("") },
        sortRating && { label: sortRating === "high" ? "Rating: High" : "Rating: Low", clear: () => setSortRating("") },
        minRating > 0 && { label: `Min ${minRating}★`, clear: () => setMinRating(0) },
    ].filter(Boolean) as { label: string; clear: () => void }[];

    const handleResetFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSortPrice("");
        setSortRating("");
        setMinRating(0);
        setPage(1);
    };

    return (
        <Box sx={{ mt: 4 }}>
            {/* HEADER */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>All Products</Typography>
                <Typography sx={{ color: "#777", mt: 0.5 }}>
                    {loading ? "Loading..." : `${filteredProducts.length} products found`}
                </Typography>
            </Box>

            {/* SEARCH */}
            <Box sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                mb: 3,
                border: "1px solid #E0E0E0",
                borderRadius: "14px",
                bgcolor: "white",
            }}>
                <SearchIcon sx={{ color: "#999", mr: 1 }} />
                <InputBase
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    sx={{ flex: 1, py: 1 }}
                />
                {search && (
                    <IconButton onClick={() => setSearch("")} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            {/* FILTERS */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                <FormControl size="small" sx={{ width: 150 }}>
                    <Select
                        displayEmpty
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        renderValue={(v) => v || <span style={{ opacity: 0.5 }}>Category</span>}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        <MenuItem value="Smartphone">Smartphone</MenuItem>
                        <MenuItem value="Headphone">Headphone</MenuItem>
                        <MenuItem value="Earbuds">Earbuds</MenuItem>
                        <MenuItem value="Laptop">Laptop</MenuItem>
                        <MenuItem value="Accessories">Accessories</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ width: 130 }}>
                    <Select
                        displayEmpty
                        value={sortPrice}
                        onChange={(e) => {
                            setSortPrice(e.target.value as "high" | "low" | "");
                            setSortRating("");
                            setPage(1);
                        }}
                        renderValue={(v) =>
                            !v ? <span style={{ opacity: 0.5 }}>Price</span>
                                : v === "high" ? "Highest" : "Lowest"
                        }
                    >
                        <MenuItem value="">All Price</MenuItem>
                        <MenuItem value="high">Highest Price</MenuItem>
                        <MenuItem value="low">Lowest Price</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ width: 130 }}>
                    <Select
                        displayEmpty
                        value={sortRating}
                        onChange={(e) => {
                            setSortRating(e.target.value as "high" | "low" | "");
                            setSortPrice("");
                            setPage(1);
                        }}
                        renderValue={(v) =>
                            !v ? <span style={{ opacity: 0.5 }}>Rating</span>
                                : v === "high" ? "Top Rated" : "Lowest Rated"
                        }
                    >
                        <MenuItem value="">All Rating</MenuItem>
                        <MenuItem value="high">Top Rated</MenuItem>
                        <MenuItem value="low">Lowest Rated</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ width: 130 }}>
                    <Select
                        displayEmpty
                        value={minRating}
                        onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1); }}
                        renderValue={(v) =>
                            !v ? <span style={{ opacity: 0.5 }}>Min Rating</span>
                                : `Min ${v}★`
                        }
                    >
                        <MenuItem value={0}>All</MenuItem>
                        {[1, 2, 3, 4, 5].map((r) => (
                            <MenuItem key={r} value={r}>
                                <Rating value={r} readOnly size="small" sx={{ color: "#16a34a" }} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Tooltip title="Reset Filters">
                    <IconButton
                        onClick={handleResetFilters}
                        sx={{
                            backgroundColor: "#16a34a",
                            color: "white",
                            height: 36,
                            width: 36,
                            borderRadius: 2,
                            "&:hover": { backgroundColor: "#15803d" },
                        }}
                    >
                        <TuneIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* ACTIVE FILTER CHIPS */}
            {activeFilters.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                    {activeFilters.map((f, i) => (
                        <Chip
                            key={i}
                            label={f.label}
                            onDelete={f.clear}
                            size="small"
                            sx={{ bgcolor: "#e8f5e9", color: "#16a34a", fontWeight: 600 }}
                        />
                    ))}
                    <Chip
                        label="Clear all"
                        onClick={handleResetFilters}
                        size="small"
                        sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600, cursor: "pointer" }}
                    />
                </Box>
            )}

            {/* PRODUCT GRID */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 4,
            }}>
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={340} sx={{ borderRadius: 4 }} />
                    ))
                    : paginatedProducts.map((product) => (
                        <Card
                            key={product.id}
                            sx={{
                                cursor: "pointer",
                                borderRadius: 4,
                                boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.27)",
                                p: 2,
                                backgroundColor: "#ffffff",
                                transition: "0.3s",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                },
                            }}
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            <Box sx={{
                                position: "relative",
                                backgroundColor: "#f3f3f3",
                                borderRadius: 3,
                                height: 200,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                mb: 2,
                            }}>
                                <IconButton
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        zIndex: 10,
                                        backgroundColor: "white",
                                        width: 30,
                                        height: 30,
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
                                        "&:hover": {
                                            color: "rgba(255,0,0,0.79)",
                                            backgroundColor: "white",
                                            scale: 1.15,
                                        },
                                    }}
                                >
                                    ❤
                                </IconButton>

                                <Box
                                    component="img"
                                    src={product.image || banner1}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        padding: "16px",
                                        transition: "transform 0.35s ease",
                                        ".MuiCard-root:hover &": { transform: "scale(1.08)" },
                                    }}
                                />
                            </Box>1

                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {product.name}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    ${product.price.toLocaleString()}
                                </Typography>
                            </Box>

                            <Typography variant="body2" sx={{ color: "#757575", mt: 0.5 }} noWrap>
                                {product.description}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                <Rating
                                    value={product.rating}
                                    precision={0.1}
                                    readOnly
                                    size="small"
                                    sx={{ color: "#16a34a" }}
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" />}
                                />
                                <Typography variant="caption" sx={{ color: "#16a34a" }}>
                                    ({product.rating})
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                        border: "1px solid #0f5132",
                                        borderRadius: "999px",
                                        textTransform: "none",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        py: 0.8,
                                        color: "#0f5132",
                                        "&:hover": {
                                            backgroundColor: "#0f5132",
                                            color: "white",
                                        },
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </Box>
                        </Card>
                    ))
                }
            </Box>

            {/* EMPTY STATE */}
            {!loading && filteredProducts.length === 0 && (
                <Box sx={{ textAlign: "center", py: 10 }}>
                    <Typography variant="h6" fontWeight={700}>No products found</Typography>
                    <Typography sx={{ color: "#999", mt: 1 }}>Try adjusting your filters</Typography>
                    <Button onClick={handleResetFilters} sx={{ mt: 2, color: "#16a34a" }}>
                        Reset Filters
                    </Button>
                </Box>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        sx={{
                            "& .MuiPaginationItem-root.Mui-selected": {
                                bgcolor: "#16a34a",
                                color: "white",
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}