"use client";

import { Button } from "@/components/ui/button";

interface QuickDateFiltersProps {
  onDateRangeChangeAction: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
  dataDateRange: { minDate: Date; maxDate: Date };
}

export function QuickDateFilters({
  onDateRangeChangeAction,
  dataDateRange,
}: QuickDateFiltersProps) {
  // Define the actual data range based on your specification
  const dataStartDate = new Date("2020-01-01");
  const dataEndDate = new Date("2021-02-22");

  const quickFilters = [
    {
      label: "All Time",
      description: "Jan 2020 - Feb 2021",
      action: () => onDateRangeChangeAction({ from: undefined, to: undefined }),
      variant: "default" as const,
    },
    {
      label: "2020",
      description: "Full year 2020",
      action: () =>
        onDateRangeChangeAction({
          from: new Date(2020, 0, 1),
          to: new Date(2020, 11, 31),
        }),
      variant: "secondary" as const,
    },
    {
      label: "2021",
      description: "Jan - Feb 2021",
      action: () =>
        onDateRangeChangeAction({
          from: new Date(2021, 0, 1),
          to: new Date(2021, 1, 22),
        }),
      variant: "secondary" as const,
    },
    {
      label: "Q1 2020",
      description: "Jan - Mar 2020",
      action: () =>
        onDateRangeChangeAction({
          from: new Date(2020, 0, 1),
          to: new Date(2020, 2, 31),
        }),
      variant: "outline" as const,
    },
    {
      label: "Q2 2020",
      description: "Apr - Jun 2020",
      action: () =>
        onDateRangeChangeAction({
          from: new Date(2020, 3, 1),
          to: new Date(2020, 5, 30),
        }),
      variant: "outline" as const,
    },
    {
      label: "Q3 2020",
      description: "Jul - Sep 2020",
      action: () =>
        onDateRangeChangeAction({
          from: new Date(2020, 6, 1),
          to: new Date(2020, 8, 30),
        }),
      variant: "outline" as const,
    },
    {
      label: "Q4 2020",
      description: "Oct - Dec 2020",
      action: () =>
        onDateRangeChangeAction({
          from: new Date(2020, 9, 1),
          to: new Date(2020, 11, 31),
        }),
      variant: "outline" as const,
    },
    // {
    //   label: "Holiday 2020",
    //   description: "Nov - Dec 2020",
    //   action: () =>
    //     onDateRangeChangeAction({
    //       from: new Date(2020, 10, 1),
    //       to: new Date(2020, 11, 31),
    //     }),
    //   variant: "outline" as const,
    // },
    // {
    //   label: "COVID Start",
    //   description: "Mar - May 2020",
    //   action: () =>
    //     onDateRangeChangeAction({
    //       from: new Date(2020, 2, 1),
    //       to: new Date(2020, 4, 31),
    //     }),
    //   variant: "outline" as const,
    // },
    // {
    //   label: "Summer 2020",
    //   description: "Jun - Aug 2020",
    //   action: () =>
    //     onDateRangeChangeAction({
    //       from: new Date(2020, 5, 1),
    //       to: new Date(2020, 7, 31),
    //     }),
    //   variant: "outline" as const,
    // },
    {
      label: "Last 6 Months",
      description: "Aug 2020 - Feb 2021",
      action: () => {
        const sixMonthsFromEnd = new Date(dataEndDate);
        sixMonthsFromEnd.setMonth(sixMonthsFromEnd.getMonth() - 6);
        onDateRangeChangeAction({
          from: sixMonthsFromEnd,
          to: dataEndDate,
        });
      },
      variant: "outline" as const,
    },
    {
      label: "Last 3 Months",
      description: "Nov 2020 - Feb 2021",
      action: () => {
        const threeMonthsFromEnd = new Date(dataEndDate);
        threeMonthsFromEnd.setMonth(threeMonthsFromEnd.getMonth() - 3);
        onDateRangeChangeAction({
          from: threeMonthsFromEnd,
          to: dataEndDate,
        });
      },
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Quick Date Filters
        </span>
        <span className="text-xs text-gray-500">
          Data Range: Jan 1, 2020 - Feb 22, 2021
        </span>
      </div>

      {/* Primary filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-600 flex items-center mr-2">
          Primary:
        </span>
        {quickFilters.slice(0, 3).map((filter) => (
          <Button
            key={filter.label}
            variant={filter.variant}
            size="sm"
            onClick={filter.action}
            className="text-xs"
            title={filter.description}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Quarterly filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-600 flex items-center mr-2">
          Quarters:
        </span>
        {quickFilters.slice(3, 7).map((filter) => (
          <Button
            key={filter.label}
            variant={filter.variant}
            size="sm"
            onClick={filter.action}
            className="text-xs"
            title={filter.description}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Special period filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-600 flex items-center mr-2">
          Periods:
        </span>
        {quickFilters.slice(7).map((filter) => (
          <Button
            key={filter.label}
            variant={filter.variant}
            size="sm"
            onClick={filter.action}
            className="text-xs"
            title={filter.description}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
