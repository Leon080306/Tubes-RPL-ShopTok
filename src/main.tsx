import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router'
import { Layout } from './components/Layout';
import { AppRoutes } from './config/AppRoutes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline />
    {/* <Provider store={store}> */}
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    {/* </Provider> */}
  </StrictMode>
)
