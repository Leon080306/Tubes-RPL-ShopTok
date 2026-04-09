import * as React from 'react';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import OutlinedInput from '@mui/material/OutlinedInput';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import type { SxProps, Theme } from '@mui/material/styles';

export default function NumberSpinner({
    id: idProp,
    label,
    error,
    size = 'medium',
    sx,
    ...other
}: BaseNumberField.Root.Props & {
    label?: React.ReactNode;
    size?: 'small' | 'medium';
    error?: boolean;
    sx?: SxProps<Theme>;
}) {
    let id = React.useId();
    if (idProp) {
        id = idProp;
    }
    return (
        <BaseNumberField.Root
            {...other}
            render={(props, state) => (
                <FormControl
                    size={size}
                    ref={props.ref}
                    disabled={state.disabled}
                    required={state.required}
                    error={error}
                    variant="outlined"
                    sx={{
                        ...sx,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "stretch",
                        gap: 0,
                        p: 0,
                        m: 0,

                        '& .MuiFormLabel-root': {
                            display: 'none'
                        },

                        '& .MuiButton-root': {
                            borderColor: 'divider',
                            minWidth: 0,
                            height: '100%',
                        },

                        '& .MuiOutlinedInput-root': {
                            height: '100%',
                        }
                    }}
                >
                    {props.children}
                </FormControl>
            )}
        >
            <BaseNumberField.ScrubArea
                render={
                    <Box component="span" sx={{ userSelect: 'none', width: 'max-content' }} />
                }
            >
                <FormLabel
                    htmlFor={id}
                    sx={{
                        display: 'inline-block',
                        cursor: 'ew-resize',
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        fontWeight: 500,
                        lineHeight: 1.5,
                        mb: 0.5,
                    }}
                >
                    {label}
                </FormLabel>
                <BaseNumberField.ScrubAreaCursor>
                    <OpenInFullIcon
                        fontSize="small"
                        sx={{ transform: 'translateY(12.5%) rotate(45deg)' }}
                    />
                </BaseNumberField.ScrubAreaCursor>
            </BaseNumberField.ScrubArea>
            <Box
                sx={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'stretch',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'white'
                }}
            >
                <BaseNumberField.Decrement
                    render={
                        <Button
                            variant="text"
                            aria-label="Decrease"
                            size={size}
                            sx={{
                                borderRadius: 0,
                                border: 'none',
                                backgroundColor: 'white',
                                borderTopLeftRadius: '999px',
                                borderBottomLeftRadius: '999px',

                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        />
                    }
                >
                    <RemoveIcon fontSize={size} />
                </BaseNumberField.Decrement>

                <BaseNumberField.Input
                    id={id}
                    render={(props, state) => (
                        <OutlinedInput
                            inputRef={props.ref}
                            value={state.inputValue}
                            onBlur={props.onBlur}
                            onChange={props.onChange}
                            onKeyUp={props.onKeyUp}
                            onKeyDown={props.onKeyDown}
                            onFocus={props.onFocus}
                            slotProps={{
                                input: {
                                    ...props,
                                    size:
                                        Math.max(
                                            (other.min?.toString() || '').length,
                                            state.inputValue.length || 1,
                                        ) + 1,
                                    sx: {
                                        textAlign: 'center',
                                    },
                                },
                            }}
                            sx={{
                                pr: 0,
                                borderRadius: 0,
                                flex: 1,
                                backgroundColor: 'white',

                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                }
                            }}
                        />
                    )}
                />

                <BaseNumberField.Increment
                    render={
                        <Button
                            variant="text"
                            aria-label="Increase"
                            size={size}
                            sx={{
                                borderRadius: 0,
                                border: 'none',
                                backgroundColor: 'white',
                                borderTopRightRadius: '999px',
                                borderBottomRightRadius: '999px',

                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        />
                    }
                >
                    <AddIcon fontSize={size} />
                </BaseNumberField.Increment>
            </Box>
        </BaseNumberField.Root>
    );
}
