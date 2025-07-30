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
} from "@chakra-ui/react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const toast = useToast();

  const handleRegister = () => {
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
        });
        console.log("Registrado", res);
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
          <FormControl>
            <FormLabel>Nombre de Usuario</FormLabel>
            <Input
              type="text"
              placeholder="Tu nombre visible"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
            <Text fontSize="xs" color="gray.500">
              El nombre con el que los demás lo verán
            </Text>
          </FormControl>

          {/* Correo */}
          <FormControl>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              placeholder="ejemplo@correo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormControl>

          {/* Contraseña */}
          <FormControl>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Mínimo 5 caracteres"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <Text fontSize="xs" color="gray.500">
              La contraseña debe tener mínimo 5 caracteres
            </Text>
          </FormControl>

          {/* Confirmar contraseña */}
          <FormControl>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Repite la contraseña"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
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
