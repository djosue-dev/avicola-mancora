import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Table from "../ui/Table";
import Modal from "../ui/Modal";
import Form from "../ui/Form";
import FormRow from "../ui/FormRow";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { useForm } from "react-hook-form";
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from "../features/clientes/useClientes";

function FormCliente({ onCloseModal, clienteEditar = null }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: clienteEditar ?? {}
    });
    const { crear, isLoading: loadingCrear } = useCreateCliente();
    const { actualizar, isLoading: loadingActualizar } = useUpdateCliente();
    const isLoading = loadingCrear || loadingActualizar;

    function onSubmit(data) {
        if (clienteEditar) {
            actualizar(
                { id: clienteEditar.id, updates: data },
                { onSuccess: () => onCloseModal() }
            );
        } else {
            crear(data, { onSuccess: () => onCloseModal() });
        }
    }

    return (
        <Form type="modal" onSubmit={handleSubmit(onSubmit)}>
            <Heading as="h2" style={{ marginBottom: "2rem" }}>
                {clienteEditar ? "Editar cliente" : "Registrar cliente"}
            </Heading>

            <FormRow label="Nombre completo" error={errors?.nombre?.message}>
                <Input
                    type="text"
                    id="nombre"
                    placeholder="Nombre del cliente o empresa"
                    {...register("nombre", { required: "El nombre es requerido" })}
                />
            </FormRow>

            <FormRow label="Telefono">
                <Input type="tel" id="telefono" placeholder="Ej: 987 654 321" {...register("telefono")} />
            </FormRow>

            <FormRow label="Direccion">
                <Input type="text" id="direccion" placeholder="Direccion del cliente" {...register("direccion")} />
            </FormRow>

            <FormRow label="RUC / DNI (opcional)">
                <Input type="text" id="ruc" placeholder="RUC o DNI" {...register("ruc")} />
            </FormRow>

            <FormRow>
                <Button variation="secondary" type="button" onClick={onCloseModal} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : (clienteEditar ? "Actualizar" : "Guardar cliente")}
                </Button>
            </FormRow>
        </Form>
    );
}

function Clientes() {
    const { clientes, isLoading } = useClientes();
    const { eliminar } = useDeleteCliente();

    if (isLoading) return <Spinner />;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Heading as="h1">Clientes</Heading>
                <Modal>
                    <Modal.Open opens="nuevo-cliente">
                        <Button>
                            <HiOutlinePlusCircle style={{ marginRight: "0.8rem", display: "inline" }} />
                            Nuevo cliente
                        </Button>
                    </Modal.Open>
                    <Modal.Window name="nuevo-cliente">
                        <FormCliente />
                    </Modal.Window>
                </Modal>
            </div>

            <Table columns="0.5fr 2fr 1.5fr 2fr 1.5fr 1fr">
                <Table.Header>
                    <div>#</div>
                    <div>Nombre</div>
                    <div>Telefono</div>
                    <div>Direccion</div>
                    <div>RUC / DNI</div>
                    <div>Acciones</div>
                </Table.Header>
                <Table.Body
                    data={clientes}
                    render={(c, idx) => (
                        <Table.Row key={c.id}>
                            <span>{idx + 1}</span>
                            <span>{c.nombre}</span>
                            <span>{c.telefono || "—"}</span>
                            <span>{c.direccion || "—"}</span>
                            <span>{c.ruc || "—"}</span>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                <Modal>
                                    <Modal.Open opens={`editar-${c.id}`}>
                                        <Button size="small" variation="secondary">
                                            <HiOutlinePencilSquare />
                                        </Button>
                                    </Modal.Open>
                                    <Modal.Window name={`editar-${c.id}`}>
                                        <FormCliente clienteEditar={c} />
                                    </Modal.Window>
                                </Modal>
                                <Button size="small" variation="danger" onClick={() => eliminar(c.id)}>
                                    <HiOutlineTrash />
                                </Button>
                            </div>
                        </Table.Row>
                    )}
                />
            </Table>
        </>
    );
}

export default Clientes;
