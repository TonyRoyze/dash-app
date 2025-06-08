"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart"

interface LineChartProps {
  data: any[]
  xKey: string
  yKeys: string[]
  title?: string
  colors?: string[]
}

const chartConfig = {
  totalSales: {
    label: "Total Sales",
  },
  totalProfit: {
    label: "Total Profit",
  },
  unitsSold: {
    label: "Units Sold",
  }
} satisfies ChartConfig

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#312059",
  "#5b3ca3",
  "#cec2e9",
  "#8b5cf6",
  "#a855f7"
]


export function CustomLineChart({
  data,
  xKey,
  yKeys,
  title,
  colors = COLORS.slice(0, yKeys.length),
}: LineChartProps) {
  return (
    <div className="w-full h-80">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full w-full"
      >
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />

          <XAxis dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
          />
          <YAxis />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {yKeys.map((key, index) => (
            <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2} />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}
