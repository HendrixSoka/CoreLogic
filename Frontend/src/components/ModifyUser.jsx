import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  Avatar,
  useToast,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import { updateUser } from '../api/auth'
import { useEffect } from "react";
const ModifyUser = ({ usuario=null }) => {
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword :""
  });

  useEffect(() => {
    if (usuario) {
      setForm((prev) => ({
        ...prev,
        email: usuario.correo || "",
      }));
    }
  }, [usuario]);

  const [foto, setFoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "confirmPassword") {
      handleConfirmPassword();
    }
  };

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleConfirmPassword = () => {
    if (form.newPassword !== form.confirmPassword) {
      setForm((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
      toast({
        title: "Error",
        description: error?.message || "Las contraseñas no coinciden. Por favor, vuelve a ingresarlas.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } 
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(usuario.id_usuario, {
        email: form.email,
        password: form.oldPassword,
        new_password: form.newPassword,
      }, foto);

      toast({
        title: "Perfil actualizado",
        description: "Los cambios fueron guardados correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el perfil.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="blue.50" minH="100vh" p={6} display="flex" justifyContent="center" alignItems="center">
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        p={8}
        rounded="xl"
        boxShadow="lg"
        maxW="4xl"
        w="100%"
        display="grid"
        gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={8}
      >
        <VStack spacing={4} align="stretch">
          <Heading fontSize="2xl" color="gray.700">Perfil de {usuario.username}</Heading>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              bg="gray.50"
            />
            
          </FormControl>

          <FormControl>
            <FormLabel>Contraseña actual</FormLabel>
            <Input
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              type="password"
              bg="gray.50"
            />
            <Text fontSize="sm" color="gray.500">
              Es nesesario para cualquier tipo de cambio 
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel>Nueva contraseña</FormLabel>
            <Input
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              type="password"
              bg="gray.50"
            />
            <Text fontSize="sm" color="gray.500">
              Déjalo en blanco si no quieres cambiar la contraseña
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel>Confirmar nueva contraseña</FormLabel>
            <Input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              bg="gray.50"
            />
          </FormControl>

          <Button type="submit" colorScheme="blue" mt={4}>
            Guardar cambios
          </Button>
        </VStack>

        <VStack spacing={4} align="center" justify="center">
          <Avatar
            size="2xl"
            name={usuario.username}
            src={usuario.fotoURL || undefined}
          />
          <FormLabel htmlFor="foto" cursor="pointer" color="blue.500" _hover={{ textDecoration: "underline" }}>
            Cambiar foto
            <Input id="foto" type="file" onChange={handleFotoChange} display="none" />
          </FormLabel>
        </VStack>
      </Box>
    </Box>
  );
}

export default ModifyUser;