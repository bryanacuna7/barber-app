'use client'

import { Card } from '@/components/ui/card'
import { Trophy, TrendingUp, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface TopReferrer {
  businessId: string
  businessName: string
  businessSlug: string
  referralCode: string
  totalReferrals: number
  successfulReferrals: number
  currentMilestone: number
  conversionRate: string
  pointsBalance: number
}

interface TopReferrersTableProps {
  referrers: TopReferrer[]
}

export function TopReferrersTable({ referrers }: TopReferrersTableProps) {
  if (referrers.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay referrers registrados todavía</p>
        </div>
      </Card>
    )
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <Trophy className="h-4 w-4" />
          <span className="font-bold">1°</span>
        </div>
      )
    if (rank === 2)
      return (
        <div className="flex items-center gap-1 text-zinc-400">
          <Award className="h-4 w-4" />
          <span className="font-bold">2°</span>
        </div>
      )
    if (rank === 3)
      return (
        <div className="flex items-center gap-1 text-orange-600">
          <Award className="h-4 w-4" />
          <span className="font-bold">3°</span>
        </div>
      )
    return <span className="text-zinc-500 font-medium">{rank}°</span>
  }

  const getMilestoneBadge = (milestone: number) => {
    const colors = [
      'bg-zinc-100 text-zinc-700', // 0
      'bg-green-100 text-green-700', // 1
      'bg-blue-100 text-blue-700', // 2
      'bg-purple-100 text-purple-700', // 3
      'bg-orange-100 text-orange-700', // 4
      'bg-pink-100 text-pink-700', // 5
    ]
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[milestone] || colors[0]}`}
      >
        Milestone {milestone}
      </span>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Top Referrers
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Ranking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Negocio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Activos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Conversión
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Milestone
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Puntos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
            {referrers.map((referrer, index) => (
              <motion.tr
                key={referrer.businessId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">{getRankBadge(index + 1)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/reservar/${referrer.businessSlug}`}
                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {referrer.businessName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                    {referrer.referralCode}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                  {referrer.totalReferrals}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {referrer.successfulReferrals}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-purple-600" />
                    <span className="font-medium">{referrer.conversionRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getMilestoneBadge(referrer.currentMilestone)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-zinc-700 dark:text-zinc-300">
                  {referrer.pointsBalance}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
