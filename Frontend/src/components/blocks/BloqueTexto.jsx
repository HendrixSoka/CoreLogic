import { Textarea, Text } from "@chakra-ui/react";

const BloqueTexto = ({ contenido, editable, onChange }) => {
  return editable ? (
    <Textarea
      value={contenido}
      onChange={(e) => onChange({ contenido: e.target.value })}
      placeholder="Escribe aquí..."
      borderRadius="md"
      p={2}
    />
  ) : (
    <Text fontSize="md" whiteSpace="pre-wrap">
      {contenido}
    </Text>
  );
};

export default BloqueTexto;
