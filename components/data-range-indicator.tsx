"use client";

import { Calendar, Info } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataRangeIndicatorProps {
  dataDateRange: { minDate: Date; maxDate: Date };
  filteredCount: number;
  totalCount: number;
}

export function DataRangeIndicator({
  dataDateRange,
  filteredCount,
  totalCount,
}: DataRangeIndicatorProps) {
  const formatDate = (date: Date) => format(date, "MMM dd, yyyy");

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              <strong>Data Range:</strong> {formatDate(dataDateRange.minDate)} -{" "}
              {formatDate(dataDateRange.maxDate)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Showing <strong>{filteredCount.toLocaleString()}</strong> of{" "}
            <strong>{totalCount.toLocaleString()}</strong> records
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {filteredCount !== totalCount && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {((filteredCount / totalCount) * 100).toFixed(1)}% of data
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
