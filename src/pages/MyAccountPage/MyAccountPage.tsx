import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import { LetterAvatar } from "../../components/LetterAvatar";
import EditIcon from '@mui/icons-material/Edit';
import { MenuAccordion } from "../../components/MenuAccordion";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useNavigate, useParams } from "react-router";
import AdressesPage from "./AddressesPage";
import MyPurchasesPage from "./MyPurchasesPage";

export default function MyAccountPage() {
    const { menu } = useParams();
    const navigate = useNavigate();

    function renderMenu() {
        switch (menu) {
            case "profile": return (
                <Paper elevation={4} sx={{
                    height: "100%",
                    flex: 4,
                    boxSizing: "border-box",
                    padding: "12px 24px"
                }}>
                    <h1 style={{ margin: 0 }}>Profile</h1>
                </Paper>
            )
            case "addresses": return <AdressesPage />;
            case "purchases": return <MyPurchasesPage />
            case "notifications": return (
                <Paper elevation={4} sx={{
                    height: "100%",
                    flex: 4,
                    boxSizing: "border-box",
                    padding: "12px 24px"
                }}>
                    <h1 style={{ margin: 0 }}>Notifications</h1>
                </Paper>
            )
            case "review": return (
                <Paper elevation={4} sx={{
                    height: "100%",
                    flex: 4,
                    boxSizing: "border-box",
                    padding: "12px 24px"
                }}>
                    <h1 style={{ margin: 0 }}>Review</h1>
                </Paper>
            )
            case "wishlist": return (
                <Paper elevation={4} sx={{
                    height: "100%",
                    flex: 4,
                    boxSizing: "border-box",
                    padding: "12px 24px"
                }}>
                    <h1 style={{ margin: 0 }}>Wishlist</h1>
                </Paper>
            )
            default: return (
                <Paper elevation={4} sx={{
                    height: "100%",
                    flex: 4,
                    boxSizing: "border-box",
                    padding: "12px 24px"
                }}>
                    <h1 style={{ margin: 0 }}>Profile</h1>
                </Paper>
            )
        }
    }

    return <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        flex: 1,
        width: "100%",
        gap: "32px",
        paddingBlock: "32px",
        boxSizing: "border-box",
        minHeight: 0,
        height: "calc(100vh - 80px)"
    }}>
        <Paper elevation={4} sx={{
            height: "100%",
            flex: 1,
            boxSizing: "border-box",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
                display: "none"
            },
        }}>
            <Box sx={{
                width: "100%",
                height: "50px",
                display: "flex",
                justifyContent: "space-between",
                gap: "12px"
            }}>
                <LetterAvatar name="Leon080306" sx={{
                    width: "50px",
                    height: "50px"
                }} />
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    flexGrow: 1
                }}>
                    <Typography>
                        Leon080306
                    </Typography>
                    <Button variant="text" disableRipple startIcon={<EditIcon />} sx={{
                        textTransform: "none",
                        color: "grey",
                        width: "fit-content",
                        padding: "0px",

                        "& .MuiButton-startIcon": {
                            marginRight: "4px",
                        },

                        "&:hover": {
                            backgroundColor: "transparent"
                        }
                    }}>Edit Profile</Button>
                </Box>
            </Box>

            <Divider sx={{
                marginBlock: "16px",
            }} />

            <MenuAccordion title="My Account" startIcon={<AccountBoxIcon />} buttons={[
                { title: "Profile", onClick: () => navigate("/my-account/profile") },
                { title: "Addresses", onClick: () => navigate("/my-account/addresses") },
            ]} />

            <MenuAccordion title="My Purchase" startIcon={<AssignmentOutlinedIcon />} buttons={[
                { title: "All Purchases", onClick: () => navigate("/my-account/purchases") },
                { title: "To Pay", onClick: () => navigate("/my-account/purchases") },
                { title: "To Ship", onClick: () => navigate("/my-account/purchases") },
                { title: "To Receive", onClick: () => navigate("/my-account/purchases") },
                { title: "Completed", onClick: () => navigate("/my-account/purchases") },
                { title: "Cancelled", onClick: () => navigate("/my-account/purchases") },
                { title: "Return Refund", onClick: () => navigate("/my-account/purchases") },
            ]} />

            <MenuAccordion title="Inbox" startIcon={<MailOutlinedIcon />} buttons={[
                { title: "Notifications", onClick: () => navigate("/my-account/notifications") },
                { title: "Review", onClick: () => navigate("/my-account/review") },
            ]} />

            <MenuAccordion title="Wishlist" onClick={() => navigate("/my-account/wishlist")} startIcon={<FavoriteBorderOutlinedIcon />} />

        </Paper>

        <Box sx={{
            display: "flex",
            flex: 4,
            height: "100%",
            minHeight: 0
        }}>
            {renderMenu()}
        </Box>
    </Box>
}