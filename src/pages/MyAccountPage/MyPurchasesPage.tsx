import { Box, Button, Card, CardActions, CardContent, Divider, Paper, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useState } from "react";
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChatIcon from '@mui/icons-material/Chat';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

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

export default function MyPurchasesPage() {
    const [value, setValue] = useState('all');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return <Paper sx={{
        height: "100%",
        flex: 4,
        boxSizing: "border-box",
        overflow: "auto",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    }}>
        <Paper elevation={2} sx={{
            width: '100%',
            border: '1px solid rgba(0, 0, 0, 0.2)',
        }}>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                sx={{
                    display: "flex",
                    "& .MuiTab-root": { color: "#89a471" },
                    "& .MuiTab-root.Mui-selected": { color: "#003f29" },
                    "& .MuiTabs-indicator": { backgroundColor: "#003f29" },
                }}
            >
                <Tab value="all" label="All" />
                <Tab value="to-pay" label="To Pay" />
                <Tab value="to-ship" label="To Ship" />
                <Tab value="to-receive" label="To Receive" />
                <Tab value="completed" label="Completed" />
                <Tab value="cancelled" label="Cancelled" />
                <Tab value="return-refund" label="Returned" />
            </Tabs>
        </Paper>
        <TextField
            label="You can search by Seller Name, Order ID, or Product Name"
            variant="outlined"
            sx={{
                "& .MuiInputLabel-root": {
                    fontWeight: "500",
                    color: "grey",
                },
            }}
        />
        <Paper sx={{
            flex: 1,
            overflow: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
                display: "none"
            },
        }}>
            <Card sx={{
                border: '1px solid rgba(0, 0, 0, 0.2)',
                paddingInline: "12px",
                marginBottom: "24px"
            }}>
                <CardContent>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                        width: "100%",
                        paddingBottom: "8px"
                    }}>
                        <Box sx={{
                            height: "32px",
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
                            <Button startIcon={<ChatIcon />} variant="contained" sx={{
                                padding: "4px 12px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "white",
                                borderColor: "#89a471",
                                backgroundColor: "#89a471"
                            }}>Chat</Button>
                            <Button startIcon={<StorefrontIcon />} variant="outlined" sx={{
                                padding: "4px 8px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                                borderColor: "#89a471"
                            }}>View Shop</Button>
                        </Box>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "12px"
                        }}>
                            <Button startIcon={<LocalShippingIcon />} variant="text" sx={{
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                            }}>Parcel has been delivered to the recipient address on the Terrace.</Button>
                            <Divider orientation="vertical" flexItem />
                            <Typography sx={{
                                textTransform: "capitalize",
                                color: "#89a471",
                                fontWeight: "500"
                            }}>RATED</Typography>
                        </Box>
                    </Box>

                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {products.map((product, index) => (
                            <Box key={index} sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "18px 12px",
                                borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
                            }}>
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "start",
                                    gap: "18px",
                                }}>
                                    <img
                                        src="/src/assets/logos/AppLogo-iconOnly.png"
                                        style={{ width: "60px", height: "60px", borderRadius: "6px" }}
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
                                        }}>
                                            1X
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography>Rp. {product.price.toLocaleString("de-DE")}</Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
                <CardActions sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    paddingBottom: "24px"
                }}>
                    <Box sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        width: "100%",
                        gap: "8px",
                    }}>
                        <Typography variant="body1" sx={{
                            paddingBottom: "4px",
                            margin: 0,
                        }}>Order Total: </Typography>
                        <Typography variant="body1" sx={{
                            padding: 0,
                            margin: 0,
                            fontSize: "24px",
                            color: "#89a471",
                            fontWeight: "600"
                        }}>Rp. {products.reduce((total, product) => total + product.price, 0).toLocaleString("de-DE")}</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        width: "100%",
                        gap: "16px"
                    }}>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "white",
                            borderColor: "#89a471",
                            backgroundColor: "#89a471",
                            width: "160px"
                        }}>Rate</Button>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "#89a471",
                            borderColor: "#89a471",
                            width: "160px"
                        }}>Contact Seller</Button>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "#89a471",
                            borderColor: "#89a471",
                            width: "160px"
                        }}>Buy Again</Button>
                    </Box>
                </CardActions>
            </Card>

            <Card sx={{
                border: '1px solid rgba(0, 0, 0, 0.2)',
                paddingInline: "12px",
                marginBottom: "24px"
            }}>
                <CardContent>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                        width: "100%",
                        paddingBottom: "8px"
                    }}>
                        <Box sx={{
                            height: "32px",
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
                            <Button startIcon={<ChatIcon />} variant="contained" sx={{
                                padding: "4px 12px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "white",
                                borderColor: "#89a471",
                                backgroundColor: "#89a471"
                            }}>Chat</Button>
                            <Button startIcon={<StorefrontIcon />} variant="outlined" sx={{
                                padding: "4px 8px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                                borderColor: "#89a471"
                            }}>View Shop</Button>
                        </Box>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "12px"
                        }}>
                            <Button startIcon={<LocalShippingIcon />} variant="text" sx={{
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                            }}>Parcel has been delivered to the recipient address on the Terrace.</Button>
                            <Divider orientation="vertical" flexItem />
                            <Typography sx={{
                                textTransform: "capitalize",
                                color: "#89a471",
                                fontWeight: "500"
                            }}>RATED</Typography>
                        </Box>
                    </Box>

                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {products.map((product, index) => (
                            <Box key={index} sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "18px 12px",
                                borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
                            }}>
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "start",
                                    gap: "18px",
                                }}>
                                    <img
                                        src="/src/assets/logos/AppLogo-iconOnly.png"
                                        style={{ width: "60px", height: "60px", borderRadius: "6px" }}
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
                                        }}>
                                            1X
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography>Rp. {product.price.toLocaleString("de-DE")}</Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
                <CardActions sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    paddingBottom: "24px"
                }}>
                    <Box sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        width: "100%",
                        gap: "8px",
                    }}>
                        <Typography variant="body1" sx={{
                            paddingBottom: "4px",
                            margin: 0,
                        }}>Order Total: </Typography>
                        <Typography variant="body1" sx={{
                            padding: 0,
                            margin: 0,
                            fontSize: "24px",
                            color: "#89a471",
                            fontWeight: "600"
                        }}>Rp. {products.reduce((total, product) => total + product.price, 0).toLocaleString("de-DE")}</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        width: "100%",
                        gap: "16px"
                    }}>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "white",
                            borderColor: "#89a471",
                            backgroundColor: "#89a471",
                            width: "160px"
                        }}>Rate</Button>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "#89a471",
                            borderColor: "#89a471",
                            width: "160px"
                        }}>Contact Seller</Button>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "#89a471",
                            borderColor: "#89a471",
                            width: "160px"
                        }}>Buy Again</Button>
                    </Box>
                </CardActions>
            </Card>

            <Card sx={{
                border: '1px solid rgba(0, 0, 0, 0.2)',
                paddingInline: "12px",
                marginBottom: "24px"
            }}>
                <CardContent>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                        width: "100%",
                        paddingBottom: "8px"
                    }}>
                        <Box sx={{
                            height: "32px",
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
                            <Button startIcon={<ChatIcon />} variant="contained" sx={{
                                padding: "4px 12px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "white",
                                borderColor: "#89a471",
                                backgroundColor: "#89a471"
                            }}>Chat</Button>
                            <Button startIcon={<StorefrontIcon />} variant="outlined" sx={{
                                padding: "4px 8px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                                borderColor: "#89a471"
                            }}>View Shop</Button>
                        </Box>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "12px"
                        }}>
                            <Button startIcon={<LocalShippingIcon />} variant="text" sx={{
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                            }}>Parcel has been delivered to the recipient address on the Terrace.</Button>
                            <Divider orientation="vertical" flexItem />
                            <Typography sx={{
                                textTransform: "capitalize",
                                color: "#89a471",
                                fontWeight: "500"
                            }}>RATED</Typography>
                        </Box>
                    </Box>

                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        {products.map((product, index) => (
                            <Box key={index} sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "18px 12px",
                                borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
                            }}>
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "start",
                                    gap: "18px",
                                }}>
                                    <img
                                        src="/src/assets/logos/AppLogo-iconOnly.png"
                                        style={{ width: "60px", height: "60px", borderRadius: "6px" }}
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
                                        }}>
                                            1X
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography>Rp. {product.price.toLocaleString("de-DE")}</Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
                <CardActions sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    paddingBottom: "24px"
                }}>
                    <Box sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        width: "100%",
                        gap: "8px",
                    }}>
                        <Typography variant="body1" sx={{
                            paddingBottom: "4px",
                            margin: 0,
                        }}>Order Total: </Typography>
                        <Typography variant="body1" sx={{
                            padding: 0,
                            margin: 0,
                            fontSize: "24px",
                            color: "#89a471",
                            fontWeight: "600"
                        }}>Rp. {products.reduce((total, product) => total + product.price, 0).toLocaleString("de-DE")}</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        width: "100%",
                        gap: "16px"
                    }}>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "white",
                            borderColor: "#89a471",
                            backgroundColor: "#89a471",
                            width: "160px"
                        }}>Rate</Button>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "#89a471",
                            borderColor: "#89a471",
                            width: "160px"
                        }}>Contact Seller</Button>
                        <Button variant="outlined" sx={{
                            textTransform: "none",
                            color: "#89a471",
                            borderColor: "#89a471",
                            width: "160px"
                        }}>Buy Again</Button>
                    </Box>
                </CardActions>
            </Card>
        </Paper>
    </Paper>
}