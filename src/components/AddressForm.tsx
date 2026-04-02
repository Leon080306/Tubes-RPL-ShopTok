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
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { type Address } from "../type";

interface AddressFormProps {
  initialData?: Address;
  onSubmit: (data: Address) => void;
  onBack: () => void;
  title: string;
}

export default function AddressForm({ initialData, onSubmit, onBack, title }: AddressFormProps) {
  
  const [formData, setFormData] = useState<Address>(
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
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isDefault: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); 
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
          <TextField
            fullWidth
            label="Nama Alamat)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
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