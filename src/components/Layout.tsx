import { AppBar, Box, Stack, Toolbar } from "@mui/material";
import type { PropsWithChildren } from "react";
export function Layout(props: PropsWithChildren) {
    return <Stack>
        <AppBar position="static" sx = {{
            backgroundColor: '#003f29'
        }}>
            <Toolbar>
                <Box display="flex" justifyContent="space-between" flexGrow={1}>
                    <Box
                        display="flex"
                        justifyContent="start"
                        alignItems="center"
                        gap="12px"
                        width="30%"
                    >
                    </Box>
                    <nav style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "30%"
                    }}>

                    </nav>
                    <Box display="flex" justifyContent="end" width="30%">

                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
        {props.children}
    </Stack>
}