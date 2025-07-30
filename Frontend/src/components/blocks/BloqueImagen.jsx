import { Box, Image, Input, VStack, Text } from "@chakra-ui/react";

const BloqueImagen = ({ url, editable, onChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const nombre = file.name;
      const urlPreview = URL.createObjectURL(file);
      onChange({ file, nombre, urlPreview });
    }
  };

  return (
    <VStack spacing={3} width="100%">
      {url && (
        <>
          <Box
            maxW={{ base: "100%", md: "500px" }}
            maxH="300px"
            overflow="hidden"
            borderRadius="md"
            boxShadow="md"
          >
            <Image
              src={url}
              alt="Imagen bloque"
              objectFit="cover"
              width="100%"
              height="100%"
            />
          </Box>
        </>
      )}
      {editable && (
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          variant="unstyled"
          p={1}
          cursor="pointer"
        />
      )}
    </VStack>
  );
};

export default BloqueImagen;
