/**
 * Captures periodic snapshots of the garden canvas and generates
 * a 7-second timelapse video using Canvas + MediaRecorder.
 */

export interface GardenRecorder {
  captureFrame: () => void;
  stop: () => void;
  generateTimelapse: () => Promise<Blob | null>;
  getFrames: () => string[];
}

export function createGardenRecorder(
  sourceElement: HTMLDivElement,
  durationSeconds = 7
): GardenRecorder {
  const frames: string[] = [];
  let stopped = false;

  const captureFrame = () => {
    if (stopped) return;
    try {
      const canvas = document.createElement("canvas");
      const rect = sourceElement.getBoundingClientRect();
      const scale = 1;
      canvas.width = Math.min(rect.width * scale, 960);
      canvas.height = Math.min(rect.height * scale, 540);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "hsl(140, 30%, 90%)");
      gradient.addColorStop(1, "hsl(140, 25%, 85%)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grass
      const grassGrad = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      grassGrad.addColorStop(0, "transparent");
      grassGrad.addColorStop(1, "hsl(120, 30%, 40%)");
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
      ctx.globalAlpha = 1;

      // Draw flowers from DOM
      const flowerEls = sourceElement.querySelectorAll("[data-flower]");
      flowerEls.forEach((el) => {
        const flowerRect = el.getBoundingClientRect();
        const x = (flowerRect.left - rect.left + flowerRect.width / 2) * scaleX;
        const y = (flowerRect.top - rect.top + flowerRect.height / 2) * scaleY;
        const size = Math.max(flowerRect.width, flowerRect.height) * scaleX / 2;

        // Draw petals
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5;
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(angle) * size * 0.3,
            y + Math.sin(angle) * size * 0.3,
            size * 0.35,
            size * 0.2,
            angle,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = `hsl(${330 + (i * 8)}, 70%, 70%)`;
          ctx.fill();
        }
        // Center
        ctx.beginPath();
        ctx.arc(x, y, size * 0.15, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffd700";
        ctx.fill();
      });

      frames.push(canvas.toDataURL("image/jpeg", 0.7));
    } catch (err) {
      console.error("Frame capture error:", err);
    }
  };

  const stop = () => {
    stopped = true;
  };

  const generateTimelapse = async (): Promise<Blob | null> => {
    if (frames.length === 0) return null;

    return new Promise((resolve) => {
      const playbackCanvas = document.createElement("canvas");
      // Use dimensions from first frame
      const img = new Image();
      img.onload = () => {
        playbackCanvas.width = img.width;
        playbackCanvas.height = img.height;

        const ctx = playbackCanvas.getContext("2d");
        if (!ctx) { resolve(null); return; }

        const stream = playbackCanvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: getSupportedMimeType(),
          videoBitsPerSecond: 2_000_000,
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const mimeType = getSupportedMimeType();
          resolve(new Blob(chunks, { type: mimeType }));
        };

        mediaRecorder.start();

        const totalFrames = frames.length;
        const fps = 30;
        const totalOutputFrames = durationSeconds * fps;
        let outputFrame = 0;

        const drawNextFrame = () => {
          if (outputFrame >= totalOutputFrames) {
            mediaRecorder.stop();
            return;
          }

          const sourceIndex = Math.min(
            Math.floor((outputFrame / totalOutputFrames) * totalFrames),
            totalFrames - 1
          );

          const frameImg = new Image();
          frameImg.onload = () => {
            ctx.clearRect(0, 0, playbackCanvas.width, playbackCanvas.height);
            ctx.drawImage(frameImg, 0, 0);
            outputFrame++;
            // ~30fps timing
            setTimeout(drawNextFrame, 1000 / fps);
          };
          frameImg.onerror = () => {
            outputFrame++;
            setTimeout(drawNextFrame, 1000 / fps);
          };
          frameImg.src = frames[sourceIndex];
        };

        drawNextFrame();
      };
      img.onerror = () => resolve(null);
      img.src = frames[0];
    });
  };

  return { captureFrame, stop, getFrames: () => frames, generateTimelapse };
}

function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "video/webm";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
