
"use client"

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const inspectionStatusData = [
  { status: "Final", count: 1, fill: "var(--color-Final)" },
  { status: "In Progress", count: 1, fill: "var(--color-In_Progress)" },
  { status: "Draft", count: 1, fill: "var(--color-Draft)" },
]

const inspectionStatusConfig = {
  count: {
    label: "Count",
  },
  Final: {
    label: "Final",
    color: "hsl(var(--chart-1))",
  },
  "In_Progress": {
    label: "In Progress",
    color: "hsl(var(--chart-2))",
  },
  Draft: {
    label: "Draft",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const revenueData = [
  { month: "August", revenue: 18600 },
  { month: "September", revenue: 30500 },
  { month: "October", revenue: 23700 },
  { month: "November", revenue: 45231 },
]

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const inspectionsByMonthData = [
  { month: "August", inspections: 92 },
  { month: "September", inspections: 148 },
  { month: "October", inspections: 212 },
  { month: "November", inspections: 265 },
]

const inspectionsByMonthConfig = {
  inspections: {
    label: "Inspections",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig


export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/60 backdrop-blur-sm lg:col-span-1">
            <CardHeader>
                <CardTitle>Inspection Status</CardTitle>
                <CardDescription>Breakdown of all inspections by their current status.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 <ChartContainer config={inspectionStatusConfig} className="mx-auto aspect-square w-full max-w-[250px]">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={inspectionStatusData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                             {inspectionStatusData.map((entry) => (
                                <Cell key={entry.status} fill={entry.fill} stroke={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Monthly revenue from completed inspections.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={revenueConfig} className="h-[250px] w-full">
                    <LineChart data={revenueData} margin={{ left: 12, right: 12, top: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Line
                            dataKey="revenue"
                            type="monotone"
                            stroke="var(--color-revenue)"
                            strokeWidth={3}
                            dot={{
                                fill: "var(--color-revenue)",
                            }}
                            activeDot={{
                                r: 8,
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-sm lg:col-span-1">
            <CardHeader>
                <CardTitle>Inspections This Year</CardTitle>
                <CardDescription>Total inspections completed each month.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={inspectionsByMonthConfig} className="h-[250px] w-full">
                    <BarChart data={inspectionsByMonthData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="inspections" fill="var(--color-inspections)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  )
}
