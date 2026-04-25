import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../store/authSlice';
import orderReducer from '../store/orderSlice';
import { wishlistReducer } from '../store/wishlistSlice';
import { cartReducer } from '../store/cartSlice';
// import { cartReducer } from '../store/cartSlice';
// import { orderReducer } from '../store/orderSlice';
// import { wishlistReducer } from '../store/wishlistSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        order: orderReducer,
        wishlist: wishlistReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;