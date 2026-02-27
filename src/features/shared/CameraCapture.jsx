import { useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { HiCamera, HiArrowPath, HiCheckCircle } from "react-icons/hi2";
import Button from "../../ui/Button";

// ── Wrapper general ────────────────────────────────────────────────────────
const CameraWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
`;

// ── Contenedor relativo — video + botón superpuesto ────────────────────────
const VideoContainer = styled.div`
    position: relative;
    width: 100%;
    max-width: 380px;
`;

const VideoElement = styled.video`
    width: 100%;
    /* Altura reducida para que el botón sea visible sin scroll */
    max-height: 240px;
    object-fit: cover;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-brand-500);
    background: #000;
    display: block;
`;

/* Botón de captura flotando SOBRE el video, en la parte inferior */
const FloatingBtn = styled.button`
    position: absolute;
    bottom: 1.2rem;
    left: 50%;
    transform: translateX(-50%);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;

    background: var(--color-brand-600);
    color: white;
    border: 3px solid white;
    border-radius: 100px;
    padding: 1rem 2.4rem;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    white-space: nowrap;
    transition: background 0.2s;

    &:hover, &:active { background: var(--color-brand-700); }

    & svg { width: 2rem; height: 2rem; }
`;

const CancelBtn = styled.button`
    background: none;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    padding: 0.6rem 1.4rem;
    font-size: 1.3rem;
    color: var(--color-grey-600);
    cursor: pointer;
    margin-top: 0.2rem;
    &:hover { background: var(--color-grey-50); }
`;

// ── Preview de foto tomada ─────────────────────────────────────────────────
const PreviewImg = styled.img`
    width: 100%;
    max-width: 380px;
    max-height: 240px;
    object-fit: cover;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-green-700);
    display: block;
`;

const HiddenCanvas = styled.canvas`
    display: none;
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: ${(p) => (p.$ok ? "var(--color-green-700)" : "var(--color-grey-500)")};
    padding: 0.5rem 1.2rem;
    background: ${(p) => (p.$ok ? "var(--color-green-100)" : "var(--color-grey-100)")};
    border-radius: var(--border-radius-sm);
`;

const ErrorMsg = styled.p`
    font-size: 1.3rem;
    color: var(--color-red-700);
    background: var(--color-red-100);
    padding: 0.8rem 1.2rem;
    border-radius: var(--border-radius-sm);
    text-align: center;
    max-width: 380px;
`;

// ── Componente ─────────────────────────────────────────────────────────────
function CameraCapture({ onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [mode, setMode] = useState("idle");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [camError, setCamError] = useState(null);

    // FIX pantalla negra: asignar srcObject DESPUÉS del render de React
    useEffect(() => {
        if (mode === "streaming" && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }
    }, [mode]);

    // Limpiar stream al desmontar
    useEffect(() => {
        return () => {
            if (streamRef.current)
                streamRef.current.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const startCamera = useCallback(async () => {
        setCamError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            setMode("streaming");
        } catch {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                streamRef.current = stream;
                setMode("streaming");
            } catch (err) {
                setCamError(
                    err.name === "NotAllowedError"
                        ? "Permiso de cámara denegado. Actívalo en la configuración del navegador."
                        : `No se pudo acceder a la cámara: ${err.message}`
                );
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setMode("idle");
    }, []);

    const takePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !video.videoWidth) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setMode("preview");
            onCapture?.(blob);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
        }, "image/jpeg", 0.88);
    }, [onCapture]);

    const retake = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        onCapture?.(null);
        setMode("idle");
    }, [previewUrl, onCapture]);

    return (
        <CameraWrapper>
            <HiddenCanvas ref={canvasRef} />

            {/* ── Idle: botón de activar ── */}
            {mode === "idle" && (
                <>
                    <Button type="button" variation="secondary" size="large" onClick={startCamera}>
                        <HiCamera /> &nbsp; Activar Cámara
                    </Button>
                    {camError && <ErrorMsg>{camError}</ErrorMsg>}
                    <StatusBadge $ok={false}>Se requiere foto de la balanza</StatusBadge>
                </>
            )}

            {/* ── Streaming: video compacto + botón flotante sobre él ── */}
            {mode === "streaming" && (
                <>
                    <VideoContainer>
                        <VideoElement
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onLoadedMetadata={(e) => e.target.play().catch(() => { })}
                        />
                        {/* Botón de captura flotante: visible sin scroll */}
                        <FloatingBtn type="button" onClick={takePhoto}>
                            <HiCamera /> Tomar foto
                        </FloatingBtn>
                    </VideoContainer>
                    <CancelBtn type="button" onClick={stopCamera}>Cancelar</CancelBtn>
                </>
            )}

            {/* ── Preview ── */}
            {mode === "preview" && (
                <>
                    <PreviewImg src={previewUrl} alt="Foto de balanza capturada" />
                    <StatusBadge $ok>
                        <HiCheckCircle size={18} /> Foto capturada correctamente
                    </StatusBadge>
                    <Button type="button" variation="secondary" size="small" onClick={retake}>
                        <HiArrowPath /> &nbsp; Retomar foto
                    </Button>
                </>
            )}
        </CameraWrapper>
    );
}

export default CameraCapture;
