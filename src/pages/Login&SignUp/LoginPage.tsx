import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Link as MuiLink,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { authActions } from "../../store/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUser = localStorage.getItem("user_data");
    if (!savedUser) {
      alert("Account not found! Sign up first");
      navigate("/signup");
      return;
    }

    const userData = JSON.parse(savedUser);

    if (formData.email === userData.email && formData.password === userData.password) {
      const userToDispatch = { ...userData }

      if (userToDispatch.role === "seller" && !userToDispatch.shop_info) {
        userToDispatch.shop_info = {
          shop_id: "SHOP-" + Math.random().toString(36).substring(2, 9),
          owner_id: userToDispatch.user_id,
          name: "Toko " + userToDispatch.firstName,
          is_approved: true,
          status: "active",
          banner: "", // Default kosong dulu
          profile_pic: ""
        };
      }
      
      dispatch(authActions.setUserInfo(userToDispatch))
      localStorage.setItem("isLoggedIn", "true");

      alert(`Welcome back, ${userData.firstName}!`);
      navigate("/");
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        width: "100%"
      }}
    >
      <Card
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
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
          Welcome Back
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={4}
          textAlign="center"
        >
          Please fill this form to login
        </Typography>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Email Address"
            name="email"
            type="email"
            fullWidth
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#16a34a",
              "&:hover": { backgroundColor: "#15803d" },
            }}
          >
            Login
          </Button>

          <Typography variant="body2" textAlign="center">
            Don't have an account?{" "}
            <MuiLink
              component={Link}
              to="/signup"
              sx={{
                color: "#16a34a",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Sign Up
            </MuiLink>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
