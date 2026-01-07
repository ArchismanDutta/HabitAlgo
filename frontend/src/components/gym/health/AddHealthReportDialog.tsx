import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHealthReportStore } from '@/store/useHealthReportStore';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { HealthMetric, HealthMetricCategory } from '@/types/gym';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const categories: HealthMetricCategory[] = [
  'hormone', 'vitamin', 'mineral', 'blood_marker', 'liver', 'kidney', 'thyroid', 'other'
];

const commonMetrics: Record<string, Array<{ name: string; unit: string; min: number; max: number }>> = {
  hormone: [
    { name: 'Testosterone (Total)', unit: 'ng/dL', min: 300, max: 1000 },
    { name: 'Testosterone (Free)', unit: 'pg/mL', min: 9, max: 30 },
    { name: 'Estradiol', unit: 'pg/mL', min: 10, max: 40 },
    { name: 'Cortisol', unit: 'µg/dL', min: 6, max: 23 },
    { name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4.0 },
    { name: 'DHEA-S', unit: 'µg/dL', min: 80, max: 560 },
    { name: 'Progesterone', unit: 'ng/mL', min: 0.2, max: 1.4 },
  ],
  vitamin: [
    { name: 'Vitamin D', unit: 'ng/mL', min: 30, max: 100 },
    { name: 'Vitamin B12', unit: 'pg/mL', min: 200, max: 900 },
    { name: 'Folate', unit: 'ng/mL', min: 2.7, max: 17 },
    { name: 'Vitamin A', unit: 'µg/dL', min: 38, max: 98 },
    { name: 'Vitamin E', unit: 'mg/L', min: 5.5, max: 17 },
    { name: 'Vitamin K', unit: 'ng/mL', min: 0.2, max: 3.2 },
  ],
  mineral: [
    { name: 'Iron', unit: 'µg/dL', min: 60, max: 170 },
    { name: 'Ferritin', unit: 'ng/mL', min: 30, max: 400 },
    { name: 'Magnesium', unit: 'mg/dL', min: 1.7, max: 2.2 },
    { name: 'Zinc', unit: 'µg/dL', min: 60, max: 130 },
    { name: 'Calcium', unit: 'mg/dL', min: 8.5, max: 10.2 },
    { name: 'Potassium', unit: 'mEq/L', min: 3.5, max: 5.0 },
    { name: 'Sodium', unit: 'mEq/L', min: 136, max: 145 },
  ],
  blood_marker: [
    { name: 'Cholesterol (Total)', unit: 'mg/dL', min: 125, max: 200 },
    { name: 'LDL Cholesterol', unit: 'mg/dL', min: 0, max: 100 },
    { name: 'HDL Cholesterol', unit: 'mg/dL', min: 40, max: 60 },
    { name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150 },
    { name: 'Glucose (Fasting)', unit: 'mg/dL', min: 70, max: 100 },
    { name: 'HbA1c', unit: '%', min: 4, max: 5.6 },
    { name: 'C-Reactive Protein', unit: 'mg/L', min: 0, max: 3 },
    { name: 'Hemoglobin', unit: 'g/dL', min: 13.5, max: 17.5 },
  ],
  liver: [
    { name: 'ALT', unit: 'U/L', min: 7, max: 56 },
    { name: 'AST', unit: 'U/L', min: 10, max: 40 },
    { name: 'ALP', unit: 'U/L', min: 44, max: 147 },
    { name: 'Bilirubin (Total)', unit: 'mg/dL', min: 0.1, max: 1.2 },
    { name: 'Albumin', unit: 'g/dL', min: 3.5, max: 5.5 },
  ],
  kidney: [
    { name: 'Creatinine', unit: 'mg/dL', min: 0.7, max: 1.3 },
    { name: 'BUN', unit: 'mg/dL', min: 7, max: 20 },
    { name: 'eGFR', unit: 'mL/min/1.73m²', min: 90, max: 120 },
    { name: 'Uric Acid', unit: 'mg/dL', min: 3.5, max: 7.2 },
  ],
  thyroid: [
    { name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4.0 },
    { name: 'T3 (Free)', unit: 'pg/mL', min: 2.3, max: 4.2 },
    { name: 'T4 (Free)', unit: 'ng/dL', min: 0.8, max: 1.8 },
    { name: 'T4 (Total)', unit: 'µg/dL', min: 4.5, max: 12.0 },
  ],
};

