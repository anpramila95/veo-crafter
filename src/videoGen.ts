import { fal } from "@fal-ai/client";

/** fal.ai model identifier, using VEO3 model */
const FALAI_MODEL = "fal-ai/veo3";

/** Arguments for VEO3 video generation */
interface Veo3Arguments {
  prompt: string;
  aspect_ratio: "16:9" | "9:16";
  duration: "4s" | "6s" | "8s";
  enhance_prompt: boolean;
  generate_audio: boolean;
}

interface VideoResult {
  status: string;
  video_url?: string;
  error?: string;
  logs?: string[];
}

/**
 * Submit the prompt to fal.ai's VEO3 model.
 * Returns a request ID for tracking the generation job.
 */
export async function startVideoGeneration(
  prompt: string
): Promise<string | null> {
  try {
    const arguments_: Veo3Arguments = {
      prompt,
      aspect_ratio: "16:9",
      duration: "8s",
      enhance_prompt: true,
      generate_audio: true,
    };

    const handler = await fal.queue.submit(FALAI_MODEL, {
      input: arguments_,
    });

    console.log(
      `Successfully submitted to FAL. Request ID: ${handler.request_id}`
    );
    return handler.request_id;
  } catch (error) {
    console.error(`Error submitting to FAL: ${String(error)}`);
    return null;
  }
}

/**
 * Check the status of a VEO3 video generation job.
 */
export async function getVideoStatus(
  requestId: string
): Promise<VideoResult> {
  try {
    const statusInfo = await fal.queue.status(FALAI_MODEL, {
      requestId,
      logs: true,
    });

    if (statusInfo.status === "COMPLETED") {
      return { status: "completed" };
    } else if (statusInfo.status === "IN_PROGRESS") {
      const logs: string[] = [];
      if ("logs" in statusInfo && Array.isArray(statusInfo.logs)) {
        for (const log of statusInfo.logs) {
          if (typeof log === "object" && log !== null && "message" in log) {
            logs.push(String((log as { message: string }).message));
          }
        }
      }
      return { status: "in_progress", logs };
    } else if (statusInfo.status === "IN_QUEUE") {
      return { status: "queued" };
    }

    return { status: "unknown" };
  } catch (error) {
    console.error(`Error checking FAL status: ${String(error)}`);
    return { error: String(error), status: "failed" };
  }
}

/**
 * Get the final result with the generated video URL.
 */
export async function getVideoResult(
  requestId: string
): Promise<VideoResult> {
  try {
    const result = await fal.queue.result(FALAI_MODEL, { requestId });
    const data = result.data as { video?: { url?: string } };

    return {
      status: "completed",
      video_url: data?.video?.url ?? undefined,
    };
  } catch (error) {
    console.error(`Error getting video result: ${String(error)}`);
    return { error: String(error), status: "failed" };
  }
}

/**
 * Wait for the VEO3 video generation to complete.
 */
export async function waitForV3Completion(
  requestId: string,
  timeoutMinutes: number = 10
): Promise<VideoResult> {
  console.log(
    `Waiting for FAL video generation to complete (timeout: ${timeoutMinutes} minutes)...`
  );

  const startTime = Date.now();
  const timeoutMs = timeoutMinutes * 60 * 1000;

  while (true) {
    const elapsed = Date.now() - startTime;
    if (elapsed > timeoutMs) {
      console.log(`Timeout reached after ${(elapsed / 1000).toFixed(1)} seconds`);
      return { error: "Timeout reached", status: "timeout" };
    }

    const result = await getVideoStatus(requestId);
    const status = result.status.toLowerCase();

    if (status === "completed") {
      return await getVideoResult(requestId);
    } else if (status === "failed") {
      console.error(`FAL video generation failed: ${result.error}`);
      return result;
    }

    // Wait 30 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
}
