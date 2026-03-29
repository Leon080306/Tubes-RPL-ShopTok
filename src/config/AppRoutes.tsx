import { lazy } from 'react';
import { Route, Routes } from 'react-router';

const HomePage = lazy(() => import('../pages/HomePage'));
const ProductPage = lazy(() => import('../pages/ProductPage/ProductPage'));

export const AppRoutes = () => {
    return <Routes>
        <Route path='/' element={<HomePage />}/>
        <Route path='/product/:id' element={<ProductPage />}/>
    </Routes>
}