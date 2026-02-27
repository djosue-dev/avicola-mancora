import { useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { HiCamera, HiArrowPath, HiCheckCircle } from "react-icons/hi2";
import Button from "../../ui/Button";

const CameraWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    width: 100%;
`;

const VideoElement = styled.video`
    width: 100%;
    max-width: 420px;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-brand-500);
    background: #000;
    display: block;
`;

const PreviewImg = styled.img`
    width: 100%;
    max-width: 420px;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-green-700);
    object-fit: cover;
    display: block;
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

const ErrorMsg = styled.p`
    font-size: 1.3rem;
    color: var(--color-red-700);
    background: var(--color-red-100);
    padding: 0.8rem 1.2rem;
    border-radius: var(--border-radius-sm);
    text-align: center;
    max-width: 420px;
`;

/**
 * CameraCapture — captura foto con la cámara del dispositivo.
 *
 * FIX pantalla negra: se usa useEffect para asignar srcObject DESPUÉS de que
 * React haya montado el elemento <video> en el DOM, y se llama .play()
 * explícitamente en onLoadedMetadata para garantizar que el stream arranque.
 *
 * @param {Function} onCapture — recibe el Blob de la foto capturada
 */
function CameraCapture({ onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [mode, setMode] = useState("idle"); // "idle" | "streaming" | "preview"
    const [previewUrl, setPreviewUrl] = useState(null);
    const [camError, setCamError] = useState(null);

    // ── KEY FIX: asignar stream al video DESPUÉS de que React monte el <video> ──
    useEffect(() => {
        if (mode === "streaming" && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            // .play() asíncrono — ignoramos AbortError (usuario cancela rápido)
            videoRef.current.play().catch(() => { });
        }
    }, [mode]);

    // ── Limpiar stream al desmontar el componente ──────────────────────────
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const startCamera = useCallback(async () => {
        setCamError(null);
        try {
            // Intentar cámara trasera (Android/iOS), con fallback automático
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            setMode("streaming"); // el useEffect de arriba asignará srcObject
        } catch {
            try {
                // Fallback: cualquier cámara disponible
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
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
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setMode("idle");
    }, []);

    const takePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        // Verificar que el video ya tiene dimensiones reales
        if (!video.videoWidth || !video.videoHeight) {
            alert("La cámara aún no está lista, espera un momento.");
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                setMode("preview");
                onCapture?.(blob);
                // Liberar cámara tras capturar
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                }
            },
            "image/jpeg",
            0.88
        );
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

            {/* ── Botón inicial ── */}
            {mode === "idle" && (
                <>
                    <Button type="button" variation="secondary" size="large" onClick={startCamera}>
                        <HiCamera /> &nbsp; Activar Cámara
                    </Button>
                    {camError && <ErrorMsg>{camError}</ErrorMsg>}
                    <StatusBadge $ok={false}>Se requiere foto de la balanza</StatusBadge>
                </>
            )}

            {/* ── Vista de cámara en vivo ── */}
            {mode === "streaming" && (
                <>
                    <VideoElement
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onLoadedMetadata={(e) => e.target.play().catch(() => { })}
                    />
                    <ButtonRow>
                        <Button type="button" variation="primary" size="large" onClick={takePhoto}>
                            <HiCamera /> &nbsp; Tomar Foto
                        </Button>
                        <Button type="button" variation="secondary" onClick={stopCamera}>
                            Cancelar
                        </Button>
                    </ButtonRow>
                </>
            )}

            {/* ── Preview de foto tomada ── */}
            {mode === "preview" && (
                <>
                    <PreviewImg src={previewUrl} alt="Foto de balanza capturada" />
                    <StatusBadge $ok>
                        <HiCheckCircle size={20} /> Foto capturada correctamente
                    </StatusBadge>
                    <Button type="button" variation="secondary" onClick={retake}>
                        <HiArrowPath /> &nbsp; Retomar foto
                    </Button>
                </>
            )}
        </CameraWrapper>
    );
}

export default CameraCapture;
