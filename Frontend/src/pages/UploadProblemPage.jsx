import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  Stack,
  Heading,
  useToast,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { crearProblema } from '../api/problemService';
import { getUserDataFromToken } from '../api/auth';
import { obtenerCarreras, obtenerMateriasPorCarrera } from '../api/options';
import BlockEditor from '../components/BlockEditor';
import { v4 as uuidv4 } from 'uuid';

export default function UploadProblemPage() {
  const [titulo, setTitulo] = useState('');
  const [enunciado, setEnunciado] = useState([
    { id: uuidv4(), tipo: 'texto', contenido: '' },
  ]);
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [tipo, setTipo] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [propietario, setPropietario] = useState('');
  const [archivo, setArchivo] = useState([]);
  const toast = useToast();
  const user = getUserDataFromToken();

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerCarreras();
      setCarreras(data.map((c) => ({ label: c.nombre, value: c.id })));
    };
    cargar();
  }, []);

  const handleCarreraSelect = async (opcion) => {
    setCarreraSeleccionada(opcion);
    const materiasRaw = await obtenerMateriasPorCarrera(opcion.value);
    setMaterias(materiasRaw.map((m) => ({ label: m, value: m })));
    setMateriaSeleccionada(null);
  };

  const handleArchivo = (file) => {
    setArchivo((prev) => [...prev, file]);
  };

  const handleSubmit = async () => {
    const enunciadoLimpio = enunciado.map(({ id, preview, ...resto }) => resto);

    const problemaData = {
      titulo,
      enunciado: JSON.stringify(enunciadoLimpio),
      carrera: carreraSeleccionada?.label || '',
      materia: materiaSeleccionada?.value || '',
      tipo,
      dificultad,
      propietario: propietario || user.nombre,
      id_usuario: user.id,
    };

    try {
      await crearProblema(problemaData, archivo);
      toast({
        title: 'Éxito',
        description: 'Problema subido exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al subir el problema',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
    }
  };

  return (
    <Box maxW="1200px" mx="auto" py={10} px={6}>
      <Heading size="lg" mb={8} textAlign="center">
        Subir Ejercicio
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Columna izquierda: Datos */}
        <Box bg="gray.50" p={6} rounded="md" boxShadow="sm">
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Título</FormLabel>
              <Input
                placeholder="Ej. Integrales por partes"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                variant="filled"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Carrera</FormLabel>
              <Select
                options={carreras}
                value={carreraSeleccionada}
                onChange={handleCarreraSelect}
                placeholder="Selecciona una carrera"
              />
            </FormControl>

            {materias.length > 0 && (
              <FormControl>
                <FormLabel>Materia</FormLabel>
                <Select
                  options={materias}
                  value={materiaSeleccionada}
                  onChange={setMateriaSeleccionada}
                  placeholder="Selecciona una materia"
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Tipo</FormLabel>
              <ChakraSelect
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Selecciona tipo"
                variant="filled"
              >
                <option value="Examen">Examen</option>
                <option value="Auxiliatura">Auxiliatura</option>
                <option value="Practica">Práctica</option>
                <option value="Propio">Propio</option>
              </ChakraSelect>
            </FormControl>

            {tipo !== 'Propio' && (
              <FormControl>
                <FormLabel>Propietario</FormLabel>
                <Input
                  placeholder="Nombre del propietario"
                  value={propietario}
                  onChange={(e) => setPropietario(e.target.value)}
                  variant="filled"
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Dificultad</FormLabel>
              <ChakraSelect
                value={dificultad}
                onChange={(e) => setDificultad(e.target.value)}
                placeholder="Selecciona dificultad"
                variant="filled"
              >
                <option value="Facil">Fácil</option>
                <option value="Media">Media</option>
                <option value="Dificil">Difícil</option>
              </ChakraSelect>
            </FormControl>
          </VStack>
        </Box>

        {/* Columna derecha: Enunciado */}
        <Box bg="gray.50" p={6} rounded="md" boxShadow="sm">
          <FormControl>
            <FormLabel>Enunciado</FormLabel>
            <BlockEditor
              contenido={enunciado}
              onBlockChange={setEnunciado}
              onArchivo={handleArchivo}
            />
          </FormControl>
        </Box>
      </SimpleGrid>

      {/* Botón de envío */}
      <Box textAlign="center" mt={10}>
        <Button
          onClick={handleSubmit}
          colorScheme="blue"
          size="lg"
          rounded="xl"
          px={10}
          boxShadow="md"
        >
          Subir Problema
        </Button>
      </Box>
    </Box>
  );
}
