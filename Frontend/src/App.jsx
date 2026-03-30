// App.jsx
import './App.css';
import AppRoutes from './routes/Routes';
import { Box } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

function App() {
  const location = useLocation();
  const rutasSinLayout = ['/login', '/register'];
  const sinLayout = rutasSinLayout.includes(location.pathname);
  const { logout } = useAuth();
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {!sinLayout && <Header onLogout={logout} />}

      {/* Contenido central */}
      <Box flex="1" px={6} py={4}>
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default App;
