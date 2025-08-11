import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AcademicPerformanceChartProps {
  data: Array<{
    subject: string;
    currentSemester: number;
    previousSemester: number;
    target: number;
  }>;
  title?: string;
  description?: string;
  className?: string;
  loading?: boolean;
}

export function AcademicPerformanceChart({
  data,
  title = 'Academic Performance Overview',
  description = 'Average performance across different subjects',
  className,
  loading = false,
}: AcademicPerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Subject
              </span>
              <span className="font-bold text-muted-foreground">
                {label}
              </span>
            </div>
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex flex-col">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  {entry.name}
                </span>
                <span className="font-bold" style={{ color: entry.color }}>
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>
            <div className="h-6 w-56 bg-muted animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis 
              dataKey="subject" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 10 }}
            />
            <Radar
              name="Current Semester"
              dataKey="currentSemester"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Previous Semester"
              dataKey="previousSemester"
              stroke="hsl(142, 76%, 36%)"
              fill="hsl(142, 76%, 36%)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Target"
              dataKey="target"
              stroke="hsl(48, 96%, 53%)"
              fill="hsl(48, 96%, 53%)"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }} className="text-sm">
                  {value}
                </span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
