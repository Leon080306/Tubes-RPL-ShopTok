import { lazy } from 'react';
import { Route, Routes } from 'react-router';

const HomePage = lazy(() => import('../pages/HomePage'));
const MyAccountPage = lazy(() => import('../pages/MyAccountPage/MyAccountPage'));

export const AppRoutes = () => {
    return <Routes>
        <Route path='/' element={<HomePage />}/>
        <Route path='/my-account' element={<MyAccountPage />}/>
        <Route path='/my-account/:menu' element={<MyAccountPage />}/>
    </Routes>
}