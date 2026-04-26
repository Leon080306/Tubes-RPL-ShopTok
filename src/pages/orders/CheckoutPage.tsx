import React, { useEffect, useState } from "react";
import {
    Box, Container, Typography, TextField, Button, Radio, RadioGroup,
    FormControlLabel, Checkbox, Divider, InputLabel, InputAdornment,
    Breadcrumbs, Link, FormControl, Select, MenuItem, Switch, Stack,
} from "@mui/material";
import { useNavigate } from "react-router";
import HomeIcon from "@mui/icons-material/Home";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAppSelector } from "../../hooks/useAppSelector";
import formatPrice from "../../utils/FormatPrice";
import type { Address, CartItem } from "../../type";

import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAddress(data: any) {
    const addr = data.address;
    return {
        province: addr.state || "",
        city: addr.city || addr.town || addr.county || "",
        district: addr.suburb || addr.village || "",
        postalCode: addr.postcode || "",
        fullAddress: [addr.amenity, addr.road, addr.house_number].filter(Boolean).join(", "),
    };
}

function MapController({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, 16);
    }, [position, map]);
    return null;
}

function LocationMarker({
    setPosition,
    onAddressParsed,
}: {
    setPosition: (pos: [number, number]) => void;
    onAddressParsed: (addr: ReturnType<typeof parseAddress>) => void;
}) {
    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            onAddressParsed(parseAddress(data));
        },
    });
    return null;
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { userInfo } = useAppSelector((state) => state.auth);
    const user_id = userInfo?.user_id;

    const [isReturningCustomer, setIsReturningCustomer] = React.useState(false);
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ================= ADDRESS FORM STATE =================
    const [position, setPosition] = useState<[number, number]>([-6.2, 106.816666]);
    const [addrForm, setAddrForm] = useState({
        receiver: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        postalCode: "",
        fullAddress: "",
        isDefault: false,
    });
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    const handleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddrForm((prev) => ({ ...prev, [name]: value }));
    };

    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setPosition([lat, lng]);

            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            const parsed = parseAddress(data);
            setAddrForm((prev) => ({
                ...prev,
                province: parsed.province,
                city: parsed.city,
                district: parsed.district,
                postalCode: parsed.postalCode,
                fullAddress: parsed.fullAddress,
            }));
        });
    };

    const handleSaveAddress = async () => {
        if (!user_id) return;
        if (!addrForm.receiver || !addrForm.phone || !addrForm.fullAddress) {
            return alert("Lengkapi semua field yang wajib diisi!");
        }

        setIsSavingAddress(true);
        try {
            const payload = {
                user_id: userInfo?.user_id,
                full_name: addrForm.receiver,
                address: addrForm.fullAddress,
                province: addrForm.province,
                city: addrForm.city,
                sub_district: addrForm.district,
                phone_number: addrForm.phone,
                is_default: addrForm.isDefault,
            };

            const isEditing = addresses.some(a => a.address_id === selectedAddressId);

            const res = await fetch(
                isEditing ? `/api/address/${selectedAddressId}` : `/api/address/`,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            if (!res.ok) return alert("Gagal simpan alamat: " + data.message);

            alert(isEditing ? "Alamat berhasil diupdate!" : "Alamat berhasil disimpan!");

            const addrRes = await fetch(`/api/address/${user_id}`);
            const addrData = await addrRes.json();
            setAddresses(addrData);

            if (!isEditing) {
                if (data.address_id) {
                    setSelectedAddressId(data.address_id);
                } else {
                    const newest = addrData[addrData.length - 1];
                    if (newest) setSelectedAddressId(newest.address_id);
                }
            }

            setIsReturningCustomer(true);

            setAddrForm({
                receiver: "", phone: "", province: "", city: "",
                district: "", postalCode: "", fullAddress: "", isDefault: false,
            });
        } catch (error) {
            console.error(error);
            alert("Gagal simpan alamat");
        } finally {
            setIsSavingAddress(false);
        }
    };

    // ================= FETCH CART =================
    useEffect(() => {
        if (!user_id) return;
        const getCart = async () => {
            try {
                const res = await fetch(`/api/cart?user_id=${user_id}`);
                const data = await res.json();
                setSelectedItems(data.data.filter((item: CartItem) => item.is_selected));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        getCart();
    }, [user_id]);

    // ================= FETCH ADDRESSES =================
    useEffect(() => {
        if (!user_id) return;
        const getAddresses = async () => {
            try {
                const res = await fetch(`/api/address/${user_id}`);
                const data = await res.json();
                setAddresses(data);
                const def = data.find((a: Address) => a.is_default) ?? data[0];
                if (def) {
                    setSelectedAddressId(def.address_id);
                    setIsReturningCustomer(true);
                }
            } catch (error) {
                console.error(error);
            }
        };
        getAddresses();
    }, [user_id]);

    // ================= TOTALS =================
    const subtotal = selectedItems.reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity, 0
    );
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    // ================= STOCK WARNINGS =================
    const hasStockIssue = selectedItems.some(
        item => item.quantity > (item.variant?.stock ?? 0)
    );

    // ================= CHECKOUT =================
    const handleCheckout = async () => {
        if (!selectedAddressId) return alert("Pilih alamat pengiriman dulu!");
        if (!user_id) return;
        if (selectedItems.length === 0) return alert("Tidak ada item yang dipilih!");
        if (hasStockIssue) return alert("Ada item yang melebihi stok! Kembali ke cart untuk menyesuaikan.");

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/orders/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: user_id,
                    address_id: selectedAddressId,
                }),
            });

            const data = await res.json();
            if (!res.ok) return alert("Checkout gagal: " + data.message);

            alert("Checkout berhasil!");
            navigate("/orders");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const border = "#E5E5E5";
    const green = "#0B5D3B";
    const light = "#F6F6F6";

    const input = {
        "& .MuiOutlinedInput-root": {
            height: "42px",
            fontSize: "13px",
            borderRadius: "6px",
        },
    };

    if (loading) return <div>Loading...</div>;

    // ================= EMPTY STATE =================
    if (selectedItems.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "50vh",
                    gap: 2,
                }}>
                    <Typography variant="h6" color="text.secondary">
                        Tidak ada item yang dipilih untuk checkout
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/cart")}
                        sx={{ backgroundColor: green, borderRadius: 50 }}
                    >
                        Kembali ke Keranjang
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumb */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link
                    onClick={() => navigate("/")}
                    underline="hover"
                    sx={{ display: "flex", alignItems: "center", fontSize: "12px", cursor: "pointer" }}
                    color="inherit"
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                </Link>
                <Link
                    onClick={() => navigate("/cart")}
                    underline="hover"
                    sx={{ display: "flex", alignItems: "center", fontSize: "12px", cursor: "pointer" }}
                    color="inherit"
                >
                    Cart
                </Link>
                <Typography
                    sx={{ display: "flex", alignItems: "center", fontSize: "12px", fontWeight: "bold" }}
                    color="text.primary"
                >
                    Checkout
                </Typography>
            </Breadcrumbs>

            {/* MAIN LAYOUT */}
            <Box display="flex" gap={3} alignItems="flex-start">
                {/* ================= LEFT ================= */}
                <Box flex={6}>
                    {/* REVIEW BOX */}
                    <Box border={`1px solid ${border}`} borderRadius={2} p={3} mb={3}>
                        <Typography fontWeight={600} mb={2} fontSize={22}>
                            Review Item And Shipping
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={2}>
                            {selectedItems.map(item => {
                                const stock = item.variant?.stock ?? 0;
                                const exceedsStock = item.quantity > stock;

                                return (
                                    <Box key={item.variant_id} display="flex" justifyContent="space-between"
                                        sx={{
                                            opacity: exceedsStock ? 0.6 : 1,
                                            border: exceedsStock ? "1px solid #d32f2f" : "none",
                                            borderRadius: exceedsStock ? 2 : 0,
                                            p: exceedsStock ? 1.5 : 0,
                                        }}
                                    >
                                        <Box display="flex" gap={2}>
                                            <Box sx={{
                                                width: 110, height: 110, background: light,
                                                borderRadius: 2, display: "flex",
                                                alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Box
                                                    component="img"
                                                    src={item.variant.picture ? `/api/${item.variant.picture}` : "/placeholder.png"}
                                                    sx={{ width: 80, height: 80, objectFit: "contain" }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight={600}>{item.variant.product.name}</Typography>
                                                <Typography fontSize={13} color="gray">{item.variant.name}</Typography>
                                                <Typography fontSize={13} color="gray">
                                                    Toko: {item.variant.product.shop?.name}
                                                </Typography>
                                                {exceedsStock && (
                                                    <Typography fontSize={12} color="#d32f2f" fontWeight={600} mt={0.5}>
                                                        ⚠ Stok tidak cukup (sisa: {stock})
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography fontWeight={600}>
                                                {formatPrice(Number(item.variant.price))}
                                            </Typography>
                                            <Typography fontSize={13}>Quantity: {item.quantity}</Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {hasStockIssue && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff3f3", borderRadius: 2, border: "1px solid #ffcdd2" }}>
                                <Typography fontSize={13} color="#d32f2f" fontWeight={600}>
                                    ⚠ Beberapa item melebihi stok yang tersedia. Kembali ke cart untuk menyesuaikan quantity.
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => navigate("/cart")}
                                    sx={{ mt: 1, color: "#d32f2f", textTransform: "none", fontWeight: 600, p: 0 }}
                                >
                                    ← Kembali ke Cart
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* RETURNING CUSTOMER */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={isReturningCustomer}
                                onChange={(e) => setIsReturningCustomer(e.target.checked)}
                                sx={{ color: green, "&.Mui-checked": { color: green } }}
                            />
                        }
                        label={<Typography fontSize={13}>Returning Customer?</Typography>}
                        sx={{ mb: 2 }}
                    />

                    {/* DELIVERY BOX */}
                    <Box border={`1px solid ${border}`} borderRadius={2} p={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography fontWeight={800} fontSize={22}>
                                Delivery Information
                            </Typography>
                            {isReturningCustomer && (
                                <Button
                                    size="small"
                                    sx={{
                                        background: "#eee", borderRadius: "20px",
                                        fontSize: 12, textTransform: "none", px: 2, color: "#000",
                                    }}
                                    onClick={() => {
                                        const addr = addresses.find(a => a.address_id === selectedAddressId);
                                        if (addr) {
                                            setAddrForm({
                                                receiver: addr.full_name || "",
                                                phone: addr.phone_number || "",
                                                province: addr.province || "",
                                                city: addr.city || "",
                                                district: addr.sub_district || "",
                                                postalCode: "",
                                                fullAddress: addr.address || "",
                                                isDefault: addr.is_default || false,
                                            });
                                        }
                                        setIsReturningCustomer(false);
                                    }}
                                >
                                    Edit
                                </Button>
                            )}
                        </Box>

                        {isReturningCustomer ? (
                            /* ================= RETURNING: SELECT & SHOW ADDRESS ================= */
                            <Box>
                                {addresses.length > 0 ? (
                                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                        <Typography fontSize={12} mb={0.5} fontWeight="bold">
                                            Pilih Alamat Pengiriman*
                                        </Typography>
                                        <Select
                                            value={selectedAddressId}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                        >
                                            {addresses.map((addr) => (
                                                <MenuItem key={addr.address_id} value={addr.address_id}>
                                                    {addr.full_name} — {addr.address}, {addr.city}
                                                    {addr.is_default ? " (Default)" : ""}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Typography fontSize={13} color="error" mb={2}>
                                        Belum ada alamat tersimpan.
                                    </Typography>
                                )}

                                {(() => {
                                    const addr = addresses.find(a => a.address_id === selectedAddressId);
                                    if (!addr) return null;
                                    return (
                                        <Box sx={{ mt: 1, p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}>
                                            <Typography fontWeight={600} mb={0.5}>
                                                {addr.full_name}
                                            </Typography>
                                            <Typography fontSize={13} color="#666">
                                                {addr.phone_number}
                                            </Typography>
                                            <Typography fontSize={13} color="#666" mt={0.5}>
                                                {addr.address}
                                            </Typography>
                                            <Typography fontSize={13} color="#666">
                                                {[addr.sub_district, addr.city, addr.province].filter(Boolean).join(", ")}
                                            </Typography>
                                        </Box>
                                    );
                                })()}
                            </Box>
                        ) : (
                            /* ================= NEW ADDRESS FORM WITH MAP ================= */
                            <Box width="100%">
                                <Button
                                    variant="outlined"
                                    onClick={getCurrentLocation}
                                    fullWidth
                                    sx={{ color: green, borderColor: green, mb: 2 }}
                                >
                                    📍 Use Current Location
                                </Button>

                                <Box sx={{ height: 180, mb: 2, borderRadius: 2, overflow: "hidden" }}>
                                    <MapContainer
                                        center={position}
                                        zoom={13}
                                        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
                                    >
                                        <TileLayer
                                            attribution="&copy; OpenStreetMap contributors"
                                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        />
                                        <Marker position={position} />
                                        <LocationMarker
                                            setPosition={setPosition}
                                            onAddressParsed={(parsed) =>
                                                setAddrForm((prev) => ({
                                                    ...prev,
                                                    province: parsed.province,
                                                    city: parsed.city,
                                                    district: parsed.district,
                                                    postalCode: parsed.postalCode,
                                                    fullAddress: parsed.fullAddress,
                                                }))
                                            }
                                        />
                                        <MapController position={position} />
                                    </MapContainer>
                                </Box>

                                {addrForm.fullAddress && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="grey">
                                            {addrForm.fullAddress}
                                        </Typography>
                                        <Typography variant="body2" color="grey">
                                            {[addrForm.district, addrForm.city, addrForm.province, addrForm.postalCode && `ID ${addrForm.postalCode}`].filter(Boolean).join(", ")}
                                        </Typography>
                                    </Box>
                                )}

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    KONTAK
                                </Typography>

                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth size="small" label="Nama Penerima"
                                        name="receiver" value={addrForm.receiver}
                                        onChange={handleAddrChange} required
                                    />
                                    <TextField
                                        fullWidth size="small" label="Nomor Telepon"
                                        name="phone" value={addrForm.phone}
                                        onChange={handleAddrChange} required
                                    />
                                </Stack>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    ALAMAT
                                </Typography>

                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            fullWidth size="small" label="Provinsi"
                                            name="province" value={addrForm.province}
                                            onChange={handleAddrChange} required
                                        />
                                        <TextField
                                            fullWidth size="small" label="Kota / Kabupaten"
                                            name="city" value={addrForm.city}
                                            onChange={handleAddrChange} required
                                        />
                                    </Stack>
                                    <TextField
                                        fullWidth size="small" label="Kecamatan"
                                        name="district" value={addrForm.district}
                                        onChange={handleAddrChange} required
                                    />
                                    <TextField
                                        fullWidth size="small" label="Alamat Lengkap"
                                        name="fullAddress" multiline rows={3}
                                        value={addrForm.fullAddress}
                                        onChange={handleAddrChange} required
                                    />
                                </Stack>

                                <Box sx={{ py: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={addrForm.isDefault}
                                                onChange={(e) => setAddrForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                                sx={{
                                                    "& .MuiSwitch-switchBase.Mui-checked": { color: green },
                                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: green },
                                                }}
                                            />
                                        }
                                        label="Atur sebagai Alamat Utama"
                                    />
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={isSavingAddress}
                                    onClick={handleSaveAddress}
                                    sx={{
                                        bgcolor: green, py: 1.5, fontWeight: 700,
                                        borderRadius: 2, "&:hover": { bgcolor: "#084c30" },
                                    }}
                                >
                                    {isSavingAddress ? "Menyimpan..." : "Simpan Alamat"}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ================= RIGHT ================= */}
                <Box flex={3} sx={{ position: "sticky", top: 24 }}>
                    <Box border={`1px solid ${border}`} borderRadius={2} p={3}>
                        <Typography fontWeight={600} mb={2} fontSize={22}>
                            Order Summary
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* ITEM LIST */}
                        <Box display="flex" flexDirection="column" gap={1} mb={2}>
                            {selectedItems.map(item => (
                                <Box key={item.variant_id} display="flex" justifyContent="space-between">
                                    <Typography fontSize={13} color="#555" flex={1} sx={{
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mr: 1,
                                    }}>
                                        {item.variant.product.name} ({item.variant.name}) x{item.quantity}
                                    </Typography>
                                    <Typography fontSize={13} fontWeight={500} whiteSpace="nowrap">
                                        {formatPrice(Number(item.variant.price) * item.quantity)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* COUPON */}
                        <Box display="flex" bgcolor={light} borderRadius="30px" p={0.5} mb={3}>
                            <input
                                placeholder="Enter Coupon Code"
                                style={{
                                    flex: 1, border: "none", outline: "none",
                                    background: "transparent", paddingLeft: 12, fontSize: 13,
                                }}
                            />
                            <Button
                                sx={{
                                    background: green, color: "#fff", borderRadius: "30px",
                                    px: 1, fontSize: 12, textTransform: "none",
                                    "&:hover": { background: "#084c30" },
                                }}
                            >
                                Apply coupon
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography fontWeight={600} mb={1}>Payment Details</Typography>

                        <Divider sx={{ my: 2 }} />

                        <RadioGroup defaultValue="card">
                            {["Cash on Delivery", "Shopcart Card", "Paypal"].map((i) => (
                                <FormControlLabel
                                    key={i}
                                    value={i}
                                    control={<Radio size="small" />}
                                    label={<Typography fontSize={13}>{i}</Typography>}
                                />
                            ))}
                            <FormControlLabel
                                value="card"
                                control={
                                    <Radio size="small" sx={{ color: green, "&.Mui-checked": { color: green } }} />
                                }
                                label={<Typography fontSize={13} fontWeight={600}>Credit or Debit card</Typography>}
                            />
                        </RadioGroup>

                        {/* CARD FORM */}
                        <Box mt={2}>
                            <InputLabel sx={{ mb: 1, fontWeight: "bold", color: "#000", fontSize: 14 }}>
                                Email*
                            </InputLabel>
                            <TextField fullWidth size="small" placeholder="Type here..." sx={{ ...input, mb: 2 }} />

                            <InputLabel sx={{ mb: 1, fontWeight: "bold", color: "#000", fontSize: 14 }}>
                                Card Holder Name*
                            </InputLabel>
                            <TextField fullWidth size="small" placeholder="Type here..." sx={{ ...input, mb: 2 }} />

                            <InputLabel sx={{ mb: 1, fontWeight: "bold", color: "#000", fontSize: 14 }}>
                                Card Number*
                            </InputLabel>
                            <TextField
                                fullWidth size="small" placeholder="0000*****1245"
                                sx={{ ...input, mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CreditCardIcon sx={{ fontSize: 18, color: "#9e9e9e" }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box display="flex" gap={2}>
                                <Box flex={1}>
                                    <InputLabel sx={{ mb: 1, fontWeight: "bold", color: "#000", fontSize: 14 }}>
                                        Expiry
                                    </InputLabel>
                                    <TextField fullWidth size="small" placeholder="MM/YY" sx={input} />
                                </Box>
                                <Box flex={1}>
                                    <InputLabel sx={{ mb: 1, fontWeight: "bold", color: "#000", fontSize: 14 }}>
                                        CVC
                                    </InputLabel>
                                    <TextField fullWidth size="small" placeholder="000" sx={input} />
                                </Box>
                            </Box>
                        </Box>

                        {/* ===== PRICE SUMMARY ===== */}
                        <Box mt={3}>
                            {[
                                { label: "Sub Total", value: formatPrice(subtotal) },
                                { label: "Coupon Discount", value: `-${formatPrice(0)}` },
                                { label: "Shipping Cost", value: formatPrice(shippingCost) },
                            ].map((item) => (
                                <Box key={item.label} display="flex" justifyContent="space-between" mb={1.5}>
                                    <Typography fontSize={14} color="#000" fontWeight="bold">
                                        {item.label}
                                    </Typography>
                                    <Typography fontSize={14} color="#555">
                                        {item.value}
                                    </Typography>
                                </Box>
                            ))}

                            <Box sx={{ borderTop: "1px solid #E5E5E5", my: 2 }} />

                            <Box display="flex" justifyContent="space-between" mb={3}>
                                <Typography fontWeight={700} fontSize={15}>Total</Typography>
                                <Typography fontWeight={700} fontSize={15}>{formatPrice(total)}</Typography>
                            </Box>

                            <Button
                                fullWidth
                                disabled={isSubmitting || selectedItems.length === 0 || !selectedAddressId || hasStockIssue}
                                onClick={handleCheckout}
                                sx={{
                                    background: green, color: "#fff", borderRadius: "30px",
                                    py: 1.5, fontSize: 14, fontWeight: 600, textTransform: "none",
                                    "&:hover": { background: "#084c30" },
                                    "&.Mui-disabled": { background: "#ccc", color: "#888" },
                                }}
                            >
                                {isSubmitting ? "Memproses..." : `Pay ${formatPrice(total)}`}
                            </Button>

                            {!selectedAddressId && (
                                <Typography fontSize={12} color="#d32f2f" textAlign="center" mt={1}>
                                    Pilih atau tambah alamat pengiriman dulu
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}