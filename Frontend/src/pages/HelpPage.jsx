import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
} from '@chakra-ui/react';

export default function HelpPage (){
  return (
    <Box maxW="4xl" mx="auto" px={6} py={10}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="md" textAlign="justify" mb={2}>
          ¿Qué es este espacio?
        </Heading>

        <Text fontSize="lg" textAlign="justify">
          Este sitio web es un repositorio de ejercicios. 
          Reúne problemas de exámenes, prácticas y otros trabajos de la 
          Facultad Nacional de Ingeniería. Su propósito es reunir 
          el contenido y almacenarlo de forma estructurada para facilitar 
          su consulta.
        </Text>
        </Box>
        

        <Box>
          <Heading size="md" mb={2}>¿Qué puedes hacer aquí?</Heading>
          <Text textAlign="justify">
            Puedes explorar ejercicios, buscar por materia o tipo, ver soluciones propuestas,
            respaldar soluciones o invalidar soluciones mediante una reaccion, subir tus propios problemas con enunciado o imagen,
            y también publicar tus soluciones a problemas existentes.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={2}>¿Cómo puedes empezar?</Heading>
          <Text textAlign="justify">
            Para ver las soluciones propuestas, no necesitas registrarte. Sin embargo, si quieres subir 
            ejercicios o contribuir con soluciones, sí es necesario crear una cuenta.
            puedes registrarte con tu correo y un nombre de usuario. Una vez dentro,
            puedes subir nuevos ejercicios o contribuir con soluciones.
          </Text>
          <Text textAlign="justify" mt={2}>
            Tanto los problemas como sus soluciones se construyen mediante un editor basado en
            <strong> bloques</strong>. Esto significa que no se limitan a texto plano: puedes añadir
            enunciados, fórmulas matemáticas, fragmentos de código, listas o incluso imágenes,
            organizando el contenido de manera libre y estructurada.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};