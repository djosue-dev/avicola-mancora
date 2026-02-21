import Heading from "../ui/Heading";
import Form from "../ui/Form";
import FormRow from "../ui/FormRow";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { useForm } from "react-hook-form";
import { useConfiguracion, useUpdateConfiguracion } from "../features/configuracion/useConfiguracion";
import { useEffect } from "react";

function Configuracion() {
    const { configuracion, isLoading } = useConfiguracion();
    const { actualizar, isLoading: isSaving } = useUpdateConfiguracion();

    const { register, handleSubmit, reset } = useForm();

    // Cargar los valores actuales cuando llegan de Supabase
    useEffect(() => {
        if (configuracion) reset(configuracion);
    }, [configuracion, reset]);

    function onSubmit(data) {
        actualizar({
            stock_minimo_kg: Number(data.stock_minimo_kg),
            precio_base_kg: Number(data.precio_base_kg),
            nombre_negocio: data.nombre_negocio,
            ruc_negocio: data.ruc_negocio || null,
        });
    }

    if (isLoading) return <Spinner />;

    return (
        <>
            <Heading as="h1">Configuracion</Heading>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormRow label="Nombre del negocio">
                    <Input type="text" id="nombre_negocio" {...register("nombre_negocio")} />
                </FormRow>
                <FormRow label="RUC del negocio">
                    <Input type="text" id="ruc_negocio" placeholder="20XXXXXXXXX" {...register("ruc_negocio")} />
                </FormRow>
                <FormRow label="Stock minimo (kg)">
                    <Input type="number" id="stock_minimo_kg" step="0.01" {...register("stock_minimo_kg")} />
                </FormRow>
                <FormRow label="Precio base por kg (S/)">
                    <Input type="number" id="precio_base_kg" step="0.01" {...register("precio_base_kg")} />
                </FormRow>
                <FormRow>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar configuracion"}
                    </Button>
                </FormRow>
            </Form>
        </>
    );
}

export default Configuracion;
