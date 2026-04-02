import { Box, TextField, Button, Stack, Typography, Paper, IconButton } from "@mui/material"
import { useState } from "react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { type CreditCard } from "../type"

interface CardFormProps {
  onSubmit: (data: CreditCard) => void
  onBack: () => void
}

export default function CardForm({ onSubmit, onBack }: CardFormProps) {
  const [formData, setFormData] = useState<CreditCard>({
    id: crypto.randomUUID(),
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <Box sx={{ maxWidth: "600px", margin: "0 auto", p: 2 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>Tambah Kartu Baru</Typography>
      </Stack>

      <Stack spacing={3} component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}>
        <TextField label="Nomor Kartu" name="cardNumber" fullWidth required onChange={handleChange} />
        <TextField label="Nama di Kartu" name="cardHolderName" fullWidth required onChange={handleChange} />
        <Stack direction="row" spacing={2}>
          <TextField label="Masa Berlaku (MM/YY)" name="expiryDate" fullWidth required onChange={handleChange} />
          <TextField label="CVV" name="cvv" type="password" fullWidth required onChange={handleChange} />
        </Stack>
        <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: "#003f29", py: 1.5 }}>
          Simpan Kartu
        </Button>
      </Stack>
    </Box>
  )
}