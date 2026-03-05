import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    typography: {
        fontFamily: "'Inter', sans-serif",
    },
    palette: {
        text: {
            primary: "#000000",
            secondary: "#003f29",
        },
    },
    components: {
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    backgroundColor: "#dfdfdf",
                    height: 36,
                    fontSize: 14,
                    transition: "0.2s",
                    "&:hover": {
                        backgroundColor: "#c8c8c8",
                    },
                    "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    },
                },
            },
        },

        MuiIconButton: {
            styleOverrides: {
                root: {
                    height: 36,
                    width: 36,
                    borderRadius: 12,
                },
            },
        },
    },
});
