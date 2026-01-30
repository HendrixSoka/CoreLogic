import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  useColorModeValue,
  Flex,
  VStack,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { obtenerProblemaPorId } from '../api/problemService';
import { getUserDataFromToken } from '../api/auth';
import BlockRenderer from '../components/BlockRenderer';
import SolucionList from '../components/SolutionList';

export default function ProblemPage() {
  const { id_problema } = useParams();
  const [problema, setProblema] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUserDataFromToken();

  useEffect(() => {
    const cargarProblema = async () => {
      try {
        const res = await obtenerProblemaPorId(id_problema);
        setProblema(res);
      } catch (err) {
        console.error('Error al cargar el problema', err);
      } finally {
        setLoading(false);
      }
    };
    cargarProblema();
  }, [id_problema]);

  const cardBg = useColorModeValue('white', 'gray.700');

  if (loading)
    return (
      <Text color="gray.500">
        <Spinner mr={2} /> Cargando problema...
      </Text>
    );

  if (!problema)
    return <Text color="red.500">Problema no encontrado.</Text>;

  return (
    <Box px={{ base: 4, md: 12 }} py={6}>
      <Stack spacing={6}>
        {/* Encabezado con botón de edición */}
        <Flex justify="space-between" align="center">
          <Heading as="h2" size="lg">
            {problema.titulo}
          </Heading>
          {user?.id == problema.id_usuario && (
            <Button
              colorScheme="blue"
              onClick={() => navigate(`/modificar-ejercicio/${id_problema}`)}
            >
              ✏️ Modificar
            </Button>
          )}
        </Flex>

        {/* Cuerpo dividido en dos columnas */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          {/* Enunciado */}
          <Box
            flex={3}
            bg={cardBg}
            p={5}
            rounded="md"
            border="1px"
            borderColor="pink.200"
            shadow="sm"
          >
            <Heading size="md" mb={4}>Enunciado</Heading>
            <BlockRenderer contenido={problema.enunciado} editable={false} />
          </Box>

          {/* Metadatos */}
          <VStack
            flex={1}
            bg="purple.50"
            p={5}
            rounded="md"
            border="1px"
            borderColor="purple.200"
            shadow="sm"
            align="stretch"
            spacing={3}
            fontSize="sm"
          >
            <Heading size="md">Detalles</Heading>
            <Divider />
            <Box><strong>Materia:</strong> {problema.materia}</Box>
            <Box><strong>Tipo:</strong> {problema.tipo}</Box>
            <Box><strong>Dificultad:</strong> {problema.dificultad || '—'}</Box>
            <Box><strong>Carrera:</strong> {problema.carrera}</Box>
            <Box><strong>Propietario:</strong> {problema.propietario}</Box>
          </VStack>
        </Flex>

        {/* Soluciones */}
        <Box
          bg="cyan.50"
          p={5}
          rounded="md"
          border="1px"
          borderColor="cyan.200"
          shadow="sm"
          mt={4}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h3" size="md">Soluciones</Heading>
            <Button
              colorScheme="teal"
              onClick={() => navigate(`/subir-solucion/${id_problema}`)}
            >
              ➕ Subir solución
            </Button>
          </Flex>

          <SolucionList id={id_problema} tipo="problema" />
        </Box>
      </Stack>
    </Box>
  );
}
