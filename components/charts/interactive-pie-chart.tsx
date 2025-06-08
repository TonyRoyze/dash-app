"use client"

import * as React from "react"
import { Label, Legend, Pie, PieChart, Sector, Cell } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

interface PieChartProps {
    data: any[]
    dataKey: string
    nameKey: string
    title?: string
}

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

const chartConfig = {
    instore: { label: "Instore" },
    outlet: { label: "Outlet" },
    online: { label: "Online" }
} satisfies ChartConfig

export function ChartPieInteractive({ data, dataKey, nameKey, title }: PieChartProps) {
    const [activeType, setActiveType] = React.useState(data[0][nameKey])

    const total = React.useMemo(
        () => data.reduce((sum, item) => sum + item[dataKey], 0),
        [data, dataKey]
    )

    const activeIndex = React.useMemo(
        () => data.findIndex((item) => item[nameKey] === activeType),
        [activeType, data, nameKey]
    )

    const types = data.map((item) => item[nameKey])

    return (
        <div className="w-full h-auto">
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            <Select value={activeType} onValueChange={setActiveType}>
                <SelectTrigger
                    className="ml-auto h-7 w-[130px] rounded-md pl-2.5"
                    aria-label="Select a Method"
                >
                    <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl">
                    {types.map((key, index) => (
                        <SelectItem key={key} value={key} className="rounded-lg [&_span]:flex">
                            <div className="flex items-center gap-2 text-xs">
                                <span
                                    className="flex h-3 w-3 shrink-0 rounded-sm"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                {key}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full"
            >
                <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        labelLine={false}
                        innerRadius={60}
                        strokeWidth={5}
                        activeIndex={activeIndex}
                        activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                            <g>
                                <Sector {...props} outerRadius={outerRadius + 10} />
                                <Sector
                                    {...props}
                                    outerRadius={outerRadius + 25}
                                    innerRadius={outerRadius + 12}
                                />
                            </g>
                        )}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
                            const RADIAN = Math.PI / 180
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                            const x = cx + radius * Math.cos(-midAngle * RADIAN)
                            const y = cy + radius * Math.sin(-midAngle * RADIAN)

                            return (
                                <text
                                    x={x}
                                    y={y}
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={12}
                                >
                                    {`${name} ${(percent * 100).toFixed(0)}%`}
                                </text>
                            )
                        }}

                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}

                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-3xl font-bold"
                                            >
                                                {Math.round(data[activeIndex]?.[dataKey] / 1000000)}M
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 24}
                                                className="fill-muted-foreground"
                                            >
                                                Sales
                                            </tspan>
                                        </text>
                                    )
                                }
                                return null
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>
        </div>
    )
}
