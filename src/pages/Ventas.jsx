import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Table from "../ui/Table";
import Modal from "../ui/Modal";
import Form from "../ui/Form";
import FormRow from "../ui/FormRow";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { HiOutlinePlusCircle, HiOutlineTrash } from "react-icons/hi2";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { useVentas, useCreateVenta, useDeleteVenta } from "../features/ventas/useVentas";
import { useClientes } from "../features/clientes/useClientes";

function FormVenta({ onCloseModal }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { fecha: format(new Date(), "yyyy-MM-dd") }
    });
    const { clientes } = useClientes();
    const { crear, isLoading } = useCreateVenta();

    function onSubmit(data) {
        crear(
            {
                cliente_id: data.cliente_id,
                fecha: data.fecha,
                total_kg: Number(data.total_kg),
                precio_por_kg: Number(data.precio_por_kg),
                observaciones: data.observaciones || null,
            },
            { onSuccess: () => onCloseModal() }
        );
    }

    return (
        <Form type="modal" onSubmit={handleSubmit(onSubmit)}>
            <Heading as="h2" style={{ marginBottom: "2rem" }}>Registrar nueva venta</Heading>

            <FormRow label="Cliente" error={errors?.cliente_id?.message}>
                <select
                    id="cliente_id"
                    {...register("cliente_id", { required: "Seleccione un cliente" })}
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
                    <option value="">Seleccione un cliente...</option>
                    {clientes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
            </FormRow>

            <FormRow label="Fecha" error={errors?.fecha?.message}>
                <Input
                    type="date"
                    id="fecha"
                    {...register("fecha", { required: "La fecha es requerida" })}
                />
            </FormRow>

            <FormRow label="Peso total (kg)" error={errors?.total_kg?.message}>
                <Input
                    type="number"
                    id="total_kg"
                    step="0.01"
                    placeholder="0.00"
                    {...register("total_kg", { required: "El peso es requerido", min: { value: 0.01, message: "Mayor a 0" } })}
                />
            </FormRow>

            <FormRow label="Precio por kg (S/)" error={errors?.precio_por_kg?.message}>
                <Input
                    type="number"
                    id="precio_por_kg"
                    step="0.01"
                    placeholder="0.00"
                    {...register("precio_por_kg", { required: "El precio es requerido", min: { value: 0.01, message: "Mayor a 0" } })}
                />
            </FormRow>

            <FormRow label="Observaciones">
                <Input type="text" id="observaciones" placeholder="Opcional..." {...register("observaciones")} />
            </FormRow>

            <FormRow>
                <Button variation="secondary" type="button" onClick={onCloseModal} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar venta"}
                </Button>
            </FormRow>
        </Form>
    );
}

function Ventas() {
    const { ventas, isLoading } = useVentas();
    const { eliminar } = useDeleteVenta();

    if (isLoading) return <Spinner />;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Heading as="h1">Ventas</Heading>
                <Modal>
                    <Modal.Open opens="nueva-venta">
                        <Button>
                            <HiOutlinePlusCircle style={{ marginRight: "0.8rem", display: "inline" }} />
                            Nueva venta
                        </Button>
                    </Modal.Open>
                    <Modal.Window name="nueva-venta">
                        <FormVenta />
                    </Modal.Window>
                </Modal>
            </div>

            <Table columns="0.5fr 2fr 1.5fr 1fr 1fr 1fr 0.5fr">
                <Table.Header>
                    <div>#</div>
                    <div>Cliente</div>
                    <div>Fecha</div>
                    <div>Peso (kg)</div>
                    <div>Precio/kg</div>
                    <div>Monto total</div>
                    <div></div>
                </Table.Header>
                <Table.Body
                    data={ventas}
                    render={(venta, idx) => (
                        <Table.Row key={venta.id}>
                            <span>{idx + 1}</span>
                            <span>{venta.clientes?.nombre ?? "—"}</span>
                            <span>{format(new Date(venta.fecha + "T00:00:00"), "dd/MM/yyyy", { locale: es })}</span>
                            <span>{Number(venta.total_kg).toLocaleString("es-PE")} kg</span>
                            <span>S/ {Number(venta.precio_por_kg).toFixed(2)}</span>
                            <span>S/ {Number(venta.monto_total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                            <Button size="small" variation="danger" onClick={() => eliminar(venta.id)}>
                                <HiOutlineTrash />
                            </Button>
                        </Table.Row>
                    )}
                />
            </Table>
        </>
    );
}

export default Ventas;
