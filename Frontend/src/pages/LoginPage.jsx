import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(false);
  const toast = useToast();

  const handleLogin = () => {
    loginUser({ email, password: pass, rememberMe: remember })
      .then(() => {
        toast({
          title: "¡Logueado con éxito!",
          status: "success",
          duration: 3000,
          isClosable: true,
          variant: "subtle", 
          onCloseComplete: () => navigate("/"),
        });
      })
      .catch(() => {
        toast({
          title: "Error al iniciar sesión",
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
      bg={useColorModeValue('gray.50', 'gray.800')}
      px={4}
    >
      <Box
        bg={useColorModeValue('white', 'gray.700')}
        p={8}
        rounded="lg"
        shadow="md"
        w="100%"
        maxW="400px"
      >
        <Stack spacing={4}>
          <Heading size="md" textAlign="center" color="blue.600">
            Te damos la bienvenida de nuevo
          </Heading>

          <FormControl>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              focusBorderColor="blue.400"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="********"
              focusBorderColor="blue.400"
            />
          </FormControl>

          <Checkbox
            isChecked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            colorScheme="blue"
          >
            Recuérdame por un mes
          </Checkbox>

          <Button
            colorScheme="blue"
            onClick={handleLogin}
            size="md"
            mt={2}
          >
            Iniciar Sesión
          </Button>

          <Text textAlign="center" color="gray.500">o</Text>

          <Text textAlign="center">
            <Link as={RouterLink} to="/register" color="blue.500">
              Registrarse
            </Link>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
