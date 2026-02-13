import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Flex,
} from "@chakra-ui/react";

const BloqueTabla = ({ encabezados, filas, editable, onChange }) => {
  // Cambiar encabezado
  const handleEncabezadoChange = (i, value) => {
    const nuevos = [...encabezados];
    nuevos[i] = value;
    onChange({ encabezados: nuevos, filas });
  };

  const handleCeldaChange = (i, j, value) => {
    const nuevasFilas = filas.map((row) => [...row]);
    nuevasFilas[i][j] = value;
    onChange({ encabezados, filas: nuevasFilas });
  };

  const addColumn = () => {
    const nuevosEncabezados = [...encabezados, `Columna ${encabezados.length + 1}`];
    const nuevasFilas = filas.map((row) => [...row, ""]);
    onChange({ encabezados: nuevosEncabezados, filas: nuevasFilas });
  };

  const addRow = () => {
    const nuevasFilas = [...filas, Array(encabezados.length).fill("")];
    onChange({ encabezados, filas: nuevasFilas });
  };

  return (
    <Box overflowX="auto" borderWidth="1px" borderColor="gray.300" borderRadius="md" p={3} bg="white">
      <Table variant="unstyled" size="sm" borderCollapse="collapse" width="100%">
        <Thead bg="gray.100">
          <Tr>
            {encabezados.map((head, i) => (
              <Th
                key={i}
                border="1px solid"
                borderColor="gray.400"
                px={2}
                py={2}
                minW="140px"
                textTransform="none"
              >
                {editable ? (
                  <Input
                    value={head}
                    onChange={(e) => handleEncabezadoChange(i, e.target.value)}
                    size="sm"
                    borderRadius="sm"
                    borderColor="gray.500"
                    px={2}
                  />
                ) : (
                  head
                )}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {filas.map((fila, i) => (
            <Tr key={i}>
              {fila.map((celda, j) => (
                <Td key={j} border="1px solid" borderColor="gray.400" px={2} py={2} minW="140px">
                  {editable ? (
                    <Input
                      value={celda}
                      onChange={(e) => handleCeldaChange(i, j, e.target.value)}
                      size="sm"
                      borderRadius="sm"
                      borderColor="gray.400"
                      px={2}
                    />
                  ) : (
                    celda
                  )}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>

      {editable && (
        <Flex mt={3} gap={2}>
          <Button size="sm" colorScheme="blue" onClick={addColumn}>
            + Columna
          </Button>
          <Button size="sm" colorScheme="green" onClick={addRow}>
            + Fila
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default BloqueTabla;
