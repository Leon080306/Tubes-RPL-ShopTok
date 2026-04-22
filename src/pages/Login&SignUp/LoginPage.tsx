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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      dispatch(authActions.setUserInfo(data.user));

      localStorage.setItem("isLoggedIn", "true");

      alert(`Welcome back, ${data.user.first_name}!`);
      navigate("/");

    } catch (error) {
      console.error(error);
      alert("Login error");
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

          <MuiLink
            component={Link}
            to="/forgot-password"
            sx={{
              color: "#16a34a",
              fontWeight: "bold",
              textDecoration: "none",
              width: "100%",
              textAlign: "center",
            }}
          >
            Forgot Password
          </MuiLink>
        </Box>
      </Card>
    </Box>
  );
}
