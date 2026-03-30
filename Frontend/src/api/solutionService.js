import api from './axiosInstance';

// Crear una nueva solución
export async function crearSolucion(solucionData, imagenes = []) {
    const formData = new FormData();

    for (const key in solucionData) {
        formData.append(key, solucionData[key]);
    }

    imagenes.forEach((img) => {
        formData.append("imagenes", img);
    });

    for (let [clave, valor] of formData.entries()) {
        console.log(clave, valor);
    };
    const response = await api.post("/soluciones/", formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
    });
    return response.data;
}

// Editar una solución existente
export async function editarSolucion(solucionData, imagenes = []) {
    const formData = new FormData();

    for (const key in solucionData) {
        formData.append(key, solucionData[key]);
    }

    if (imagenes && imagenes.length > 0) {
        imagenes.forEach((img) => {
            formData.append("imagenes", img);
        });
    }

    for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
    }
    const response = await api.put(`/soluciones/${solucionData.id_solucion}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
    });
    return response.data;
}

export async function listarSoluciones({ id, tipo = "usuario", skip = 0, limit = 10 }) {
  const endpoint =
    tipo === 'usuario'
      ? '/soluciones/usuario'
      : `/soluciones/${tipo}/${id}`;
  const response = await api.get(`${endpoint}?skip=${skip}&limit=${limit}`);
  return response.data;
}

// Obtener una solución por su ID
export async function obtenerSolucionPorId(solucionId) {
    const response = await api.get(`/solucion/${solucionId}`);
    return response.data;
}

// Dar like a una solución
export async function likeSolucion(solucionId) {
  const response = await api.post(`/soluciones/${solucionId}/like`);
  return response.data; 
}

// Dar dislike a una solución
export async function dislikeSolucion(solucionId) {
  const response = await api.post(`/soluciones/${solucionId}/dislike`);
  return response.data;
}
