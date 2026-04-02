import { Accordion, AccordionDetails, AccordionSummary, Button, Stack } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type React from "react";

type AccordionButton = {
    title: string;
    onClick: () => void;
}

type MenuAccordionProps = {
    title: string;
    onClick?: () => void;
    startIcon?: React.ReactNode;
    buttons?: AccordionButton[];
}

export function MenuAccordion({ title, onClick, buttons, startIcon }: MenuAccordionProps) {
    return <Accordion
        disableGutters
        elevation={0}
        square
        sx={{
            margin: 0,
            "&.Mui-expanded": {
                margin: 0
            },
            "&:before": {
                display: "none"
            },
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        }}
    >
        <AccordionSummary
            expandIcon={buttons ? <ArrowDropDownIcon /> : null}
            sx={{
                minHeight: 38,
                "&.Mui-expanded": {
                    minHeight: 38
                },
                "& .MuiAccordionSummary-content": {
                    margin: "4px 0"
                },
                "& .MuiAccordionSummary-content.Mui-expanded": {
                    margin: "4px 0"
                },
                paddingLeft: "0px",
            }}
        >
            <Button
                component="div"
                variant="text"
                onClick={onClick}
                disableRipple
                startIcon={startIcon}
                sx={{
                    textTransform: "none",
                    width: "100%",
                    paddingBlock: "4px",
                    boxSizing: "border-box",
                    color: "black",
                    justifyContent: "flex-start",
                    fontWeight: "500",
                    letterSpacing: "0.5px",

                    "& .MuiButton-startIcon": {
                        marginRight: "6px",
                        color: "#89a471"
                    },

                    "&:hover": {
                        backgroundColor: "transparent"
                    }
                }}
            >
                {title}
            </Button>
        </AccordionSummary>

        <AccordionDetails sx={{
            padding: "0",
            paddingLeft: "23px"
        }}>
            <Stack>
                {buttons?.map((btn, index) => (
                    <Button variant="text" key={index} onClick={btn.onClick} disableRipple sx={{
                        textTransform: "none",
                        width: "100%",
                        paddingBlock: "4px",
                        boxSizing: "border-box",
                        color: "black",
                        justifyContent: "flex-start",
                        fontWeight: "500",
                        letterSpacing: "0.5px",

                        "& .MuiButton-startIcon": {
                            marginRight: "4px",
                        },

                        "&:hover": {
                            backgroundColor: "#f2f4f7"
                        }
                    }}>{btn.title}</Button>
                ))}
            </Stack>
        </AccordionDetails>
    </Accordion>
}