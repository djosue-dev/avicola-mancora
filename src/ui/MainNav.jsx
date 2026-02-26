import styled from "styled-components";
import { NavLink, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineScale,
  HiOutlineFire,
  HiOutlineChartBarSquare,
  HiOutlineCog6Tooth,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineScissors,
} from "react-icons/hi2";
import { useSidebar } from "../context/SidebarContext";
import { useUserRole } from "../context/UserRoleContext";
import { useEffect } from "react";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  list-style: none;
`;

const NavSection = styled.li`
    margin-top: 1.2rem;
`;

const SectionLabel = styled.p`
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-grey-400);
    padding: 0.4rem 2.4rem;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    border-radius: var(--border-radius-sm);
    transition: all 0.3s;
  }

  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }
`;

function NavItem({ to, label, icon }) {
  return (
    <li>
      <StyledNavLink to={to}>
        {icon}
        <span>{label}</span>
      </StyledNavLink>
    </li>
  );
}

function MainNav() {
  const { close } = useSidebar();
  const { isAdmin, isPesador, isDigitador, rol } = useUserRole();

  const location = useLocation();
  useEffect(() => {
    close();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav>
      <NavList>
        {/* Siempre visible */}
        <NavItem to="/dashboard" label="Dashboard" icon={<HiOutlineHome />} />

        {/* Solo Admin y Digitador: Pizarra */}
        {(isAdmin || isDigitador) && (
          <NavItem to="/pizarra" label="Pizarra de Pedidos" icon={<HiOutlineClipboardDocumentList />} />
        )}

        {/* Solo Admin y Pesador: Camal y Procesos */}
        {(isAdmin || isPesador) && (
          <>
            <NavItem to="/camal" label="Camal" icon={<HiOutlineScale />} />
            <NavItem to="/procesos" label="Procesos" icon={<HiOutlineScissors />} />
          </>
        )}

        {/* Solo Admin: Reportes y Configuración */}
        {isAdmin && (
          <>
            <NavItem to="/reportes" label="Reportes" icon={<HiOutlineChartBarSquare />} />
            <NavItem to="/configuracion" label="Configuración" icon={<HiOutlineCog6Tooth />} />
          </>
        )}
      </NavList>
    </nav>
  );
}

export default MainNav;
