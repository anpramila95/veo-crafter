import "dotenv/config";
import { z } from "zod";
import { startVideoGeneration, waitForV3Completion } from "./videoGen";
import { logToExcel, ainvokeLlm, getCurrentDate, LogEntry } from "./utils";
import {
  GENERATE_IDEAS_PROMPT,
  GENERATE_VIDEO_SCRIPT_PROMPT,
} from "./prompts";

// Zod schemas for structured LLM output
const IdeaItemSchema = z.object({
  Caption: z.string(),
  Idea: z.string(),
  Environment: z.string(),
});

const IdeasListSchema = z.object({
  ideas: z.array(IdeaItemSchema),
});

type IdeaItem = z.infer<typeof IdeaItemSchema>;

async function generateVideoIdeas(
  topic: string,
  count: number = 1
): Promise<IdeaItem[]> {
  console.log(`Generating ideas for topic: '${topic}'...`);
  const userMessage = `Generate ${count} creative video ideas about: ${topic}`;

  const result = await ainvokeLlm<z.infer<typeof IdeasListSchema>>({
    model: "gpt-4.1-mini",
    systemPrompt: GENERATE_IDEAS_PROMPT,
    userMessage,
    responseFormat: IdeasListSchema,
    temperature: 0.7,
  });

  return result.ideas;
}

async function generateVeo3VideoPrompt(
  idea: string,
  environment: string
): Promise<string> {
  console.log(`Creating video prompt for idea: '${idea}'...`);

  const userMessage = `
    Create a V3 prompt for this idea: ${idea}
    Environment context: ${environment}
  `;

  const result = await ainvokeLlm<string>({
    model: "gpt-4.1-mini",
    systemPrompt: GENERATE_VIDEO_SCRIPT_PROMPT,
    userMessage,
    temperature: 0.7,
  });

  return result;
}

async function runWorkflow(
  topic: string,
  count: number = 1
): Promise<void> {
  try {
    // Step 1: Generate idea
    const ideas = await generateVideoIdeas(topic, count);
    console.log(`Generated ideas:\n\n${JSON.stringify(ideas, null, 2)}`);

    // Process each idea sequentially
    for (const idea of ideas) {
      const logEntry: LogEntry = {
        idea: idea.Idea,
        caption: idea.Caption,
        environment: idea.Environment,
        prompt: "",
        status: "in_progress",
        created_at: getCurrentDate(),
        video_url: null,
      };

      // Step 2: Generate V3 prompt
      const prompt = await generateVeo3VideoPrompt(idea.Idea, idea.Environment);
      logEntry.prompt = prompt;

      // Log the initial entry and get the row index
      let rowIndex = await logToExcel(logEntry);
      console.log(`Log entry created with index: ${rowIndex}`);

      // Step 3: Submit to fal.ai
      const requestId = await startVideoGeneration(prompt);

      if (!requestId) {
        logEntry.status = "failed";
        logEntry.error = "Failed to get request ID";
        await logToExcel(logEntry, rowIndex);
        return;
      }

      logEntry.request_id = requestId;
      await logToExcel(logEntry, rowIndex);

      // Step 4: Wait for completion
      const result = await waitForV3Completion(requestId);

      // Step 5: Update status and log results
      if (result.error) {
        logEntry.status = "failed";
        logEntry.error = result.error;
      } else {
        logEntry.status = "completed";
        logEntry.video_url = result.video_url ?? null;
        console.log(`Video URL: ${result.video_url}`);
      }

      // Step 6: Update the Excel log with final results
      await logToExcel(logEntry, rowIndex);
    }
  } catch (error) {
    console.error(`Error in workflow: ${String(error)}`);
  }
}

async function main(): Promise<void> {
  // Check environment variables
  if (!process.env.FAL_KEY) {
    console.warn("Warning: FAL_KEY environment variable not set");
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("Warning: OPENROUTER_API_KEY environment variable not set");
  }

  // You can configure this to run on a schedule
  const topic = "Alien comedian roasting humans for trusting AI";
  const count = 1;

  await runWorkflow(topic, count);
}

main();
