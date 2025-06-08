"use client"

import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface BarChartProps {
  data: any[]
  xKey: string
  yKey: string
  title?: string
  color?: string
}

const chartConfig = {
  sales: {
    label: "Sales",
  },

  totalSales: {
    label: "Total Sales",
  },

  totalProfit: {
    label: "Total Profit",
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

export function CustomBarChart({ data, xKey, yKey, title, color = COLORS[0],
}: BarChartProps) {
  return (
    <div className="w-full h-120">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full h-full">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey={xKey} angle={+45} textAnchor="start" height={130} fontSize={12} />
          {/* <YAxis /> */}
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey={yKey} fill={color} radius={8} >
            <LabelList
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={12}
              formatter={(value: any) => `${Math.round(value / 1000000).toLocaleString()} M`}
            />
          </Bar>

        </BarChart>
      </ChartContainer>
    </div>
  )
}
