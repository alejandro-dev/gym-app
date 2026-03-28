import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Función para verificar si el usuario está autenticado y redireccionar si no lo está.
export async function requireUser() {
   const user = await getCurrentUser();
   if (!user) redirect("/signin");
   return user;
}

// Función para verificar si el admin está autenticado y redireccionar si no lo está.
export async function requireAdmin() {
   const user = await requireUser();
   // if (!user.role === "ADMIN") redirect("/dashboard");
   return user;
}

// Función para proteger si no es admin y redirigir a la página de inicio de sesión.
export async function requireAdminApi() {
   const user = await getCurrentUser();

   // Si el usuario no está autenticado, redirigimos al inicio de sesión.
   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

   // Si el usuario no es admin, redirigimos al inicio de sesión.
   // if (!user.isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

   return null;
}
