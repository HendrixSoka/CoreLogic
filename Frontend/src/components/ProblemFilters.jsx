import { useEffect, useRef, useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select as ChakraSelect,
  SimpleGrid,
  Box,
  Button,
  Text,
} from '@chakra-ui/react';
import Select from 'react-select';
import { obtenerCarreras, obtenerMateriasPorCarrera } from '../api/options';

const ProblemFilters = ({ onChangeFiltros, initialFiltros = {} }) => {
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
  const isHydrating = useRef(true);

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerCarreras();
      setCarreras(data.map((c) => ({ label: c.nombre, value: c.id })));
    };
    cargar();
  }, []);

  useEffect(() => {
    isHydrating.current = true;
    setFiltros((prev) => ({
      ...prev,
      titulo: initialFiltros.titulo ?? '',
      tipo: initialFiltros.tipo ?? '',
      dificultad: initialFiltros.dificultad ?? '',
      carrera: initialFiltros.carrera ?? '',
      materia: initialFiltros.materia ?? '',
    }));
    const timer = setTimeout(() => {
      isHydrating.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, [
    initialFiltros.titulo,
    initialFiltros.tipo,
    initialFiltros.dificultad,
    initialFiltros.carrera,
    initialFiltros.materia,
  ]);

  const handleCarreraSelect = async (opcion) => {
    setCarreraSeleccionada(opcion);
    setFiltros((prev) => ({ ...prev, carrera: opcion?.label || '' }));
    if (!opcion) {
      setMaterias([]);
      setMateriaSeleccionada(null);
      if (!isHydrating.current) {
        onChangeFiltros({ carrera: null, materia: null });
      }
      return;
    }

    const materiasRaw = await obtenerMateriasPorCarrera(opcion.value);
    setMaterias(materiasRaw.map((m) => ({ label: m, value: m })));
    setMateriaSeleccionada(null);
    if (!isHydrating.current) {
      onChangeFiltros({ carrera: opcion.label, materia: null });
    }
  };

  useEffect(() => {
    if (!initialFiltros.carrera || carreras.length === 0) return;
    const match = carreras.find((c) => c.label === initialFiltros.carrera) || null;
    if (match && match.value !== carreraSeleccionada?.value) {
      setCarreraSeleccionada(match);
      setFiltros((prev) => ({ ...prev, carrera: match.label }));
      obtenerMateriasPorCarrera(match.value).then((materiasRaw) => {
        setMaterias(materiasRaw.map((m) => ({ label: m, value: m })));
      });
    }
  }, [initialFiltros.carrera, carreras]);

  useEffect(() => {
    if (!initialFiltros.materia || materias.length === 0) return;
    const match = materias.find((m) => m.value === initialFiltros.materia) || null;
    if (match && match.value !== materiaSeleccionada?.value) {
      setMateriaSeleccionada(match);
      setFiltros((prev) => ({ ...prev, materia: match.value }));
    }
  }, [initialFiltros.materia, materias]);

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
    onChangeFiltros(nuevosFiltros);
  };

  const handleMateriaSelect = (opcion) => {
    setMateriaSeleccionada(opcion);
    setFiltros((prev) => ({ ...prev, materia: opcion?.value || '' }));
    if (!isHydrating.current) {
      onChangeFiltros({
        carrera: carreraSeleccionada?.label || null,
        materia: opcion?.value || null,
      });
    }
  };

  const handleClearFilters = () => {
    const filtrosLimpios = {
      titulo: '',
      materia: '',
      tipo: '',
      dificultad: '',
      carrera: '',
    };
    setFiltros(filtrosLimpios);
    setCarreraSeleccionada(null);
    setMateriaSeleccionada(null);
    setMaterias([]);
    onChangeFiltros(filtrosLimpios);
  };

  const hayFiltrosActivos = Boolean(
    filtros.titulo ||
    filtros.carrera ||
    filtros.materia ||
    filtros.tipo ||
    filtros.dificultad
  );

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 18,
      borderColor: state.isFocused ? '#8B5CF6' : '#DDD6FE',
      backgroundColor: '#FFFFFF',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(109,40,217,0.16)' : 'none',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: '#8B5CF6',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#7C7C8A',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1F1F1F',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 18,
      overflow: 'hidden',
      border: '1px solid #DDD6FE',
      boxShadow: '0 12px 30px rgba(109,40,217,0.12)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#F5F3FF' : '#FFFFFF',
      color: '#1F1F1F',
      cursor: 'pointer',
    }),
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="brand.100"
      borderRadius="24px"
      p={{ base: 4, md: 5 }}
      boxShadow="0 4px 20px rgba(109,40,217,0.08)"
      mb={4}
    >
      <Text
        color="brand.700"
        textTransform="uppercase"
        fontWeight="800"
        letterSpacing="0.08em"
        fontSize="xs"
        mb={4}
      >
        Filtros
      </Text>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 6 }}
        spacing={4}
        w="100%"
      >
      <Box>
        <FormControl>
        <FormLabel color="brand.900" fontWeight="700">Título</FormLabel>
        <Input
            value={filtros.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            placeholder="Buscar por título"
            bg="white"
            borderColor="brand.100"
            borderRadius="18px"
            _hover={{ borderColor: 'brand.300' }}
            _focusVisible={{
              borderColor: 'brand.400',
              boxShadow: '0 0 0 3px rgba(109,40,217,0.16)',
            }}
        />
        </FormControl>
      </Box>

      <Box>
        <FormControl>
        <FormLabel color="brand.900" fontWeight="700">Carrera</FormLabel>
        <Select
            styles={selectStyles}
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
            <FormLabel color="brand.900" fontWeight="700">Materia</FormLabel>
            <Select
            styles={selectStyles}
            options={materias}
            value={materiaSeleccionada}
            onChange={handleMateriaSelect}
            placeholder="Selecciona una materia"
            />
        </FormControl>
        </Box>
    )}

      <Box>
        <FormControl>
        <FormLabel color="brand.900" fontWeight="700">Tipo</FormLabel>
        <ChakraSelect
            value={filtros.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            placeholder="Selecciona tipo"
            variant="filled"
            bg="white"
            borderColor="brand.100"
            borderRadius="18px"
            _hover={{ borderColor: 'brand.300' }}
            _focusVisible={{
              borderColor: 'brand.400',
              boxShadow: '0 0 0 3px rgba(109,40,217,0.16)',
            }}
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
        <FormLabel color="brand.900" fontWeight="700">Dificultad</FormLabel>
        <ChakraSelect
            value={filtros.dificultad}
            onChange={(e) => handleChange('dificultad', e.target.value)}
            placeholder="Selecciona dificultad"
            variant="filled"
            bg="white"
            borderColor="brand.100"
            borderRadius="18px"
            _hover={{ borderColor: 'brand.300' }}
            _focusVisible={{
              borderColor: 'brand.400',
              boxShadow: '0 0 0 3px rgba(109,40,217,0.16)',
            }}
        >
            <option value="Facil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Dificil">Difícil</option>
        </ChakraSelect>
        </FormControl>
    </Box>
      {hayFiltrosActivos && (
      <Box display="flex" alignItems="center">
        <Button
          onClick={handleClearFilters}
          w="100%"
          bg="#6D28D9"
          color="white"
          fontWeight="semibold"
          rounded="18px"
          shadow="0 4px 20px rgba(109,40,217,0.2)"
          transition="all 0.3s ease"
          _hover={{ bg: '#5B21B6', transform: 'translateY(-1px)' }}
          _active={{ bg: '#4C1D95', transform: 'translateY(0)' }}
        >
          Limpiar filtros
        </Button>
      </Box>
      )}
      </SimpleGrid>
    </Box>
  );
};

export default ProblemFilters;
