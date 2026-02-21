import Heading from "../ui/Heading";
import styled from "styled-components";

const ReportesLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const PlaceholderCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 4.8rem;
  text-align: center;
  color: var(--color-grey-500);
  font-size: 1.6rem;
`;

function Reportes() {
    return (
        <>
            <Heading as="h1">Reportes</Heading>
            <ReportesLayout>
                <PlaceholderCard>
                    Las funcionalidades de reportes estan en desarrollo. Gracias, vuelva pronto
                </PlaceholderCard>
            </ReportesLayout>
        </>
    );
}

export default Reportes;
