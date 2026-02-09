# Guía de Integración Frontend: Autenticación con Cookies y Tokens

Esta guía explica cómo integrar el sistema de **Access Token** (15 min) y **Refresh Token** (24h) en el frontend utilizando **Axios**.

## 1. Configuración de Axios

Es **CRÍTICO** configurar `withCredentials: true`. Sin esto, el navegador no enviará ni guardará las cookies.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // Permite el envío de cookies
});
```

## 2. Interceptor para Renovación Automática

Utilizaremos un interceptor de respuesta para detectar cuando el `access_token` ha expirado y renovarlo sin que el usuario se dé cuenta.

```javascript
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, no hacemos nada
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos 401 (Access Token expirado) y no es un reintento
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentamos renovar el token
        await axios.post('http://localhost:3000/api/auth/refresh', {}, { withCredentials: true });

        // Si la renovación tuvo éxito, reintentamos la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (403), significa que la sesión expiró totalmente
        console.error('La sesión expiró. Redirigiendo al login...');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## 3. Ejemplo de Login

No necesitas guardar el token en `localStorage`. El navegador se encarga de las cookies.

```javascript
const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    // Guardar solo datos públicos del usuario en tu estado global (Redux/Context)
    const userData = res.data.user;
    return userData;
  } catch (error) {
    throw error.response.data.message;
  }
};
```

## 4. Obtener perfil actual (Persistencia)

Al recargar la página, llama a `/me` para saber si el usuario sigue autenticado.

```javascript
const checkAuth = async () => {
  try {
    const res = await api.get('/auth/me');
    return res.data.user;
  } catch (error) {
    // Si falla, el usuario no está logueado
    return null;
  }
};
```

## Resumen de Errores
- **401 Unauthorized:** El `access_token` no sirve. El interceptor intentará `/refresh`.
- **403 Forbidden:** El `refresh_token` expiró o es inválido. El usuario **debe** ir al Login.
