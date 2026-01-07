import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { HealthReport } from '@/types/gym';

interface Props {
  report: HealthReport;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

export default function ReportCard({ report, onDelete, getStatusColor }: Props) {
  const [expanded, setExpanded] = useState(false);

  const statusCounts = {
    low: report.metrics.filter(m => m.status === 'low').length,
    normal: report.metrics.filter(m => m.status === 'normal').length,
    high: report.metrics.filter(m => m.status === 'high').length,
  };

  return (
    <Card>
      <CardHeader className="px-3 xxs:px-4 sm:px-6 py-3 xxs:py-4 sm:py-5">
        <CardTitle className="flex items-center justify-between gap-2 xxs:gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-sm xxs:text-base sm:text-lg truncate block">{report.reportName}</span>
            <p className="text-xs xxs:text-sm text-muted-foreground font-normal mt-0.5 xxs:mt-1">
              {new Date(report.reportDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {report.labName && ` • ${report.labName}`}
            </p>
          </div>
          <div className="flex gap-1 xxs:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 xxs:h-9 xxs:w-9 sm:h-10 sm:w-10"
            >
              {expanded ? <ChevronUp className="h-3 w-3 xxs:h-4 xxs:w-4" /> : <ChevronDown className="h-3 w-3 xxs:h-4 xxs:w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(report._id)}
              className="h-8 w-8 xxs:h-9 xxs:w-9 sm:h-10 sm:w-10"
            >
              <Trash2 className="h-3 w-3 xxs:h-4 xxs:w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 xxs:px-4 sm:px-6 pb-3 xxs:pb-4 sm:pb-6">
        {/* Summary */}
        <div className="flex flex-wrap gap-2 xxs:gap-3 sm:gap-4 mb-3 xxs:mb-4">
          <div className="flex items-center gap-1 xxs:gap-2">
            <span className="text-xs xxs:text-sm text-muted-foreground">Total:</span>
            <span className="text-xs xxs:text-sm font-semibold">{report.metrics.length}</span>
          </div>
          <div className="flex items-center gap-1 xxs:gap-2">
            <span className="text-xs xxs:text-sm text-green-500">Normal:</span>
            <span className="text-xs xxs:text-sm font-semibold text-green-500">{statusCounts.normal}</span>
          </div>
          <div className="flex items-center gap-1 xxs:gap-2">
            <span className="text-xs xxs:text-sm text-red-500">Low:</span>
            <span className="text-xs xxs:text-sm font-semibold text-red-500">{statusCounts.low}</span>
          </div>
          <div className="flex items-center gap-1 xxs:gap-2">
            <span className="text-xs xxs:text-sm text-orange-500">High:</span>
            <span className="text-xs xxs:text-sm font-semibold text-orange-500">{statusCounts.high}</span>
          </div>
        </div>

        {/* Expanded View */}
        {expanded && (
          <div className="space-y-2 xxs:space-y-3 mt-3 xxs:mt-4 pt-3 xxs:pt-4 border-t">
            {report.metrics.map((metric, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 xxs:p-3 bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs xxs:text-sm sm:text-base font-semibold truncate">{metric.name}</p>
                  <p className="text-[10px] xxs:text-xs text-muted-foreground capitalize">
                    {metric.category.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 xxs:gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="text-xs xxs:text-sm font-bold">
                      {metric.value} {metric.unit}
                    </p>
                    <p className="text-[10px] xxs:text-xs text-muted-foreground whitespace-nowrap">
                      Range: {metric.referenceRange.min} - {metric.referenceRange.max}
                    </p>
                  </div>
                  <div className={`px-2 xxs:px-3 py-0.5 xxs:py-1 rounded-full text-[10px] xxs:text-xs font-semibold flex-shrink-0 ${getStatusColor(metric.status)}`}>
                    {metric.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}

            {report.overallNotes && (
              <div className="mt-3 xxs:mt-4 p-2 xxs:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs xxs:text-sm font-semibold mb-0.5 xxs:mb-1">Notes:</p>
                <p className="text-xs xxs:text-sm">{report.overallNotes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
