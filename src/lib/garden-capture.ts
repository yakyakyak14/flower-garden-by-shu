import { supabase } from "@/integrations/supabase/client";

export const captureGardenScreenshot = async (
  canvasElement: HTMLDivElement,
  userId: string,
  flowerType: string,
  flowerCount: number,
  sessionId?: string
): Promise<string | null> => {
  try {
    // Use html2canvas-like approach with canvas API
    const canvas = document.createElement("canvas");
    const rect = canvasElement.getBoundingClientRect();
    const scale = 2; // Retina
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, "rgba(200, 230, 200, 0.3)");
    gradient.addColorStop(1, "rgba(180, 220, 180, 0.5)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grass
    const grassGrad = ctx.createLinearGradient(0, rect.height * 0.7, 0, rect.height);
    grassGrad.addColorStop(0, "transparent");
    grassGrad.addColorStop(1, "rgba(76, 153, 76, 0.2)");
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, rect.height * 0.7, rect.width, rect.height * 0.3);

    // Draw each flower as a simple representation
    const flowers = canvasElement.querySelectorAll("[data-flower]");
    flowers.forEach((el) => {
      const flowerRect = el.getBoundingClientRect();
      const x = flowerRect.left - rect.left + flowerRect.width / 2;
      const y = flowerRect.top - rect.top + flowerRect.height / 2;
      const size = Math.max(flowerRect.width, flowerRect.height) / 2;

      // Draw a simple flower shape
      const petalCount = 5;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * 2 * Math.PI) / petalCount;
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
        ctx.fillStyle = `hsl(${330 + Math.random() * 40}, 70%, 70%)`;
        ctx.fill();
      }
      // Center
      ctx.beginPath();
      ctx.arc(x, y, size * 0.15, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffd700";
      ctx.fill();
    });

    // Add watermark
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("🌸 The Flower Garden", rect.width - 10, rect.height - 10);

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 0.9)
    );
    if (!blob) return null;

    // Upload
    const fileName = `${userId}/${Date.now()}-garden.png`;
    const { error: uploadError } = await supabase.storage
      .from("garden-screenshots")
      .upload(fileName, blob, { contentType: "image/png" });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // Save to gallery table
    await supabase.from("garden_gallery").insert({
      user_id: userId,
      session_id: sessionId || null,
      flower_type: flowerType,
      flower_count: flowerCount,
      screenshot_path: fileName,
    } as any);

    return fileName;
  } catch (err) {
    console.error("Screenshot capture error:", err);
    return null;
  }
};

export const getScreenshotUrl = (path: string): string => {
  const { data } = supabase.storage.from("garden-screenshots").getPublicUrl(path);
  return data.publicUrl;
};
