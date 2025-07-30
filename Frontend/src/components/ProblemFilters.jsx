import { useEffect, useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  SimpleGrid,
  Box
} from '@chakra-ui/react';
import Select from 'react-select';
import { obtenerCarreras, obtenerMateriasPorCarrera } from '../api/options';

const ProblemFilters = ({ onChangeFiltros }) => {
  const [filtros, setFiltros] = useState({
    titulo: '',
    materia: '',
    tipo: '',
    dificultad: '',
    carrera: '',
  });

  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerCarreras();
      setCarreras(data.map((c) => ({ label: c.nombre, value: c.id })));
    };
    cargar();
  }, []);

  const handleCarreraSelect = async (opcion) => {
    setCarreraSeleccionada(opcion);
    if (!opcion) {
      setMaterias([]);
      setMateriaSeleccionada(null);
      return;
    }

    const materiasRaw = await obtenerMateriasPorCarrera(opcion.value);
    setMaterias(materiasRaw.map((m) => ({ label: m, value: m })));
    setMateriaSeleccionada(null);
  };

  useEffect(() => {
    if (filtros.carrera) {
      const cargarMaterias = async () => {
        const data = await obtenerMateriasPorCarrera(filtros.carrera);
        setMaterias(data);
      };
      cargarMaterias();
    } else {
      setMaterias([]);
    }
  }, [filtros.carrera]);
  useEffect(() => {
    onChangeFiltros({
      carrera: carreraSeleccionada?.value || null,
      materia: materiaSeleccionada?.value || null,
    });
  }, [carreraSeleccionada, materiaSeleccionada]);

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
    onChangeFiltros(nuevosFiltros);
  };

  return (
    <SimpleGrid
    columns={{ base: 1, md: 2, lg: 3, xl: 5 }}
    spacing={4}
    w="100%"
    >
    <Box>
        <FormControl>
        <FormLabel>Título</FormLabel>
        <Input
            value={filtros.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            placeholder="Buscar por título"
        />
        </FormControl>
    </Box>

    <Box>
        <FormControl>
        <FormLabel>Carrera</FormLabel>
        <Select
            options={carreras}
            value={carreraSeleccionada}
            onChange={handleCarreraSelect}
            placeholder="Selecciona una carrera"
        />
        </FormControl>
    </Box>

    {materias.length > 0 && (
        <Box>
        <FormControl>
            <FormLabel>Materia</FormLabel>
            <Select
            options={materias}
            value={materiaSeleccionada}
            onChange={setMateriaSeleccionada}
            placeholder="Selecciona una materia"
            />
        </FormControl>
        </Box>
    )}

    <Box>
        <FormControl>
        <FormLabel>Tipo</FormLabel>
        <ChakraSelect
            value={filtros.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            placeholder="Selecciona tipo"
            variant="filled"
        >
            <option value="Examen">Examen</option>
            <option value="Auxiliatura">Auxiliatura</option>
            <option value="Practica">Práctica</option>
            <option value="Propio">Propio</option>
        </ChakraSelect>
        </FormControl>
    </Box>

    <Box>
        <FormControl>
        <FormLabel>Dificultad</FormLabel>
        <ChakraSelect
            value={filtros.dificultad}
            onChange={(e) => handleChange('dificultad', e.target.value)}
            placeholder="Selecciona dificultad"
            variant="filled"
        >
            <option value="Facil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Dificil">Difícil</option>
        </ChakraSelect>
        </FormControl>
    </Box>
    </SimpleGrid>
  );
};

export default ProblemFilters;
