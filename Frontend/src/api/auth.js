import api from './axiosInstance';
import { jwtDecode } from 'jwt-decode';

export async function loginWithGoogle({ idToken }) {
  const response = await api.post('/auth/google', {
    id_token: idToken,
    remember_me: true,
  });

  const token = response.data.access_token;
  localStorage.setItem('token', token);
  sessionStorage.removeItem('token');
  return response.data;
}

export async function getMyUser(token) {
  const res = await api.get('/usuarios/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
export async function updateUser(userId, usuarioData, foto = null) {
  try {
    const formData = new FormData();

    // Agrega cada campo del usuario al FormData
    for (const key in usuarioData) {
      if(usuarioData[key]!= "" && usuarioData[key]!= undefined && usuarioData[key]!=null)
        formData.append(key, usuarioData[key]);
    }
    if (foto) {
      formData.append('foto', foto);
    }

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await api.put(`/usuarios/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error.response?.data || error;
  }
}

export function getUserDataFromToken() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.sub,
      nombre: decoded.nombre
    };
  } catch (err) {
    console.error('Token inválido', err);
    return null;
  }
}