export default function AddHealthReportDialog({ open, onOpenChange, onSuccess }: Props) {
  const { createReport } = useHealthReportStore();
  const [submitting, setSubmitting] = useState(false);

  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportName, setReportName] = useState('Blood Work');
  const [labName, setLabName] = useState('');
  const [overallNotes, setOverallNotes] = useState('');
  const [metrics, setMetrics] = useState<Omit<HealthMetric, 'status'>[]>([]);

  const addMetric = () => {
    setMetrics([
      ...metrics,
      {
        category: 'blood_marker',
        name: '',
        value: 0,
        unit: '',
        referenceRange: { min: 0, max: 0, unit: '' },
      },
    ]);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, updates: Partial<Omit<HealthMetric, 'status'>>) => {
    setMetrics(metrics.map((m, i) => (i === index ? { ...m, ...updates } : m)));
  };

  const loadCommonMetric = (index: number, metricName: string) => {
    const category = metrics[index].category;
    const common = commonMetrics[category]?.find(m => m.name === metricName);

    if (common) {
      updateMetric(index, {
        name: common.name,
        unit: common.unit,
        referenceRange: { min: common.min, max: common.max, unit: common.unit },
      });
    }
  };

  const handleSubmit = async () => {
    if (!reportDate || metrics.length === 0) {
      toast.error('Please add at least one metric');
      return;
    }

    // Validate all metrics have required fields
    const invalidMetric = metrics.find(m => !m.name || !m.unit || m.value === 0);
    if (invalidMetric) {
      toast.error('Please fill in all metric fields');
      return;
    }

    setSubmitting(true);
    try {
      await createReport({
        reportDate,
        reportName,
        labName,
        metrics,
        overallNotes,
      });
      toast.success('Health report created!');

      // Reset form
      setReportDate(new Date().toISOString().split('T')[0]);
      setReportName('Blood Work');
      setLabName('');
      setOverallNotes('');
      setMetrics([]);

      onSuccess();
    } catch (error) {
      toast.error('Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] xxs:max-w-[90vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto px-3 xxs:px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-base xxs:text-lg sm:text-xl">Add Health Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 xxs:space-y-5 sm:space-y-6">
          {/* Report Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xxs:gap-4">
            <div>
              <Label htmlFor="reportDate">Report Date</Label>
              <Input
                id="reportDate"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Annual Physical"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="labName" className="text-xs xxs:text-sm">Lab/Clinic Name (Optional)</Label>
            <Input
              id="labName"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="e.g., Quest Diagnostics"
              className="h-9 xxs:h-10 text-sm xxs:text-base"
            />
          </div>

          {/* Metrics */}
          <div>
            <div className="flex items-center justify-between mb-3 xxs:mb-4">
              <Label className="text-base xxs:text-lg font-semibold">Metrics</Label>
              <Button type="button" size="sm" onClick={addMetric} className="h-8 xxs:h-9 text-xs xxs:text-sm">
                <Plus className="h-3 w-3 xxs:h-4 xxs:w-4 mr-1 xxs:mr-2" />
                <span className="hidden xxs:inline">Add Metric</span>
                <span className="xxs:hidden">Add</span>
              </Button>
            </div>

            <div className="space-y-3 xxs:space-y-4">
              {metrics.map((metric, index) => (
                <Card key={index} className="p-3 xxs:p-4">
                  <div className="space-y-3 xxs:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xxs:gap-4">
                      <div>
                        <Label className="text-xs xxs:text-sm">Category</Label>
                        <Select
                          value={metric.category}
                          onValueChange={(value) =>
                            updateMetric(index, { category: value as HealthMetricCategory })
                          }
                        >
                          <SelectTrigger className="h-9 xxs:h-10 text-xs xxs:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-xs xxs:text-sm">
                                {cat.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs xxs:text-sm">Metric Name</Label>
                        <Select
                          value={metric.name}
                          onValueChange={(value) => loadCommonMetric(index, value)}
                        >
                          <SelectTrigger className="h-9 xxs:h-10 text-xs xxs:text-sm">
                            <SelectValue placeholder="Select or type custom" />
                          </SelectTrigger>
                          <SelectContent>
                            {commonMetrics[metric.category]?.map((common) => (
                              <SelectItem key={common.name} value={common.name} className="text-xs xxs:text-sm">
                                {common.name}
                              </SelectItem>
                            )) || <SelectItem value="custom">Custom</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* If custom or name not in list, allow manual entry */}
                    {metric.name && !commonMetrics[metric.category]?.find(m => m.name === metric.name) && (
                      <div>
                        <Label className="text-xs xxs:text-sm">Custom Metric Name</Label>
                        <Input
                          value={metric.name}
                          onChange={(e) => updateMetric(index, { name: e.target.value })}
                          placeholder="Enter custom metric name"
                          className="h-9 xxs:h-10 text-xs xxs:text-sm"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xxs:gap-3">
                      <div>
                        <Label className="text-xs xxs:text-sm">Value</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={metric.value || ''}
                          onChange={(e) =>
                            updateMetric(index, { value: parseFloat(e.target.value) || 0 })
                          }
                          className="h-9 xxs:h-10 text-xs xxs:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs xxs:text-sm">Unit</Label>
                        <Input
                          value={metric.unit}
                          onChange={(e) => updateMetric(index, { unit: e.target.value })}
                          placeholder="ng/dL"
                          className="h-9 xxs:h-10 text-xs xxs:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs xxs:text-sm">Min Range</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={metric.referenceRange.min || ''}
                          onChange={(e) =>
                            updateMetric(index, {
                              referenceRange: {
                                ...metric.referenceRange,
                                min: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="h-9 xxs:h-10 text-xs xxs:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs xxs:text-sm">Max Range</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={metric.referenceRange.max || ''}
                          onChange={(e) =>
                            updateMetric(index, {
                              referenceRange: {
                                ...metric.referenceRange,
                                max: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="h-9 xxs:h-10 text-xs xxs:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-end gap-2 xxs:gap-3 sm:gap-4">
                      <div className="flex-1">
                        <Label className="text-xs xxs:text-sm">Notes (Optional)</Label>
                        <Input
                          value={metric.notes || ''}
                          onChange={(e) => updateMetric(index, { notes: e.target.value })}
                          placeholder="Any additional notes..."
                          className="h-9 xxs:h-10 text-xs xxs:text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMetric(index)}
                        className="h-9 w-9 xxs:h-10 xxs:w-10 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3 xxs:h-4 xxs:w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {metrics.length === 0 && (
                <div className="text-center py-6 xxs:py-8 border-2 border-dashed rounded-lg">
                  <p className="text-xs xxs:text-sm text-muted-foreground">No metrics added yet</p>
                  <p className="text-[10px] xxs:text-xs text-muted-foreground mt-0.5 xxs:mt-1">Click "Add Metric" to start</p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Notes */}
          <div>
            <Label htmlFor="overallNotes" className="text-xs xxs:text-sm">Overall Notes (Optional)</Label>
            <Textarea
              id="overallNotes"
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="Any overall observations or doctor's notes..."
              rows={3}
              className="text-xs xxs:text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 xxs:gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-9 xxs:h-10 text-xs xxs:text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-9 xxs:h-10 text-xs xxs:text-sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
