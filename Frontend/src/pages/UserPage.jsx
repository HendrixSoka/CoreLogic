import { useEffect, useState } from 'react';
import { getUserApprovedProblems, getUserPendingProblems } from '../api/auth';
import { getProblemsPendients } from '../api/adminService';
import SolucionList from '../components/SolutionList';
import ModifyUser from '../components/ModifyUser';
import AdminUsersPanel from '../components/AdminUsersPanel';
import ProblemTable from '../components/ProblemTable';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';

export default function UserPage() {
  const [tab, setTab] = useState(0);
  const [approvedProblems, setApprovedProblems] = useState([]);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [pendingProblems, setPendingProblems] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [adminPendingProblems, setAdminPendingProblems] = useState([]);
  const [adminPendingTotal, setAdminPendingTotal] = useState(0);
  const [adminPendingPage, setAdminPendingPage] = useState(1);
  const [adminPendingLoading, setAdminPendingLoading] = useState(false);
  const [adminTitleSearch, setAdminTitleSearch] = useState('');
  const { user, isAdmin, loading } = useAuth();
  const limit = 10;
  const btnSelectedBg = useColorModeValue('blue.400', 'blue.600');
  const btnSelectedColor = useColorModeValue('white', 'gray.100');

  useEffect(() => {
    if (!user) return;

    const loadApprovedProblems = async () => {
      try {
        setApprovedLoading(true);
        const approvedData = await getUserApprovedProblems({
          skip: (approvedPage - 1) * limit,
          limit,
        });
        setApprovedProblems(approvedData.items || []);
        setApprovedTotal(approvedData.total || 0);
      } catch (error) {
        console.error('Error cargando problemas aprobados del usuario:', error);
      } finally {
        setApprovedLoading(false);
      }
    };

    loadApprovedProblems();
  }, [user, approvedPage]);

  useEffect(() => {
    if (!user) return;

    const loadPendingProblems = async () => {
      try {
        setPendingLoading(true);
        const pendingData = await getUserPendingProblems({
          skip: (pendingPage - 1) * limit,
          limit,
        });
        setPendingProblems(pendingData.items || []);
        setPendingTotal(pendingData.total || 0);
      } catch (error) {
        console.error('Error cargando problemas pendientes del usuario:', error);
      } finally {
        setPendingLoading(false);
      }
    };

    loadPendingProblems();
  }, [user, pendingPage]);

  useEffect(() => {
    if (!isAdmin) {
      setAdminPendingProblems([]);
      setAdminPendingTotal(0);
      return;
    }

    const loadAdminPendingProblems = async () => {
      try {
        setAdminPendingLoading(true);
        const data = await getProblemsPendients({
          skip: (adminPendingPage - 1) * limit,
          limit,
          titulo: adminTitleSearch.trim() || undefined,
        });
        setAdminPendingProblems(data.items || []);
        setAdminPendingTotal(data.total || 0);
      } catch (error) {
        console.error('Error cargando problemas pendientes de admin:', error);
      } finally {
        setAdminPendingLoading(false);
      }
    };

    loadAdminPendingProblems();
  }, [isAdmin, adminPendingPage, adminTitleSearch]);

  useEffect(() => {
    setAdminPendingPage(1);
  }, [adminTitleSearch]);

  if (loading || !user) {
    return <Text>Cargando usuario...</Text>;
  }

  const renderPagination = (page, total, isLoading, onPageChange) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (totalPages <= 1) return null;

    return (
      <Flex justify="center" mt={4} gap={2} flexWrap="wrap" opacity={isLoading ? 0.5 : 1}>
        {page > 3 && (
          <Button
            onClick={() => onPageChange(1)}
            isDisabled={isLoading}
            px={4}
            py={2}
            rounded="xl"
            border="1px"
            borderColor={page === 1 ? btnSelectedBg : 'blue.200'}
            bg={page === 1 ? btnSelectedBg : 'white'}
            color={page === 1 ? btnSelectedColor : 'blue.500'}
          >
            1
          </Button>
        )}

        {page > 4 && <Box px={2}>...</Box>}

        {Array.from({ length: 5 }, (_, i) => {
          const num = page - 2 + i;
          if (num < 1 || num > totalPages) return null;
          return (
            <Button
              key={num}
              onClick={() => onPageChange(num)}
              isDisabled={isLoading}
              px={4}
              py={2}
              rounded="xl"
              border="1px"
              borderColor={page === num ? btnSelectedBg : 'blue.200'}
              bg={page === num ? btnSelectedBg : 'white'}
              color={page === num ? btnSelectedColor : 'blue.500'}
              _hover={{
                bg: page === num ? btnSelectedBg : 'blue.100',
              }}
            >
              {num}
            </Button>
          );
        })}

        {page < totalPages - 3 && <Box px={2}>...</Box>}

        {page < totalPages - 2 && (
          <Button
            onClick={() => onPageChange(totalPages)}
            isDisabled={isLoading}
            px={4}
            py={2}
            rounded="xl"
            border="1px"
            borderColor={page === totalPages ? btnSelectedBg : 'blue.200'}
            bg={page === totalPages ? btnSelectedBg : 'white'}
            color={page === totalPages ? btnSelectedColor : 'blue.500'}
          >
            {totalPages}
          </Button>
        )}
      </Flex>
    );
  };

  return (
    <Box maxW="4xl" mx="auto" p={4}>
      <Tabs index={tab} onChange={setTab} variant="enclosed">
        <TabList mb={4}>
          <Tab>Perfil</Tab>
          <Tab>Problemas</Tab>
          <Tab>Soluciones</Tab>
          <Tab>Configuraciones</Tab>
          {isAdmin && <Tab>Admin Usuarios</Tab>}
          {isAdmin && <Tab>Pendientes</Tab>}
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
                  src={user.foto}
                  alt="Foto de perfil"
                  boxSize="100%"
                  objectFit="cover"
                />
              </VStack>
            </Flex>
          </TabPanel>

          <TabPanel>
            <VStack align="stretch" spacing={8}>
              <Box>
                <Heading as="h3" size="md" mb={4}>
                  Problemas aprobados
                </Heading>
                {approvedLoading ? (
                  <Center py={8}>
                    <Spinner />
                  </Center>
                ) : approvedProblems.length === 0 ? (
                  <Text color="gray.500">No tienes problemas aprobados.</Text>
                ) : (
                  <>
                    <ProblemTable problemas={approvedProblems} />
                    {renderPagination(approvedPage, approvedTotal, approvedLoading, setApprovedPage)}
                  </>
                )}
              </Box>

              <Box>
                <Heading as="h3" size="md" mb={4}>
                  Problemas pendientes
                </Heading>
                {pendingLoading ? (
                  <Center py={8}>
                    <Spinner />
                  </Center>
                ) : pendingProblems.length === 0 ? (
                  <Text color="gray.500">No tienes problemas pendientes.</Text>
                ) : (
                  <>
                    <ProblemTable problemas={pendingProblems} />
                    {renderPagination(pendingPage, pendingTotal, pendingLoading, setPendingPage)}
                  </>
                )}
              </Box>
            </VStack>
          </TabPanel>

          <TabPanel>
            <SolucionList id={user.id_usuario} tipo="usuario" />
          </TabPanel>
          <TabPanel>
            <ModifyUser usuario = {user}> </ModifyUser>
          </TabPanel>
          {isAdmin && (
            <TabPanel>
              <AdminUsersPanel />
            </TabPanel>
          )}
          {isAdmin && (
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Input
                  placeholder="Buscar por titulo"
                  value={adminTitleSearch}
                  onChange={(e) => setAdminTitleSearch(e.target.value)}
                  bg="white"
                />
              {adminPendingLoading ? (
                <Center py={8}>
                  <Spinner />
                </Center>
              ) : adminPendingProblems.length === 0 ? (
                adminTitleSearch.trim() ? (
                  <Text color="gray.500">No se encontraron problemas con ese titulo.</Text>
                ) : (
                  <Text color="gray.500">No hay problemas pendientes.</Text>
                )
              ) : (
                <>
                  <ProblemTable problemas={adminPendingProblems} />
                  {renderPagination(
                    adminPendingPage,
                    adminPendingTotal,
                    adminPendingLoading,
                    setAdminPendingPage
                  )}
                </>
              )}
              </VStack>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
};
