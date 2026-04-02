import { useParams, useNavigate } from "react-router";
import { useAppSelector } from "../../../hooks/useAppSelector";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { authActions } from "../../../store/authSlice";
import AddressForm from "../../../components/AddressForm";

export default function AddressEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Ambil data alamat yang mau diedit dari Redux
  const { userInfo } = useAppSelector((state) => state.auth);
  const addressToEdit = userInfo?.addresses?.find((addr) => addr.id === id);

  if (!addressToEdit) {
    return <div>Alamat tidak ditemukan!</div>;
  }

  return (
    <AddressForm
      title="Ubah Alamat"
      initialData={addressToEdit}
      onBack={() => navigate(-1)}
      onSubmit={(updatedData) => {
        dispatch(authActions.updateAddress(updatedData));
        navigate("/settings/address");
      }}
    />
  );
}