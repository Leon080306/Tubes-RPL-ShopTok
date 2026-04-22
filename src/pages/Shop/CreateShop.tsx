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

// sama seperti dashboard kamu
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

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (!userInfo?.user_id) return alert("User not logged in");

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);

            formData.append("owner_id", userInfo?.user_id);

            if (profilePic) formData.append("profile_pic", profilePic);
            if (banner) formData.append("banner", banner);

            const res = await axios.post(
                "api/shops",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Shop created!");
            navigate("/shop/dashboard");
            console.log(res.data);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.log(err.response?.data);  // ← shows the actual backend message
            alert(err.response?.data?.message || "Failed to create shop");
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
            <Box
                sx={{
                    p: 3,
                    minHeight: "100vh",
                    bgcolor: BG,
                    width: '50%',
                }}
            >
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
                        {/* TITLE */}
                        <Stack direction="row" alignItems="center" gap={1} mb={2}>
                            <StorefrontRoundedIcon sx={{ color: PRIMARY }} />
                            <Typography sx={{ fontWeight: 700, color: "#0d1f13" }}>
                                Shop Information
                            </Typography>
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        {/* NAME */}
                        <Stack gap={2}>
                            <TextField
                                label="Shop Name"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                                        <ImageIcon />
                                    </Avatar>

                                    <Button variant="outlined" component="label">
                                        Upload
                                        <input
                                            hidden
                                            type="file"
                                            onChange={(e) =>
                                                setProfilePic(e.target.files?.[0] || null)
                                            }
                                        />
                                    </Button>
                                </Stack>
                            </Box>

                            {/* BANNER */}
                            <Box>
                                <Typography sx={{ fontSize: 13, mb: 1, color: "#64748b" }}>
                                    Banner Image
                                </Typography>

                                <Button variant="outlined" component="label">
                                    Upload Banner
                                    <input
                                        hidden
                                        type="file"
                                        onChange={(e) => setBanner(e.target.files?.[0] || null)}
                                    />
                                </Button>
                            </Box>

                            {/* ACTION */}
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                variant="contained"
                                sx={{
                                    mt: 2,
                                    bgcolor: PRIMARY,
                                    "&:hover": { bgcolor: "#012d1d" },
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