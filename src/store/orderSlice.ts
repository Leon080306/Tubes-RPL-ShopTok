import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { type AsyncDataState, type OrderDetail } from '../type';
import type { RootState } from '../redux/store';
import type { Order } from '../type';

const API_URL = "/api/order";

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
        orders: [] as OrderDetail[], 
        status: 'idle' as AsyncDataState,
        currentOrder: null as OrderDetail | null, 
        error: null as string | null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchShopOrders
            .addCase(fetchShopOrders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchShopOrders.fulfilled, (state, action) => {
                state.status = 'fulfilled';
                state.orders = action.payload;
            })
            .addCase(fetchShopOrders.rejected, (state, action: any) => {
                state.status = 'error';
                state.error = action.payload?.message || "Gagal fetch shop orders";
            })
            // updateOrderStatus
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o.order_id === action.payload.order_id);
                if (index !== -1) {
                    state.orders[index].status = action.payload.status as any;
                }
            })
            // Order history
            .addCase(fetchMyOrders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.status = 'fulfilled';
                state.orders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action: any) => {
                state.status = 'error';
                state.error = action.payload?.message || "Gagal fetch orders";
            })
            // Order detail
            .addCase(fetchOrderDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOrderDetail.fulfilled, (state, action) => {
                state.status = 'fulfilled';
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderDetail.rejected, (state, action: any) => {
                state.status = 'error';
                state.error = action.payload?.message || "Gagal fetch detail order";
            })
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


export const fetchOrderDetail = createAsyncThunk(
    'order/fetchDetail',
    async (order_id: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.userInfo?.token;

            const response = await axios.get(`${API_URL}/${order_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data as OrderDetail;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchMyOrders = createAsyncThunk(
    'order/fetchMyOrders',
    async (statusFilter: string = 'all', { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.userInfo?.token;

            const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
            const response = await axios.get(`${API_URL}${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data as OrderDetail[];
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Seller: fetch orders masuk ke toko
export const fetchShopOrders = createAsyncThunk(
    'order/fetchShopOrders',
    async ({ shop_id, statusFilter = 'all' }: { shop_id: string; statusFilter?: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.userInfo?.token;
            const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';

            const response = await axios.get(`${API_URL}/shop/${shop_id}${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data as OrderDetail[];
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Seller: update status order
export const updateOrderStatus = createAsyncThunk(
    'order/updateStatus',
    async ({ order_id, status }: { order_id: string; status: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.userInfo?.token;

            const response = await axios.patch(`${API_URL}/status/${order_id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { order_id, status, data: response.data.data };
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const orderReducer = orderSlice.reducer;