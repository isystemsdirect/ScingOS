
'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import type { ChartConfig } from "@/components/ui/chart"

interface ClientPieChartProps {
    data: any[];
    config: ChartConfig;
}

export function ClientPieChart({ data, config }: ClientPieChartProps) {
    return (
        <ChartContainer config={config} className="mx-auto aspect-square w-full max-w-[250px]">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={data} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                     {data.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} stroke={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
        </ChartContainer>
    );
}
