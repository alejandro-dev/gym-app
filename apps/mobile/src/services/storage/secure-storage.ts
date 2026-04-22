import * as SecureStore from 'expo-secure-store';

// Clave utilizada para almacenar el token de acceso en el almacenamiento seguro
const ACCESS_TOKEN_KEY = 'access_token';

// Función para guardar el token de acceso en el almacenamiento seguro
export async function setAccessToken(token: string) {
   await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

// Función para obtener el token de acceso desde el almacenamiento seguro
export async function getAccessToken() {
   return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

// Función para eliminar el token de acceso del almacenamiento seguro
export async function removeAccessToken() {
   await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
