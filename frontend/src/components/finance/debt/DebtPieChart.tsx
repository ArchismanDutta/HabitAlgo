import { motion } from 'framer-motion';
import { DebtBreakdown, DEBT_TYPES } from '@/types/finance';
import { Wallet, TrendingDown, Layers } from 'lucide-react';

interface Props {
  data: DebtBreakdown[];
  formatCurrency: (amount: number) => string;
}

export default function DebtPieChart({ data, formatCurrency }: Props) {
  const chartData = data
    .map(item => {
      const typeInfo = DEBT_TYPES.find(t => t.value === item.type);
      const value = isNaN(item.totalCurrent) || !isFinite(item.totalCurrent) ? 0 : item.totalCurrent;

      return {
        name: typeInfo?.label || item.type,
        value: value,
        color: typeInfo?.color || '#6b7280',
        count: item.count || 0
      };
    })
    .filter(item => item.value > 0);

  const hasValidData = chartData.length > 0 && chartData.every(item =>
    typeof item.value === 'number' && !isNaN(item.value) && isFinite(item.value) && item.value > 0
  );

  if (!hasValidData) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...chartData.map(item => item.value));

  return (
    <div className="w-full space-y-6">
      {/* Radial Breakdown Visualization */}
      <div className="relative">
        {/* Center Summary */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center"
        >
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-4 border shadow-lg">
            <Layers className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Total Debt</p>
            <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{chartData.length} types</p>
          </div>
        </motion.div>

        {/* Circular Progress Rings */}
        <div className="relative h-[300px] xxs:h-[350px] flex items-center justify-center">
          {chartData.map((item, index) => {
            const radius = 120 - index * 25;
            const circumference = 2 * Math.PI * radius;
            const percentage = (item.value / totalValue) * 100;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <motion.svg
                key={index}
                className="absolute"
                width="280"
                height="280"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
              >
                {/* Background Circle */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="18"
                  opacity="0.2"
                />

                {/* Animated Progress Circle */}
                <motion.circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '140px 140px' }}
                />

                {/* Shimmer Effect */}
                <motion.circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke={`${item.color}40`}
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  animate={{
                    strokeDashoffset: [circumference, strokeDashoffset, circumference],
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{
                    duration: 3,
                    delay: index * 0.2 + 1.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '140px 140px' }}
                />
              </motion.svg>
            );
          })}
        </div>
      </div>

      {/* Debt Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {chartData.map((item, index) => {
          const percentage = (item.value / totalValue) * 100;
          const barWidth = (item.value / maxValue) * 100;

          return (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-lg transition-shadow"
            >
              {/* Color Accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: item.color }}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Wallet className="h-4 w-4" style={{ color: item.color }} />
                  </motion.div>
                  <div>
                    <p className="text-xs font-semibold">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.count} debt{item.count > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.7, type: 'spring' }}
                  className="px-2 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color
                  }}
                >
                  {percentage.toFixed(0)}%
                </motion.div>
              </div>

              {/* Amount */}
              <p className="text-lg font-bold mb-3" style={{ color: item.color }}>
                {formatCurrency(item.value)}
              </p>

              {/* Animated Bar */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 1, delay: index * 0.15 + 0.8, ease: "easeOut" }}
                  className="h-full rounded-full relative"
                  style={{ backgroundColor: item.color }}
                >
                  <motion.div
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                      repeatDelay: 1.5
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </motion.div>
              </div>

              {/* Hover Icon */}
              <motion.div
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.2 }}
              >
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex flex-wrap justify-center gap-4 pt-4 border-t"
      >
        {chartData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.3 + index * 0.05, type: 'spring' }}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
