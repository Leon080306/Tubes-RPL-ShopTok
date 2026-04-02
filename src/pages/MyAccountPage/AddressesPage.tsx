/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogTitle, Divider, Paper, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

type Address = {
    name: string;
    phoneNumber: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
    address: string;
    details?: string;
    label: "home" | "work" | "other";
    isDefault: boolean;
}

function parseAddress(data: any): Address {
    const addr = data.address;

    console.log(addr)

    return {
        name: "",
        phoneNumber: "",
        province: addr.state || "",
        city: addr.city || addr.town || addr.county || "",
        district: addr.suburb || addr.village || "",
        postalCode: addr.postcode || "",
        address: (addr.road || "") + (addr.house_number ? ", " + addr.house_number : "") + (addr.amenity ? ", " + addr.amenity : ""),
        label: "other",
        isDefault: false
    }
}

function MapController({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, 16);
    }, [position]);

    return null;
}

function LocationMarker({
    setPosition,
    setParsedAddress
}: {
    setPosition: (pos: [number, number]) => void;
    setParsedAddress: (addr: any) => void;
}) {
    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;

            setPosition([lat, lng]);

            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );

            const data = await res.json();
            setParsedAddress(parseAddress(data));
        }
    });

    return null;
}

export default function AdressesPage() {
    const [isAddAdressDialogOpen, setAddAdressDialogOpen] = useState(false);
    const [position, setPosition] = useState<[number, number]>([
        -6.200000,
        106.816666
    ]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>({
        name: "",
        phoneNumber: "",
        province: "",
        city: "",
        district: "",
        postalCode: "",
        address: "",
        details: "",
        label: "other",
        isDefault: false
    });
    const [isRegionDialogOpen, setRegionDialogOpen] = useState(false);
    const [regionStep, setRegionStep] = useState<"province" | "city" | "district" | "postalCode">("province");
    const [regions, setRegions] = useState<{ code: string, name: string }[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([
        {
            name: "Leonard Samuel Setiawan",
            phoneNumber: "082118161745",
            province: "JAWA BARAT",
            city: "KAB. BANDUNG",
            district: "MARGAHAYU",
            postalCode: "40228",
            address: "Taman Kopo Indah II Blok A3 No. 28 Margahayu Selatan, Margahayu",
            details: "Details 1",
            label: "home",
            isDefault: true,
        }
    ]);

    const fetchProvinces = async () => {
        const res = await fetch("/regions/provinces.json");
        const data = await res.json();
        setRegions(data.map((item: any) => ({ code: item.id, name: item.name })));
    };

    const fetchCities = async (provinceCode: string) => {
        const res = await fetch(`https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/static/api/regencies/${provinceCode}.json`);
        const data = await res.json();
        setRegions(data.map((item: any) => ({ code: item.id, name: item.name })));
    };

    const fetchDistricts = async (cityCode: string) => {
        const res = await fetch(`https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/static/api/districts/${cityCode}.json`);
        const data = await res.json();
        setRegions(data.map((item: any) => ({ code: item.id, name: item.name })));
    };

    const fetchVillages = async (districtCode: string) => {
        const res = await fetch(`https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/static/api/villages/${districtCode}.json`);
        const data = await res.json();
        setRegions(data.map((item: any) => ({ code: item.id, name: item.name })));
    };

    const stepTitles = {
        province: "Select Province",
        city: "Select City",
        district: "Select District",
        postalCode: "Select Postal Code"
    };

    const handleRegionSelect = (item: { code: string, name: string }) => {
        if (regionStep === "province") {
            setSelectedAddress(prev => ({ ...prev!, province: item.name, city: "", district: "", postalCode: "" }));
            setRegionStep("city");
            fetchCities(item.code);
        } else if (regionStep === "city") {
            setSelectedAddress(prev => ({ ...prev!, city: item.name, district: "", postalCode: "" }));
            setRegionStep("district");
            fetchDistricts(item.code);
        } else if (regionStep === "district") {
            setSelectedAddress(prev => ({ ...prev!, district: item.name, postalCode: "" }));
            setRegionStep("postalCode");
            fetchVillages(item.code);
        } else {
            setSelectedAddress(prev => ({ ...prev!, postalCode: item.code.slice(-5) }));
            setRegionDialogOpen(false);
        }
    };


    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            setPosition([lat, lng]);

            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );

            const data = await res.json();
            const parsed = parseAddress(data);

            setSelectedAddress(parsed);
        });
    };

    const textFieldProps = {
        flex: 1,
        "& .MuiInputBase-root": {
            height: "44px",
        },
        "& .MuiInputLabel-root": {
            top: "50%",
            transform: "translateY(-50%)",
            paddingLeft: "12px",
            fontWeight: "500",
            color: "grey",
            fontSize: '14px'
        },
        "& .MuiInputLabel-shrink": {
            top: 0,
            transform: "translate(6px, -6px) scale(0.75)",
        }
    }

    return <Paper elevation={4} sx={{
        height: "100%",
        flex: 4,
        boxSizing: "border-box",
        padding: "12px 24px",
        overflow: "auto",
        paddingBottom: "24px"
    }}>
        <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <h1 style={{ margin: 0, fontSize: "24px" }}>My Addresses</h1>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                    backgroundColor: "#003f29",
                }}
                onClick={() => {
                    setAddAdressDialogOpen(true)
                }}
            >Add New Address</Button>
        </Box>
        <Divider sx={{ marginBlock: "12px" }} />
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
        }}>
            {addresses.map((address, index) => (
                <Card key={index} elevation={3}>
                    <CardContent sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                    }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                <Typography variant="body1" sx={{
                                    fontWeight: "600"
                                }}>{address.name}</Typography>
                                <Typography sx={{
                                    fontWeight: "300",
                                    color: "grey"
                                }}>|</Typography>
                                <Typography variant="body2" sx={{
                                    fontWeight: "300",
                                    color: "grey"
                                }}>{address.phoneNumber}</Typography>
                            </Box>

                            <Box sx={{
                                display: "flex",
                            }}>
                                <Button variant="text" sx={{
                                    padding: "0px 6px",
                                    width: "fit-content",
                                    minWidth: "auto",
                                    color: "#89a471",
                                    textTransform: "none",
                                }}>Edit</Button>
                                <Button variant="text" sx={{
                                    padding: "0px 6px",
                                    width: "fit-content",
                                    minWidth: "auto",
                                    color: "#89a471",
                                    textTransform: "none",
                                }}>Delete</Button>
                            </Box>
                        </Box>

                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}>
                            <Box>
                                <Typography variant="body2" sx={{
                                    fontWeight: "300",
                                    color: "grey"
                                }}>{address.address} {address.details && "(" + address.details + ")"}</Typography>
                                <Typography variant="body2" sx={{
                                    fontWeight: "300",
                                    color: "grey"
                                }}>{address.district}, {address.city}, {address.province}, ID, {address.postalCode}</Typography>
                            </Box>

                            <Button variant="outlined" disabled={address.isDefault} sx={{
                                padding: "4px 8px",
                                height: "fit-content",
                                textTransform: "none",
                                color: "#89a471",
                                borderColor: "#89a471"
                            }}>{address.isDefault ? "Default" : "Set as Default"}</Button>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>

        <Dialog
            open={isAddAdressDialogOpen}
            onClose={() => setAddAdressDialogOpen(false)}
            PaperProps={{
                sx: {
                    backgroundColor: "white",
                    width: "35%",
                    height: "80%",
                    padding: "14px 8px",
                    display: "flex",
                    flexDirection: "column",
                }
            }}
        >
            <DialogTitle sx={{
                margin: 0,
                paddingInline: "16px",
                flexShrink: 0
            }}>New Address</DialogTitle>

            <Box sx={{
                padding: "0 16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                overflow: "auto",
                flex: 1,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                    display: "none"
                }
            }}>

                <Button
                    variant="outlined"
                    onClick={getCurrentLocation}
                    sx={{
                        color: "#003f29",
                        borderColor: "#003f29",
                    }}
                >
                    Use Current Location
                </Button>

                <Box sx={{ height: "160px" }}>
                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{
                            height: "100%",
                            width: "100%",
                            borderRadius: "8px"
                        }}
                    >
                        <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />

                        <Marker position={position} />

                        <LocationMarker
                            setPosition={setPosition}
                            setParsedAddress={setSelectedAddress}
                        />

                        <MapController position={position} />
                    </MapContainer>
                </Box>

                {selectedAddress && (
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: "300", color: "grey" }}>
                            {selectedAddress.address}
                            {selectedAddress.details && ` (${selectedAddress.details})`}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "300", color: "grey" }}>
                            {[
                                selectedAddress.district,
                                selectedAddress.city,
                                selectedAddress.province,
                                selectedAddress.postalCode && `ID ${selectedAddress.postalCode}`
                            ].filter(Boolean).join(", ")}
                        </Typography>
                    </Box>
                )}

                <Box sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px"
                }}>

                    <TextField
                        value={selectedAddress?.name ?? ""}
                        label="Full Name"
                        variant="outlined"
                        sx={textFieldProps}
                        onChange={(e) => setSelectedAddress(prev => ({ ...prev!, name: e.target.value }))}
                    />
                    <TextField
                        value={selectedAddress?.phoneNumber ?? ""}
                        label="Phone Number"
                        variant="outlined"
                        sx={textFieldProps}
                        onChange={(e) => setSelectedAddress(prev => ({ ...prev!, phoneNumber: e.target.value }))}
                    />
                </Box>
                <TextField
                    value={[selectedAddress?.province, selectedAddress?.city, selectedAddress?.district, selectedAddress?.postalCode].filter(Boolean).join(", ") ?? ""}
                    label="Province, City, District, Postal Code"
                    variant="outlined"
                    sx={{ ...textFieldProps, caretColor: "transparent", cursor: "pointer" }}
                    inputProps={{ readOnly: true, style: { cursor: "pointer" } }}
                    onClick={() => {
                        setRegionStep("province");
                        fetchProvinces();
                        setRegionDialogOpen(true);
                    }}
                />
                <TextField
                    value={selectedAddress?.address ?? ""}
                    label="Street Name, Building, House No."
                    variant="outlined"
                    sx={textFieldProps}
                    onChange={(e) => setSelectedAddress(prev => ({ ...prev!, address: e.target.value }))}
                />
                <TextField
                    value={selectedAddress?.details ?? ""}
                    label="Order Details"
                    variant="outlined"
                    sx={textFieldProps}
                    onChange={(e) => setSelectedAddress(prev => ({ ...prev!, details: e.target.value }))}
                />
            </Box>
            <DialogActions sx={{
                padding: "8px 16px",
            }}>
                <Button variant="text" sx={{ color: "#003f29" }} onClick={() => setAddAdressDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" sx={{ color: "white", backgroundColor: "#003f29" }} onClick={() => {
                    setAddresses(prev => [...prev, selectedAddress!]);
                    setAddAdressDialogOpen(false);
                    setSelectedAddress(null);
                }}>Save</Button>
            </DialogActions>
        </Dialog>
        <Dialog
            open={isRegionDialogOpen}
            onClose={() => setRegionDialogOpen(false)}
            PaperProps={{ sx: { width: "35%", height: "60%", padding: "8px" } }}
        >
            <DialogTitle>{stepTitles[regionStep]}</DialogTitle>
            <Box sx={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "4px", overflow: "auto" }}>
                {regions.map((item) => (
                    <Button
                        key={item.code}
                        variant="text"
                        onClick={() => handleRegionSelect(item)}
                        sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            color: "black",
                            padding: "10px 8px",
                            borderRadius: "4px",
                            "&:hover": { backgroundColor: "#f5f5f5" }
                        }}
                    >
                        {item.name}
                    </Button>
                ))}
            </Box>
        </Dialog>
    </Paper >
}