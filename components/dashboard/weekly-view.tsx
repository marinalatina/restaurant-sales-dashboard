// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Progress } from '@/components/ui/progress'
// import { Badge } from '@/components/ui/badge'
// import { Calendar, Users, CreditCard, TrendingUp } from 'lucide-react'
// import {
//   formatCurrency,
//   formatDate,
//   type DailySummary,
//   type WeeklySummary,
// } from '@/lib/csv-parser'
// import { calculateAchievementRate } from '@/lib/sales-store'
// import { KPICard } from './kpi-card'
// import { DailySalesChart, PaymentMethodChart } from './sales-chart'
// import { cn } from '@/lib/utils'

// interface WeeklyViewProps {
//   weeklySummaries: WeeklySummary[]
//   dailySummaries: DailySummary[]
//   weeklyTarget: number
// }

// export function WeeklyView({
//   weeklySummaries,
//   dailySummaries,
//   weeklyTarget,
// }: WeeklyViewProps) {
//   // Get the most recent week
//   const currentWeek = weeklySummaries[weeklySummaries.length - 1]
//   const previousWeek =
//     weeklySummaries.length > 1
//       ? weeklySummaries[weeklySummaries.length - 2]
//       : null

//   // [Dashboard Date] デバッグ: 週次レポートに表示する週
//   if (currentWeek) {
//     console.log('[Dashboard Date] 4. WeeklyView 表示する週', {
//       選択週: `${currentWeek.weekStart} - ${currentWeek.weekEnd}`,
//       weekStart: currentWeek.weekStart,
//       weekEnd: currentWeek.weekEnd,
//       週次サマリー総数: weeklySummaries.length,
//       この週の取引件数: currentWeek.transactionCount,
//     })
//   }

//   if (!currentWeek) {
//     return (
//       <div className="text-center py-12 text-muted-foreground">
//         週次データがありません
//       </div>
//     )
//   }

//   const achievementRate = calculateAchievementRate(
//     currentWeek.totalSales,
//     weeklyTarget
//   )
//   const weekOverWeekChange = previousWeek
//     ? Math.round(
//         ((currentWeek.totalSales - previousWeek.totalSales) /
//           previousWeek.totalSales) *
//           100
//       )
//     : 0

//   // Get daily data for the current week（日付文字列で比較してタイムゾーンずれを防ぐ）
//   const weekDays = dailySummaries.filter(
//     (d) =>
//       d.date >= currentWeek.weekStart && d.date <= currentWeek.weekEnd
//   )

//   return (
//     <div className="space-y-6">
//       {/* Week Summary Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold text-foreground">
//             週次レポート
//           </h2>
//           <p className="text-sm text-muted-foreground">
//             {formatDate(currentWeek.weekStart)} -{' '}
//             {formatDate(currentWeek.weekEnd)}
//           </p>
//         </div>
//         <Badge
//           variant="outline"
//           className={cn(
//             'text-sm',
//             achievementRate >= 100 && 'border-success/30 bg-success/10 text-success',
//             achievementRate >= 80 &&
//               achievementRate < 100 &&
//               'border-warning/30 bg-warning/10 text-warning',
//             achievementRate < 80 &&
//               'border-destructive/30 bg-destructive/10 text-destructive'
//           )}
//         >
//           目標達成率: {achievementRate}%
//         </Badge>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KPICard
//           title="週間売上"
//           value={formatCurrency(currentWeek.totalSales)}
//           trend={
//             previousWeek
//               ? {
//                   value: weekOverWeekChange,
//                   direction:
//                     weekOverWeekChange > 0
//                       ? 'up'
//                       : weekOverWeekChange < 0
//                         ? 'down'
//                         : 'flat',
//                 }
//               : undefined
//           }
//           target={{ value: formatCurrency(weeklyTarget), rate: achievementRate }}
//         />
//         <KPICard
//           title="取引件数"
//           value={`${currentWeek.transactionCount}件`}
//           subtitle={`日平均 ${Math.round(currentWeek.transactionCount / 7)}件`}
//         />
//         <KPICard
//           title="来客数"
//           value={`${currentWeek.customerCount}人`}
//           subtitle={`日平均 ${Math.round(currentWeek.customerCount / 7)}人`}
//         />
//         <KPICard
//           title="客単価"
//           value={formatCurrency(currentWeek.averagePerCustomer)}
//           subtitle="1人あたりの平均支払額"
//         />
//       </div>

//       {/* Progress to Target */}
//       <Card className="bg-card border-border">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
//             <TrendingUp className="size-5" />
//             目標進捗
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-muted-foreground">週次目標</span>
//               <span className="text-foreground font-medium">
//                 {formatCurrency(currentWeek.totalSales)} /{' '}
//                 {formatCurrency(weeklyTarget)}
//               </span>
//             </div>
//             <Progress
//               value={Math.min(achievementRate, 100)}
//               className="h-3"
//             />
//             <div className="flex items-center justify-between text-xs text-muted-foreground">
//               <span>0%</span>
//               <span>50%</span>
//               <span>100%</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <DailySalesChart data={weekDays} target={weeklyTarget / 7} />
//         <PaymentMethodChart data={weekDays} type="daily" />
//       </div>

//       {/* Daily Breakdown */}
//       <Card className="bg-card border-border">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
//             <Calendar className="size-5" />
//             日別売上
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
//             {weekDays.map((day) => {
//               const dayNames = ['日', '月', '火', '水', '木', '金', '土']
//               const dayOfWeek = dayNames[day.dateObj.getDay()]
//               const dailyRate = calculateAchievementRate(
//                 day.totalSales,
//                 weeklyTarget / 7
//               )

//               return (
//                 <div
//                   key={day.date}
//                   className="p-4 rounded-lg bg-muted/30 border border-border"
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium text-foreground">
//                       {day.dateObj.getDate()}日({dayOfWeek})
//                     </span>
//                     <Badge
//                       variant="outline"
//                       className={cn(
//                         'text-xs',
//                         dailyRate >= 100 && 'border-success/30 text-success',
//                         dailyRate < 100 && 'border-muted-foreground/30 text-muted-foreground'
//                       )}
//                     >
//                       {dailyRate}%
//                     </Badge>
//                   </div>
//                   <div className="text-lg font-bold text-foreground">
//                     {formatCurrency(day.totalSales)}
//                   </div>
//                   <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
//                     <Users className="size-3" />
//                     <span>{day.customerCount}人</span>
//                     <CreditCard className="size-3 ml-2" />
//                     <span>{day.transactionCount}件</span>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
