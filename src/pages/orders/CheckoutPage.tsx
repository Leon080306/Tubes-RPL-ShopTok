import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, Checkbox, Divider, InputLabel, InputAdornment, Breadcrumbs, Link, } from "@mui/material";

import { useNavigate } from "react-router";
import HomeIcon from "@mui/icons-material/Home";
import CreditCardIcon from "@mui/icons-material/CreditCard";

// redux
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { checkoutOrder } from "../../store/orderSlice";

export default function CheckoutPage() {
    const [isReturningCustomer, setIsReturningCustomer] = React.useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Ambil cart items yang is_selected === true
    const { items, total_payment } = useAppSelector(state => state.cart);
    const selectedItems = items.filter(item => item.is_selected);

    // Ambil addresses dari user
    const userInfo = useAppSelector(state => state.auth.userInfo);
    const addresses = userInfo?.addresses ?? [];
    const defaultAddress = addresses.find(a => a.is_default) ?? addresses[0];

    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        defaultAddress?.address_id?.toString() ?? ""
    );
    const [voucherCode, setVoucherCode] = useState("");

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            alert("Pilih alamat pengiriman dulu!");
            return;
        }
        const result = await dispatch(checkoutOrder({
            address_id: selectedAddressId,
            // voucher_id: voucherCode || undefined,
        }));

        if (checkoutOrder.fulfilled.match(result)) {
            alert("Checkout berhasil!");
            navigate("/orders");
        } else {
            alert("Checkout gagal: " + (result.payload as any)?.message);
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

    function formatPrice(total_payment: number): React.ReactNode {
        throw new Error("Function not implemented.");
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumb */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link
                    onClick={() => navigate("/")}
                    underline="hover"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                    }}
                    color="inherit"
                    href="/"
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                </Link>
                <Link
                    underline="hover"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                    }}
                    color="inherit"
                    href="/material-ui/getting-started/installation/"
                >
                    Checkout
                </Link>
            </Breadcrumbs>

            {/* MAIN LAYOUT */}
            <Box display="flex" gap={3} alignItems="flex-start">
                {/* ================= LEFT ================= */}
                <Box flex={6}>
                    {/* REVIEW BOX */}
                    <Box
                        border={`1px solid ${border}`}
                        borderRadius={2}
                        p={3}
                        mb={3}
                    >
                        <Typography fontWeight={600} mb={2} fontSize={22}>
                            Review Item And Shipping
                        </Typography>

                        <Box display="flex" justifyContent="space-between">
                            {/* LEFT ITEM */}
                            {selectedItems.map(item => (
                                <Box key={item.variant_id} display="flex" justifyContent="space-between">
                                    <Box display="flex" gap={2}>
                                        <Box sx={{ width: 110, height: 110, background: light, borderRadius: 2 }}>
                                            <Box component="img"
                                                src={item.variant.picture || "/placeholder.png"}
                                                sx={{ width: 80, height: 80, objectFit: "contain" }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography fontWeight={600}>{item.variant.product.name}</Typography>
                                            <Typography fontSize={13} color="gray">{item.variant.name}</Typography>
                                            <Typography fontSize={13} color="gray">
                                                Toko: {item.variant.product.shop.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography fontWeight={600}>
                                            {formatPrice(Number(item.variant.price))}
                                        </Typography>
                                        <Typography fontSize={13}>Quantity: {item.quantity}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* RETURNING */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={isReturningCustomer}
                                onChange={(e) =>
                                    setIsReturningCustomer(e.target.checked)
                                }
                                sx={{
                                    color: green,
                                    "&.Mui-checked": {
                                        color: green,
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography fontSize={13}>
                                Returning Customer?
                            </Typography>
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* DELIVERY BOX */}
                    <Box border={`1px solid ${border}`} borderRadius={2} p={3}>
                        {/* HEADER */}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={3}
                        >
                            <Typography fontWeight={800} fontSize={22}>
                                Delivery Information
                            </Typography>

                            <Button
                                size="small"
                                sx={{
                                    background: "#eee",
                                    borderRadius: "20px",
                                    fontSize: 12,
                                    textTransform: "none",
                                    px: 2,
                                    color: "#000",
                                }}
                            >
                                {isReturningCustomer
                                    ? "Edit"
                                    : "Save Information"}
                            </Button>
                        </Box>

                        {/* ================= CONDITIONAL ================= */}
                        {isReturningCustomer ? (
                            // ✅ MODE SUMMARY (SESUAI GAMBAR)
                            <Box>
                                <Typography fontWeight={600} mb={1}>
                                    Wade Warren
                                </Typography>

                                <Typography fontSize={13} color="#666" mb={0.5}>
                                    4140 Parker Rd. Allentown, New Mexico 31134
                                </Typography>

                                <Typography fontSize={13} color="#666" mb={0.5}>
                                    +447700960054
                                </Typography>

                                <Typography fontSize={13} color="#666">
                                    Warren@mail.com
                                </Typography>
                            </Box>
                        ) : (
                            // ✅ MODE FORM (YANG SUDAH KAMU BUAT)
                            <Box width="100%">
                                {/* ROW 1 */}
                                <Box display="flex" gap={2} mb={2}>
                                    <Box flex={1}>
                                        <Typography
                                            fontSize={12}
                                            mb={0.5}
                                            fontWeight="bold"
                                        >
                                            First Name*
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Type here..."
                                            sx={{
                                                "& input::placeholder": {
                                                    fontSize: "12px",
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box flex={1}>
                                        <Typography
                                            fontSize={12}
                                            mb={0.5}
                                            fontWeight="bold"
                                        >
                                            Last Name*
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Type here..."
                                            sx={{
                                                "& input::placeholder": {
                                                    fontSize: "12px",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* ROW 2 */}
                                <Box mb={2}>
                                    <Typography
                                        fontSize={12}
                                        mb={0.5}
                                        fontWeight="bold"
                                    >
                                        Address*
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Type here..."
                                        sx={{
                                            "& input::placeholder": {
                                                fontSize: "12px",
                                            },
                                        }}
                                    />
                                </Box>

                                {/* ROW 3 */}
                                <Box display="flex" gap={2} mb={2}>
                                    <Box flex={1}>
                                        <Typography
                                            fontSize={12}
                                            mb={0.5}
                                            fontWeight="bold"
                                        >
                                            City / Town*
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Type here..."
                                            sx={{
                                                "& input::placeholder": {
                                                    fontSize: "12px",
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box flex={1}>
                                        <Typography
                                            fontSize={12}
                                            mb={0.5}
                                            fontWeight="bold"
                                        >
                                            Zip Code*
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Type here..."
                                            sx={{
                                                "& input::placeholder": {
                                                    fontSize: "12px",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* ROW 4 */}
                                <Box display="flex" gap={2}>
                                    <Box flex={1}>
                                        <Typography
                                            fontSize={12}
                                            mb={0.5}
                                            fontWeight="bold"
                                        >
                                            Mobile*
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Type here..."
                                            sx={{
                                                "& input::placeholder": {
                                                    fontSize: "12px",
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box flex={1}>
                                        <Typography
                                            fontSize={12}
                                            mb={0.5}
                                            fontWeight="bold"
                                        >
                                            Email*
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Type here..."
                                            sx={{
                                                "& input::placeholder": {
                                                    fontSize: "12px",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ================= RIGHT ================= */}
                <Box flex={3}>
                    {/* SINGLE TALL BOX */}
                    <Box border={`1px solid ${border}`} borderRadius={2} p={3}>
                        <Typography fontWeight={600} mb={2} fontSize={22}>
                            Order Summery
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        {/* COUPON */}
                        <Box
                            display="flex"
                            bgcolor={light}
                            borderRadius="30px"
                            p={0.5}
                            mb={3}
                        >
                            <input
                                placeholder="Enter Coupon Code"
                                style={{
                                    flex: 1,
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    paddingLeft: 12,
                                    fontSize: 13,
                                }}
                            />

                            <Button
                                sx={{
                                    background: green,
                                    color: "#fff",
                                    borderRadius: "30px",
                                    px: 1,
                                    fontSize: 12,
                                    textTransform: "none",
                                }}
                            >
                                Apply coupon
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography fontWeight={600} mb={1}>
                            Payment Details
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <RadioGroup defaultValue="card">
                            {[
                                "Cash on Delivery",
                                "Shopcart Card",
                                "Paypal",
                            ].map((i) => (
                                <FormControlLabel
                                    key={i}
                                    value={i}
                                    control={<Radio size="small" />}
                                    label={
                                        <Typography fontSize={13}>
                                            {i}
                                        </Typography>
                                    }
                                />
                            ))}

                            <FormControlLabel
                                value="card"
                                control={
                                    <Radio
                                        size="small"
                                        sx={{
                                            color: green,
                                            "&.Mui-checked": { color: green },
                                        }}
                                    />
                                }
                                label={
                                    <Typography fontSize={13} fontWeight={600}>
                                        Credit or Debit card
                                    </Typography>
                                }
                            />
                        </RadioGroup>

                        {/* FORM */}
                        <Box mt={2}>
                            <InputLabel
                                sx={{
                                    mb: 1,
                                    fontWeight: "bold",
                                    color: "#000000",
                                    fontSize: 14,
                                }}
                            >
                                Email*
                            </InputLabel>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type here..."
                                sx={{ ...input, mb: 2 }}
                            />
                            <InputLabel
                                sx={{
                                    mb: 1,
                                    fontWeight: "bold",
                                    color: "#000000",
                                    fontSize: 14,
                                }}
                            >
                                Card Holder Name*
                            </InputLabel>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type here..."
                                sx={{ ...input, mb: 2 }}
                            />
                            <InputLabel
                                sx={{
                                    mb: 1,
                                    fontWeight: "bold",
                                    color: "#000000",
                                    fontSize: 14,
                                }}
                            >
                                Card Number*
                            </InputLabel>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="0000*****1245"
                                sx={{ ...input, mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CreditCardIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: "#9e9e9e",
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box display="flex" gap={2}>
                                {/* Expiry */}
                                <Box flex={1}>
                                    <InputLabel
                                        sx={{
                                            mb: 1,
                                            fontWeight: "bold",
                                            color: "#000",
                                            fontSize: 14,
                                        }}
                                    >
                                        Expiry
                                    </InputLabel>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="MM/YY"
                                        sx={input}
                                    />
                                </Box>

                                {/* CVC */}
                                <Box flex={1}>
                                    <InputLabel
                                        sx={{
                                            mb: 1,
                                            fontWeight: "bold",
                                            color: "#000",
                                            fontSize: 14,
                                        }}
                                    >
                                        CVC
                                    </InputLabel>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="000"
                                        sx={input}
                                    />
                                </Box>
                            </Box>
                        </Box>
                        {/* ===== PRICE SUMMARY ===== */}
                        <Box mt={3}>
                            {[
                                { label: "Sub Total", value: "$549.00" },
                                { label: "Tax(10%)", value: "$54.90" },
                                { label: "Coupon Discount", value: "-$54.90" },
                                { label: "Shipping Cost", value: "-$0.00" },
                            ].map((item) => (
                                <Box
                                    key={item.label}
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={1.5}
                                >
                                    <Typography
                                        fontSize={14}
                                        color="#000000"
                                        fontWeight={"bold"}
                                    >
                                        {item.label}
                                    </Typography>
                                    <Typography fontSize={14} color="#555">
                                        {item.value}
                                    </Typography>
                                </Box>
                            ))}

                            {/* Divider */}
                            <Box
                                sx={{
                                    borderTop: "1px solid #E5E5E5",
                                    my: 2,
                                }}
                            />

                            {/* TOTAL */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                mb={3}
                            >
                                <Typography fontWeight={700} fontSize={15}>
                                    Total
                                </Typography>
                                <Typography fontWeight={700} fontSize={15}>
                                    = $494.10
                                </Typography>
                            </Box>

                            {/* BUTTON */}
                            <Button
                                fullWidth
                                sx={{
                                    background: "#0B5D3B",
                                    color: "#fff",
                                    borderRadius: "30px",
                                    py: 1.5,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    "&:hover": {
                                        background: "#084c30",
                                    },
                                }}
                            >
                                Pay {formatPrice(total_payment)}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}