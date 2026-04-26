import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import CheckoutPage from "../pages/orders/CheckoutPage";
import { Layout } from "../components/Layout";
import { Box, CircularProgress, Typography } from "@mui/material";
import RouteGuard from "./RouteGuard";

const HomePage = lazy(() => import("../pages/HomePage"));
const RegisterPage = lazy(() => import("../pages/Login&SignUp/RegisterPage"));
const LoginPage = lazy(() => import("../pages/Login&SignUp/LoginPage"));

const ForgotPasswordPage = lazy(() => import("../pages/Login&SignUp/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/Login&SignUp/ResetPasswordPage"));

const ProfilePage = lazy(() => import("../pages/Account/Profile/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/Account/Profile/EditProfilePage"));

const SettingProfilePage = lazy(() => import("../pages/Account/SettingProfilePage"));

const SettingAddress = lazy(() => import("../pages/Account/Address/SettingAddress"));
const SettingAddAddress = lazy(() => import("../pages/Account/Address/SettingAddAddress"));
const SettingEditAddress = lazy(() => import("../pages/Account/Address/SettingEditAddress"));

const SettingRekening = lazy(() => import("../pages/Account/Rekening/SettingRekening"));
const SettingRekeningCard = lazy(() => import("../pages/Account/Rekening/SettingRekeningCard"));
const SettingRekeningBank = lazy(() => import("../pages/Account/Rekening/SettingRekeningBank"));

const ChatToko = lazy(() => import("../pages/Chat/ChatToko"));
const SettingKeamanan = lazy(() => import("../pages/Account/SettingKeamanan"));

const Wishlist = lazy(() => import("../pages/Account/Wishlist"));

const ProductsPage = lazy(() => import("../pages/products/ProductsPage"));
const ProductPage = lazy(() => import("../pages/products/ProductPage"));

const OrderHistoryPage = lazy(() => import("../pages/orders/OrderHistoryPage"));

const CartPage = lazy(() => import("../pages/CartPage"));

const ShopProfile = lazy(() => import("../pages/Shop/ShopProfile"));

const ShopDashboard = lazy(() => import("../pages/Shop/ShopDashboard"));
const CreateShopPage = lazy(() => import("../pages/Shop/CreateShop"));
const AddProductPage = lazy(() => import("../pages/Shop/AddProductPage"));
const EditProductPage = lazy(() => import("../pages/Shop/EditProduct"));
const OrderDetailPage = lazy(() => import("../pages/orders/OrderDetailPage"));

// Admin
const AdminLayout = lazy(() => import("../components/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const CategoryManagement = lazy(() => import("../pages/admin/CategoryManagement"));
const CreateCategory = lazy(() => import("../pages/admin/CreateCategory"));
const EditCategoryPage = lazy(() => import("../pages/admin/EditCategoryPage"));
const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const CreateUserPage = lazy(() => import("../pages/admin/CreateUserPage"));
const EditUserPage = lazy(() => import("../pages/admin/EditUserPage"));

const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", height: "100vh",
    }}
  >
    <CircularProgress />
    <Typography>Loading...</Typography>
  </Box>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* ─── Public routes ───────────────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ─── Customer routes ─────────────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/" element={<RouteGuard allowed={["customer"]}><HomePage /></RouteGuard>} />
          <Route path="/profile" element={<RouteGuard allowed={["customer"]}><ProfilePage /></RouteGuard>} />
          <Route path="/profile/edit" element={<RouteGuard allowed={["customer"]}><EditProfilePage /></RouteGuard>} />
          <Route path="/settings" element={<RouteGuard allowed={["customer"]}><SettingProfilePage /></RouteGuard>} />
          <Route path="/settings/address" element={<RouteGuard allowed={["customer"]}><SettingAddress /></RouteGuard>} />
          <Route path="/settings/address/add" element={<RouteGuard allowed={["customer"]}><SettingAddAddress /></RouteGuard>} />
          <Route path="/settings/address/edit/:id" element={<RouteGuard allowed={["customer"]}><SettingEditAddress /></RouteGuard>} />
          <Route path="/settings/bank" element={<RouteGuard allowed={["customer"]}><SettingRekening /></RouteGuard>} />
          <Route path="/settings/bank/add-card" element={<RouteGuard allowed={["customer"]}><SettingRekeningCard /></RouteGuard>} />
          <Route path="/settings/bank/add-rekening" element={<RouteGuard allowed={["customer"]}><SettingRekeningBank /></RouteGuard>} />
          <Route path="/settings/security" element={<RouteGuard allowed={["customer"]}><SettingKeamanan /></RouteGuard>} />
          <Route path="/chattoko" element={<RouteGuard allowed={["customer"]}><ChatToko /></RouteGuard>} />
          <Route path="/products" element={<RouteGuard allowed={["customer"]}><ProductsPage /></RouteGuard>} />
          <Route path="/product/:id" element={<RouteGuard allowed={["customer"]}><ProductPage /></RouteGuard>} />
          <Route path="/orders" element={<RouteGuard allowed={["customer"]}><OrderHistoryPage /></RouteGuard>} />
          <Route path="/orders/checkout" element={<RouteGuard allowed={["customer"]}><CheckoutPage /></RouteGuard>} />
          <Route path="/orders/detail/:order_id" element={<RouteGuard allowed={["customer"]}><OrderDetailPage /></RouteGuard>} />
          <Route path="/cart" element={<RouteGuard allowed={["customer"]}><CartPage /></RouteGuard>} />
          <Route path="/shop/:shopId" element={<RouteGuard allowed={["customer"]}><ShopProfile /></RouteGuard>} />
          <Route path="/wishlist" element={<RouteGuard allowed={["customer"]}><Wishlist /></RouteGuard>} />
        </Route>

        {/* ─── Seller routes ───────────────────────────────── */}
        <Route path="/create-shop" element={<RouteGuard allowed={["seller"]}><CreateShopPage /></RouteGuard>} />
        <Route path="/shop/dashboard" element={<RouteGuard allowed={["seller"]}><ShopDashboard /></RouteGuard>} />
        <Route path="/shop/add-product" element={<RouteGuard allowed={["seller"]}><AddProductPage /></RouteGuard>} />
        <Route path="/shop/edit-product/:id" element={<RouteGuard allowed={["seller"]}><EditProductPage /></RouteGuard>} />

        {/* ─── Admin routes (with AdminLayout sidebar) ─────── */}
        <Route
          element={
            <RouteGuard allowed={["admin"]}>
              <AdminLayout />
            </RouteGuard>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/category-management" element={<CategoryManagement />} />
          <Route path="/admin/create-category" element={<CreateCategory />} />
          <Route path="/admin/edit-category/:id" element={<EditCategoryPage />} />
          <Route path="/admin/user-management" element={<UserManagementPage />} />
          <Route path="/admin/create-user" element={<CreateUserPage />} />
          <Route path="/admin/edit-user/:id" element={<EditUserPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};