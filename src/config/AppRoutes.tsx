import { lazy } from "react";
import { Route, Routes } from "react-router";

const HomePage = lazy(() => import("../pages/HomePage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/EditProfilePage"));
const SettingProfilePage = lazy(() => import("../pages/SettingProfilePage"))
const SettingAddress = lazy(() => import("../pages/SettingAddress"))
const SettingAddAddress = lazy(() => import("../pages/SettingAddAddress") )
const SettingEditAddress = lazy(() => import("../pages/SettingEditAddress"));
const SettingRekening = lazy(() => import("../pages/SettingRekening"));
const SettingRekeningCard = lazy(() => import("../pages/SettingRekeningCard"));
const SettingRekeningBank = lazy(() => import("../pages/SettingRekeningBank"));
const SettingKeamanan = lazy(() => import("../pages/SettingKeamanan"));

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
      <Route path="/settings/address/edit/:id" element={<SettingEditAddress />} 
      />
      <Route path="/settings/bank" element={<SettingRekening />} />
      <Route path="/settings/bank/add-card" element={<SettingRekeningCard />} />
      <Route path="/settings/bank/add-rekening" element={<SettingRekeningBank />} />
      <Route path="/settings/security" element={<SettingKeamanan />} />

    </Routes>
  );
};
