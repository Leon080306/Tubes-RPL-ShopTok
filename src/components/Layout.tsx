/* eslint-disable react-hooks/set-state-in-effect */
import { AppBar, Box, Button, InputAdornment, Paper, Stack, TextField, Toolbar, Typography } from "@mui/material";
import { useState, type PropsWithChildren } from "react";
import { Link } from "react-router";
import AppLogoInline from '../assets/logos/AppLogo-inline.png';
import AppLogoOnly from "../assets/logos/AppLogo-iconOnly.png";
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchIcon from '@mui/icons-material/Search';
import '../assets/styles/navbar.css';
import BasicMenu from "./BasicMenu";

export function Layout(props: PropsWithChildren) {
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Categories');

    const categories = [
        {
            name: "All Products"
        },
        {
            name: "Electronics"
        },
        {
            name: "Computers & Laptops"
        },
        {
            name: "Phones & Tablets"
        },
        {
            name: "Accessories"
        },
        {
            name: "Home & Living"
        },
        {
            name: "Fashion"
        },
        {
            name: "Books"
        },
        {
            name: "Sports"
        },
        {
            name: "Health & Beauty"
        },
    ]

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    }

    return <Stack>
        <AppBar position="static" sx={{
            backgroundColor: '#003f29',
            height: "80px"
        }}>
            <Toolbar disableGutters sx={{
                height: '100%',
                paddingInline: '64px',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <Box sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '64px'
                }}>
                    <Link to='/' style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <img src={AppLogoInline} alt="" style={{
                            width: '130px',
                        }} />
                    </Link>

                    <nav style={{
                        display: 'flex',
                        gap: '32px',
                        fontSize: '14px',
                        alignItems: 'center',
                        overflow: 'hidden',
                    }}>
                        <BasicMenu
                            className="nav-link"
                            label={selectedCategory}
                            onSelect={handleCategorySelect}
                            menuItems={categories}
                        />
                        <Box
                            sx={{
                                maxWidth: searchFocused ? "0px" : "400px",
                                transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                                display: "flex",
                                gap: "32px",
                                alignItems: "center",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Link className="nav-link" to="/">Home</Link>
                            <Link className="nav-link" to="/">Products</Link>
                            <Link className="nav-link" to="/">Orders</Link>
                        </Box>
                    </nav>
                </Box>

                <Box sx={{
                    fontSize: '13px',
                    display: 'flex',
                    gap: '32px',
                    alignItems: 'center',
                    flexGrow: 1,
                    justifyContent: 'flex-end',
                    height: '100%'
                }}>
                    <Box
                        sx={{
                            position: "relative",
                            width: searchFocused ? "100%" : "400px",
                            transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                            maxWidth: "100%",
                        }}
                    >
                        <TextField
                            fullWidth
                            onFocus={() => {
                                setSearchFocused(true);
                            }}
                            onBlur={() => {
                                setSearchFocused(false);
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon sx={{ fontSize: "20px", color: "#888" }} />
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            placeholder="Search products"
                            sx={{
                                backgroundColor: "white",
                                borderRadius: "100px",

                                "& fieldset": {
                                    border: "none",
                                },

                                "&:hover fieldset": {
                                    border: "none",
                                },

                                "&.Mui-focused fieldset": {
                                    border: "none",
                                },

                                "&.Mui-focused": {
                                    boxShadow: "none",
                                },

                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "100px",
                                    height: "38px",
                                },

                                "& .MuiOutlinedInput-input": {
                                    padding: "6px 14px",
                                    fontSize: "12px",

                                    "&::placeholder": {
                                        fontSize: "12px",
                                        opacity: 0.5,
                                    },
                                },
                            }}
                        />
                        {searchFocused && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    width: "100%",
                                    mt: 1,
                                    height: "100px",
                                    zIndex: 10,
                                    borderRadius: 2,
                                }}
                            >
                                <Paper elevation={5} sx={{
                                    backgroundColor: "white",
                                    width: "100%",
                                    padding: "18px 12px",
                                }}>
                                    <h2 style={{
                                        fontSize: "18px",
                                        margin: '0',
                                        marginBottom: '16px',
                                        paddingBottom: "16px",
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.2)'
                                    }}>Popular Categories</h2>

                                    <Box sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: 2,
                                    }}>
                                        {categories.map((category) => (
                                            <Paper elevation={0} sx={{
                                                display: 'flex',
                                                justifyContent: 'start',
                                                gap: "18px",
                                                alignItems: 'center',
                                                flexGrow: 1,
                                                backgroundColor: '#f6f6f6',
                                                borderRadius: '12px',
                                                padding: "12px 12px",
                                                boxSizing: 'border-box',
                                                flex: 1,
                                                transition: "all 0.25s ease",

                                                "&:hover": {
                                                    transform: "scale(1.02)",
                                                    boxShadow: 5,
                                                },
                                            }}>
                                                <img src={AppLogoOnly} style={{ width: "60px", height: "60px", borderRadius: "6px" }} alt="" />
                                                <Box style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                    height: "50px",
                                                    flexGrow: 1,
                                                }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {category.name}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "text.secondary",
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        12 products available
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Paper>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: '24px',
                    }}>
                        <Link to='/'>
                            <Button className="nav-link" startIcon={<PersonOutlinedIcon />} sx={{
                                color: 'white',
                                textDecoration: 'none',
                                letterSpacing: '0.5px',
                                textTransform: 'none',
                            }}>Account</Button>
                        </Link>

                        <Link to='/'>
                            <Button className="nav-link" startIcon={<ShoppingCartOutlinedIcon />} sx={{
                                color: 'white',
                                textDecoration: 'none',
                                letterSpacing: '0.5px',
                                textTransform: 'none'
                            }}>Cart</Button>
                        </Link>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>

        <Box sx={{
            paddingInline: '64px'
        }}>
            {props.children}
        </Box>
    </Stack>
}