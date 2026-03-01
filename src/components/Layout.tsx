import { AppBar, Box, Button, InputAdornment, Stack, TextField, Toolbar } from "@mui/material";
import { useState, type PropsWithChildren } from "react";
import { Link } from "react-router";
import AppLogoInline from '../assets/logos/AppLogo-inline.png';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchIcon from '@mui/icons-material/Search';
import '../assets/styles/navbar.css';
import BasicMenu from "./BasicMenu";
export function Layout(props: PropsWithChildren) {
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Categories');

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
                            menuItems={[
                                "All Products",
                                "Electronics",
                                "Computers & Laptops",
                                "Phones & Tablets",
                                "Accessories",
                                "Home & Living",
                                "Fashion",
                                "Books",
                                "Sports",
                                "Health & Beauty"
                            ]}
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
                    gap: '24px',
                    alignItems: 'center',
                    flexGrow: 1,
                    justifyContent: 'flex-end'
                }}>
                    <Box sx={{
                        width: searchFocused ? "100%" : "300px",
                        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                        maxWidth: "100%",
                    }}>
                        <TextField
                            fullWidth
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
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