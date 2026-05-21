import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { InfoOutlineIcon, StarIcon, TimeIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';
import { despertarBackend } from '../api/options';

export default function HelpPage (){
  useEffect(() => {
    despertarBackend();
  }, []);

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
      <VStack spacing={{ base: 8, md: 10 }} align="stretch">
        <Box
          bg="white"
          border="1px solid"
          borderColor="brand.100"
          borderRadius="24px"
          px={{ base: 6, md: 8 }}
          py={{ base: 7, md: 9 }}
          boxShadow="0 4px 20px rgba(109,40,217,0.08)"
        >
          <Text
            color="brand.700"
            textTransform="uppercase"
            fontWeight="800"
            letterSpacing="0.08em"
            fontSize="sm"
            mb={3}
          >
            Bienvenido
          </Text>
          <Heading size="xl" mb={4} color="brand.900">
            Un espacio académico más claro, moderno y fácil de explorar
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.700" lineHeight="tall">
            Este sitio reúne ejercicios, prácticas y soluciones de la Facultad Nacional de Ingeniería
            en un entorno más ordenado, legible y pensado para estudiar mejor.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box
            bg="white"
            border="1px solid"
            borderColor="brand.100"
            borderRadius="24px"
            p={6}
            boxShadow="0 4px 20px rgba(109,40,217,0.08)"
          >
            <Flex align="center" gap={3} mb={4}>
              <Flex
                w="44px"
                h="44px"
                align="center"
                justify="center"
                rounded="full"
                bg="brand.50"
                color="brand.700"
              >
                <Icon as={InfoOutlineIcon} boxSize={5} />
              </Flex>
              <Heading size="md" color="brand.900">¿Qué es este espacio?</Heading>
            </Flex>
            <Text color="gray.700" lineHeight="tall" textAlign="justify">
              Este sitio web es un repositorio de ejercicios. Reúne problemas de exámenes,
              prácticas y otros trabajos de la Facultad Nacional de Ingeniería para facilitar
              su consulta de forma estructurada.
            </Text>
          </Box>

          <Box
            bg="white"
            border="1px solid"
            borderColor="brand.100"
            borderRadius="24px"
            p={6}
            boxShadow="0 4px 20px rgba(109,40,217,0.08)"
          >
            <Flex align="center" gap={3} mb={4}>
              <Flex
                w="44px"
                h="44px"
                align="center"
                justify="center"
                rounded="full"
                bg="brand.50"
                color="brand.700"
              >
                <Icon as={StarIcon} boxSize={4} />
              </Flex>
              <Heading size="md" color="brand.900">¿Qué puedes hacer aquí?</Heading>
            </Flex>
            <Text color="gray.700" lineHeight="tall" textAlign="justify">
              Puedes explorar ejercicios, buscar por materia o tipo, ver soluciones propuestas,
              reaccionar a ellas, subir tus propios problemas y también publicar soluciones.
            </Text>
          </Box>

          <Box
            bg="white"
            border="1px solid"
            borderColor="brand.100"
            borderRadius="24px"
            p={6}
            boxShadow="0 4px 20px rgba(109,40,217,0.08)"
          >
            <Flex align="center" gap={3} mb={4}>
              <Flex
                w="44px"
                h="44px"
                align="center"
                justify="center"
                rounded="full"
                bg="brand.50"
                color="brand.700"
              >
                <Icon as={TimeIcon} boxSize={5} />
              </Flex>
              <Heading size="md" color="brand.900">¿Cómo puedes empezar?</Heading>
            </Flex>
            <Text color="gray.700" lineHeight="tall" textAlign="justify">
              No necesitas registrarte para revisar soluciones. Si quieres aportar ejercicios o
              publicar respuestas, puedes entrar con tu cuenta de Google y comenzar a colaborar.
            </Text>
          </Box>
        </SimpleGrid>

        <Box
          bg="white"
          border="1px solid"
          borderColor="brand.100"
          borderRadius="24px"
          px={{ base: 6, md: 8 }}
          py={{ base: 6, md: 7 }}
          boxShadow="0 4px 20px rgba(109,40,217,0.08)"
        >
          <Heading size="md" mb={4} color="brand.900">
            Editor por bloques
          </Heading>
          <Text color="gray.700" lineHeight="tall" textAlign="justify">
            Tanto los problemas como sus soluciones se construyen mediante un editor basado en
            <strong> bloques</strong>. Esto permite añadir texto, fórmulas matemáticas, fragmentos
            de código, listas e imágenes en una estructura más flexible y profesional.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};
