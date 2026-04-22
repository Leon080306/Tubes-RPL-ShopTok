/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { type Address, type AddressFormState } from "../type";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

interface AddressFormProps {
  initialData?: AddressFormState;
  onSubmit: (data: Address) => void;
  onBack: () => void;
  title: string;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

function parseAddress(data: any): AddressFormState {
  const addr = data.address;
  return {
    id: crypto.randomUUID(),
    name: "",
    receiver: "",
    phone: "",
    province: addr.state || "",
    city: addr.city || addr.town || addr.county || "",
    district: addr.suburb || addr.village || "",
    postalCode: addr.postcode || "",
    fullAddress: [
      addr.amenity,
      addr.road,
      addr.house_number
    ].filter(Boolean).join(", "),
    isDefault: false,
  };
}

function MapController({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 16);
  }, [position]);

  return null;
}

// In LocationMarker, rename the prop for clarity
function LocationMarker({
  setPosition,
  onAddressParsed  // renamed
}: {
  setPosition: (pos: [number, number]) => void;
  onAddressParsed: (addr: AddressFormState) => void;
}) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      onAddressParsed(parseAddress(data));
    }
  });

  return null;
}

export default function AddressForm({ initialData, onSubmit, onBack, title }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormState>(
    initialData || {
      id: crypto.randomUUID(),
      name: "",
      receiver: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      fullAddress: "",
      isDefault: false,
      postalCode: ""
    }
  );

  const [position, setPosition] = useState<[number, number]>([
    -6.200000,
    106.816666
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isDefault: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Address = {
      full_name: formData.receiver,
      address: formData.fullAddress,
      province: formData.province,
      city: formData.city,
      sub_district: formData.district,
      phone_number: formData.phone,
      is_default: formData.isDefault,
    };

    onSubmit(payload);
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

      setFormData((prev) => ({
        ...prev,
        province: parsed.province,
        city: parsed.city,
        district: parsed.district,
        postalCode: parsed.postalCode,
        fullAddress: parsed.fullAddress,
      }));
    });
  };

  return (
    <Box sx={{ maxWidth: "800px", margin: "0 auto", minHeight: "100vh", bgcolor: "white" }}>

      <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', borderRadius: 0 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon sx={{ color: "#003f29" }} />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
      </Paper>

      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <Button
            variant="outlined"
            onClick={getCurrentLocation}
            sx={{
              color: "#003f29",
              borderColor: "#003f29",
              width: "100%",
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
                onAddressParsed={(parsed) =>
                  setFormData((prev) => ({
                    ...prev,
                    province: parsed.province,
                    city: parsed.city,
                    district: parsed.district,
                    postalCode: parsed.postalCode,
                    fullAddress: parsed.fullAddress,
                  }))
                }
              />

              <MapController position={position} />
            </MapContainer>
          </Box>
          {formData && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: "300", color: "grey" }}>
                {formData.fullAddress}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "300", color: "grey" }}>
                {[
                  formData.district,
                  formData.city,
                  formData.province,
                  formData.postalCode && `ID ${formData.postalCode}`
                ].filter(Boolean).join(", ")}
              </Typography>
            </Box>
          )}
        </Box>

        <Stack spacing={3}>
          <Typography variant="subtitle2" color="text.secondary">KONTAK</Typography>
          <TextField
            fullWidth
            label="Nama Penerima"
            name="receiver"
            value={formData.receiver}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Nomor Telepon"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <Typography variant="subtitle2" color="text.secondary" sx={{ pt: 2 }}>ALAMAT</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Provinsi"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Kota / Kabupaten"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Stack>
          <TextField
            fullWidth
            label="Kecamatan"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Alamat Lengkap"
            name="fullAddress"
            multiline
            rows={3}
            value={formData.fullAddress}
            onChange={handleChange}
            required
          />

          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={handleSwitch}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: "#003f29" }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: "#003f29" } }}
                />
              }
              label="Atur sebagai Alamat Utama"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ bgcolor: "#003f29", py: 1.5, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: "#002a1c" } }}
          >
            Simpan Alamat
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}