import { lazy } from "react";
import { Route, Routes } from "react-router";

const HomePage = lazy(() => import("../pages/HomePage"));
const RegisterPage = lazy(() => import("../pages/login&signup/RegisterPage"));
const LoginPage = lazy(() => import("../pages/login&signup/LoginPage"));

const ProfilePage = lazy(() => import("../pages/account/profile/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/account/profile/EditProfilePage"));

const SettingProfilePage = lazy(() => import("../pages/account/SettingProfilePage"))

const SettingAddress = lazy(() => import("../pages/account/address/SettingAddress"))
const SettingAddAddress = lazy(() => import("../pages/account/address/SettingAddAddress"))
const SettingEditAddress = lazy(() => import("../pages/account/address/SettingEditAddress"));

const SettingRekening = lazy(() => import("../pages/account/rekening/SettingRekening"));
const SettingRekeningCard = lazy(() => import("../pages/account/rekening/SettingRekeningCard"));
const SettingRekeningBank = lazy(() => import("../pages/account/rekening/SettingRekeningBank"));

const SettingKeamanan = lazy(() => import("../pages/account/SettingKeamanan"));

const ProductPage = lazy(() => import("../pages/products/ProductPage"));

const OrderHistoryPage = lazy(() => import("../pages/orders/OrderHistoryPage"));

const CartPage = lazy(() => import("../pages/CartPage"));

export const AppRoutes = () => {
  return (
    <Routes>
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

      <Route path="/product/:id" element={<ProductPage />} />

      <Route path="/orders" element={<OrderHistoryPage />} />

      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
};
