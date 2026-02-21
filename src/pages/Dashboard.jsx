import styled from "styled-components";
import Heading from "../ui/Heading";
import Spinner from "../ui/Spinner";
import {
  HiOutlineShoppingCart,
  HiOutlineScale,
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { useVentasHoy, useVentasSemana, useVentasRecientes } from "../features/ventas/useVentas";
import { useStockActual } from "../features/pesos/usePesos";
import { useClientes } from "../features/clientes/useClientes";
import { useConfiguracion } from "../features/configuracion/useConfiguracion";

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.4rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: grid;
  grid-template-columns: 6.4rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 1.6rem;
  row-gap: 0.4rem;
`;

const Icon = styled.div`
  grid-row: 1 / -1;
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-${(props) => props.color}-100);
  & svg {
    height: 3.2rem;
    width: 3.2rem;
    color: var(--color-${(props) => props.color}-700);
  }
`;

const Title = styled.h5`
  align-self: end;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-grey-500);
  font-weight: 600;
`;

const Value = styled.p`
  font-size: 2.4rem;
  line-height: 1;
  font-weight: 600;
`;

const AlertBox = styled.div`
  background-color: var(--color-red-100);
  border: 1px solid var(--color-red-700);
  border-radius: var(--border-radius-md);
  padding: 2rem 2.4rem;
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-red-700);
    flex-shrink: 0;
    margin-top: 0.2rem;
  }
  & h4 {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-red-700);
    margin-bottom: 0.4rem;
  }
  & p {
    font-size: 1.4rem;
    color: var(--color-red-700);
  }
`;

const RecentTable = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
`;

const TableTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const TableHeader = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-grey-100);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.4px;

  @media (max-width: 600px) {
    grid-template-columns: 2fr 1fr 1fr;
    & span:nth-child(3) { display: none; }
  }
`;

const TableRow = styled.div`
  font-size: 1.4rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--color-grey-100);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  align-items: center;
  &:last-child { border-bottom: none; }

  @media (max-width: 600px) {
    grid-template-columns: 2fr 1fr 1fr;
    & span:nth-child(3) { display: none; }
  }
`;

const FechaBadge = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: var(--border-radius-tiny);
  padding: 0.2rem 0.8rem;
  background-color: var(--color-green-100);
  color: var(--color-green-700);
`;

function getFechaLabel(fecha) {
  const d = new Date(fecha + "T00:00:00");
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  return format(d, "dd/MM/yyyy");
}

function formatSoles(n) {
  return `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
}

function Dashboard() {
  const today = format(new Date(), "PPPP", { locale: es });

  const { totalHoy, isLoading: loadingHoy } = useVentasHoy();
  const { totalSemana, isLoading: loadingSemana } = useVentasSemana();
  const { stockKg, isLoading: loadingStock } = useStockActual();
  const { clientes, isLoading: loadingClientes } = useClientes();
  const { ventasRecientes, isLoading: loadingRecientes } = useVentasRecientes();
  const { configuracion, isLoading: loadingConfig } = useConfiguracion();

  const isLoading = loadingHoy || loadingSemana || loadingStock || loadingClientes || loadingConfig;

  const stockMinimo = configuracion?.stock_minimo_kg ?? 1000;
  const stockBajo = stockKg < stockMinimo;

  if (isLoading) return <Spinner />;

  return (
    <>
      <div>
        <Heading as="h1">Dashboard</Heading>
        <p style={{ fontSize: "1.4rem", color: "var(--color-grey-500)", marginTop: "0.4rem" }}>
          {today}
        </p>
      </div>

      <StatsRow>
        <Stat>
          <Icon color="blue"><HiOutlineShoppingCart /></Icon>
          <Title>Ventas del dia</Title>
          <Value>{formatSoles(totalHoy)}</Value>
        </Stat>
        <Stat>
          <Icon color={stockBajo ? "red" : "green"}><HiOutlineScale /></Icon>
          <Title>Stock actual</Title>
          <Value style={{ color: stockBajo ? "var(--color-red-700)" : "inherit" }}>
            {Number(stockKg).toLocaleString("es-PE")} kg
          </Value>
        </Stat>
        <Stat>
          <Icon color="indigo"><HiOutlineUsers /></Icon>
          <Title>Clientes activos</Title>
          <Value>{clientes.length}</Value>
        </Stat>
        <Stat>
          <Icon color="yellow"><HiOutlineTrendingUp /></Icon>
          <Title>Ventas esta semana</Title>
          <Value>{formatSoles(totalSemana)}</Value>
        </Stat>
      </StatsRow>

      {stockBajo && (
        <AlertBox>
          <HiOutlineExclamationCircle />
          <div>
            <h4>Alerta de stock</h4>
            <p>
              El stock actual ({Number(stockKg).toLocaleString("es-PE")} kg) esta por debajo del minimo
              configurado ({Number(stockMinimo).toLocaleString("es-PE")} kg).
            </p>
          </div>
        </AlertBox>
      )}

      <RecentTable>
        <TableTitle>Ventas recientes</TableTitle>
        {loadingRecientes ? (
          <Spinner />
        ) : ventasRecientes.length === 0 ? (
          <p style={{ fontSize: "1.4rem", color: "var(--color-grey-500)" }}>
            No hay ventas registradas aun.
          </p>
        ) : (
          <>
            <TableHeader>
              <span>Cliente</span>
              <span>Peso</span>
              <span>Monto</span>
              <span>Fecha</span>
            </TableHeader>
            {ventasRecientes.map((v) => (
              <TableRow key={v.id}>
                <span>{v.clientes?.nombre ?? "—"}</span>
                <span>{Number(v.total_kg).toLocaleString("es-PE")} kg</span>
                <span>{formatSoles(v.monto_total)}</span>
                <FechaBadge>{getFechaLabel(v.fecha)}</FechaBadge>
              </TableRow>
            ))}
          </>
        )}
      </RecentTable>
    </>
  );
}

export default Dashboard;
