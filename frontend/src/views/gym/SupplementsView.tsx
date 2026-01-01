import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupplementStore } from '@/store/useSupplementStore';
import Header from '@/components/layout/Header';
import { Plus, Edit, Trash2, Pill } from 'lucide-react';
import { toast } from 'sonner';
import type { SupplementType, SupplementTiming, SupplementFormData } from '@/types/gym';

export default function SupplementsView() {
  const { supplements, adherenceStats, fetchSupplements, fetchAdherenceStats, deleteSupplement, createSupplement } = useSupplementStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<SupplementFormData>({
    name: '',
    type: 'protein',
    dosage: '',
    timing: [],
    color: '#ff6b35',
    icon: '💊',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSupplements();
    fetchAdherenceStats({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosage || formData.timing.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await createSupplement(formData);
      toast.success('Supplement added! 💊');
      setShowAddForm(false);
      setFormData({
        name: '',
        type: 'protein',
        dosage: '',
        timing: [],
        color: '#ff6b35',
        icon: '💊',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to add supplement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplement?')) return;

    try {
      await deleteSupplement(id);
      toast.success('Supplement deleted');
    } catch (error) {
      toast.error('Failed to delete supplement');
    }
  };

  const toggleTiming = (timing: SupplementTiming) => {
    setFormData(prev => ({
      ...prev,
      timing: prev.timing.includes(timing)
        ? prev.timing.filter(t => t !== timing)
        : [...prev.timing, timing]
    }));
  };

  const timingOptions: SupplementTiming[] = ['morning', 'pre_workout', 'post_workout', 'night'];
  const typeOptions: SupplementType[] = ['protein', 'creatine', 'pre_workout', 'bcaa', 'vitamins', 'other'];
  const iconOptions = ['💊', '🥤', '💪', '⚡', '🌿', '🧪'];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Supplements" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">My Supplements</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track your daily supplement intake
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto text-sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Add Supplement</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Add New Supplement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Whey Protein"
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium">Type</label>
                  <Select value={formData.type} onValueChange={(value: SupplementType) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="h-10 sm:h-11 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(type => (
                        <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium">Dosage</label>
                <Input
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="30g"
                  className="h-10 sm:h-11 text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium">Timing</label>
                <div className="grid grid-cols-2 xs:flex gap-2 mt-2">
                  {timingOptions.map(timing => (
                    <button
                      key={timing}
                      onClick={() => toggleTiming(timing)}
                      className={`min-h-[40px] px-2 xs:px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors active:scale-95 ${
                        formData.timing.includes(timing)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {timing.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium">Icon</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-xl sm:text-2xl p-2 sm:p-3 rounded-lg min-w-[44px] min-h-[44px] transition-all active:scale-95 ${
                        formData.icon === icon ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full h-10 sm:h-11 text-sm">
                {submitting ? 'Adding...' : 'Add Supplement'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Supplements List */}
        {supplements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 sm:py-12 px-4">
                <Pill className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Supplements Yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Add your first supplement to start tracking
                </p>
                <Button onClick={() => setShowAddForm(true)} className="text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplement
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {supplements.map(supplement => {
              const adherence = adherenceStats.find(s => s.supplement._id === supplement._id);

              return (
                <Card key={supplement._id}>
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">{supplement.icon}</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm sm:text-base truncate">{supplement.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                              {supplement.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(supplement._id)}>
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm font-medium">Dosage: {supplement.dosage}</p>
                        <div className="flex gap-1 flex-wrap mt-2">
                          {supplement.timing.map(timing => (
                            <span key={timing} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900 rounded text-[10px] sm:text-xs">
                              {timing.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {adherence && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm text-muted-foreground">30-day Adherence</span>
                            <span className="text-xs sm:text-sm font-bold">{Math.round(adherence.adherenceRate)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${adherence.adherenceRate}%` }}
                            />
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            {adherence.takenCount} of {adherence.totalExpected} taken
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
