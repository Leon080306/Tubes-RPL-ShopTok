import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Stack,
  IconButton,
} from "@mui/material"
import { useState } from "react"
import { useAppSelector } from "../../../hooks/useAppSelector"
import { useAppDispatch } from "../../../hooks/useAppDispatch"
import { useNavigate } from "react-router"
import { authActions } from "../../../store/authSlice"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

export default function EditProfilePage() {
  const { userInfo } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    email: userInfo?.email || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    dispatch(authActions.updateProfile(formData))

    alert("Profile updated successfully!")

    navigate("/profile")
  }

  return (
    <Box sx={{ maxWidth: "500px", margin: "40px auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate("/profile")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Edit Profile
        </Typography>
      </Stack>

      <Paper elevation={3} sx={{ padding: "32px", borderRadius: "16px" }}>
        <Stack spacing={3}>
          <TextField
            label="First Name"
            name="firstName"
            fullWidth
            value={formData.firstName}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Last Name"
            name="lastName"
            fullWidth
            value={formData.lastName}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Email Address"
            name="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
          />

          <Box sx={{ display: "flex", gap: "16px", mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/profile")}
              sx={{
                color: "#003f29",
                borderColor: "#003f29",
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
              sx={{
                backgroundColor: "#003f29",
                textTransform: "none",
                "&:hover": { backgroundColor: "#002a1b" },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}
