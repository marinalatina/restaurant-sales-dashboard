'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, BarChart, Bar, Cell, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CustomerSummary } from '@/lib/customer-parser'

interface CustomerAnalysisViewProps {
    dailyData: CustomerSummary[]
    monthlyData: CustomerSummary[]
}

const GENDER_COLORS = {
    Male: '#3b82f6',   // Blue
    Female: '#ec4899', // Pink
    Unknown: '#9ca3af' // Gray
}

export function CustomerAnalysisView({ dailyData, monthlyData }: CustomerAnalysisViewProps) {

    // Aggregate all time for overview
    const totalMale = monthlyData.reduce((acc, curr) => acc + curr.male, 0)
    const totalFemale = monthlyData.reduce((acc, curr) => acc + curr.female, 0)
    const totalUnknown = monthlyData.reduce((acc, curr) => acc + curr.unknown, 0)

    const overallData = [
        { name: '男性', value: totalMale, color: GENDER_COLORS.Male },
        { name: '女性', value: totalFemale, color: GENDER_COLORS.Female },
        { name: '不明', value: totalUnknown, color: GENDER_COLORS.Unknown },
    ].filter(d => d.value > 0)

    // Get current month (last entry in monthlyData)
    const currentMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null
    const currentMonthData = currentMonth ? [
        { name: '男性', value: currentMonth.male, color: GENDER_COLORS.Male },
        { name: '女性', value: currentMonth.female, color: GENDER_COLORS.Female },
        { name: '不明', value: currentMonth.unknown, color: GENDER_COLORS.Unknown },
    ].filter(d => d.value > 0) : []

    const AGE_COLORS = {
        elementary: '#f472b6', // Pink-400
        student: '#a78bfa',    // Violet-400
        young: '#38bdf8',      // Sky-400
        middle: '#34d399',     // Emerald-400
        senior: '#fbbf24',     // Amber-400
    }

    // Age Group Data (Overall)
    const totalElementary = monthlyData.reduce((acc, curr) => acc + curr.ageElementary, 0)
    const totalStudent = monthlyData.reduce((acc, curr) => acc + curr.ageStudent, 0)
    const totalYoung = monthlyData.reduce((acc, curr) => acc + curr.ageYoung, 0)
    const totalMiddle = monthlyData.reduce((acc, curr) => acc + curr.ageMiddle, 0)
    const totalSenior = monthlyData.reduce((acc, curr) => acc + curr.ageSenior, 0)

    const overallAgeData = [
        { name: '小学生以下', value: totalElementary, color: AGE_COLORS.elementary },
        { name: '中高生', value: totalStudent, color: AGE_COLORS.student },
        { name: '20-30代', value: totalYoung, color: AGE_COLORS.young },
        { name: '40-50代', value: totalMiddle, color: AGE_COLORS.middle },
        { name: '60代以上', value: totalSenior, color: AGE_COLORS.senior },
    ].filter(d => d.value > 0)

    // Age Group Data (Current Month)
    const currentMonthAgeData = currentMonth ? [
        { name: '小学生以下', value: currentMonth.ageElementary, color: AGE_COLORS.elementary },
        { name: '中高生', value: currentMonth.ageStudent, color: AGE_COLORS.student },
        { name: '20-30代', value: currentMonth.ageYoung, color: AGE_COLORS.young },
        { name: '40-50代', value: currentMonth.ageMiddle, color: AGE_COLORS.middle },
        { name: '60代以上', value: currentMonth.ageSenior, color: AGE_COLORS.senior },
    ].filter(d => d.value > 0) : []

    const totalAgeCount = totalElementary + totalStudent + totalYoung + totalMiddle + totalSenior
    const currentMonthAgeTotal = currentMonth ? (currentMonth.ageElementary + currentMonth.ageStudent + currentMonth.ageYoung + currentMonth.ageMiddle + currentMonth.ageSenior) : 0

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">性別比率</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Gender Ratio */}
                <Card>
                    <CardHeader>
                        <CardTitle>全期間 男女比率</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overallData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {overallData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value}人`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-4">
                            <span className="text-sm text-muted-foreground">総計: {totalMale + totalFemale + totalUnknown}人</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Month Gender Ratio */}
                <Card>
                    <CardHeader>
                        <CardTitle>{currentMonth ? `${currentMonth.date} 男女比率` : '月間データなし'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {currentMonth ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={currentMonthData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {currentMonthData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `${value}人`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    データがありません
                                </div>
                            )}
                        </div>
                        {currentMonth && (
                            <div className="text-center mt-4">
                                <span className="text-sm text-muted-foreground">総計: {currentMonth.total}人</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <h3 className="text-xl font-semibold mt-8">年代別比率</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Age Ratio */}
                <Card>
                    <CardHeader>
                        <CardTitle>全期間 年代別比率</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={overallAgeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={0}
                                        textAnchor="middle"
                                        height={60}
                                        interval={0}
                                    />
                                    <YAxis hide />
                                    <Tooltip formatter={(value: number) => `${value}人`} />
                                    <Legend />
                                    <Bar dataKey="value" name="人数">
                                        {overallAgeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-4">
                            <span className="text-sm text-muted-foreground">総計: {totalAgeCount}人</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Month Age Ratio */}
                <Card>
                    <CardHeader>
                        <CardTitle>{currentMonth ? `${currentMonth.date} 年代別比率` : '月間データなし'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {currentMonth ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={currentMonthAgeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={0}
                                            textAnchor="middle"
                                            height={60}
                                            interval={0}
                                        />
                                        <YAxis hide />
                                        <Tooltip formatter={(value: number) => `${value}人`} />
                                        <Legend />
                                        <Bar dataKey="value" name="人数">
                                            {currentMonthAgeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    データがありません
                                </div>
                            )}
                        </div>
                        {currentMonth && (
                            <div className="text-center mt-4">
                                <span className="text-sm text-muted-foreground">総計: {currentMonthAgeTotal}人</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
