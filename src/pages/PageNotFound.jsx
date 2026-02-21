import Heading from "../ui/Heading";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const StyledPageNotFound = styled.main`
  height: 100vh;
  background-color: var(--color-grey-50);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 4.8rem;
  flex: 0 1 96rem;
  text-align: center;

  & h1 {
    margin-bottom: 3.2rem;
  }
`;

function PageNotFound() {
    const navigate = useNavigate();

    return (
        <StyledPageNotFound>
            <Box>
                <Heading as="h1">La pagina que buscas no existe.</Heading>
                <Button onClick={() => navigate(-1)} size="large">
                    Volver
                </Button>
            </Box>
        </StyledPageNotFound>
    );
}

export default PageNotFound;
