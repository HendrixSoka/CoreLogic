import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { registerUser } from "../api/auth";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Stack,
  Heading,
  useColorModeValue,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errores, setErrores] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const limpiarError = (campo) => {
    setErrores(prev => ({ ...prev, [campo]: "" }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};


    if (!form.username.trim()) {
      nuevosErrores.username = "El nombre de usuario es obligatorio";
    } else if (form.username.length < 3) {
      nuevosErrores.username = "Mínimo 3 caracteres";
    }

    if (!form.email.trim()) {
      nuevosErrores.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nuevosErrores.email = "Email no válido";
    }

    if (!form.password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (form.password.length < 5) {
      nuevosErrores.password = "Mínimo 5 caracteres";
    }

    if (!form.confirmPassword) {
      nuevosErrores.confirmPassword = "Confirma tu contraseña";
    } else if (form.password !== form.confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = () => {
    if (!validarFormulario()) return;
    if (form.password !== form.confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    registerUser({
      name: form.username,
      email: form.email,
      password: form.password,
    })
      .then((res) => {
        toast({
          title: "Registro exitoso",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
          onCloseComplete: () => navigate("/login")
        });
        
      })
      .catch((err) => {
        toast({
          title: "Error al registrar",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        console.error("Error al registrar usuario", err);
      });
  };

  
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("gray.50", "gray.800")}
      px={4}
    >
      <Box
        bg={useColorModeValue("white", "gray.700")}
        p={8}
        rounded="lg"
        shadow="md"
        w="100%"
        maxW="400px"
      >
        <Stack spacing={4}>
          <Heading size="md" textAlign="center" color="blue.600">
            Crear Cuenta
          </Heading>

          {/* Nombre de usuario */}
          <FormControl isInvalid={errores.username}>
            <FormLabel>Nombre de Usuario</FormLabel>
            <Input
              type="text"
              placeholder="Tu nombre visible"
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                limpiarError('username');
              }}
            />
            <FormErrorMessage>{errores.username}</FormErrorMessage>
            <Text fontSize="xs" color="gray.500">
              El nombre con el que los demás lo verán
            </Text>
          </FormControl>

          {/* Correo */}
          <FormControl isInvalid={errores.email}>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              placeholder="ejemplo@correo.com"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                limpiarError('email');
              }}
            />
            <FormErrorMessage>{errores.email}</FormErrorMessage>
          </FormControl>

          {/* Contraseña */}
          <FormControl isInvalid={errores.password}>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Mínimo 5 caracteres"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                limpiarError('password');
              }}
            />
            <FormErrorMessage>{errores.password}</FormErrorMessage>
            <Text fontSize="xs" color="gray.500">
              La contraseña debe tener mínimo 5 caracteres
            </Text>
          </FormControl>

          {/* Confirmar contraseña */}
          <FormControl isInvalid={errores.confirmPassword}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Repite la contraseña"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                limpiarError('confirmPassword');
              }}
            />
            <FormErrorMessage>{errores.confirmPassword}</FormErrorMessage>
          </FormControl>

          {/* Botón */}
          <Button colorScheme="blue" onClick={handleRegister} mt={2}>
            Registrar
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
