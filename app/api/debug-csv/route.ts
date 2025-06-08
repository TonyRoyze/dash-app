import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Try to read the CSV file from the public directory
    const filePath = path.join(process.cwd(), "public", "adidas-sales.csv")

    // Check if file exists
    const fileExists = fs.existsSync(filePath)

    if (!fileExists) {
      return NextResponse.json(
        {
          error: "CSV file not found",
          checkedPath: filePath,
        },
        { status: 404 },
      )
    }

    // Get file stats
    const stats = fs.statSync(filePath)

    // Read first 500 characters of the file
    const fileContent = fs.readFileSync(filePath, "utf8")
    const preview = fileContent.substring(0, 500)

    return NextResponse.json({
      success: true,
      fileExists,
      filePath,
      fileSize: stats.size,
      preview,
      headers: fileContent.split("\n")[0],
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error accessing CSV file",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
