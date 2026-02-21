import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Table from "../ui/Table";
import Modal from "../ui/Modal";
import Form from "../ui/Form";
import FormRow from "../ui/FormRow";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { HiOutlinePlusCircle, HiOutlineExclamationCircle, HiOutlineTrash } from "react-icons/hi2";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { usePesosLotes, useStockActual, useCreatePesoLote, useDeletePesoLote } from "../features/pesos/usePesos";
import { useConfiguracion } from "../features/configuracion/useConfiguracion";

const tipoBadgeStyle = (tipo) => ({
    fontSize: "1.1rem",
    fontWeight: 600,
    textTransform: "uppercase",
    padding: "0.2rem 0.8rem",
    borderRadius: "var(--border-radius-tiny)",
    backgroundColor: tipo === "entrada" ? "var(--color-green-100)" : tipo === "salida" ? "var(--color-red-100)" : "var(--color-yellow-100)",
    color: tipo === "entrada" ? "var(--color-green-700)" : tipo === "salida" ? "var(--color-red-700)" : "var(--color-yellow-700)",
});

function FormPeso({ onCloseModal }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { fecha: format(new Date(), "yyyy-MM-dd"), tipo: "entrada" }
    });
    const { crear, isLoading } = useCreatePesoLote();

    function onSubmit(data) {
        crear(
            {
                fecha: data.fecha,
                descripcion: data.descripcion,
                tipo: data.tipo,
                cantidad_pollos: Number(data.cantidad_pollos),
                peso_promedio_kg: Number(data.peso_promedio_kg),
            },
            { onSuccess: () => onCloseModal() }
        );
    }

    return (
        <Form type="modal" onSubmit={handleSubmit(onSubmit)}>
            <Heading as="h2" style={{ marginBottom: "2rem" }}>Registrar movimiento de peso</Heading>

            <FormRow label="Tipo de movimiento">
                <select
                    id="tipo"
                    {...register("tipo")}
                    style={{
                        border: "1px solid var(--color-grey-300)",
                        backgroundColor: "var(--color-grey-0)",
                        borderRadius: "var(--border-radius-sm)",
                        boxShadow: "var(--shadow-sm)",
                        padding: "0.8rem 1.2rem",
                        fontSize: "1.4rem",
                        width: "100%",
                    }}
                >
                    <option value="entrada">Entrada de pollos</option>
                    <option value="salida">Salida / Venta</option>
                    <option value="ajuste">Ajuste de inventario</option>
                </select>
            </FormRow>

            <FormRow label="Fecha" error={errors?.fecha?.message}>
                <Input type="date" id="fecha" {...register("fecha", { required: "Requerido" })} />
            </FormRow>

            <FormRow label="Descripcion" error={errors?.descripcion?.message}>
                <Input
                    type="text"
                    id="descripcion"
                    placeholder="Ej: Lote #5 granja norte"
                    {...register("descripcion", { required: "Requerido" })}
                />
            </FormRow>

            <FormRow label="Cantidad de pollos" error={errors?.cantidad_pollos?.message}>
                <Input
                    type="number"
                    id="cantidad_pollos"
                    placeholder="0"
                    {...register("cantidad_pollos", { required: "Requerido", min: { value: 1, message: "Minimo 1" } })}
                />
            </FormRow>

            <FormRow label="Peso promedio por pollo (kg)" error={errors?.peso_promedio_kg?.message}>
                <Input
                    type="number"
                    id="peso_promedio_kg"
                    step="0.001"
                    placeholder="0.000"
                    {...register("peso_promedio_kg", { required: "Requerido", min: { value: 0.001, message: "Mayor a 0" } })}
                />
            </FormRow>

            <FormRow>
                <Button variation="secondary" type="button" onClick={onCloseModal} disabled={isLoading}>Cancelar</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar"}
                </Button>
            </FormRow>
        </Form>
    );
}

