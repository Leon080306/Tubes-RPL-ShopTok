import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Link as MuiLink,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router";

export default function RegisterPage() {
  const [role, setRole] = useState("customer");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    const userData = {
      user_id: crypto.randomUUID(), 
      first_name: formData.firstName, 
      last_name: formData.lastName, 
      email: formData.email,
      phone_number: formData.phoneNumber,
      password: formData.password,
      role: role,
      shopTok_pay: 0,
      coins: 0,
      vouchers: 0,
    };

    localStorage.setItem("user_data", JSON.stringify(userData));

    console.log("Coba cek sign up ", { ...formData, role });
    alert(`Berhasil sign up (ntr diganti biar lbh bagus hehe)`);
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
        py: 5,
      }}
    >
      <Card
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 500,
          borderRadius: 4,
          boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          mb={1}
          textAlign="center"
          color="#003f29"
        >
          Sign Up
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={4}
          textAlign="center"
        >
          Choose your role and fill this form
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <RadioGroup
            row
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ justifyContent: "center", gap: 2, mb: 2 }}
          >
            <RoleCard
              value="customer"
              label="Customer"
              icon={<PersonIcon sx={{ fontSize: 32 }} />}
              active={role === "customer"}
            />
            <RoleCard
              value="seller"
              label="Seller"
              icon={<StorefrontIcon sx={{ fontSize: 32 }} />}
              active={role === "seller"}
            />
          </RadioGroup>

          <Stack direction="row" gap={2}>
            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              variant="outlined"
              onChange={handleChange}
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              variant="outlined"
              onChange={handleChange}
              required
            />
          </Stack>

          <TextField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            fullWidth
            variant="outlined"
            onChange={handleChange}
            required
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            variant="outlined"
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#16a34a",
              "&:hover": { backgroundColor: "#15803d" },
            }}
          >
            Create Account
          </Button>

          {/* LOGIN LINK */}
          <Typography variant="body2" textAlign="center" mt={1}>
            Already have an account?{" "}
            <MuiLink
              component={Link}
              to="/login"
              sx={{
                color: "#16a34a",
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Log in
            </MuiLink>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

function RoleCard({
  value,
  label,
  icon,
  active,
}: {
  value: string;
  label: string;
  icon: any;
  active: boolean;
}) {
  return (
    <FormControlLabel
      value={value}
      control={<Radio sx={{ display: "none" }} />}
      label={
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 100,
            borderRadius: 3,
            border: "2px solid",
            borderColor: active ? "#16a34a" : "#e0e0e0",
            backgroundColor: active ? "#f0fdf4" : "transparent",
            color: active ? "#16a34a" : "#666",
            transition: "all 0.3s ease",
            cursor: "pointer",
            "&:hover": { borderColor: "#16a34a" },
          }}
        >
          {icon}
          <Typography variant="caption" fontWeight={700} mt={1}>
            {label}
          </Typography>
        </Box>
      }
      sx={{ m: 0 }}
    />
  );
}
