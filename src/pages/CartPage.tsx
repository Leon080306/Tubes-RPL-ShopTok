import { Box, Button, Card, CardContent, Checkbox, IconButton, Paper, Typography } from "@mui/material"
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NumberSpinner from "../components/NumberSpinner";

const products = [
    {
        name: "Wireless Earbuds",
        rating: 5,
        totalReviews: 121,
        price: 120000
    },
    {
        name: "Wireless Earbuds",
        rating: 5,
        totalReviews: 121,
        price: 120000
    },
]

export default function CartPage() {
    return <Box sx={{
        width: "100%",
        height: "calc(100vh - 104px)",
        display: "flex",
        gap: "24px",
    }}>
        <Paper elevation={0} sx={{
            flex: 2.8,
            backgroundColor: "transparent",
            overflow: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
                display: "none"
            },
        }}>
            <Card elevation={0} sx={{
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: "8px",
                paddingInline: "12px",
                marginBottom: "24px",
            }}>
                <CardContent>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                        width: "100%",
                        paddingBottom: "8px",
                        gap: "12px"
                    }}>
                        <Checkbox sx={{
                            color: "#89a471",
                            '&.Mui-checked': {
                                color: "#89a471",
                            },
                            padding: 0
                        }} />
                        <Box sx={{
                            height: "32px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%"
                        }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            }}>
                                <StorefrontIcon sx={{ fontSize: "24px" }} />
                                {/* <img src="/src/assets/logos/AppLogo-iconOnly.png" alt="" style={{
                                height: "100%",
                                width: "auto"
                            }} /> */}
                                <Typography variant="body1" sx={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    margin: "0",
                                    padding: "0"
                                }}>Product Toko</Typography>
                            </Box>
                            <Button startIcon={<ChatIcon />} variant="contained" sx={{
                                padding: "4px 12px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "white",
                                borderColor: "#89a471",
                                backgroundColor: "#89a471"
                            }}>Chat</Button>
                        </Box>
                    </Box>

                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {products.map((product, index) => (
                            <Box key={index} sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                paddingBlock: "18px",
                                paddingBottom: index === products.length - 1 ? "0" : "18px",
                                width: "100%",
                                borderBottom: index === products.length - 1 ? "none" : "1px solid rgba(0, 0, 0, 0.2)",
                                gap: "12px",
                            }}>
                                <Checkbox sx={{
                                    color: "#89a471",
                                    '&.Mui-checked': {
                                        color: "#89a471",
                                    },
                                    padding: "0"
                                }} />
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "stretch",
                                    flex: 1,
                                }}>
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "start",
                                        alignItems: "flex-start",
                                        gap: "18px",
                                    }}>
                                        <img
                                            src="/src/assets/logos/AppLogo-iconOnly.png"
                                            style={{ width: "80px", height: "80px", borderRadius: "6px" }}
                                            alt=""
                                        />
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "4px"
                                        }}>
                                            <Typography sx={{
                                                fontSize: "14px"
                                            }}>
                                                {product.name}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: "14px"
                                            }}>VARIANT</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        justifyContent: "space-between",
                                        alignSelf: "stretch",
                                    }}>
                                        <Typography sx={{
                                            padding: 0,
                                            margin: 0
                                        }}>Rp. {product.price.toLocaleString("de-DE")}</Typography>
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            // border: "1px solid black",
                                        }}>
                                            <IconButton sx={{
                                                padding: 0,
                                                // marginBottom: "-10px",
                                            }}>
                                                <FavoriteBorderIcon />
                                            </IconButton>
                                            <IconButton sx={{
                                                padding: 0,
                                                // marginBottom: "-10px",
                                            }}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                            {/* set maxnya jadi banyak stock */}
                                            <NumberSpinner defaultValue={1} min={1} max={99} size="small" sx={{
                                                height: "36px",
                                                width: "100px",
                                            }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Paper >

        <Paper elevation={0} sx={{
            flex: 1,
            height: "500px",
            maxHeight: "calc(100vh - 104px)",
            border: "1px solid rgba(0, 0, 0, 0.2)",
        }}>

        </Paper>
    </Box >
}