// options.js
import api from './axiosInstance';

/**
 * Obtiene la lista de carreras desde el backend.
 * @returns {Promise<Array<{ id: number, nombre: string }>>}
 */
export async function obtenerCarreras() {
  try {
    const response = await api.get('/carreras');
    return response.data.carreras;
  } catch (error) {
    console.error('Error al obtener carreras:', error);
    return [];
  }
}

/**
 * Obtiene las materias asociadas a una carrera por ID.
 * @param {number} carreraId - ID de la carrera
 * @returns {Promise<string[]>}
 */
export async function obtenerMateriasPorCarrera(carreraId) {
  try {
    const response = await api.get(`/materias/${carreraId}`);
    return response.data.materias;
  } catch (error) {
    console.error(`Error al obtener materias de la carrera ${carreraId}:`, error);
    return [];
  }
}
