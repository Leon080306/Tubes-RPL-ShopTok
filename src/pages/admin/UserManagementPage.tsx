/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Button,
  Chip,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import InputBase from "@mui/material/InputBase";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
};

export default function UserManagementPage() {
  const navigate = useNavigate();
  const themeColor = "#16a34a";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortNama, setSortNama] = useState("");

  /* ================= FETCH ================= */
  const getUsers = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();

      const mapped: User[] = data.records.map((u: any) => ({
        id: String(u.user_id),
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
        phone: u.phone_number,
        role: u.role,
        status: u.status ?? "active",
      }));

      setUsers(mapped);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    try {
      const response = await fetch(`/api/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Gagal menghapus user");
    }
  };

  /* ================= UPDATE STATUS ================= */
  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status");
    }
  };

  /* ================= FILTER + SORT ================= */
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchSearch = user.name.toLowerCase().includes(search.toLowerCase());
        const matchRole = selectedRole ? user.role === selectedRole : true;
        const matchStatus = selectedStatus ? user.status === selectedStatus : true;
        return matchSearch && matchRole && matchStatus;
      })
      .sort((a, b) => {
        if (sortNama === "asc") return a.name.localeCompare(b.name);
        if (sortNama === "desc") return b.name.localeCompare(a.name);
        return 0;
      });
  }, [users, search, selectedRole, selectedStatus, sortNama]);

  if (loading) return <Box sx={{ p: 4 }}>Memuat data...</Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            User Management
          </Typography>
          <Typography sx={{ color: "#666", mt: 1 }}>
            Kelola semua user yang tersedia
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/create-user")}
          sx={{
            bgcolor: themeColor,
            borderRadius: "10px",
            textTransform: "none",
            height: "100%",
          }}
        >
          Tambah User
        </Button>
      </Box>

      {/* SEARCH */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            border: "1px solid #E0E0E0",
            borderRadius: "14px",
          }}
        >
          <SearchIcon sx={{ color: "#999", mr: 1 }} />
          <InputBase
            placeholder="Cari user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          {search && (
            <IconButton onClick={() => setSearch("")}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* FILTER */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <FilterListIcon />

        <Select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
        >
          <MenuItem value="" sx={{ color: "#515151b7" }}>Semua Role</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="seller">Seller</MenuItem>
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
        >
          <MenuItem value="" sx={{ color: "#515151b7" }}>Semua Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
        </Select>

        <Select
          value={sortNama}
          onChange={(e) => setSortNama(e.target.value)}
          displayEmpty
          IconComponent={SortIcon}
        >
          <MenuItem value="" sx={{ color: "#515151b7" }}>Urutkan Nama</MenuItem>
          <MenuItem value="asc">A-Z</MenuItem>
          <MenuItem value="desc">Z-A</MenuItem>
        </Select>

        <Button
          onClick={() => {
            setSearch("");
            setSelectedRole("");
            setSelectedStatus("");
            setSortNama("");
          }}
        >
          Reset
        </Button>
      </Box>

      {/* LIST */}
      <Paper sx={{ borderRadius: "20px", overflow: "hidden" }}>
        <Box sx={{ display: "flex", px: 3, py: 2, bgcolor: "#FAFAFA" }}>
          <Box sx={{ width: "35%" }}>User</Box>
          <Box sx={{ width: "25%" }}>Phone</Box>
          <Box sx={{ width: "15%" }}>Role</Box>
          <Box sx={{ width: "15%" }}>Status</Box>
          <Box sx={{ width: "10%", textAlign: "right" }}>Aksi</Box>
        </Box>

        {filteredUsers.map((user) => (
          <Box key={user.id} sx={{ display: "flex", px: 3, py: 2 }}>
            <Box sx={{ width: "35%", display: "flex", gap: 2 }}>
              <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
                {user.name[0]}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                <Typography variant="body2" sx={{ color: "#999" }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: "25%" }}>
              <Typography>{user.phone}</Typography>
            </Box>

            <Box sx={{ width: "15%" }}>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                size="small"
                sx={{
                  bgcolor:
                    user.role === "admin" ? "#F3E8FF" : user.role === "seller" ? "#FFF4E5" : "#E3F2FD",
                  color:
                    user.role === "admin" ? "#7E22CE" : user.role === "seller" ? "#EA580C" : "#1E88E5",
                  fontWeight: 600,
                }}
              />
            </Box>

            <Box sx={{ width: "15%" }}>
              <Select
                value={user.status}
                onChange={(e) => handleChangeStatus(user.id, e.target.value)}
                size="small"
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  height: "28px",
                  bgcolor: user.status === "active" ? "#E8F5E9" : "#FFEBEE",
                  color: user.status === "active" ? "#2E7D32" : "#C62828",
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", px: 1.5 },
                  "& fieldset": { border: "none" },
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </Box>

            <Box sx={{ width: "10%", display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <IconButton onClick={() => navigate(`/admin/edit-user/${user.id}`)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(user.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}

        {filteredUsers.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography>Tidak ada user ditemukan</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}