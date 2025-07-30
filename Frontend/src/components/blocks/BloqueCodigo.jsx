import { Box, Textarea, Select, Code, VStack, Text } from "@chakra-ui/react";

const LENGUAJES = [
  { label: "C++", value: "cpp" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "SQL", value: "sql" },
];

const BloqueCodigo = ({ contenido, lenguaje, editable, onChange }) => {
  const handleContenidoChange = (e) => {
    onChange({ contenido: e.target.value });
  };

  const handleLenguajeChange = (e) => {
    onChange({ lenguaje: e.target.value });
  };

  const lenguajeLabel =
    LENGUAJES.find((lang) => lang.value === lenguaje)?.label || lenguaje;

  return (
    <VStack align="stretch" spacing={3}>
      {editable ? (
        <Select value={lenguaje} onChange={handleLenguajeChange}>
          {LENGUAJES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </Select>
      ) : (
        <Text fontSize="sm" fontWeight="bold" color="gray.600">
          Lenguaje: {lenguajeLabel}
        </Text>
      )}

      {editable ? (
        <Textarea
          value={contenido}
          onChange={handleContenidoChange}
          placeholder="Código..."
          fontFamily="mono"
          bg="gray.100"
          borderRadius="md"
          p={2}
          minH="150px"
        />
      ) : (
        <Box
          bg="gray.100"
          borderRadius="md"
          p={3}
          overflowX="auto"
          fontFamily="mono"
        >
          <Code className={`language-${lenguaje}`} whiteSpace="pre">
            {contenido}
          </Code>
        </Box>
      )}
    </VStack>
  );
};

export default BloqueCodigo;
