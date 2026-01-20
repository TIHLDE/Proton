"use client";

import { BarChart3, Download, Medal, TrendingUp } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";
import { P } from "~/components/ui/typography";
import { api } from "~/trpc/react";

interface AttendanceStatsProps {
	teamId: string;
	isAdmin: boolean;
}

export default function AttendanceStats({
	teamId,
	isAdmin,
}: AttendanceStatsProps) {
	const { data: stats, isLoading } = api.team.getAttendanceStats.useQuery({
		teamId,
	});

	const exportToCSV = () => {
		if (!stats) return;

		const csvHeaders =
			"Navn,Antall deltakelser,Totalt arrangementer,Oppmøteprosent\n";
		const csvRows = stats
			.map((stat) => {
				return `"${stat.userName}",${stat.attendedCount},${stat.totalEvents},${stat.attendanceRate.toFixed(1)}%`;
			})
			.join("\n");

		const csvContent = csvHeaders + csvRows;
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`oppmøtestatistikk_${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-64" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-[400px] w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!stats || stats.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Oppmøtestatistikk</CardTitle>
					<CardDescription>
						Ingen data tilgjengelig for dette laget.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const chartData = stats.slice(0, 10).map((stat, index) => ({
		name: stat.userName,
		attendedCount: stat.attendedCount,
		fill: index === 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
	}));

	const chartConfig = {
		attendedCount: {
			label: "Arrangementer",
			color: "hsl(var(--chart-1))",
		},
	} satisfies ChartConfig;

	const topPerformer = stats[0];
	const averageAttendance =
		stats.reduce((sum, stat) => sum + stat.attendedCount, 0) / stats.length;

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Totalt arrangementer
						</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{stats[0]?.totalEvents || 0}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Gjennomsnittlig oppmøte
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{averageAttendance.toFixed(1)}
						</div>
						<p className="text-muted-foreground text-xs">
							arrangementer per medlem
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Topp deltaker</CardTitle>
						<Medal className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{topPerformer?.userName}</div>
						<p className="text-muted-foreground text-xs">
							{topPerformer?.attendedCount} arrangementer
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Bar Chart */}
			<Card>
				<CardHeader>
					<CardTitle>Oppmøtestatistikk</CardTitle>
					<CardDescription>Top 10 deltakere</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={chartConfig}>
						<BarChart
							accessibilityLayer
							data={chartData}
							margin={{
								top: 20,
							}}
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="name"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								angle={-45}
								textAnchor="end"
								height={100}
							/>
							<YAxis tickLine={false} axisLine={false} tickMargin={10} />
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Bar
								dataKey="attendedCount"
								fill="var(--color-attendedCount)"
								radius={8}
							>
								<LabelList
									position="top"
									offset={12}
									className="fill-foreground"
									fontSize={12}
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				</CardContent>
				<CardFooter className="flex-col items-start gap-2 text-sm">
					<div className="flex gap-2 font-medium leading-none">
						Rangering basert på totalt antall deltakelser
					</div>
					<div className="text-muted-foreground leading-none">
						Viser data for alle medlemmer i laget
					</div>
				</CardFooter>
			</Card>

			{/* Leaderboard Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Detaljert oversikt</CardTitle>
							<CardDescription>
								Fullstendig liste med oppmøteprosent
							</CardDescription>
						</div>
						{isAdmin && (
							<Button onClick={exportToCSV} variant="outline" size="sm">
								<Download className="h-4 w-4" />
								Eksporter CSV
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{stats.map((stat, index) => (
							<div
								key={stat.userId}
								className="flex items-center justify-between rounded-lg border p-4"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
										{index + 1}
									</div>
									<div>
										<P className="font-medium">{stat.userName}</P>
									</div>
								</div>
								<div className="text-right">
									<P className="font-bold">
										{stat.attendedCount} / {stat.totalEvents}
									</P>
									<P className="text-muted-foreground text-sm">
										{stat.attendanceRate.toFixed(1)}% oppmøte
									</P>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
