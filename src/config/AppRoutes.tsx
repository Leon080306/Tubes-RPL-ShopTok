import { lazy } from "react";
import { Route, Routes } from "react-router";
import CheckoutPage from "../pages/orders/CheckoutPage";
import { Layout } from "../components/Layout";

const HomePage = lazy(() => import("../pages/HomePage"));
const RegisterPage = lazy(() => import("../pages/Login&SignUp/RegisterPage"));
const LoginPage = lazy(() => import("../pages/Login&SignUp/LoginPage"));

const ProfilePage = lazy(() => import("../pages/Account/Profile/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/Account/Profile/EditProfilePage"));

const SettingProfilePage = lazy(() => import("../pages/Account/SettingProfilePage"))

const SettingAddress = lazy(() => import("../pages/Account/Address/SettingAddress"))
const SettingAddAddress = lazy(() => import("../pages/Account/Address/SettingAddAddress"))
const SettingEditAddress = lazy(() => import("../pages/Account/Address/SettingEditAddress"));

const SettingRekening = lazy(() => import("../pages/Account/Rekening/SettingRekening"));
const SettingRekeningCard = lazy(() => import("../pages/Account/Rekening/SettingRekeningCard"));
const SettingRekeningBank = lazy(() => import("../pages/Account/Rekening/SettingRekeningBank"));


const ChatToko = lazy(() => import("../pages/Chat/ChatToko"))
const SettingKeamanan = lazy(() => import("../pages/Account/SettingKeamanan"));

const Wishlist = lazy(() => import("../pages/Account/Wishlist"));

const ProductPage = lazy(() => import("../pages/products/ProductPage"));

const OrderHistoryPage = lazy(() => import("../pages/orders/OrderHistoryPage"));

const CartPage = lazy(() => import("../pages/CartPage"));

const ShopProfile = lazy(() => import("../pages/Shop/ShopProfile"))

const ShopDashboard = lazy(() => import("../pages/Shop/SellerDashboard"));
const OrderDetailPage = lazy(() => import("../pages/orders/OrderDetailPage"));

const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"))

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />

        <Route path="/settings" element={<SettingProfilePage />} />

        <Route path="/settings/address" element={<SettingAddress />} />
        <Route path="/settings/address/add" element={<SettingAddAddress />} />
        <Route path="/settings/address/edit/:id" element={<SettingEditAddress />} />

        <Route path="/settings/bank" element={<SettingRekening />} />
        <Route path="/settings/bank/add-card" element={<SettingRekeningCard />} />
        <Route path="/settings/bank/add-rekening" element={<SettingRekeningBank />} />

        <Route path="/settings/security" element={<SettingKeamanan />} />

        <Route path="/chattoko" element={<ChatToko />} />
        <Route path="/settings/security" element={<SettingKeamanan />} />

        <Route path="/product/:id" element={<ProductPage />} />

        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/checkout" element={<CheckoutPage />} />
        <Route path="/orders/detail" element={<OrderDetailPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />

        <Route path="/shop/:shopId" element={<ShopProfile />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
      </Route>

      <Route path="/shop/dashboard" element={<ShopDashboard />} />

      <Route path="/orders" element={<OrderHistoryPage />} />

      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
      <Route path="/orders/checkout" element={<CheckoutPage />} />
      <Route path="/orders/detail" element={<OrderDetailPage />} />

      <Route path="/admin/user-management" element={<UserManagementPage />} />
    </Routes>
  );
};
