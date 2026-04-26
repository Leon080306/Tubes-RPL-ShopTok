import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
    Stack,
    Avatar,
    Divider,
} from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { authActions } from "../../store/authSlice";

const PRIMARY = "#003f29";
const BG = "#f0f3f7";

export default function CreateShopPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const { userInfo } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (!userInfo?.user_id) return alert("User not logged in");
            if (!name.trim()) return alert("Shop name is required");

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("owner_id", userInfo.user_id);
            if (profilePic) formData.append("profile_pic", profilePic);
            if (banner) formData.append("banner", banner);

            const res = await axios.post("/api/shops", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Handle both possible response structures
            const shopData = res.data.records ?? res.data.data ?? res.data;
            console.log("Created shop data:", shopData);

            if (shopData) {
                dispatch(authActions.setShopInfo(shopData));

                // Also update user role to seller if not already
                if (userInfo.role !== "seller") {
                    dispatch(authActions.setUserInfo({
                        ...userInfo,
                        role: "seller" as const,
                    }));
                }
            }

            alert("Shop created successfully!");
            navigate("/shop/dashboard");

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                console.error(err.response?.data);
                alert(err.response?.data?.message || "Failed to create shop");
            } else {
                console.error(err);
                alert("Failed to create shop");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
        }}>
            <Box sx={{ p: 3, minHeight: "100vh", bgcolor: BG, width: "50%" }}>
                {/* HEADER */}
                <Box mb={2.5}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0d1f13" }}>
                        Create Your Shop 🏪
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                        Build your store identity and start selling
                    </Typography>
                </Box>

                {/* MAIN CARD */}
                <Card sx={{ maxWidth: 700 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={2}>
                            <StorefrontRoundedIcon sx={{ color: PRIMARY }} />
                            <Typography sx={{ fontWeight: 700, color: "#0d1f13" }}>
                                Shop Information
                            </Typography>
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        <Stack gap={2}>
                            <TextField
                                label="Shop Name"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            {/* PROFILE PIC */}
                            <Box>
                                <Typography sx={{ fontSize: 13, mb: 1, color: "#64748b" }}>
                                    Profile Picture
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={2}>
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: "#e2e8f0" }}>
                                        {profilePic ? (
                                            <Box
                                                component="img"
                                                src={URL.createObjectURL(profilePic)}
                                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <ImageIcon />
                                        )}
                                    </Avatar>
                                    <Stack>
                                        <Button variant="outlined" component="label">
                                            Upload
                                            <input
                                                hidden
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                                            />
                                        </Button>
                                        {profilePic && (
                                            <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.5 }}>
                                                {profilePic.name}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Box>

                            {/* BANNER */}
                            <Box>
                                <Typography sx={{ fontSize: 13, mb: 1, color: "#64748b" }}>
                                    Banner Image
                                </Typography>
                                {banner && (
                                    <Box
                                        component="img"
                                        src={URL.createObjectURL(banner)}
                                        sx={{
                                            width: "100%", height: 120, objectFit: "cover",
                                            borderRadius: 1, mb: 1, border: "1px solid #e2e8f0",
                                        }}
                                    />
                                )}
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Button variant="outlined" component="label">
                                        Upload Banner
                                        <input
                                            hidden
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setBanner(e.target.files?.[0] || null)}
                                        />
                                    </Button>
                                    {banner && (
                                        <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                                            {banner.name}
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>

                            {/* ACTION */}
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !name.trim()}
                                variant="contained"
                                sx={{
                                    mt: 2,
                                    bgcolor: PRIMARY,
                                    "&:hover": { bgcolor: "#012d1d" },
                                    "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                {loading ? "Creating..." : "Create Shop"}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}