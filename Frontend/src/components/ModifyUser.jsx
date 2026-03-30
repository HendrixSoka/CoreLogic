import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { updateUser } from "../api/auth";

const ModifyUser = ({ usuario = null }) => {
  const toast = useToast();
  const [nombre, setNombre] = useState("");
  const [foto, setFoto] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
    }
  }, [usuario]);

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);
      await updateUser(
        usuario.id_usuario,
        { nombre: nombre.trim() },
        foto
      );

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
        description: error?.detail || "No se pudo actualizar el perfil.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box
      bg="white"
      p={8}
      rounded="xl"
      boxShadow="lg"
      maxW="4xl"
      w="100%"
      mx="auto"
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap={8}
      as="form"
      onSubmit={handleSubmit}
    >
      <VStack spacing={4} align="stretch">
        <Heading fontSize="2xl" color="gray.700">
          Perfil de {usuario?.nombre}
        </Heading>

        <FormControl>
          <FormLabel>Nombre</FormLabel>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            bg="gray.50"
          />
          <Text fontSize="sm" color="gray.500" mt={2}>
            Puedes cambiar tu nombre visible y tu foto de perfil.
          </Text>
        </FormControl>

        <Button type="submit" colorScheme="blue" mt={4} isLoading={guardando}>
          Guardar cambios
        </Button>
      </VStack>

      <VStack spacing={4} align="center" justify="center">
        <Avatar
          size="2xl"
          name={usuario?.nombre}
          src={foto ? URL.createObjectURL(foto) : (usuario?.foto || undefined)}
        />
        <FormLabel
          htmlFor="foto"
          cursor="pointer"
          color="blue.500"
          _hover={{ textDecoration: "underline" }}
        >
          Cambiar foto
          <Input id="foto" type="file" onChange={handleFotoChange} display="none" />
        </FormLabel>
      </VStack>
    </Box>
  );
};

export default ModifyUser;
