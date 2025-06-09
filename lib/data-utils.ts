export interface SalesRecord {
  Retailer: string;
  "Retailer ID": number;
  "Invoice Date": string;
  Region: string;
  State: string;
  City: string;
  Product: string;
  "Price per Unit": number;
  "Units Sold": number;
  "Total Sales": number;
  "Operating Profit": number;
  "Operating Margin": number;
  "Sales Method": string;
}

export function parseCSV(csvText: string): SalesRecord[] {
  try {
    // Log the first few lines to help with debugging
    console.log(
      "CSV first few lines:",
      csvText.split("\n").slice(0, 3).join("\n"),
    );

    const lines = csvText.split("\n");
    if (lines.length <= 1) {
      console.error("CSV has too few lines:", lines.length);
      return [];
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    console.log("CSV headers:", headers);

    // Check if we have the expected headers
    const requiredHeaders = [
      "Retailer",
      "Retailer ID",
      "Invoice Date",
      "Region",
      "State",
      "City",
      "Product",
      "Price per Unit",
      "Units Sold",
      "Total Sales",
      "Operating Profit",
      "Operating Margin",
      "Sales Method",
    ];

    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      console.error("Missing required headers:", missingHeaders);
    }

    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line, index) => {
        try {
          // Handle quoted values properly
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = "";

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = "";
            } else {
              currentValue += char;
            }
          }

          // Add the last value
          values.push(currentValue.trim());

          // If simple splitting didn't work, fall back to it
          if (values.length !== headers.length) {
            console.warn(
              `Line ${index + 2} has ${values.length} values but expected ${headers.length}, falling back to simple split`,
            );
            const simpleValues = line
              .split(",")
              .map((v) => v.trim().replace(/"/g, ""));

            if (simpleValues.length === headers.length) {
              values.length = 0;
              values.push(...simpleValues);
            }
          }

          const record: any = {};

          headers.forEach((header, index) => {
            const value = values[index] || "";

            // Parse numeric fields
            if (
              [
                "Retailer ID",
                "Price per Unit",
                "Units Sold",
                "Total Sales",
                "Operating Profit",
                "Operating Margin",
              ].includes(header)
            ) {
              record[header] = Number.parseFloat(value) || 0;
            } else {
              record[header] = value;
            }
          });

          return record as SalesRecord;
        } catch (err) {
          console.error(`Error parsing line ${index + 2}:`, err, line);
          return null;
        }
      })
      .filter((record): record is SalesRecord => record !== null);
  } catch (err) {
    console.error("Error parsing CSV:", err);
    return [];
  }
}

export function aggregateByRegion(data: SalesRecord[]) {
  const regionData = data.reduce(
    (acc, record) => {
      if (!acc[record.Region]) {
        acc[record.Region] = {
          totalSales: 0,
          totalProfit: 0,
          unitsSold: 0,
          count: 0,
        };
      }

      acc[record.Region].totalSales += record["Total Sales"];
      acc[record.Region].totalProfit += record["Operating Profit"];
      acc[record.Region].unitsSold += record["Units Sold"];
      acc[record.Region].count += 1;

      return acc;
    },
    {} as Record<string, any>,
  );

  return Object.entries(regionData).map(([region, data]) => ({
    region,
    ...data,
    avgMargin: data.totalProfit / data.totalSales || 0,
  }));
}

export function aggregateByProduct(data: SalesRecord[]) {
  const productData = data.reduce(
    (acc, record) => {
      if (!acc[record.Product]) {
        acc[record.Product] = {
          totalSales: 0,
          totalProfit: 0,
          unitsSold: 0,
          count: 0,
        };
      }

      acc[record.Product].totalSales += record["Total Sales"];
      acc[record.Product].totalProfit += record["Operating Profit"];
      acc[record.Product].unitsSold += record["Units Sold"];
      acc[record.Product].count += 1;

      return acc;
    },
    {} as Record<string, any>,
  );

  return Object.entries(productData).map(([product, data]) => ({
    product,
    ...data,
    avgMargin: data.totalProfit / data.totalSales || 0,
  }));
}

export function getMonthlyTrends(data: SalesRecord[]) {
  const monthlyData = data.reduce(
    (acc, record) => {
      try {
        const date = new Date(record["Invoice Date"]);
        if (isNaN(date.getTime())) {
          console.warn("Invalid date:", record["Invoice Date"]);
          return acc;
        }

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!acc[monthKey]) {
          acc[monthKey] = {
            totalSales: 0,
            totalProfit: 0,
            unitsSold: 0,
            count: 0,
          };
        }

        acc[monthKey].totalSales += record["Total Sales"];
        acc[monthKey].totalProfit += record["Operating Profit"];
        acc[monthKey].unitsSold += record["Units Sold"];
        acc[monthKey].count += 1;
      } catch (err) {
        console.error(
          "Error processing record for monthly trends:",
          err,
          record,
        );
      }

      return acc;
    },
    {} as Record<string, any>,
  );

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ...data,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getDateRange(data: SalesRecord[]): {
  minDate: Date;
  maxDate: Date;
} {
  if (data.length === 0) {
    const now = new Date();
    return {
      minDate: new Date(now.getFullYear() - 1, 0, 1),
      maxDate: now,
    };
  }

  const dates = data
    .map((record) => new Date(record["Invoice Date"]))
    .filter((date) => !isNaN(date.getTime()));

  if (dates.length === 0) {
    const now = new Date();
    return {
      minDate: new Date(now.getFullYear() - 1, 0, 1),
      maxDate: now,
    };
  }

  return {
    minDate: new Date(Math.min(...dates.map((d) => d.getTime()))),
    maxDate: new Date(Math.max(...dates.map((d) => d.getTime()))),
  };
}

export function isDateInRange(
  dateString: string,
  startDate: Date | null,
  endDate: Date | null,
): boolean {
  if (!startDate && !endDate) return true;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    if (startDate) {
      // Set start date to beginning of day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (date < start) return false;
    }

    if (endDate) {
      // Set end date to end of day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }

    return true;
  } catch (e) {
    console.error("Error parsing date:", e);
    return false;
  }
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}
