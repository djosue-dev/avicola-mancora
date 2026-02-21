import styled from "styled-components";
import { NavLink, useLocation } from "react-router-dom";
import {
    HiOutlineHome,
    HiOutlineShoppingCart,
    HiOutlineScale,
    HiOutlineUsers,
    HiOutlineChartBarSquare,
    HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { useSidebar } from "../context/SidebarContext";
import { useEffect } from "react";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  list-style: none;
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

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <HiOutlineHome /> },
    { to: "/ventas", label: "Ventas", icon: <HiOutlineShoppingCart /> },
    { to: "/pesos", label: "Pesos y Stock", icon: <HiOutlineScale /> },
    { to: "/clientes", label: "Clientes", icon: <HiOutlineUsers /> },
    { to: "/reportes", label: "Reportes", icon: <HiOutlineChartBarSquare /> },
    { to: "/configuracion", label: "Configuracion", icon: <HiOutlineCog6Tooth /> },
];

function MainNav() {
    const { close } = useSidebar();

    // Cerrar el sidebar en móvil al navegar
    const location = useLocation();
    useEffect(() => {
        close();
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <nav>
            <NavList>
                {navItems.map(({ to, label, icon }) => (
                    <li key={to}>
                        <StyledNavLink to={to}>
                            {icon}
                            <span>{label}</span>
                        </StyledNavLink>
                    </li>
                ))}
            </NavList>
        </nav>
    );
}

export default MainNav;
