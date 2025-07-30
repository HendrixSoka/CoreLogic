import React from 'react';
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

const ProblemTable = ({ problemas = []}) => {
  const navigate = useNavigate();

  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const headerBg = useColorModeValue('blue.100', 'blue.700');
  const borderColor = useColorModeValue('blue.200', 'blue.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');

  return (
    <Box overflowX="auto" p={4}>
      <Table variant="simple" size="md" bg="white" border="1px solid" borderColor={borderColor} borderRadius="lg" boxShadow="sm">
        <Thead bg={headerBg}>
          <Tr>
            <Th>#</Th>
            <Th>Título</Th>
            <Th>Materia</Th>
            <Th>Tipo</Th>
            <Th>Dificultad</Th>
            <Th>Carrera</Th>
            <Th>Propietario</Th>
          </Tr>
        </Thead>
        <Tbody>
          {problemas.map((p, idx) => (
            <Tr
              key={p.id_problema}
              _hover={{ bg: hoverBg, cursor: 'pointer' }}
              onClick={
                () => navigate(`/ejercicio/${p.id_problema}`) 
              }
            >
              <Td textAlign="center" color={textColor}>{idx + 1}</Td>
              <Td color={textColor}>{p.titulo}</Td>
              <Td color={textColor}>{p.materia}</Td>
              <Td color={textColor}>{p.tipo}</Td>
              <Td color={textColor}>{p.dificultad || '—'}</Td>
              <Td color={textColor}>{p.carrera}</Td>
              <Td color={textColor}>{p.propietario}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ProblemTable;
