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
        <Heading size="xl" textAlign="center">
          ¿Qué es lo que nos impulsa a crear este espacio?
        </Heading>

        <Text fontSize="lg" textAlign="justify">
          ¿Qué hace experto a alguien en una materia? ¿Coeficientes altos, mejores memorias a corto plazo, 
          razonamiento espacial superior al promedio? Lo cierto es que cualquier experto no necesariamente 
          destaca en ninguno de estos criterios. Centralmente, la maestría está relacionada con el reconocimiento
          de patrones, y dicho reconocimiento conduce a la intuición. Si ves el cielo gris, sabes instintivamente 
          qué sucederá después. Desarrollar la memoria a largo plazo de un experto lleva mucho tiempo; 10.000 horas 
          es la regla de oro popularizada por Malcolm Gladwell.

          Con ese objetivo este sitio web ofrece una herramienta práctica para organizar, consultar
          y resolver ejercicios académicos. Permite clasificar problemas por materia, tipo o nivel de 
          dificultad, y ofrece un espacio donde cada estudiante puede registrar tanto los enunciados como 
          sus soluciones, facilitando así un enfoque sistemático para reforzar el aprendizaje.
        </Text>

        <Box>
          <Heading size="md" mb={2}>¿Qué puedes hacer aquí?</Heading>
          <Text textAlign="justify">
            Puedes explorar ejercicios, buscar por materia o tipo, ver soluciones propuestas,
            comentar con reacciones, subir tus propios problemas con enunciado e imagen,
            y también publicar tus soluciones a problemas existentes.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={2}>¿Cómo puedes empezar?</Heading>
          <Text textAlign="justify">
            Solo necesitas registrarte con tu correo y un nombre de usuario. Una vez dentro,
            puedes navegar por la lista de problemas, subir nuevos ejercicios o contribuir con
            soluciones. Es rápido, simple, y todo se guarda automáticamente.
          </Text>
          <Text textAlign="justify" mt={2}>
            Tanto los problemas como sus soluciones se construyen mediante un editor basado en
            <strong> bloques</strong>. Esto significa que no se limitan a texto plano: puedes añadir
            enunciados, fórmulas matemáticas, fragmentos de código, listas o incluso imágenes,
            organizando el contenido de manera clara y estructurada.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};