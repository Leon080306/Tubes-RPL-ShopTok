import CardForm from "../components/CardForm"
import { useAppDispatch } from "../hooks/useAppDispatch"
import { authActions } from "../store/authSlice"
import { useNavigate } from "react-router"

export default function CardAddPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return (
    <CardForm
      onBack={() => navigate(-1)}
      onSubmit={(data) => {
        dispatch(authActions.addCard(data))
        navigate("/settings/bank")
      }}
    />
  )
}