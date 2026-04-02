import AddressForm from "../components/AddressForm";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { authActions } from "../store/authSlice";
import { useNavigate } from "react-router";

export default function AddressAddPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <AddressForm
      title="Tambah Alamat Baru"
      onBack={() => navigate(-1)}
      onSubmit={(data) => {
        dispatch(authActions.addAddress(data));
        navigate("/settings/address");
      }}
    />
  );
}