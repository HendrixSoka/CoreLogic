import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, Heading, Spinner, Stack, Text, useToast } from "@chakra-ui/react";
import { verifyEmail } from "../api/auth";

export default function Verify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        toast({
          title: "Cuenta activada",
          status: "success",
          duration: 3000,
          isClosable: true,
          variant: "subtle",
        });
      })
      .catch(() => {
        setStatus("error");
        toast({
          title: "No se pudo activar la cuenta",
          status: "error",
          duration: 3000,
          isClosable: true,
          variant: "subtle",
        });
      });
  }, [params, toast]);

  return (
    <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Stack spacing={3} align="center" textAlign="center">
        <Heading size="md">Verificación de cuenta</Heading>

        {status === "loading" && (
          <>
            <Spinner />
            <Text>Verificando tu cuenta...</Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text>Tu cuenta fue activada correctamente.</Text>
            <Button colorScheme="blue" onClick={() => navigate("/login")}>
              Ir a iniciar sesión
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Text>El enlace no es válido o ya expiró.</Text>
            <Button colorScheme="blue" variant="outline" onClick={() => navigate("/register")}>
              Volver a registrarme
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}
