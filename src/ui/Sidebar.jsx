import styled from "styled-components";
import Logo from "./Logo";
import MainNav from "./MainNav";
import { useSidebar } from "../context/SidebarContext";

const StyledSidebar = styled.aside`
  background-color: var(--color-grey-0);
  padding: 3.2rem 2.4rem;
  border-right: 1px solid var(--color-grey-100);
  grid-row: 1 / -1;

  display: flex;
  flex-direction: column;
  gap: 3.2rem;

  /* Móvil: sidebar deslizante desde la izquierda */
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    width: 28rem;
    z-index: 100;
    transform: ${(props) =>
        props.$isOpen ? "translateX(0)" : "translateX(-100%)"};
    transition: transform 0.3s ease;
    box-shadow: ${(props) =>
        props.$isOpen ? "var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.3))" : "none"};
  }
`;

function Sidebar() {
    const { isOpen } = useSidebar();

    return (
        <StyledSidebar $isOpen={isOpen}>
            <Logo />
            <MainNav />
        </StyledSidebar>
    );
}

export default Sidebar;
