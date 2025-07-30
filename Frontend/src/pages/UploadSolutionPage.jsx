import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserDataFromToken } from '../api/auth';
import { crearSolucion } from '../api/solutionService';
import { getImageUrl } from '../api/problemService';
import BlockEditor from '../components/BlockEditor';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Heading,
  Button,
  useToast,
  VStack,
} from '@chakra-ui/react';

export default function UploadSolutionPage() {
  const { id_problema } = useParams();
  const user = getUserDataFromToken();
  const [contenido, setContenido] = useState([
    { id: uuidv4(), tipo: 'texto', contenido: '' }
  ]);
  const [archivos, setArchivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const chakraToast = useToast();

  const handleArchivo = (archivo) => {
    setArchivos((prev) => [...prev, archivo]);
  };

  const handleSubmit = async () => {
    const limpio = contenido.map(({ id, ...resto }) => resto);

    const solucionData = {
      id_problema,
      id_usuario: user.id,
      contenido: JSON.stringify(limpio),
    };

    try {
      setEnviando(true);
      await crearSolucion(solucionData, archivos);
      chakraToast({
        title: 'Solución enviada',
        description: 'Tu solución fue enviada con éxito.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      chakraToast({
        title: 'Error al enviar',
        description: 'Ocurrió un problema al enviar tu solución.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" p={6}>
      <Heading as="h2" size="lg" mb={4}>
        Enviar Solución
      </Heading>

      <VStack spacing={4} align="stretch">
        <BlockEditor
          contenido={contenido}
          onBlockChange={setContenido}
          onArchivo={handleArchivo}
        />

        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={enviando}
          loadingText="Enviando..."
          alignSelf="flex-start"
        >
          Enviar
        </Button>
      </VStack>
    </Box>
  );
}
