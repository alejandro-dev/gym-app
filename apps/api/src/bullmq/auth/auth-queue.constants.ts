export const AUTH_QUEUE = 'auth';

// Nombres de las tareas de la cola de correo de onboarding
export const AUTH_JOBS = {
   USER_REGISTERED: 'auth.user-registered', // Enviar un correo de bienvenida
   PASSWORD_RESET_REQUESTED: 'auth.password-reset-requested', // Enviar un correo de restablecimiento de contraseña
} as const;
