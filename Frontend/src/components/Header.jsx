import {
  Box,
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ onLogout }) {
  const bgHeader = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('blue.100', 'blue.700');
  const textBlue = useColorModeValue('blue.500', 'blue.200');
  const btnBg = useColorModeValue('blue.300', 'blue.600');
  const btnBgHover = useColorModeValue('blue.400', 'blue.700');
  const btnGreenBg = useColorModeValue('green.300', 'green.600');
  const btnGreenHover = useColorModeValue('green.400', 'green.700');
  const { user } = useAuth();

  return (
    <Box px={{ base: 3, md: 10 }} py={4}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={{ base: 3, md: 4 }}
        bg={bgHeader}
        shadow="sm"
        rounded="2xl"
        maxW="7xl"
        mx="auto"
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 4 }}
        mb={6}
        border="1px"
        borderColor={borderColor}
      >
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }} color={textBlue} fontWeight="bold" textAlign={{ base: 'center', md: 'left' }}>
          EjerciciosFNI
        </Heading>
        <Flex align="center" gap={3} wrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
          {user ? (
            <>
              <ChakraLink
                as={Link}
                to="/perfil"
                color={textBlue}
                border="1px"
                borderColor="blue.300"
                px={4}
                py={2}
                rounded="2xl"
                w={{ base: '100%', sm: 'auto' }}
                textAlign="center"
                _hover={{ bg: 'blue.100' }}
              >
                {user.nombre}
              </ChakraLink>
              <Button
                onClick={onLogout}
                bg={btnBg}
                color="white"
                px={4}
                py={2}
                rounded="2xl"
                w={{ base: '100%', sm: 'auto' }}
                _hover={{ bg: btnBgHover }}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <ChakraLink
                as={Link}
                to="/login"
                color={textBlue}
                border="1px"
                borderColor="blue.300"
                px={4}
                py={2}
                rounded="2xl"
                w={{ base: '100%', sm: 'auto' }}
                textAlign="center"
                _hover={{ bg: 'blue.100' }}
              >
                Iniciar Sesión
              </ChakraLink>
              <Button
                as={Link}
                to="/register"
                bg={btnBg}
                color="white"
                px={4}
                py={2}
                rounded="2xl"
                w={{ base: '100%', sm: 'auto' }}
                _hover={{ bg: btnBgHover }}
              >
                Registrar
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Flex
        gap={{ base: 2, md: 4 }}
        wrap="wrap"
        maxW="7xl"
        mx="auto"
        px={{ base: 2, md: 6 }}
        mb={4}
        justify={{ base: 'center', md: 'start' }}
      >
        <Button
          as={Link}
          to="/HomePage"
          bg={btnBg}
          color="white"
          px={4}
          py={2}
          rounded="xl"
          w={{ base: '100%', sm: 'auto' }}
          _hover={{ bg: btnBgHover }}
        >
          Problemas
        </Button>
        <Button
          as={Link}
          to="/subir-ejercicio"
          bg={btnGreenBg}
          color="white"
          px={4}
          py={2}
          rounded="xl"
          w={{ base: '100%', sm: 'auto' }}
          _hover={{ bg: btnGreenHover }}
        >
          Subir Problema
        </Button>
        <Button
          as={Link}
          to="/"
          bg="cyan.500"
          color="white"
          px={4}
          py={2}
          rounded="xl"
          w={{ base: '100%', sm: 'auto' }}
          _hover={{ bg: "cyan.600" }}
        >
          Comenzar
        </Button>

      </Flex>
    </Box>
  );
}
