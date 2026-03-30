import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const user = getUserDataFromToken();
  const [contenido, setContenido] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [idProblema, setIdProblema] = useState(null);
  const toast = useToast();
  useEffect(() => {
    const cargarSolucion = async () => {
      try {
        const solucion = await obtenerSolucionPorId(id_solucion);
        setIdProblema(solucion.id_problema);
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

  const normalizarBloque = (bloque) => {
    switch (bloque.tipo) {
      case 'imagen':
        return {
          tipo: 'imagen',
          nombre: bloque.nombre,
          url: bloque.url,
        };
      case 'texto':
        return {
          tipo: 'texto',
          contenido: bloque.contenido,
        };
      case 'codigo':
        return {
          tipo: 'codigo',
          lenguaje: bloque.lenguaje,
          contenido: bloque.contenido,
        };
      case 'ecuacion':
        return {
          tipo: 'ecuacion',
          contenido: bloque.contenido,
        };
      case 'lista':
        return {
          tipo: 'lista',
          estilo: bloque.estilo,
          items: bloque.items,
        };
      case 'tabla':
        return {
          tipo: 'tabla',
          encabezados: bloque.encabezados,
          filas: bloque.filas,
        };
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    const limpio = contenido.map(normalizarBloque).filter(Boolean);

    const solucionData = {
      id_solucion,
      contenido: JSON.stringify(limpio),
    };

    try {
      setGuardando(true);
      await editarSolucion(solucionData, archivos);
      toast({
        title: 'Éxito',
        description: 'Solucion modificado correctamente',
        status: 'success',
        isClosable: true,
        onCloseComplete: () => {
          if (idProblema) {
            navigate(`/ejercicio/${idProblema}`);
          }
        },
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al modificar la solucion',
        status: 'error',
        isClosable: true,
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
