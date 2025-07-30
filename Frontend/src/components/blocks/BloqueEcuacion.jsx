import { Input, Box, Text, Center } from "@chakra-ui/react";

const BloqueEcuacion = ({ contenido, editable, onChange }) => {
  return editable ? (
    <Input
      value={contenido}
      onChange={(e) => onChange({ contenido: e.target.value })}
      placeholder="Ecuación LaTeX..."
      fontFamily="mono"
      fontSize="lg"
      borderRadius="md"
      p={2}
    />
  ) : (
    <Center>
      <Box
        bg="gray.50"
        px={3}
        py={2}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        fontFamily="mono"
        fontSize="lg"
      >
        {contenido}
      </Box>
    </Center>
  );
};

export default BloqueEcuacion;
