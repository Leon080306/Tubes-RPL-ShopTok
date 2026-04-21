import { useParams, useNavigate } from "react-router";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { authActions } from "../../../store/authSlice";
import AddressForm from "../../../components/AddressForm";
import type { AddressFormState, Address } from "../../../type";
import { useEffect, useState } from "react";

export default function AddressEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [initialFormState, setInitialFormState] = useState<AddressFormState | null>(null);
  const [addressId, setAddressId] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/address/detail/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((addr: Address) => {
        setAddressId(addr.address_id ?? id);
        setInitialFormState({
          id: addr.address_id ?? crypto.randomUUID(),
          name: "",
          receiver: addr.full_name,
          phone: addr.phone_number,
          province: addr.province,
          city: addr.city,
          district: addr.sub_district,
          postalCode: "",
          fullAddress: addr.address,
          isDefault: addr.is_default,
        });
      })
      .catch(console.error);
  }, [id]);

  if (!initialFormState) return <div>Loading...</div>;

  return (
    <AddressForm
      title="Ubah Alamat"
      initialData={initialFormState}
      onBack={() => navigate(-1)}
      onSubmit={async (updatedData) => {
        try {
          const response = await fetch(`/api/address/${addressId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedData),
          });

          if (!response.ok) throw new Error("Failed to update address");

          const saved = await response.json();
          dispatch(authActions.updateAddress(saved));
          navigate("/settings/address");
        } catch (error) {
          console.error(error);
        }
      }}
    />
  );
}