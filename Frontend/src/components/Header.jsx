import {
  Box,
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ onLogout }) {
  const { user } = useAuth();

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 5 }}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={{ base: 4, md: 5 }}
        bgGradient="linear(90deg, #6D28D9, #7C3AED, #5B21B6)"
        boxShadow="0 4px 20px rgba(109,40,217,0.2)"
        rounded="18px"
        maxW="7xl"
        mx="auto"
        px={{ base: 5, md: 7 }}
        py={{ base: 5, md: 5 }}
        mb={3}
      >
        <Box>
          <Heading
            as="h1"
            size={{ base: 'xl', md: '2xl' }}
            color="white"
            fontWeight="800"
            textAlign={{ base: 'center', md: 'left' }}
          >
            EjerciciosFNI
          </Heading>
          <Text mt={1} color="whiteAlpha.900" fontSize={{ base: 'sm', md: 'md' }} textAlign={{ base: 'center', md: 'left' }}>
            Repositorio académico.
          </Text>
        </Box>
        <Flex align="center" gap={3} wrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
          {user ? (
            <>
              <ChakraLink
                as={Link}
                to="/perfil"
                color="white"
                border="1px solid"
                borderColor="whiteAlpha.400"
                bg="whiteAlpha.200"
                px={4}
                py={2}
                rounded="18px"
                w={{ base: '100%', sm: 'auto' }}
                textAlign="center"
                fontWeight="700"
                _hover={{ bg: 'whiteAlpha.300', textDecoration: 'none' }}
              >
                {user.nombre}
              </ChakraLink>
              <Button
                onClick={onLogout}
                bg="#6D28D9"
                color="white"
                px={4}
                py={2}
                rounded="18px"
                w={{ base: '100%', sm: 'auto' }}
                _hover={{ bg: '#5B21B6', transform: 'translateY(-1px)' }}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <ChakraLink
                as={Link}
                to="/login"
                color="white"
                border="1px solid"
                borderColor="whiteAlpha.400"
                bg="whiteAlpha.200"
                px={4}
                py={2}
                rounded="18px"
                w={{ base: '100%', sm: 'auto' }}
                textAlign="center"
                fontWeight="700"
                _hover={{ bg: 'whiteAlpha.300', textDecoration: 'none' }}
              >
                Iniciar Sesión
              </ChakraLink>
              <Button
                as={Link}
                to="/register"
                bg="white"
                color="#6D28D9"
                px={4}
                py={2}
                rounded="18px"
                w={{ base: '100%', sm: 'auto' }}
                _hover={{ bg: '#F5F3FF', transform: 'translateY(-1px)' }}
              >
                Registrar
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Flex
        gap={{ base: 3, md: 4 }}
        wrap="wrap"
        maxW="7xl"
        mx="auto"
        px={{ base: 1, md: 2 }}
        mb={2}
        justify={{ base: 'center', md: 'start' }}
      >
        <Button
          as={Link}
          to="/HomePage"
          bg="#6D28D9"
          color="white"
          px={4}
          py={2}
          rounded="18px"
          w={{ base: '100%', sm: 'auto' }}
          _hover={{ bg: '#5B21B6', transform: 'translateY(-1px)' }}
        >
          Problemas
        </Button>
        <Button
          as={Link}
          to="/subir-ejercicio"
          bg="#8B5CF6"
          color="white"
          px={4}
          py={2}
          rounded="18px"
          w={{ base: '100%', sm: 'auto' }}
          _hover={{ bg: '#6D28D9', transform: 'translateY(-1px)' }}
        >
          Subir Problema
        </Button>
        <Button
          as={Link}
          to="/"
          bg="white"
          color="#6D28D9"
          px={4}
          py={2}
          rounded="18px"
          w={{ base: '100%', sm: 'auto' }}
          _hover={{ bg: '#F5F3FF', transform: 'translateY(-1px)' }}
        >
          Comenzar
        </Button>

      </Flex>
    </Box>
  );
}
