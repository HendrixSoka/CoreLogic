import {
  Box,
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { getUserDataFromToken } from '../api/auth';

export default function Header({ onLogout }) {
  const bgHeader = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('blue.100', 'blue.700');
  const textBlue = useColorModeValue('blue.500', 'blue.200');
  const btnBg = useColorModeValue('blue.300', 'blue.600');
  const btnBgHover = useColorModeValue('blue.400', 'blue.700');
  const btnGreenBg = useColorModeValue('green.300', 'green.600');
  const btnGreenHover = useColorModeValue('green.400', 'green.700');
  const user = getUserDataFromToken();

  return (
    <Box px={{ base: 4, md: 10 }} py={4}>
      <Flex
        justify="space-between"
        align="center"
        bg={bgHeader}
        shadow="sm"
        rounded="2xl"
        maxW="7xl"
        mx="auto"
        px={6}
        py={4}
        mb={6}
        border="1px"
        borderColor={borderColor}
      >
        <Heading as="h1" size="xl" color={textBlue} fontWeight="bold">
          CoreLogic
        </Heading>
        <Flex align="center" gap={4}>
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
                _hover={{ bg: btnBgHover }}
              >
                Registrar
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Flex
        gap={4}
        maxW="7xl"
        mx="auto"
        px={6}
        mb={4}
        justify="start"
      >
        <Button
          as={Link}
          to="/HomePage"
          bg={btnBg}
          color="white"
          px={4}
          py={2}
          rounded="xl"
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
          _hover={{ bg: "cyan.600" }}
        >
          Comenzar
        </Button>

      </Flex>
    </Box>
  );
}
