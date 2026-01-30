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
  FormErrorMessage,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { crearProblema } from '../api/problemService';
import { getUserDataFromToken } from '../api/auth';
import { obtenerCarreras, obtenerMateriasPorCarrera } from '../api/options';
import BlockEditor from '../components/BlockEditor';
import { v4 as uuidv4 } from 'uuid';

export default function UploadProblemPage() {
  const [errores, setErrores] = useState({});
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
  const navigate = useNavigate();
  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerCarreras();
      setCarreras(data.map((c) => ({ label: c.nombre, value: c.id })));
    };
    cargar();
  }, []);

  const limpiarError = (campo) => {
    setErrores(prev => ({
      ...prev,
      [campo]: ''
    }));
  };
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
    if (!user || !user.id) {
      toast({
        title: 'Error crítico',
        description: 'Usuario no autenticado. Por favor inicia sesión.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    if (!validarFormulario()) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
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
      const problemaCreado = await crearProblema(problemaData, archivo);
      toast({
        title: 'Éxito',
        description: 'Problema subido exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        onCloseComplete: () => navigate(`/ejercicio/${problemaCreado.id_problema}`)
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
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!titulo.trim()) nuevosErrores.titulo = "El título es obligatorio";
    if (!carreraSeleccionada) nuevosErrores.carrera = "Selecciona una carrera";
    if (!materiaSeleccionada) nuevosErrores.materia = "Selecciona una materia";
    if (!tipo) nuevosErrores.tipo = "Selecciona un tipo";
    if (tipo !== 'Propio' && !propietario.trim()) {
      nuevosErrores.propietario = "El propietario es obligatorio";
    }
    if (!dificultad) nuevosErrores.dificultad = "Selecciona dificultad";
    if (!enunciado || Object.keys(enunciado).length === 0) {
      nuevosErrores.enunciado = "El enunciado es obligatorio";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleTipoChange = (value) => {
    setTipo(value);
    if (value === 'Propio') {
      setPropietario(''); 
      limpiarError('propietario'); 
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
            <FormControl isInvalid={errores.titulo}>
              <FormLabel>Título</FormLabel>
              <Input
                placeholder="Ej. Integrales por partes"
                value={titulo}
                onChange={(e) => {setTitulo(e.target.value); limpiarError('titulo');}}
                variant="filled"
              />
              <FormErrorMessage>{errores.titulo}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errores.carrera}>
              <FormLabel>Carrera</FormLabel>
              <Select
                options={carreras}
                value={carreraSeleccionada}
                onChange={(selected) => {handleCarreraSelect(selected); limpiarError('carrera');}}
                placeholder="Selecciona una carrera"
              />
              <FormErrorMessage>{errores.carrera}</FormErrorMessage>
            </FormControl>

            {materias.length > 0 && (
              <FormControl isInvalid={errores.materia}>
                <FormLabel>Materia</FormLabel>
                <Select
                  options={materias}
                  value={materiaSeleccionada}
                  onChange={(selected) => {setMateriaSeleccionada(selected); limpiarError('materia');}}
                  placeholder="Selecciona una materia"
                />
                <FormErrorMessage>{errores.materia}</FormErrorMessage>
              </FormControl>
            )}

            <FormControl isInvalid={errores.tipo}>
              <FormLabel>Tipo</FormLabel>
              <ChakraSelect
                value={tipo}
                onChange={(e) => {handleTipoChange(e.target.value); limpiarError('tipo');}}
                placeholder="Selecciona tipo"
                variant="filled"
              >
                <option value="Examen">Examen</option>
                <option value="Auxiliatura">Auxiliatura</option>
                <option value="Practica">Práctica</option>
                <option value="Propio">Propio</option>
              </ChakraSelect>
              <FormErrorMessage>{errores.tipo}</FormErrorMessage>
            </FormControl>

            {tipo !== 'Propio' && (
              <FormControl isInvalid={errores.propietario}>
                <FormLabel>Propietario</FormLabel>
                <Input
                  placeholder="Nombre del propietario"
                  value={propietario}
                  onChange={(e) => {setPropietario(e.target.value); limpiarError('propietario');}}
                  variant="filled"
                />
                <FormErrorMessage>{errores.propietario}</FormErrorMessage>
              </FormControl>
            )}

            <FormControl isInvalid={errores.dificultad}>
              <FormLabel>Dificultad</FormLabel>
              <ChakraSelect
                value={dificultad}
                onChange={(e) => {setDificultad(e.target.value); limpiarError('dificultad');}}
                placeholder="Selecciona dificultad"
                variant="filled"
              >
                <option value="Facil">Fácil</option>
                <option value="Media">Media</option>
                <option value="Dificil">Difícil</option>
              </ChakraSelect>
              <FormErrorMessage>{errores.dificultad}</FormErrorMessage>
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
