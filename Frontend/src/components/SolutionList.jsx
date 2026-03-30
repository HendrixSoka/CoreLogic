import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BlockRenderer from './BlockRenderer';
import { listarSoluciones } from '../api/solutionService';
import {likeSolucion, dislikeSolucion} from '../api/solutionService'
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Spinner,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons'; // 👈 iconos de Chakra

const SolucionList = ({ id, tipo = 'usuario' }) => {
  const [soluciones, setSoluciones] = useState([]);
  const [abiertas, setAbiertas] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [cargando, setCargando] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setSoluciones([]);
    setPage(0);
    setHasMore(true);
    setAbiertas({});
  }, [id, tipo]);

  const cargarMasSoluciones = useCallback(async () => {
    if (cargando || !hasMore) return;
    setCargando(true);
    const limit = 10;
    try {
      const res = await listarSoluciones({ id, tipo, skip: page * limit, limit });
      setSoluciones((prev) => {
        const nuevas = [...prev, ...res.items];
        setHasMore(nuevas.length < res.total);
        return nuevas;
      });
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('Error cargando soluciones:', err);
    } finally {
      setCargando(false);
    }
  }, [id, tipo, page, cargando, hasMore]);

  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !cargando) {
        cargarMasSoluciones();
      }
    });

    observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [cargarMasSoluciones, hasMore, cargando]);

  const toggle = (id_sol) => {
    setAbiertas((prev) => ({ ...prev, [id_sol]: !prev[id_sol] }));
  };

  const actualizarReacciones = (idSolucion, data) => {
    setSoluciones((prev) =>
      prev.map((sol) =>
        sol.id_solucion === idSolucion
          ? { ...sol, likes: data.likes, dislikes: data.dislikes }
          : sol
      )
    );
  };

  const handleLike = async (idSolucion) => {
    try {
      const data = await likeSolucion(idSolucion);
      actualizarReacciones(idSolucion, data);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleDislike = async (idSolucion) => {
    try {
      const data = await dislikeSolucion(idSolucion);
      actualizarReacciones(idSolucion, data);
    } catch (error) {
      console.error('Error al dar dislike:', error);
    }
  };

  const bgHeader = useColorModeValue('gray.100', 'gray.700');
  const bgHeaderHover = useColorModeValue('gray.200', 'gray.600');

  return (
    <VStack spacing={4} align="stretch">
      {soluciones.map((sol) => {
        const esDelUsuario = user?.id == sol.id_usuario;
        return (
          <Box key={sol.id_solucion} borderWidth="1px" borderRadius="md" shadow="sm">
            <Flex
              justify="space-between"
              align="center"
              px={4}
              py={2}
              bg={bgHeader}
              _hover={{ bg: bgHeaderHover }}
              cursor="pointer"
            >
              <Button
                variant="ghost"
                textAlign="left"
                fontWeight="semibold"
                onClick={() => toggle(sol.id_solucion)}
                flex={1}
              >
                {abiertas[sol.id_solucion] ? '▾' : '▸'} {sol.nombre}
              </Button>
              {esDelUsuario && (
                <Button
                  size="sm"
                  variant="link"
                  colorScheme="blue"
                  ml={4}
                  onClick={() => navigate(`/modificar-solucion/${sol.id_solucion}`)}
                >
                  Modificar
                </Button>
              )}
            </Flex>

            <Collapse in={abiertas[sol.id_solucion]}>
              <Box p={4} bg="white" borderTopWidth="1px">
                <BlockRenderer contenido={sol.contenido} editable={false} />

                {/* Like / Dislike con Chakra */}
                <Flex mt={4} justify="flex-end" gap={4}>
                  <Button
                    size="sm"
                    leftIcon={<ArrowUpIcon />}
                    variant="ghost"
                    colorScheme="green"
                    onClick={() => handleLike(sol.id_solucion)}
                  >
                    {sol.likes ?? 0}
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<ArrowDownIcon />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDislike(sol.id_solucion)}
                  >
                    {sol.dislikes ?? 0}
                  </Button>
                </Flex>
              </Box>
            </Collapse>
          </Box>
        );
      })}

      {hasMore && (
        <Box ref={loaderRef} textAlign="center" py={4} color="gray.400">
          <Spinner size="sm" mr={2} /> Cargando más...
        </Box>
      )}
      {!hasMore && soluciones.length > 0 && (
        <Text textAlign="center" py={4} color="gray.500">
          No hay más soluciones.
        </Text>
      )}
    </VStack>
  );
};

export default SolucionList;
