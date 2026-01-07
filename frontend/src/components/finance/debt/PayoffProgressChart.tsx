import { motion } from 'framer-motion';
import { DebtPayoffProgress, DEBT_TYPES } from '@/types/finance';
import { TrendingUp, Target, Award } from 'lucide-react';

interface Props {
  data: DebtPayoffProgress[];
}

export default function PayoffProgressChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const chartData = data
    .map(item => {
      const typeInfo = DEBT_TYPES.find(t => t.value === item.type);
      let payoffPct = 0;

      try {
        const rawValue = item.payoffPercentage;
        if (rawValue !== null && rawValue !== undefined &&
            typeof rawValue === 'number' && !isNaN(rawValue) && isFinite(rawValue)) {
          payoffPct = Math.max(0, Math.min(100, Math.round(rawValue * 10) / 10));
        }
      } catch (e) {
        payoffPct = 0;
      }

      return {
        name: typeInfo?.label || item.type || 'Unknown',
        payoffPercentage: payoffPct,
        remainingPercentage: Math.max(0, 100 - payoffPct),
        color: typeInfo?.color || '#6b7280'
      };
    })
    .filter(item =>
      item.name &&
      typeof item.payoffPercentage === 'number' &&
      !isNaN(item.payoffPercentage) &&
      isFinite(item.payoffPercentage)
    );

  if (chartData.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No valid data to display</p>
      </div>
    );
  }

  const avgProgress = chartData.reduce((sum, item) => sum + item.payoffPercentage, 0) / chartData.length;

  return (
    <div className="w-full space-y-6">
      {/* Overall Progress Summary */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border border-primary/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Progress</p>
              <p className="text-2xl font-bold">{avgProgress.toFixed(1)}%</p>
            </div>
          </div>
          {avgProgress >= 50 && (
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Award className="h-8 w-8 text-yellow-500" />
            </motion.div>
          )}
        </div>

        {/* Animated Progress Arc */}
        <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${avgProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full relative"
          >
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Individual Debt Progress */}
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-semibold">{item.name}</span>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${item.color}20`,
                  color: item.color
                }}
              >
                <TrendingUp className="h-3 w-3" />
                {item.payoffPercentage}%
              </motion.div>
            </div>

            {/* Animated Progress Bar */}
            <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
              {/* Background Grid */}
              <div className="absolute inset-0 grid grid-cols-4 gap-px">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-r border-border/30 last:border-0" />
                ))}
              </div>

              {/* Progress Fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.payoffPercentage}%` }}
                transition={{
                  duration: 1.2,
                  delay: index * 0.15,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="absolute top-0 left-0 h-full relative overflow-hidden"
                style={{ backgroundColor: item.color }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "linear",
                    repeatDelay: 1
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />

                {/* Percentage Text Inside */}
                {item.payoffPercentage > 15 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.8 }}
                    className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-md"
                  >
                    {item.payoffPercentage}%
                  </motion.span>
                )}
              </motion.div>

              {/* Percentage Text Outside */}
              {item.payoffPercentage <= 15 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.8 }}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-sm font-bold z-10"
                  style={{ color: item.color }}
                >
                  {item.payoffPercentage}%
                </motion.span>
              )}
            </div>

            {/* Stats Footer */}
            <div className="flex items-center justify-between mt-3 text-xs">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="text-green-600 dark:text-green-400 font-semibold"
              >
                ✓ Paid: {item.payoffPercentage}%
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="text-muted-foreground"
              >
                Remaining: {item.remainingPercentage}%
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative Progress Scale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="pt-6 border-t"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
          <span className="font-semibold">0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span className="font-semibold">100%</span>
        </div>
        <div className="relative w-full h-2 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 opacity-40" />
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
