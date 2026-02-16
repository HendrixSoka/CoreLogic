import { useNavigate } from 'react-router-dom';
import {
  Box,
  Badge,
  HStack,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { loginWithGoogle } from '../api/auth';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function RegisterPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const handleGoogleRegister = (idToken) => {
    loginWithGoogle({ idToken })
      .then(() => {
        toast({
          title: 'Cuenta lista con Google',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
          onCloseComplete: () => navigate('/'),
        });
      })
      .catch((err) => {
        const mensaje = err.response?.data?.detail || 'No se pudo registrar con Google';
        toast({
          title: 'Error al registrar',
          description: mensaje,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      });
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient={useColorModeValue(
        'linear(to-br, cyan.50, blue.50)',
        'linear(to-br, gray.900, gray.800)'
      )}
      px={4}
      py={10}
    >
      <Box
        bg={useColorModeValue('white', 'gray.700')}
        p={10}
        rounded="2xl"
        shadow="xl"
        w="100%"
        maxW="500px"
        border="1px solid"
        borderColor={useColorModeValue('cyan.100', 'whiteAlpha.200')}
      >
        <Stack spacing={6}>
          <HStack justify="center">
            <Badge colorScheme="cyan" px={3} py={1} rounded="full">
              Registro rápido
            </Badge>
          </HStack>

          <Heading size="lg" textAlign="center" color="blue.600">
            Crear cuenta con Google
          </Heading>

          <Text fontSize="md" textAlign="center" color="gray.500">
            Ya no necesitas correo y contraseña. Tu cuenta se crea al continuar con Google.
          </Text>

          <Box
            bg={useColorModeValue('cyan.50', 'whiteAlpha.100')}
            rounded="xl"
            p={4}
          >
            <Text fontSize="sm" color="gray.600" textAlign="center">
              La sesión quedará guardada automáticamente después de entrar.
            </Text>
          </Box>

          <GoogleAuthButton onSuccess={handleGoogleRegister} />
        </Stack>
      </Box>
    </Box>
  );
}
