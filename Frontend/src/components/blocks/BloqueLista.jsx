import { Input, List, ListItem, Button, HStack, Box } from "@chakra-ui/react";

const BloqueLista = ({ estilo, items, editable, onChange }) => {
  const handleItemChange = (i, value) => {
    const nuevos = [...items];
    nuevos[i] = value;
    onChange({ estilo, items: nuevos });
  };

  const handleEstiloChange = (nuevoEstilo) => {
    onChange({ estilo: nuevoEstilo, items });
  };

  const handleEnter = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nuevos = [...items];
      nuevos.splice(index + 1, 0, ""); // insertar un nuevo ítem vacío después
      onChange({ estilo, items: nuevos });
    }
  };

  const getStyleType = (estilo) => {
    switch (estilo) {
      case "ordenada":
        return "decimal";
      case "viñetas":
        return "disc";
      default:
        return "disc";
    }
  };

  return (
    <Box>
      {editable && (
        <HStack mb={2} spacing={2}>
          <Button
            size="xs"
            opacity={0.7}
            bg="orange.300"
            _hover={{ opacity: 1 }}
            onClick={() => handleEstiloChange("viñetas")}
          >
            Viñetas
          </Button>
          <Button
            size="xs"
            opacity={0.7}
            bg="yellow.300"
            _hover={{ opacity: 1 }}
            onClick={() => handleEstiloChange("ordenada")}
          >
            Ordenada
          </Button>
        </HStack>
      )}

      <List spacing={1} styleType={getStyleType(estilo)} pl={4}>
        {items.map((item, i) => (
          <ListItem key={i}>
            {editable ? (
              <Input
                value={item}
                onChange={(e) => handleItemChange(i, e.target.value)}
                onKeyDown={(e) => handleEnter(e, i)}
                size="sm"
                variant="unstyled"
                _focus={{ bg: "gray.100" }}
                borderRadius="md"
                px={1}
              />
            ) : (
              item
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BloqueLista;
