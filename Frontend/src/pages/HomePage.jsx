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
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { listarProblemas } from '../api/problemService';
import ProblemTable from '../components/ProblemTable';
import ProblemFilters from '../components/ProblemFilters';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const parsePath = useMemo(() => {
    const decode = (val) => (val ? decodeURIComponent(val) : '');
    const path = location.pathname.replace(/^\/HomePage\/?/, '');
    const parts = path.split('/').filter(Boolean);
    const filtros = { carrera: '', materia: '', tipo: '', dificultad: '', titulo: '' };
    let page = 1;
    for (let i = 0; i < parts.length; i += 2) {
      const key = parts[i];
      const val = parts[i + 1];
      if (!val) break;
      if (key === 'page') {
        const num = Number.parseInt(val, 10);
        if (!Number.isNaN(num) && num > 0) page = num;
        break;
      }
      if (key in filtros) filtros[key] = decode(val);
    }
    return { filtros, page };
  }, [location.pathname]);

  const buildPath = (nextPage, nextFiltros) => {
    let path = '/HomePage';
    if (nextFiltros.carrera) {
      path += `/carrera/${encodeURIComponent(nextFiltros.carrera)}`;
      if (nextFiltros.materia) {
        path += `/materia/${encodeURIComponent(nextFiltros.materia)}`;
      }
    }
    if (nextFiltros.tipo) path += `/tipo/${encodeURIComponent(nextFiltros.tipo)}`;
    if (nextFiltros.dificultad) path += `/dificultad/${encodeURIComponent(nextFiltros.dificultad)}`;
    if (nextFiltros.titulo) path += `/titulo/${encodeURIComponent(nextFiltros.titulo)}`;
    path += `/page/${nextPage}`;
    return path;
  };

  useEffect(() => {
    console.log('Ruta actual:', location.pathname);
    const rawPath = location.pathname.replace(/\/+$/, '');
    if (rawPath === '/HomePage') {
      try {
        const last = sessionStorage.getItem('home:lastPath');
        console.log('Último path guardado:', last);
        if (last && last !== rawPath) {
          navigate(last, { replace: true });
        }
      } catch {}
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!location.pathname.startsWith('/HomePage')) return;
    if (!location.pathname.includes('/page/')) return;
    try {
      sessionStorage.setItem('home:lastPath', location.pathname);
    } catch {}
  }, [location.pathname]);

  useEffect(() => {
    const next = parsePath.page;
    if (!next || next < 1) {
      navigate(buildPath(1, parsePath.filtros), { replace: true });
      return;
    }
    if (next !== pagina) setPagina(next);
    setFiltros((prev) => {
      const carreraNext = parsePath.filtros.carrera || '';
      const materiaNext = parsePath.filtros.materia || '';
      const tipoNext = parsePath.filtros.tipo || '';
      const dificultadNext = parsePath.filtros.dificultad || '';
      const tituloNext = parsePath.filtros.titulo || '';
      if (
        prev.carrera === carreraNext &&
        prev.materia === materiaNext &&
        prev.titulo === tituloNext &&
        prev.tipo === tipoNext &&
        prev.dificultad === dificultadNext
      ) return prev;
      return {
        ...prev,
        carrera: carreraNext,
        materia: materiaNext,
        titulo: tituloNext,
        tipo: tipoNext,
        dificultad: dificultadNext,
      };
    });
  }, [parsePath, pagina, navigate]);

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
    navigate(buildPath(1, nuevosFiltros));
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  };

  const totalPaginas = Math.max(1, Math.ceil(total / limit));

  const irPagina = (num) => {
    if (num < 1 || num > totalPaginas || num === pagina) return;
    setPagina(num);
    navigate(buildPath(num, filtros));
  };

  return (
    <Box minH="100vh" bg={bgMain} p={6}>


      <Stack spacing={6}>
        <Box bg={bgHeader} p={4} rounded="2xl" shadow="sm" border="1px" borderColor="gray.100">
          <ProblemFilters onChangeFiltros={onChangeFiltros} initialFiltros={filtros} />
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
              onClick={() => irPagina(1)}
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
                onClick={() => irPagina(num)}
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
              onClick={() => irPagina(totalPaginas)}
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
