import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "adidas-sales.csv");

    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
      return NextResponse.json(
        {
          error: "CSV file not found",
          checkedPath: filePath,
        },
        { status: 404 },
      );
    }

    const stats = fs.statSync(filePath);

    const fileContent = fs.readFileSync(filePath, "utf8");
    const preview = fileContent.substring(0, 500);

    return NextResponse.json({
      success: true,
      fileExists,
      filePath,
      fileSize: stats.size,
      preview,
      headers: fileContent.split("\n")[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error accessing CSV file",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
