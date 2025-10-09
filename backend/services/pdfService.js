import fs from "fs/promises";

export async function extractTextFromPDF(filePath) {
  try {
    const { pdf } = await import("pdf-parse");

    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "Unable to extract text from this PDF. You can still use the app, but some features may be limited.";
  }
}
