import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { type AsyncDataState } from '../type';
import type { RootState } from '../redux/store';

const API_URL = "http://localhost:3000/order";

// Action untuk Checkout
export const checkoutOrder = createAsyncThunk(
    'order/checkout',
    async (payload: { address_id: string; voucher_id?: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.userInfo?.token;

            const response = await axios.post(`${API_URL}/checkout`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Action untuk Cancel Order
export const cancelOrder = createAsyncThunk(
    'order/cancel',
    async (order_id: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.userInfo?.token;

            const response = await axios.patch(`${API_URL}/cancel/${order_id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { order_id, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [] as any[], // Nanti bisa buatkan type Order di type.ts
        status: 'idle' as AsyncDataState,
        error: null as string | null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Checkout
            .addCase(checkoutOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(checkoutOrder.fulfilled, (state, action) => {
                state.status = 'fulfilled';
                state.orders.push(...action.payload.orders);
            })
            .addCase(checkoutOrder.rejected, (state, action: any) => {
                state.status = 'error';
                state.error = action.payload?.message || "Checkout failed";
            })
            // Cancel
            .addCase(cancelOrder.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o.order_id === action.payload.order_id);
                if (index !== -1) {
                    state.orders[index].status = 'cancelled';
                }
            });
    }
});

export const orderReducer = orderSlice.reducer;