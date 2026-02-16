import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../api/auth';
import {
  Box,
  Badge,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleGoogleLogin = (idToken) => {
    loginWithGoogle({ idToken })
      .then(() => {
        toast({
          title: "¡Sesión iniciada con Google!",
          status: "success",
          duration: 3000,
          isClosable: true,
          variant: "subtle", 
          onCloseComplete: () => navigate("/"),
        });
      })
      .catch(() => {
        toast({
          title: "Error al iniciar con Google",
          status: "error",
          duration: 3000,
          isClosable: true,
          variant: "subtle",
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
        'linear(to-br, blue.50, cyan.50)',
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
        borderColor={useColorModeValue('blue.100', 'whiteAlpha.200')}
      >
        <Stack spacing={6}>
          <HStack justify="center">
            <Badge colorScheme="blue" px={3} py={1} rounded="full">
              Acceso seguro
            </Badge>
          </HStack>

          <Heading size="lg" textAlign="center" color="blue.600">
            Inicia sesión con Google
          </Heading>

          <Text textAlign="center" color="gray.500">
            Tu sesión quedará guardada automáticamente en este navegador.
          </Text>

          <GoogleAuthButton onSuccess={handleGoogleLogin} />

          <Box
            bg={useColorModeValue('blue.50', 'whiteAlpha.100')}
            rounded="xl"
            p={4}
          >
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Entra en segundos, sin contraseña y con verificación de Google.
            </Text>
          </Box>

          <Text textAlign="center">
            <Link as={RouterLink} to="/register" color="blue.500">
              Crear cuenta con Google
            </Link>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
