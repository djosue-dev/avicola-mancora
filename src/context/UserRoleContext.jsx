import { createContext, useContext } from "react";
import { useUser } from "../features/authentication/useUser";

const UserRoleContext = createContext(null);

/**
 * Roles válidos del sistema:
 * - "admin"     → acceso completo
 * - "pesador"   → acceso a Camal y Procesos
 * - "digitador" → acceso a Pizarra de Pedidos
 */
export function UserRoleProvider({ children }) {
    const { user, isLoading } = useUser();

    const rol = user?.user_metadata?.rol ?? null;

    const isAdmin     = rol === "admin";
    const isPesador   = rol === "pesador";
    const isDigitador = rol === "digitador";

    const canAccess = (allowedRoles = []) => {
        if (!rol) return false;
        return allowedRoles.includes(rol);
    };

    return (
        <UserRoleContext.Provider
            value={{ rol, isAdmin, isPesador, isDigitador, canAccess, isLoading }}
        >
            {children}
        </UserRoleContext.Provider>
    );
}

export function useUserRole() {
    const context = useContext(UserRoleContext);
    if (!context) throw new Error("useUserRole debe usarse dentro de UserRoleProvider");
    return context;
}
