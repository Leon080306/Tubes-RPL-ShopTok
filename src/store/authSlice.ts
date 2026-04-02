import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import {
  type AuthState,
  type UserInfo,
  type Address,
  type CreditCard,
  type BankAccount,
} from "../type"

const savedUser = localStorage.getItem("user_data")
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

const initialState: AuthState = {
  userInfo: savedUser && isLoggedIn ? JSON.parse(savedUser) : undefined,
  isLoading: false,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo | undefined>) => {
      state.userInfo = action.payload
      state.isLoading = false

      if (action.payload) {
        localStorage.setItem("user_data", JSON.stringify(action.payload))
        localStorage.setItem("isLoggedIn", "true")
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload }
        localStorage.setItem("user_data", JSON.stringify(state.userInfo))
      }
    },
    logout: (state) => {
      state.userInfo = undefined
      state.isLoading = false

      localStorage.removeItem("user_data")
      localStorage.removeItem("isLoggedIn")
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      if (state.userInfo) {
        if (!state.userInfo.addresses) {
          state.userInfo.addresses = []
        }
        if (action.payload.isDefault) {
          state.userInfo.addresses = state.userInfo.addresses.map((addr) => ({
            ...addr,
            isDefault: false,
          }))
        }
        state.userInfo.addresses.push(action.payload)
        localStorage.setItem("user_data", JSON.stringify(state.userInfo))
      }
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      if (state.userInfo && state.userInfo.addresses) {
        if (action.payload.isDefault) {
          state.userInfo.addresses = state.userInfo.addresses.map((addr) => ({
            ...addr,
            isDefault: false,
          }))
        }

        const index = state.userInfo.addresses.findIndex(
          (addr) => addr.id === action.payload.id,
        )
        if (index !== -1) {
          state.userInfo.addresses[index] = action.payload
        }

        localStorage.setItem("user_data", JSON.stringify(state.userInfo))
      }
    },
    addCard: (state, action: PayloadAction<CreditCard>) => {
      if (state.userInfo) {
        if (!state.userInfo.cards) state.userInfo.cards = []
        state.userInfo.cards.push(action.payload)
        localStorage.setItem("user_data", JSON.stringify(state.userInfo))
      }
    },
    addBankAccount: (state, action: PayloadAction<BankAccount>) => {
      if (state.userInfo) {
        if (!state.userInfo.bankAccounts) state.userInfo.bankAccounts = []
        state.userInfo.bankAccounts.push(action.payload)
        localStorage.setItem("user_data", JSON.stringify(state.userInfo))
      }
    },
    changePassword: (state, action: PayloadAction<string>) => {
      if (state.userInfo) {
        state.userInfo.password = action.payload 
        localStorage.setItem("user_data", JSON.stringify(state.userInfo))
      }
    },

    deleteAccount: (state) => {
      state.userInfo = undefined
      state.isLoading = false
      localStorage.removeItem("user_data")
      localStorage.removeItem("isLoggedIn")
    },
  },
})

export const authActions = authSlice.actions
export const authReducer = authSlice.reducer
