// pages/HomePage.jsx
import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { listarProblemas } from '../api/problemService';
import ProblemTable from '../components/ProblemTable';
import ProblemFilters from '../components/ProblemFilters';

export default function HomePage() {
  const bgMain = useColorModeValue('blue.50', 'blue.900');
  const bgHeader = useColorModeValue('white', 'gray.700');
  const btnSelectedBg = useColorModeValue('blue.400', 'blue.600');
  const btnSelectedColor = useColorModeValue('white', 'gray.100');
  const toast = useToast();
  const [problemas, setProblemas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const limit = 10;
  const [filtros, setFiltros] = useState({
    titulo: '',
    materia: '',
    tipo: '',
    dificultad: '',
    carrera: '',
  });

  useEffect(() => {
    const cargarProblemas = async () => {
      setCargando(true);
      try {
        const { items, total } = await listarProblemas({
          skip: (pagina - 1) * limit,
          limit,
          ...filtros,
        });
        setProblemas(items);
        setTotal(total);
      } catch (error) {
        console.error('Error al cargar problemas', error);
        toast({
          title: 'Error al cargar problemas.',
          description: 'Ocurrió un error al obtener los problemas del servidor.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setCargando(false);
      }
    };

    cargarProblemas();
  }, [pagina, filtros]);

  const onChangeFiltros = (nuevosFiltros) => {
    setPagina(1);
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  };

  const totalPaginas = Math.ceil(total / limit);

  return (
    <Box minH="100vh" bg={bgMain} p={6}>


      <Stack spacing={6}>
        <Box bg={bgHeader} p={4} rounded="2xl" shadow="sm" border="1px" borderColor="gray.100">
          <ProblemFilters onChangeFiltros={onChangeFiltros} />
          {cargando ? (
            <Center py={12} flexDirection="column" gap={3}>
              <Spinner size="xl" color="blue.400" thickness="4px" />
              <Text color="gray.600" textAlign="center">
                Cargando problemas... el sistema puede estar despertando.
              </Text>
            </Center>
          ) : (
            <ProblemTable problemas={problemas} />
          )}
        </Box>

        <Flex justify="center" mt={4} gap={2} flexWrap="wrap" opacity={cargando ? 0.5 : 1}>
          {/** Primera página siempre */}
          {pagina > 3 && (
            <Button
              onClick={() => setPagina(1)}
              isDisabled={cargando}
              px={4}
              py={2}
              rounded="xl"
              border="1px"
              borderColor={pagina === 1 ? btnSelectedBg : 'blue.200'}
              bg={pagina === 1 ? btnSelectedBg : 'white'}
              color={pagina === 1 ? btnSelectedColor : 'blue.500'}
            >
              1
            </Button>
          )}

          {/** “…” si hay salto antes del rango */}
          {pagina > 4 && <Box px={2}>...</Box>}

          {/** Botones del rango dinámico */}
          {Array.from({ length: 5 }, (_, i) => {
            const num = pagina - 2 + i; // rango: pagina-2 .. pagina+2
            if (num < 1 || num > totalPaginas) return null;
            return (
              <Button
                key={num}
                onClick={() => setPagina(num)}
                isDisabled={cargando}
                px={4}
                py={2}
                rounded="xl"
                border="1px"
                borderColor={pagina === num ? btnSelectedBg : 'blue.200'}
                bg={pagina === num ? btnSelectedBg : 'white'}
                color={pagina === num ? btnSelectedColor : 'blue.500'}
                _hover={{
                  bg: pagina === num ? btnSelectedBg : 'blue.100',
                }}
              >
                {num}
              </Button>
            );
          })}

          {/** “…” si hay salto después del rango */}
          {pagina < totalPaginas - 3 && <Box px={2}>...</Box>}

          {/** Última página siempre */}
          {pagina < totalPaginas - 2 && (
            <Button
              onClick={() => setPagina(totalPaginas)}
              isDisabled={cargando}
              px={4}
              py={2}
              rounded="xl"
              border="1px"
              borderColor={pagina === totalPaginas ? btnSelectedBg : 'blue.200'}
              bg={pagina === totalPaginas ? btnSelectedBg : 'white'}
              color={pagina === totalPaginas ? btnSelectedColor : 'blue.500'}
            >
              {totalPaginas}
            </Button>
          )}
        </Flex>
      </Stack>
    </Box>
  );
}
