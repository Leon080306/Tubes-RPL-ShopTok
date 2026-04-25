import AddressForm from "../../../components/AddressForm";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../hooks/useAppSelector";
import { type Address } from "../../../type";

export default function AddressAddPage() {
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const handleCreateAddress = async (data: Address) => {
    try {
      await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: userInfo?.user_id,
          ...data,
        }),
      });
      navigate("/settings/address");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AddressForm
      title="Tambah Alamat Baru"
      onBack={() => navigate(-1)}
      onSubmit={handleCreateAddress}
    />
  );
}