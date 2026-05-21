import { Box, Flex, Image, Text } from '@chakra-ui/react';

export default function Footer() {
  const serverTime = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/La_Paz',
  }).format(new Date());

  return (
    <Box px={{ base: 4, md: 8 }} pb={{ base: 5, md: 6 }} pt={{ base: 2, md: 3 }}>
      <Flex
        maxW="7xl"
        mx="auto"
        direction="column"
        justify="center"
        align="center"
        gap={3}
        bgGradient="linear(90deg, #6D28D9, #7C3AED, #5B21B6)"
        borderRadius="18px"
        boxShadow="0 4px 20px rgba(109,40,217,0.2)"
        px={{ base: 5, md: 7 }}
        py={{ base: 5, md: 5 }}
      >
        <Text color="whiteAlpha.900" fontWeight="700" textAlign="center" fontSize={{ base: 'xs', md: 'sm' }}>
          EjerciciosFNI (c) Copyright 2026 Hendrix
        </Text>
        <Text color="whiteAlpha.900" textAlign="center" fontSize={{ base: 'xs', md: 'sm' }}>
          The academic exercises platform
        </Text>
        <Text color="whiteAlpha.900" textAlign="center" fontSize={{ base: 'xs', md: 'sm' }}>
          Server time: {serverTime} UTC-4.
        </Text>
        
        <Box
          mt={1}
          px={4}
          py={3}
          minW={{ base: '100%', md: '320px' }}
          border="1px dashed"
          borderColor="whiteAlpha.500"
          borderRadius="16px"
          bg="whiteAlpha.100"
        >
          <Text color="white" fontWeight="800" textAlign="center" mb={1}>
            Supported by 
          </Text>
          <Image
            src="/logonova.jpg"
            alt="Logo de apoyo"
            mx="auto"
            mt={2}
            maxH={{ base: '56px', md: '72px' }}
            objectFit="contain"
            borderRadius="10px"
          />
        </Box>
      </Flex>
    </Box>
  );
}
