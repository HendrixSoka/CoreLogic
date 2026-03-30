import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  Heading,
  Text,
  Spinner,
  useColorModeValue,
  Flex,
  VStack,
  Stack,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { obtenerProblemaPorId } from '../api/problemService';
import BlockRenderer from '../components/BlockRenderer';
import SolucionList from '../components/SolutionList';
import { useAuth } from '../context/AuthContext';
import { approveProblem, deleteProblem } from '../api/adminService';

export default function ProblemPage() {
  const { id_problema } = useParams();
  const [problema, setProblema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAdmin } = useAuth();
  const cancelRef = useRef(null);

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
  const isOwner = user?.id == problema?.id_usuario;
  const showApprove = isAdmin && problema?.estado === 'Pendiente';
  const showModify = isOwner;
  const showDelete = isOwner || isAdmin;

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveProblem(id_problema);
      toast({
        title: 'Problema aprobado',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      const res = await obtenerProblemaPorId(id_problema);
      setProblema(res);
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'No se pudo aprobar el problema',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      setIsDeleteDialogOpen(false);
      await deleteProblem(id_problema);
      toast({
        title: 'Problema eliminado',
        status: 'success',
        duration: 2500,
        isClosable: true,
        onCloseComplete: () => navigate('/perfil'),
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'No se pudo eliminar el problema',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <Flex align="center" color="gray.500" gap={2}>
        <Spinner /> <Text as="span">Cargando problema...</Text>
      </Flex>
    );

  if (!problema)
    return <Text color="red.500">Problema no encontrado.</Text>;

  return (
    <Box px={{ base: 4, md: 12 }} py={6}>
      <Stack spacing={6}>
        {/* Encabezado con botón de edición */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Heading as="h2" size="lg">
            {problema.titulo}
          </Heading>
          <Flex gap={3} wrap="wrap">
            {showModify && (
              <Button
                colorScheme="blue"
                onClick={() => navigate(`/modificar-ejercicio/${id_problema}`)}
              >
                Modificar
              </Button>
            )}
            {showApprove && (
              <Button
                colorScheme="green"
                isLoading={processing}
                onClick={handleApprove}
              >
                Aprobar
              </Button>
            )}
            {showDelete && (
              <Button
                colorScheme="red"
                variant="outline"
                isLoading={processing}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Eliminar
              </Button>
            )}
          </Flex>
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

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => !processing && setIsDeleteDialogOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar problema
            </AlertDialogHeader>

            <AlertDialogBody>
              Esta accion eliminara el problema. Quieres continuar?
            </AlertDialogBody>

            <AlertDialogFooter>
              <ButtonGroup>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsDeleteDialogOpen(false)}
                  isDisabled={processing}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  isLoading={processing}
                >
                  Eliminar
                </Button>
              </ButtonGroup>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
