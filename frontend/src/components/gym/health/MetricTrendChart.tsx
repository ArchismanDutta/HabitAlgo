import { motion } from 'framer-motion';
import type { MetricTrendData } from '@/types/gym';
import {TrendingUp, TrendingDown} from 'lucide-react';

interface Props {
  trendData: MetricTrendData;
}

export default function MetricTrendChart({ trendData }: Props) {
  if (!trendData.trend || trendData.trend.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No data available for this metric</p>
      </div>
    );
  }

  const chartData = trendData.trend.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: item.date,
    value: item.value,
    min: item.referenceRange.min,
    max: item.referenceRange.max,
    status: item.status
  }));

  const refMin = trendData.trend[0].referenceRange.min;
  const refMax = trendData.trend[0].referenceRange.max;
  const unit = trendData.trend[0].unit;

  // Calculate chart dimensions
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values, refMin);
  const maxValue = Math.max(...values, refMax);
  const range = maxValue - minValue;
  const padding = range * 0.1;

  const getY = (value: number) => {
    return ((maxValue + padding - value) / (range + 2 * padding)) * 100;
  };

  // Create SVG path
  const createPath = () => {
    const width = 100;
    const step = width / (chartData.length - 1);

    return chartData.map((point, index) => {
      const x = index * step;
      const y = getY(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-500';
      case 'high': return 'text-orange-500';
      default: return 'text-green-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 dark:bg-red-900/20 border-red-500';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 border-orange-500';
      default: return 'bg-green-100 dark:bg-green-900/20 border-green-500';
    }
  };

  const trend = trendData.change && trendData.change !== 0 ? (trendData.change > 0 ? 'up' : 'down') : 'stable';

  return (
    <div className="w-full space-y-6">
      {/* Latest Value Card */}
      {trendData.latestValue && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`relative overflow-hidden rounded-2xl border-2 p-6 ${getStatusBg(trendData.latestValue.status)}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Latest {trendData.metricName}</p>
              <div className="flex items-baseline gap-2">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`text-4xl font-bold ${getStatusColor(trendData.latestValue.status)}`}
                >
                  {trendData.latestValue.value}
                </motion.p>
                <span className="text-lg text-muted-foreground">{unit}</span>
              </div>
              {trendData.change !== undefined && trendData.change !== 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-1 mt-2"
                >
                  {trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-purple-500" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(trendData.change).toFixed(1)} {unit} {trend === 'up' ? 'increase' : 'decrease'}
                  </span>
                </motion.div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBg(trendData.latestValue.status)}`}
            >
              {trendData.latestValue.status.toUpperCase()}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Animated Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative h-[300px] bg-card border rounded-2xl p-6 overflow-hidden"
      >
        {/* Background Grid */}
        <div className="absolute inset-6 grid grid-rows-5 grid-cols-6 gap-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="border-r border-b border-muted/30" />
          ))}
        </div>

        {/* Reference Range Zones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.5 }}
          className="absolute left-6 right-6 bg-green-500/20 rounded"
          style={{
            top: `calc(6px + ${getY(refMax)}%)`,
            bottom: `calc(6px + ${100 - getY(refMin)}%)`
          }}
        />

        {/* Reference Lines */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute left-6 right-6 border-t-2 border-red-500 border-dashed opacity-40"
          style={{ top: `calc(6px + ${getY(refMax)}%)` }}
        >
          <span className="absolute -top-2 right-0 text-[10px] bg-background px-1 text-red-500">
            Max: {refMax}
          </span>
        </motion.div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute left-6 right-6 border-t-2 border-red-500 border-dashed opacity-40"
          style={{ top: `calc(6px + ${getY(refMin)}%)` }}
        >
          <span className="absolute -bottom-2 right-0 text-[10px] bg-background px-1 text-red-500">
            Min: {refMin}
          </span>
        </motion.div>

        {/* SVG Line Path */}
        <svg
          className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Gradient Fill */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under line */}
          <motion.path
            d={`${createPath()} L 100 100 L 0 100 Z`}
            fill="url(#lineGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          />

          {/* Animated Line */}
          <motion.path
            d={createPath()}
            fill="none"
            stroke="#f97316"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.9, duration: 1.5, ease: "easeOut" }}
          />

          {/* Data Points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = getY(point.value);

            return (
              <motion.g key={index}>
                {/* Pulse Effect */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#f97316"
                  opacity="0.3"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 2, 0] }}
                  transition={{
                    delay: 0.9 + index * 0.1,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
                {/* Dot */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="0.8"
                  fill={
                    point.status === 'low' ? '#ef4444' :
                    point.status === 'high' ? '#f97316' :
                    '#10b981'
                  }
                  stroke="white"
                  strokeWidth="0.3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, type: 'spring' }}
                />
              </motion.g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute bottom-0 left-6 right-6 flex justify-between text-[10px] text-muted-foreground">
          {chartData.map((point, index) => {
            if (index % Math.ceil(chartData.length / 5) === 0 || index === chartData.length - 1) {
              return (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + index * 0.05 }}
                >
                  {point.date}
                </motion.span>
              );
            }
            return null;
          })}
        </div>
      </motion.div>

      {/* Data Points List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
      >
        {chartData.map((point, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.9 + index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className={`p-3 rounded-lg border ${getStatusBg(point.status)}`}
          >
            <p className="text-[10px] text-muted-foreground">{point.date}</p>
            <p className={`text-lg font-bold ${getStatusColor(point.status)}`}>
              {point.value} <span className="text-xs">{unit}</span>
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
