import React, { useEffect, useRef, useState } from 'react';
import {
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

  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const headerBg = useColorModeValue('blue.100', 'blue.700');
  const borderColor = useColorModeValue('blue.200', 'blue.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');

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
        bg="white"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Thead bg={headerBg}>
          <Tr>
            <Th>#</Th>
            <Th>Título</Th>
            <Th>Materia</Th>
            {showTipo && <Th>Tipo</Th>}
            {showDificultad && <Th>Dificultad</Th>}
            {showCarrera && <Th>Carrera</Th>}
            {showPropietario && <Th>Propietario</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {problemas.map((p, idx) => (
            <Tr
              key={p.id_problema}
              _hover={{ bg: hoverBg, cursor: 'pointer' }}
              onClick={() => navigate(`${customBasePath}/${p.id_problema}`)}
            >
              <Td textAlign="center" color={textColor}>{idx + 1}</Td>
              <Td>
                <Text color={textColor} maxW={{ base: '180px', md: '320px' }} noOfLines={1}>
                  {p.titulo}
                </Text>
              </Td>
              <Td color={textColor}>
                <Text maxW={{ base: '140px', md: '220px' }} noOfLines={1}>
                  {p.materia}
                </Text>
              </Td>
              {showTipo && <Td color={textColor}>{p.tipo}</Td>}
              {showDificultad && <Td color={textColor}>{p.dificultad || '—'}</Td>}
              {showCarrera && <Td color={textColor}>{p.carrera}</Td>}
              {showPropietario && <Td color={textColor}>{p.propietario}</Td>}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ProblemTable;
