import React, { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ProblemTable = ({ problemas = [], customBasePath = '/ejercicio' }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const tableBg = useColorModeValue('#FCFAFF', 'gray.800');
  const hoverBg = useColorModeValue('#F3EEFF', 'purple.900');
  const headerBg = useColorModeValue('linear-gradient(90deg, #6D28D9, #7C3AED)', 'purple.800');
  const borderColor = useColorModeValue('brand.200', 'purple.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const mutedTextColor = useColorModeValue('brand.900', 'white');

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      setContainerWidth(node.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showTipo = containerWidth >= 680;
  const showDificultad = containerWidth >= 820;
  const showCarrera = containerWidth >= 960;
  const showPropietario = containerWidth >= 1100;

  return (
    <Box ref={containerRef} overflowX="auto" p={{ base: 2, md: 4 }}>
      <Table
        variant="simple"
        size={{ base: 'sm', md: 'md' }}
        bg={tableBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="18px"
        boxShadow="0 8px 24px rgba(109,40,217,0.12)"
        overflow="hidden"
      >
        <Thead bg={headerBg}>
          <Tr>
            <Th color="white" borderColor="whiteAlpha.300" py={4} fontSize="xs" letterSpacing="0.08em">#</Th>
            <Th color="white" borderColor="whiteAlpha.300" py={4} fontSize="xs" letterSpacing="0.08em">Título</Th>
            <Th color="white" borderColor="whiteAlpha.300" py={4} fontSize="xs" letterSpacing="0.08em">Materia</Th>
            {showTipo && <Th color="white" borderColor="whiteAlpha.300" py={4} fontSize="xs" letterSpacing="0.08em">Tipo</Th>}
            {showDificultad && <Th color="white" borderColor="whiteAlpha.300" py={4} fontSize="xs" letterSpacing="0.08em">Dificultad</Th>}
            {showCarrera && <Th color="white" borderColor="whiteAlpha.300" py={4} fontSize="xs" letterSpacing="0.08em">Carrera</Th>}
            {showPropietario && <Th color="white" borderColor="whiteAlpha.300" py={4} fontSize="xs" letterSpacing="0.08em">Propietario</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {problemas.map((p, idx) => (
            <Tr
              key={p.id_problema}
              transition="background 0.3s ease"
              _hover={{ bg: hoverBg, cursor: 'pointer' }}
              onClick={() => navigate(`${customBasePath}/${p.id_problema}`)}
            >
              <Td textAlign="center" color={mutedTextColor} borderColor={borderColor}>{idx + 1}</Td>
              <Td>
                <Text color={textColor} fontWeight="700" maxW={{ base: '180px', md: '320px' }} noOfLines={1}>
                  {p.titulo}
                </Text>
              </Td>
              <Td color={textColor} borderColor={borderColor}>
                <Text maxW={{ base: '140px', md: '220px' }} noOfLines={1}>
                  {p.materia}
                </Text>
              </Td>
              {showTipo && (
                <Td color={textColor} borderColor={borderColor}>
                  <Badge
                    bg="brand.50"
                    color="brand.800"
                    px={3}
                    py={1}
                    rounded="full"
                    textTransform="none"
                  >
                    {p.tipo}
                  </Badge>
                </Td>
              )}
              {showDificultad && <Td color={textColor} borderColor={borderColor}>{p.dificultad || '—'}</Td>}
              {showCarrera && <Td color={textColor} borderColor={borderColor}>{p.carrera}</Td>}
              {showPropietario && <Td color={textColor} borderColor={borderColor}>{p.propietario}</Td>}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ProblemTable;