function Pesos() {
    const { lotes, isLoading: loadingLotes } = usePesosLotes();
    const { stockKg, isLoading: loadingStock } = useStockActual();
    const { configuracion, isLoading: loadingConfig } = useConfiguracion();
    const { eliminar } = useDeletePesoLote();

    const isLoading = loadingLotes || loadingStock || loadingConfig;
    if (isLoading) return <Spinner />;

    const stockMinimo = configuracion?.stock_minimo_kg ?? 1000;
    const stockBajo = stockKg < stockMinimo;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Heading as="h1">Pesos y Stock</Heading>
                <Modal>
                    <Modal.Open opens="nuevo-peso">
                        <Button>
                            <HiOutlinePlusCircle style={{ marginRight: "0.8rem", display: "inline" }} />
                            Registrar movimiento
                        </Button>
                    </Modal.Open>
                    <Modal.Window name="nuevo-peso">
                        <FormPeso />
                    </Modal.Window>
                </Modal>
            </div>

            <div style={{
                display: "grid",
                gap: "2.4rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
            }}>
                {[
                    { label: "Stock actual", value: `${Number(stockKg).toLocaleString("es-PE")} kg`, color: stockBajo ? "red" : "green" },
                    { label: "Stock minimo configurado", value: `${Number(stockMinimo).toLocaleString("es-PE")} kg`, color: "indigo" },
                    { label: "Estado", value: stockBajo ? "Stock bajo" : "Stock normal", color: stockBajo ? "red" : "green" },
                ].map((item) => (
                    <div key={item.label} style={{
                        backgroundColor: "var(--color-grey-0)",
                        border: "1px solid var(--color-grey-100)",
                        borderRadius: "var(--border-radius-md)",
                        padding: "2.4rem",
                    }}>
                        <p style={{ fontSize: "1.2rem", textTransform: "uppercase", color: "var(--color-grey-500)", fontWeight: 600, letterSpacing: "0.4px" }}>
                            {item.label}
                        </p>
                        <p style={{ fontSize: "2.4rem", fontWeight: 600, marginTop: "0.8rem", color: `var(--color-${item.color}-700)` }}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>

            {stockBajo && (
                <div style={{
                    backgroundColor: "var(--color-red-100)",
                    border: "1px solid var(--color-red-700)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "2rem 2.4rem",
                    display: "flex",
                    gap: "1.2rem",
                    alignItems: "flex-start",
                }}>
                    <HiOutlineExclamationCircle style={{ width: "2.4rem", height: "2.4rem", color: "var(--color-red-700)", flexShrink: 0 }} />
                    <div>
                        <h4 style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--color-red-700)", marginBottom: "0.4rem" }}>
                            Alerta de stock critico
                        </h4>
                        <p style={{ fontSize: "1.4rem", color: "var(--color-red-700)" }}>
                            El stock actual ({Number(stockKg).toLocaleString("es-PE")} kg) esta por debajo del minimo ({Number(stockMinimo).toLocaleString("es-PE")} kg).
                        </p>
                    </div>
                </div>
            )}

            <Table columns="2fr 2fr 1fr 1fr 1fr 1fr 0.5fr">
                <Table.Header>
                    <div>Fecha</div>
                    <div>Descripcion</div>
                    <div>Tipo</div>
                    <div>Pollos</div>
                    <div>Peso prom.</div>
                    <div>Peso total</div>
                    <div></div>
                </Table.Header>
                <Table.Body
                    data={lotes}
                    render={(p) => (
                        <Table.Row key={p.id}>
                            <span>{format(new Date(p.fecha + "T00:00:00"), "dd/MM/yyyy", { locale: es })}</span>
                            <span>{p.descripcion}</span>
                            <span style={tipoBadgeStyle(p.tipo)}>{p.tipo}</span>
                            <span>{Number(p.cantidad_pollos).toLocaleString("es-PE")}</span>
                            <span>{Number(p.peso_promedio_kg).toFixed(3)} kg</span>
                            <span>{Number(p.peso_total_kg).toLocaleString("es-PE")} kg</span>
                            <Button size="small" variation="danger" onClick={() => eliminar(p.id)}>
                                <HiOutlineTrash />
                            </Button>
                        </Table.Row>
                    )}
                />
            </Table>
        </>
    );
}

export default Pesos;
