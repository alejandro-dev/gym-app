import { login, type LoginPayload } from '@/services/api/authService';
import { setAccessToken } from '@/services/storage/secure-storage';

// Función que realiza la solicitud de inicio de sesión a la API y almacena el token de acceso en el almacenamiento seguro
export async function signIn(payload: LoginPayload) {
   // Realizar la solicitud de inicio de sesión a la API
   const response = await login(payload);

   // Almacenar el token de acceso en el almacenamiento seguro
   await setAccessToken(response.accessToken);

   // Devolver el resultado de la solicitud de inicio de sesión
   return response;
}
