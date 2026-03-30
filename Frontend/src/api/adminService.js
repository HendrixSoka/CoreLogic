import api from './axiosInstance';

export async function getUsuariosRol() {
  const response = await api.get('/roles/usuarios');
  return response.data;
}

export async function assignRol(idUsuario, rol = 'Admin') {
  const response = await api.post('/roles/asignar', {
    id_usuario: idUsuario,
    rol,
  });
  return response.data;
}

export async function revokeRol(idUsuario) {
  const response = await api.delete('/roles/revoke', {
    data: {
      id_usuario: idUsuario,
    },
  });
  return response.data;
}

export async function getProblemsPendients({ skip = 0, limit = 20, titulo } = {}) {
  const response = await api.get('/problemas/pendientes', {
    params: { skip, limit, titulo },
  });
  return response.data;
}

export async function approveProblem(problemId) {
  const response = await api.patch(`/problemas/${problemId}/approve`);
  return response.data;
}

export async function deleteProblem(problemId) {
  const response = await api.delete(`/problemas/${problemId}`);
  return response.data;
}

export async function deleteSolution(solutionId) {
  const response = await api.delete(`/soluciones/${solutionId}`);
  return response.data;
}
