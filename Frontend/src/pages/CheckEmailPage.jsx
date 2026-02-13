import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { EmailIcon, RepeatIcon } from "@chakra-ui/icons";

import { useNavigate } from "react-router-dom";

export default function CheckEmail() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="md"
        maxW="md"
        w="100%"
        textAlign="center"
      >
        <VStack spacing={5}>

          {/* Icono */}
          <Icon
            as={EmailIcon}
            boxSize={14}
            color="green.400"
          />

          {/* Título */}
          <Heading size="lg" color="gray.700">
            Revisa tu correo
          </Heading>

          {/* Texto */}
          <Text color="gray.600" fontSize="md">
            Te enviamos un enlace de verificación a tu correo electrónico.
            Haz clic en él para activar tu cuenta.
          </Text>

          <Text fontSize="sm" color="gray.500">
            Si no aparece en tu bandeja, revisa spam.
          </Text>

          {/* Botón volver */}
          <Button
            colorScheme="green"
            width="100%"
            onClick={() => navigate("/login")}
          >
            Ir al login
          </Button>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Si no recibiste el correo, inicia sesión y desde tu cuenta
            podrás solicitar un nuevo enlace de verificación.
          </Text>


        </VStack>
      </Box>
    </Box>
  );
}
