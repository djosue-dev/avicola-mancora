import styled from "styled-components";
import UserAvatar from "../features/authentication/UserAvatar";
import HeaderMenu from "./HeaderMenu";
import ButtonIcon from "./ButtonIcon";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
import { useSidebar } from "../context/SidebarContext";

const StyledHeader = styled.header`
  background-color: var(--color-grey-0);
  padding: 1.2rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-100);

  display: flex;
  gap: 2.4rem;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 768px) {
    padding: 1.2rem 1.6rem;
    justify-content: space-between;
  }
`;

const HamburgerButton = styled(ButtonIcon)`
  /* Solo visible en móvil */
  display: none;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2.4rem;
`;

function Header() {
    const { isOpen, toggle } = useSidebar();

    return (
        <StyledHeader>
            {/* Botón hamburguesa — solo en móvil */}
            <HamburgerButton onClick={toggle} aria-label="Abrir menu">
                {isOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
            </HamburgerButton>

            <RightGroup>
                <UserAvatar />
                <HeaderMenu />
            </RightGroup>
        </StyledHeader>
    );
}

export default Header;
