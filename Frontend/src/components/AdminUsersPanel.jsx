import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { assignRol, getUsuariosRol, revokeRol } from '../api/adminService';

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsuariosRol();
        setUsers(data.items || []);
      } catch (error) {
        console.error('Error cargando usuarios admin:', error);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      user.nombre?.toLowerCase().includes(q) ||
      user.correo?.toLowerCase().includes(q)
    );
  });

  const handleAssign = async (idUsuario) => {
    try {
      setLoadingId(idUsuario);
      await assignRol(idUsuario);
      setUsers((prev) =>
        prev.map((user) =>
          user.id_usuario === idUsuario ? { ...user, is_admin: true } : user
        )
      );
      toast({
        title: 'Admin asignado',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'No se pudo asignar el rol',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevoke = async (idUsuario) => {
    try {
      setLoadingId(idUsuario);
      await revokeRol(idUsuario);
      setUsers((prev) =>
        prev.map((user) =>
          user.id_usuario === idUsuario ? { ...user, is_admin: false } : user
        )
      );
      toast({
        title: 'Admin revocado',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'No se pudo revocar el rol',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Input
        placeholder="Buscar por nombre o correo"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Correo</Th>
              <Th>Rol</Th>
              <Th>Acción</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map((user) => (
              <Tr key={user.id_usuario}>
                <Td>{user.nombre}</Td>
                <Td>{user.correo}</Td>
                <Td>
                  <Text fontWeight="medium">
                    {user.is_admin ? 'Admin' : 'Usuario'}
                  </Text>
                </Td>
                <Td>
                  <HStack>
                    {user.is_admin ? (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        isLoading={loadingId === user.id_usuario}
                        onClick={() => handleRevoke(user.id_usuario)}
                      >
                        Revocar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        isLoading={loadingId === user.id_usuario}
                        onClick={() => handleAssign(user.id_usuario)}
                      >
                        Hacer admin
                      </Button>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}
