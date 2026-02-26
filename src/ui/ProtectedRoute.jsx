import { useNavigate } from "react-router-dom";
import { useUser } from "../features/authentication/useUser";
import { useUserRole } from "../context/UserRoleContext";
import Spinner from "./Spinner";
import styled from "styled-components";
import { useEffect } from "react";

const FullPage = styled.div`
  height: 100dvh;
  background-color: var(--color-grey-50);
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * ProtectedRoute extendido:
 * - Sin allowedRoles: solo verifica autenticación (comportamiento original)
 * - Con allowedRoles: verifica autenticación Y que el rol esté permitido
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
    const navigate = useNavigate();
    const { isLoading, isAuthenticated } = useUser();
    const { rol, isLoading: roleLoading } = useUserRole();

    useEffect(
        function () {
            if (!isAuthenticated && !isLoading) navigate("/login");
        },
        [isAuthenticated, isLoading, navigate]
    );

    useEffect(
        function () {
            if (!isLoading && !roleLoading && isAuthenticated && allowedRoles.length > 0) {
                if (!allowedRoles.includes(rol)) {
                    navigate("/dashboard");
                }
            }
        },
        [isLoading, roleLoading, isAuthenticated, rol, allowedRoles, navigate]
    );

    if (isLoading || roleLoading)
        return (
            <FullPage>
                <Spinner />
            </FullPage>
        );

    if (isAuthenticated) return children;
}

export default ProtectedRoute;
