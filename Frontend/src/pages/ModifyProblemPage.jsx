import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  Stack,
  Text,
  Heading,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { obtenerCarreras, obtenerMateriasPorCarrera } from '../api/options';
import { getUserDataFromToken } from '../api/auth';
import { obtenerProblemaPorId, editarProblema } from '../api/problemService';
import { useParams } from 'react-router-dom';
import BlockEditor from '../components/BlockEditor';
import { v4 as uuidv4 } from 'uuid';

export default function ModifyProblemPage() {
  const { id } = useParams();
  const toast = useToast();
  const user = getUserDataFromToken();

  const [titulo, setTitulo] = useState('');
  const [enunciado, setEnunciado] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [tipo, setTipo] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [propietario, setPropietario] = useState('');
  const [archivo, setArchivo] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const problema = await obtenerProblemaPorId(id);
        console.log(problema);
        setTitulo(problema.titulo);
        setEnunciado(
          Array.isArray(problema.enunciado)
            ? problema.enunciado.map(b => ({ id: uuidv4(), ...b }))
            : []
        );
        setTipo(problema.tipo);
        setDificultad(problema.dificultad);
        setPropietario(problema.propietario);

        const listaCarreras = await obtenerCarreras();
        const opcionesCarrera = listaCarreras.map(c => ({ label: c.nombre, value: c.id }));
        setCarreras(opcionesCarrera);

        const carreraSel = opcionesCarrera.find(c => c.value === problema.carrera);
        setCarreraSeleccionada(carreraSel);

        if (carreraSel) {
          const materiasRaw = await obtenerMateriasPorCarrera(carreraSel.value);
          const opcionesMaterias = materiasRaw.map(m => ({ label: m, value: m }));
          setMaterias(opcionesMaterias);
          const materiaSel = opcionesMaterias.find(m => m.value === problema.materia);
          setMateriaSeleccionada(materiaSel);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error al cargar el problema',
          status: 'error',
        });
      }
    };
    cargarDatos();
  }, [id]);

  const handleCarreraSelect = async (opcion) => {
    setCarreraSeleccionada(opcion);
    const materiasRaw = await obtenerMateriasPorCarrera(opcion.value);
    setMaterias(materiasRaw.map(m => ({ label: m, value: m })));
    setMateriaSeleccionada(null);
  };

  const handleArchivo = (file) => {
    setArchivo(prev => [...prev, file]);
  };

  const handleSubmit = async () => {
    const enunciadoLimpio = enunciado.map(({ id,preview , ...resto }) => resto);

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
      await editarProblema(id, problemaData, archivo);
      toast({
        title: 'Éxito',
        description: 'Problema modificado correctamente',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al modificar el problema',
        status: 'error',
      });
    }
  };

  return (
    <Box maxW="1200px" mx="auto" py={10} px={6}>
      <Heading size="lg" mb={8}>
        Modificar Problema
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* Columna de Metadatos */}
        <Box bg="gray.50" p={6} rounded="xl" boxShadow="sm">
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Título</FormLabel>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título del problema"
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
                  value={propietario}
                  onChange={(e) => setPropietario(e.target.value)}
                  placeholder="Nombre del propietario"
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
          </Stack>
        </Box>

        {/* Columna del Enunciado */}
        <Box bg="gray.50" p={6} rounded="xl" boxShadow="sm">
          <FormControl>
            <FormLabel>Enunciado</FormLabel>
            <BlockEditor contenido={enunciado} onBlockChange={setEnunciado} onArchivo={handleArchivo} />
          </FormControl>
        </Box>
      </SimpleGrid>

      {/* Botón */}
      <Box textAlign="center" mt={10}>
        <Button
          onClick={handleSubmit}
          colorScheme="green"
          size="lg"
          rounded="full"
          px={10}
          boxShadow="lg"
        >
          Guardar Cambios
        </Button>
      </Box>
    </Box>
  );
}
