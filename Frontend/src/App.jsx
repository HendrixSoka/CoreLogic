// App.jsx
import './App.css';
import AppRoutes from './routes/Routes';
import { Box } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';

function App() {
  const location = useLocation();
  const rutasSinLayout = ['/login', '/register'];
  const sinLayout = rutasSinLayout.includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.reload();
  };
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {!sinLayout && <Header onLogout={handleLogout} />}

      {/* Contenido central */}
      <Box flex="1" px={6} py={4}>
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default App;
