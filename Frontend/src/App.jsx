// App.jsx
import './App.css';
import AppRoutes from './routes/Routes';
import { Box } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

function App() {
  const location = useLocation();
  const rutasSinLayout = ['/login', '/register'];
  const sinLayout = rutasSinLayout.includes(location.pathname);
  const { logout } = useAuth();
  return (
    <Box className="app-shell" minH="100vh" display="flex" flexDirection="column">
      {!sinLayout && <Header onLogout={logout} />}

      <Box flex="1" px={{ base: 4, md: 6 }} pt={{ base: 2, md: 3 }} pb={{ base: 4, md: 5 }}>
        <AppRoutes />
      </Box>

      {!sinLayout && <Footer />}
    </Box>
  );
}

export default App;
