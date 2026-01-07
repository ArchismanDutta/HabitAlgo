import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHealthReportStore } from '@/store/useHealthReportStore';
import Header from '@/components/layout/Header';
import { Activity, Plus, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AddHealthReportDialog from '@/components/gym/health/AddHealthReportDialog';
import MetricTrendChart from '@/components/gym/health/MetricTrendChart';
import ReportCard from '@/components/gym/health/ReportCard';

export default function HealthReportsView() {
  const {
    reports,
    reportSummary,
    selectedMetricTrend,
    availableMetrics,
    fetchReports,
    fetchReportSummary,
    fetchAvailableMetrics,
    fetchMetricTrend,
    deleteReport
  } = useHealthReportStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
    fetchReportSummary();
    fetchAvailableMetrics();
  }, []);

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await deleteReport(id);
      toast.success('Report deleted');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleMetricSelect = async (metricName: string) => {
    setSelectedMetric(metricName);
    await fetchMetricTrend(metricName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'normal': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Health Reports" />

      <div className="container mx-auto px-3 xxs:px-4 py-4 xxs:py-5 sm:py-6 space-y-4 xxs:space-y-5 sm:space-y-6 pb-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xxs:gap-3 sm:gap-4">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 pb-4 xxs:pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs xxs:text-sm text-muted-foreground">Last Test</p>
                  <p className="text-lg xxs:text-xl sm:text-2xl font-bold mt-0.5">
                    {reportSummary ? `${reportSummary.daysAgo}d` : '--'}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {reportSummary?.reportDate ? new Date(reportSummary.reportDate).toLocaleDateString() : 'No reports'}
                  </p>
                </div>
                <Calendar className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 pb-4 xxs:pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs xxs:text-sm text-muted-foreground">Normal</p>
                  <p className="text-lg xxs:text-xl sm:text-2xl font-bold text-green-500 mt-0.5">
                    {reportSummary?.statusSummary.normal || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">metrics</p>
                </div>
                <Activity className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 pb-4 xxs:pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs xxs:text-sm text-muted-foreground">Low</p>
                  <p className="text-lg xxs:text-xl sm:text-2xl font-bold text-red-500 mt-0.5">
                    {reportSummary?.statusSummary.low || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">metrics</p>
                </div>
                <TrendingDown className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="pt-4 xxs:pt-5 sm:pt-6 px-3 xxs:px-4 pb-4 xxs:pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs xxs:text-sm text-muted-foreground">High</p>
                  <p className="text-lg xxs:text-xl sm:text-2xl font-bold text-orange-500 mt-0.5">
                    {reportSummary?.statusSummary.high || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">metrics</p>
                </div>
                <TrendingUp className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Report Button */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
            <CardTitle className="flex items-center justify-between text-base xxs:text-lg sm:text-xl">
              <span>Health Reports</span>
              <Button onClick={() => setShowAddDialog(true)} className="h-9 xxs:h-10 text-sm xxs:text-base">
                <Plus className="h-4 w-4 mr-1 xxs:mr-2" />
                <span className="hidden xxs:inline">Add Report</span>
                <span className="xxs:hidden">Add</span>
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">All Reports</TabsTrigger>
            <TabsTrigger value="trends">Metric Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-4 xxs:mt-5 sm:mt-6">
            <div className="space-y-3 xxs:space-y-4">
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No health reports yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add your first health report to track your metrics
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reports.map(report => (
                  <ReportCard
                    key={report._id}
                    report={report}
                    onDelete={handleDeleteReport}
                    getStatusColor={getStatusColor}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4 xxs:mt-5 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xxs:gap-5 sm:gap-6">
              {/* Metric Selector */}
              <Card className="lg:col-span-1 transition-all hover:shadow-lg">
                <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
                  <CardTitle className="text-base xxs:text-lg">Select Metric</CardTitle>
                </CardHeader>
                <CardContent className="px-4 xxs:px-5 sm:px-6">
                  {availableMetrics.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No metrics tracked yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add a health report to see metrics
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 xxs:space-y-4">
                      {availableMetrics.map(category => (
                        <div key={category.category}>
                          <h3 className="font-semibold text-xs xxs:text-sm mb-1.5 xxs:mb-2 capitalize">
                            {category.category.replace('_', ' ')}
                          </h3>
                          <div className="space-y-1">
                            {category.metrics.map(metric => (
                              <button
                                key={metric}
                                onClick={() => handleMetricSelect(metric)}
                                className={`w-full text-left px-2.5 xxs:px-3 py-1.5 xxs:py-2 rounded-lg text-xs xxs:text-sm transition-colors ${
                                  selectedMetric === metric
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                              >
                                {metric}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trend Chart */}
              <Card className="lg:col-span-2 transition-all hover:shadow-lg">
                <CardHeader className="px-4 xxs:px-5 sm:px-6 py-4 xxs:py-5 sm:py-6">
                  <CardTitle className="flex flex-col xxs:flex-row items-start xxs:items-center justify-between gap-2 text-base xxs:text-lg sm:text-xl">
                    <span className="truncate">{selectedMetric || 'Select a metric'}</span>
                    {selectedMetricTrend && (
                      <div className="flex items-center gap-1.5 xxs:gap-2">
                        {getTrendIcon(selectedMetricTrend.change)}
                        <span className="text-xs xxs:text-sm text-muted-foreground">
                          {selectedMetricTrend.change > 0 ? '+' : ''}
                          {selectedMetricTrend.change.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 xxs:px-5 sm:px-6">
                  {selectedMetricTrend ? (
                    <MetricTrendChart trendData={selectedMetricTrend} />
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        Select a metric to view trends
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Report Dialog */}
        <AddHealthReportDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={() => {
            setShowAddDialog(false);
            fetchReports();
            fetchReportSummary();
            fetchAvailableMetrics();
          }}
        />
      </div>
    </div>
  );
}
