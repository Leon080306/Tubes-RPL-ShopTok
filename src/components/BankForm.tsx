import { Box, TextField, Button, Stack, Typography, IconButton } from "@mui/material"
import { useState } from "react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { type BankAccount } from "../type"

interface BankFormProps {
  onSubmit: (data: BankAccount) => void
  onBack: () => void
}

export default function BankForm({ onSubmit, onBack }: BankFormProps) {
  const [formData, setFormData] = useState<BankAccount>({
    id: crypto.randomUUID(),
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <Box sx={{ maxWidth: "600px", margin: "0 auto", p: 2 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>Tambah Rekening Bank</Typography>
      </Stack>

      <Stack spacing={3} component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}>
        <TextField label="Nama Bank" name="bankName" fullWidth required onChange={handleChange} />
        <TextField label="Nomor Rekening" name="accountNumber" fullWidth required onChange={handleChange} />
        <TextField label="Nama Pemilik Rekening" name="accountHolderName" fullWidth required onChange={handleChange} />
        <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: "#003f29", py: 1.5 }}>
          Simpan Rekening
        </Button>
      </Stack>
    </Box>
  )
}