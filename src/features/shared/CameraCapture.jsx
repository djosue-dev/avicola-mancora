import { useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { HiCamera, HiArrowPath, HiCheckCircle } from "react-icons/hi2";
import Button from "../../ui/Button";

const CameraWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
`;

const VideoElement = styled.video`
    width: 100%;
    max-width: 400px;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-brand-500);
    background: #000;
`;

const PreviewImg = styled.img`
    width: 100%;
    max-width: 400px;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-green-700);
    object-fit: cover;
`;

const HiddenCanvas = styled.canvas`
    display: none;
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.4rem;
    font-weight: 600;
    color: ${(p) => (p.$ok ? "var(--color-green-700)" : "var(--color-grey-500)")};
    padding: 0.6rem 1.2rem;
    background: ${(p) => (p.$ok ? "var(--color-green-100)" : "var(--color-grey-100)")};
    border-radius: var(--border-radius-sm);
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
`;

/**
 * Componente reutilizable para captura de foto con cámara del dispositivo.
 * Optimizado para uso en móviles Android/iOS.
 *
 * @param {Function} onCapture - Callback que recibe el Blob de la foto capturada
 */
function CameraCapture({ onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [mode, setMode] = useState("idle"); // "idle" | "streaming" | "preview"
    const [previewUrl, setPreviewUrl] = useState(null);

    const startCamera = useCallback(async () => {
        try {
            // Solicitar cámara trasera en móviles, cualquier cámara en desktop
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" }, // cámara trasera
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setMode("streaming");
        } catch (err) {
            // Fallback: si no hay cámara trasera, intentar con cualquier cámara
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setMode("streaming");
            } catch {
                alert("No se pudo acceder a la cámara. Por favor otorga los permisos necesarios.");
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const takePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                setMode("preview");
                onCapture?.(blob);   // pasamos el Blob al padre
                stopCamera();
            },
            "image/jpeg",
            0.85
        );
    }, [onCapture, stopCamera]);

    const retake = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        onCapture?.(null);
        setMode("idle");
    }, [previewUrl, onCapture]);

    return (
        <CameraWrapper>
            <HiddenCanvas ref={canvasRef} />

            {mode === "idle" && (
                <Button type="button" variation="secondary" size="large" onClick={startCamera}>
                    <HiCamera /> &nbsp; Activar Cámara
                </Button>
            )}

            {mode === "streaming" && (
                <>
                    <VideoElement ref={videoRef} autoPlay playsInline muted />
                    <ButtonRow>
                        <Button type="button" variation="primary" size="large" onClick={takePhoto}>
                            <HiCamera /> &nbsp; Tomar Foto
                        </Button>
                        <Button type="button" variation="secondary" onClick={stopCamera.bind(null)} >
                            Cancelar
                        </Button>
                    </ButtonRow>
                </>
            )}

            {mode === "preview" && (
                <>
                    <PreviewImg src={previewUrl} alt="Foto de balanza capturada" />
                    <StatusBadge $ok>
                        <HiCheckCircle size={20} /> Foto capturada
                    </StatusBadge>
                    <Button type="button" variation="secondary" onClick={retake}>
                        <HiArrowPath /> &nbsp; Retomar foto
                    </Button>
                </>
            )}

            {mode === "idle" && (
                <StatusBadge $ok={false}>Se requiere foto de la balanza</StatusBadge>
            )}
        </CameraWrapper>
    );
}

export default CameraCapture;
