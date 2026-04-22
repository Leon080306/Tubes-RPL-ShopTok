import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../redux/store';
import type { AsyncDataState } from '../type';

const API_URL = "/api/wishlist";

// Type untuk item wishlist dari backend
export type WishlistProduct = {
    product_id: string;
    name: string;
    description: string;
    view_count: number;
    shop_id: string;
    category_id: string;
    variants?: {
        variant_id: string;
        name: string;
        price: string;
        picture: string;
        stock: number;
    }[];
}

export type WishlistItem = {
    user_id: string;
    product_id: string;
    product: WishlistProduct;
}

// Fetch semua wishlist
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetch',
    async (_, { getState, rejectWithValue }) => {
        try {
            // const state = getState() as RootState;
            // const token = state.auth.userInfo?.token;
            const response = await axios.get(API_URL, {
                withCredentials: true
            });
            return response.data.data as WishlistItem[];
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Toggle like/unlike
export const toggleWishlist = createAsyncThunk(
    'wishlist/toggle',
    async (product_id: string, { getState, rejectWithValue }) => {
        try {
            // const state = getState() as RootState;
            // const token = state.auth.userInfo?.token;
            const response = await axios.post(API_URL, { product_id }, {
                withCredentials: true
            });
            return { product_id, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [] as WishlistItem[],
        wishlistedIds: [] as string[],
        status: 'idle' as AsyncDataState,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.status = 'fulfilled';
                state.items = action.payload;
                state.wishlistedIds = action.payload.map(item => item.product_id);
            })
            .addCase(fetchWishlist.rejected, (state) => {
                state.status = 'error';
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                const { product_id, message } = action.payload;
                const isUnlike = message.includes('unlike');
                if (isUnlike) {
                    state.items = state.items.filter(i => i.product_id !== product_id);
                    state.wishlistedIds = state.wishlistedIds.filter(id => id !== product_id);
                } else {
                    // optimistic: tambah id dulu, data lengkap baru masuk saat fetch ulang
                    if (!state.wishlistedIds.includes(product_id)) {
                        state.wishlistedIds.push(product_id);
                    }
                }
            });
    }
});

export const wishlistReducer = wishlistSlice.reducer;