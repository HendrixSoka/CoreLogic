import { useState, useEffect } from 'react';
import { obtenerProblemasPorUsuario } from '../api/problemService';
import { getUserDataFromToken, getMyUser } from '../api/auth';
import SolucionList from '../components/solutionList';
import ProblemTable from '../components/problemTable';
import ModifyUser from '../components/ModifyUser';
import { getImageUrl } from "../api/problemService"; 
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  HStack,
  Image,
} from '@chakra-ui/react';

export default function UserPage() {
  const [tab, setTab] = useState(0);
  const [problemas, setProblemas] = useState([]);
  const [soluciones, setSoluciones] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const partialUser = getUserDataFromToken(); // id + nombre
    if (!partialUser?.id) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    getMyUser(token)
      .then((fullUser) => {
        setUser(fullUser);
        return Promise.all([obtenerProblemasPorUsuario(fullUser.id_usuario)]);
      })
      .then(([problemasData]) => {
        setProblemas(problemasData);
      })
      .catch(() => {
        toast.error('No se pudo obtener el usuario', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'colored',
        });
      });
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    console.log('Cambiar foto:', file);
  };

  if (!user) {
    return <Text>Cargando usuario...</Text>;
  }

  return (
    <Box maxW="4xl" mx="auto" p={4}>
      <Tabs index={tab} onChange={setTab} variant="enclosed">
        <TabList mb={4}>
          <Tab>Perfil</Tab>
          <Tab>Problemas</Tab>
          <Tab>Soluciones</Tab>
          <Tab>Configuraciones</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex gap={8} flexWrap="wrap">
              {/* Info del usuario */}
              <Box flex="1" borderWidth="1px" borderRadius="lg" p={4}>
                <Heading as="h2" size="md" mb={2}>
                  {user.nombre}
                </Heading>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Correo:{' '}
                  <Text as="span" fontStyle="italic" color="gray.400">
                    {user.correo} (No visible)
                  </Text>
                </Text>
                <Text fontSize="sm">Aportaciones: {user.aportaciones}</Text>
                <Text fontSize="sm">Publicaciones: {user.publicaciones}</Text>
              </Box>
              
              {/* Imagen de perfil */}
              <VStack
                w="160px"
                h="160px"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                align="center"
                justify="center"
              >
                <Image
                  src={getImageUrl(user.foto)}
                  alt="Foto de perfil"
                  boxSize="100%"
                  objectFit="cover"
                />
              </VStack>
            </Flex>
          </TabPanel>

          <TabPanel>
            <ProblemTable problemas={problemas.items} fromUser={true} />
          </TabPanel>

          <TabPanel>
            <SolucionList id={user.id_usuario} tipo="usuario" />
          </TabPanel>
          <TabPanel>
            <ModifyUser usuario = {user}> </ModifyUser>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
