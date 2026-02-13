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
    <Box overflowX="auto" p={{ base: 2, md: 4 }}>
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
            <Th display={{ base: 'none', md: 'table-cell' }}>Tipo</Th>
            <Th display={{ base: 'none', md: 'table-cell' }}>Dificultad</Th>
            <Th display={{ base: 'none', md: 'table-cell' }}>Carrera</Th>
            <Th display={{ base: 'none', md: 'table-cell' }}>Propietario</Th>
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
              <Td color={textColor} display={{ base: 'none', md: 'table-cell' }}>{p.tipo}</Td>
              <Td color={textColor} display={{ base: 'none', md: 'table-cell' }}>{p.dificultad || '—'}</Td>
              <Td color={textColor} display={{ base: 'none', md: 'table-cell' }}>{p.carrera}</Td>
              <Td color={textColor} display={{ base: 'none', md: 'table-cell' }}>{p.propietario}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ProblemTable;
