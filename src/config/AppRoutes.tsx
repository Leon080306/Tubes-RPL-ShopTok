import { lazy } from 'react';
import { Route, Routes } from 'react-router';

const HomePage = lazy(() => import('../pages/Homepage'));

export const AppRoutes = () => {
    return <Routes>
        <Route path='/' element={<HomePage />}/>
    </Routes>
}