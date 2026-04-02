import BankForm from "../../../components/BankForm"
import { useAppDispatch } from "../../../hooks/useAppDispatch"
import { authActions } from "../../../store/authSlice"
import { useNavigate } from "react-router"

export default function BankAddPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return (
    <BankForm
      onBack={() => navigate(-1)}
      onSubmit={(data) => {
        dispatch(authActions.addBankAccount(data))
        navigate("/settings/bank")
      }}
    />
  )
}