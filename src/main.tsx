import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router'
import { Layout } from './components/Layout';
import { AppRoutes } from './config/AppRoutes';
import { theme } from './theme/theme';
import ScrollToTop from './components/ScrollToTop';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* <Provider store={store}> */}
      <BrowserRouter>
      <ScrollToTop />
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
      {/* </Provider> */}
    </ThemeProvider>
  </StrictMode>
)
