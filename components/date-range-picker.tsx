"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChangeAction: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChangeAction,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFromDateChange = (date: string) => {
    const newDate = date ? new Date(date) : undefined;
    onDateRangeChangeAction({
      from: newDate,
      to: dateRange.to,
    });
  };

  const handleToDateChange = (date: string) => {
    const newDate = date ? new Date(date) : undefined;
    onDateRangeChangeAction({
      from: dateRange.from,
      to: newDate,
    });
  };

  const clearDates = () => {
    onDateRangeChangeAction({ from: undefined, to: undefined });
    setIsOpen(false);
  };

  const formatDateForInput = (date: Date | undefined): string => {
    return date ? format(date, "yyyy-MM-dd") : "";
  };

  const formatDisplayDate = (date: Date | undefined): string => {
    return date ? format(date, "MMM dd, yyyy") : "";
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateRange.from && !dateRange.to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {formatDisplayDate(dateRange.from)} -{" "}
                  {formatDisplayDate(dateRange.to)}
                </>
              ) : (
                formatDisplayDate(dateRange.from)
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-date">Start Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={formatDateForInput(dateRange.from)}
                  onChange={(e) => handleFromDateChange(e.target.value)}
                  min={minDate ? formatDateForInput(minDate) : undefined}
                  max={
                    dateRange.to
                      ? formatDateForInput(dateRange.to)
                      : maxDate
                        ? formatDateForInput(maxDate)
                        : undefined
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date">End Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={formatDateForInput(dateRange.to)}
                  onChange={(e) => handleToDateChange(e.target.value)}
                  min={
                    dateRange.from
                      ? formatDateForInput(dateRange.from)
                      : minDate
                        ? formatDateForInput(minDate)
                        : undefined
                  }
                  max={maxDate ? formatDateForInput(maxDate) : undefined}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={clearDates}>
                Clear
              </Button>
              <Button onClick={() => setIsOpen(false)}>Apply</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
