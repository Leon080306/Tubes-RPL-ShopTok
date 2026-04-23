// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { type CartItem, type AsyncDataState } from '../type';
// import type { RootState } from '../redux/store'; 

// const API_URL = "/api/cart";

// export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { getState, rejectWithValue }) => {
//     try {
//         // const state = getState() as RootState;
//         // const token = state.auth.userInfo?.token;

//         // if (!token) return rejectWithValue("No token found");

//         const response = await axios.get(API_URL, {
//             withCredentials: true
//         });
//         return response.data;
//     } catch (error: any) {
//         return rejectWithValue(error.response.data);
//     }
// });

// export const updateCartItem = createAsyncThunk('cart/updateItem', async (payload: { variant_id: string, quantity?: number, is_selected?: boolean }, { getState, rejectWithValue }) => {
//     try {
//         const state = getState() as RootState;
//         // const token = state.auth.userInfo?.token;

//         const currentItem = state.cart.items.find(i => i.variant_id === payload.variant_id);

//         const response = await axios.patch(
//             `${API_URL}/${payload.variant_id}`,
//             {
//                 quantity: payload.quantity ?? currentItem?.quantity,
//                 is_selected: payload.is_selected ?? currentItem?.is_selected
//             },
//             {
//                 withCredentials: true
//             }
//         );
//         return response.data.data;
//     } catch (error: any) {
//         return rejectWithValue(error.response.data);
//     }
// });

// export const deleteCartItem = createAsyncThunk('cart/deleteItem', async (variant_id: string, { getState, rejectWithValue }) => {
//     try {
//         // const state = getState() as RootState;
//         // const token = state.auth.userInfo?.token;

//         await axios.delete(`${API_URL}/${variant_id}`, {
//             withCredentials: true
//         });
//         return variant_id;
//     } catch (error: any) {
//         return rejectWithValue(error.response.data);
//     }
// });

// // --- SLICE ---
// const cartSlice = createSlice({
//     name: 'cart',
//     initialState: { 
//         items: [] as CartItem[], 
//         total_payment: 0, 
//         status: 'idle' as AsyncDataState 
//     },
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             // Handle Fetch
//             .addCase(fetchCart.pending, (state) => {
//                 state.status = 'loading';
//             })
//             .addCase(fetchCart.fulfilled, (state, action) => {
//                 state.status = 'idle';
//                 state.items = action.payload.data;
//                 state.total_payment = action.payload.total_payment;
//             })
//             .addCase(fetchCart.rejected, (state) => {
//                 state.status = 'error';
//             })
//             // Handle Update
//             .addCase(updateCartItem.fulfilled, (state, action) => {
//                 const index = state.items.findIndex(item => item.variant_id === action.payload.variant_id);
//                 if (index !== -1) {
//                     state.items[index] = { ...state.items[index], ...action.payload };
//                 }
//                 state.total_payment = state.items
//                     .filter(item => item.is_selected)
//                     .reduce((sum, item) => sum + (Number(item.variant.price) * item.quantity), 0);
//             })
//             // Handle Delete
//             .addCase(deleteCartItem.fulfilled, (state, action) => {
//                 state.items = state.items.filter(item => item.variant_id !== action.payload);
//             });
//     }
// });

// // Export Reducer
// export const cartReducer = cartSlice.reducer;

import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../type";

interface CartResponse {
  data: CartItem[];
  total_payment: number;
}

interface CartState {
  items: CartItem[];
  total_payment: number;
  status: "idle" | "loading" | "success" | "failed";
}

const initialState: CartState = {
  items: [],
  total_payment: 0,
  status: "idle",
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (user_id: string, thunkAPI) => {
    try {
      const res = await fetch(`/api/cart?user_id=${user_id}`);
      return await res.json();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async (
        { user_id, variant_id, quantity, is_selected, skipRefetch = false }: { 
            user_id: string; 
            variant_id: string; 
            quantity?: number; 
            is_selected?: boolean 
            skipRefetch?: boolean;
        },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const res = await fetch(`/api/cart/${variant_id}?user_id=${user_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity, is_selected })
            });

            if (!res.ok) throw new Error("Gagal update cart");

            // refetch biar UI sinkron
            if (!skipRefetch) {
                dispatch(fetchCart(user_id));
            }

        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ variant_id, user_id }: { variant_id: string; user_id: string }, thunkAPI) => {
    try {
      await fetch(`/api/cart/${variant_id}?user_id=${user_id}`, {
        method: "DELETE",
      });
      await thunkAPI.dispatch(fetchCart(user_id));
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })

      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartResponse>) => {
          state.status = "success";
          state.items = action.payload.data;
          state.total_payment = action.payload.total_payment;
        }
      )

      .addCase(fetchCart.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const cartReducer = cartSlice.reducer;