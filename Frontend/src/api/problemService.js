import api from './axiosInstance';
const BACKEND_URL = import.meta.env.VITE_API_URL
export async function crearProblema(problemaData, imagenes = []) {
    const formData = new FormData();
     
    for (const key in problemaData) {
        formData.append(key, problemaData[key]);
    }
    imagenes.forEach((img) => {
        formData.append("imagenes", img);
    });

    const response = await api.post('/problemas/', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
    });
    return response.data;
}

export async function editarProblema(problem_id, problemaData, imagenes = []) {
    const formData = new FormData();

    for (const key in problemaData) {
        formData.append(key, problemaData[key]);
    }

    imagenes.forEach((img) => {
        formData.append("imagenes", img);
    });

    const response = await api.put(`/problemas/${problem_id}`, formData,{
    headers: {
        'Content-Type': 'multipart/form-data'
    }
    });
    return response.data;
}

export async function listarProblemas({ skip = 0, limit = 20, titulo, materia, tipo, dificultad, carrera }) {
  const params = new URLSearchParams();

  params.append("skip", skip.toString());
  params.append("limit", limit.toString());

  if (titulo) params.append("titulo", titulo);
  if (materia) params.append("materia", materia);
  if (tipo) params.append("tipo", tipo);
  if (dificultad) params.append("dificultad", dificultad);
  if (carrera) params.append("carrera", carrera);

  const response = await api.get(`/problemas/?${params.toString()}`);
  return response.data;
}


export async function obtenerProblemaPorId(id) {
    const response = await api.get(`/problemas/${id}`);
    return response.data;
}

export async function obtenerProblemasPorUsuario(id_user) {
    const response = await api.get(`/problemas/usuario/${id_user}`);
    return response.data;
}

///reemplazar en nuevas versiones por esto 
/*
export function getImageUrl(path) {
  if (!path) return '';
  return `${BACKEND_URL}/${path}`;
}

*/
export function getImageUrl(path) {
  if (!path) return '';
  return `${BACKEND_URL}/${path.replace(/^static\//, '')}`;
}
