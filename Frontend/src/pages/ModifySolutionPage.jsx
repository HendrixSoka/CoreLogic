import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserDataFromToken } from '../api/auth';
import { obtenerSolucionPorId, editarSolucion } from '../api/solutionService';
import BlockEditor from '../components/BlockEditor';
import { v4 as uuidv4 } from 'uuid';

import {
  Box,
  Button,
  Heading,
  Spinner,
  VStack,
  Container,
  useToast,
} from '@chakra-ui/react';

export default function ModifySolutionPage() {
  const { id_solucion } = useParams();
  const user = getUserDataFromToken();
  const [contenido, setContenido] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();
  useEffect(() => {
    const cargarSolucion = async () => {
      try {
        const solucion = await obtenerSolucionPorId(id_solucion);
        const bloques = solucion.contenido.map((bloque) => ({
          id: uuidv4(),
          ...bloque,
        }));
        setContenido(bloques);
      } catch (error) {
        toast.error('Error al cargar la solución');
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarSolucion();
  }, [id_solucion]);

  const handleArchivo = (archivo) => {
    setArchivos((prev) => [...prev, archivo]);
  };

  const handleSubmit = async () => {
    const limpio = contenido.map(({ id,preview ,...resto }) => resto);

    const solucionData = {
      id_solucion,
      id_usuario: user.id,
      contenido: JSON.stringify(limpio),
    };

    try {
      setGuardando(true);
      await editarSolucion(solucionData, archivos);
      toast({
        title: 'Éxito',
        description: 'Solucion modificado correctamente',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al modificar la solucion',
        status: 'error',
      });
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" />
        <Box mt={4}>Cargando solución...</Box>
      </Box>
    );
  }

  return (
    <Container maxW="2xl" py={6}>
      <VStack spacing={4} align="stretch">
        <Heading size="lg">Modificar Solución</Heading>

        <BlockEditor
          contenido={contenido}
          onBlockChange={setContenido}
          onArchivo={handleArchivo}
        />

        <Button
          colorScheme="green"
          isLoading={guardando}
          onClick={handleSubmit}
          alignSelf="flex-start"
        >
          Guardar Cambios
        </Button>
      </VStack>
    </Container>
  );
}
