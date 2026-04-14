import * as fs from "fs";
import * as path from "path";
import { ChatOpenAI } from "@langchain/openai";
import ExcelJS from "exceljs";
import { z } from "zod";

/** Excel file for logging */
const EXCEL_LOG_FILE = "videos.xlsx";

/** Column definitions for the Excel log */
const COLUMNS: ExcelJS.Column[] = [
  { header: "idea", key: "idea", width: 30 },
  { header: "caption", key: "caption", width: 30 },
  { header: "environment", key: "environment", width: 30 },
  { header: "prompt", key: "prompt", width: 50 },
  { header: "status", key: "status", width: 15 },
  { header: "request_id", key: "request_id", width: 40 },
  { header: "video_url", key: "video_url", width: 50 },
  { header: "error", key: "error", width: 30 },
  { header: "created_at", key: "created_at", width: 20 },
] as ExcelJS.Column[];

export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export interface LlmOptions {
  model: string;
  systemPrompt: string;
  userMessage: string;
  responseFormat?: z.ZodType;
  temperature?: number;
}

/**
 * Invoke an LLM asynchronously via OpenRouter.
 * When responseFormat (a Zod schema) is provided, returns structured output.
 */
export async function ainvokeLlm<T = string>(
  options: LlmOptions
): Promise<T> {
  const { model, systemPrompt, userMessage, responseFormat, temperature = 0.1 } = options;

  let llm: ChatOpenAI = new ChatOpenAI({
    model,
    temperature,
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  if (responseFormat) {
    const structured = llm.withStructuredOutput(responseFormat);
    const response = await structured.invoke(messages);
    return response as T;
  }

  const response = await llm.invoke(messages);
  return response.content as T;
}

export interface LogEntry {
  idea?: string;
  caption?: string;
  environment?: string;
  prompt?: string;
  status?: string;
  request_id?: string;
  video_url?: string | null;
  error?: string;
  created_at?: string;
}

/**
 * Log video generation data to an Excel file.
 * If rowIndex is provided, updates an existing row instead of creating a new one.
 * Returns the row index (0-based data row) of the entry.
 */
export async function logToExcel(
  data: LogEntry,
  rowIndex?: number
): Promise<number> {
  const filePath = path.resolve(EXCEL_LOG_FILE);
  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
  }

  let worksheet = workbook.getWorksheet("Sheet1");
  if (!worksheet) {
    worksheet = workbook.addWorksheet("Sheet1");
    worksheet.columns = COLUMNS;
  }

  // rowIndex is 0-based data row; ExcelJS rows are 1-based with row 1 = header
  const dataRowCount = worksheet.rowCount - 1; // subtract header

  if (rowIndex !== undefined && rowIndex >= 0 && rowIndex < dataRowCount) {
    // Update existing row (ExcelJS row = rowIndex + 2 because row 1 is header)
    const excelRow = worksheet.getRow(rowIndex + 2);
    for (const [key, value] of Object.entries(data)) {
      const colIndex = COLUMNS.findIndex((c) => c.key === key);
      if (colIndex >= 0) {
        excelRow.getCell(colIndex + 1).value = value ?? null;
      }
    }
    excelRow.commit();
  } else {
    // Add new row
    const row: Record<string, unknown> = {};
    for (const col of COLUMNS) {
      row[col.key as string] = (data as Record<string, unknown>)[col.key as string] ?? null;
    }
    worksheet.addRow(row);
    rowIndex = worksheet.rowCount - 2; // 0-based data index
  }

  await workbook.xlsx.writeFile(filePath);
  return rowIndex;
}
