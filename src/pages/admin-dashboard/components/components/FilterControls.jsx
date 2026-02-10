import React, { useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';

const FilterControls = ({ 
  timeRange, 
  onTimeRangeChange, 
  activityFilter, 
  onActivityFilterChange 
}) => {
  const timeRangeOptions = [
    { value: '1h', label: '1 Jam' },
    { value: '24h', label: '24 Jam' },
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '3 Bulan' }
  ];

  const activityFilterOptions = [
    { value: 'all', label: 'Semua Aktivitas' },
    { value: 'evaluation', label: 'Evaluasi' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'user', label: 'Pengguna' },
    { value: 'system', label: 'Sistem' }
  ];

  useEffect(() => {
    // Any side effects related to filter changes can be handled here
  }, [timeRange, activityFilter]);

  const handleResetFilters = () => {
    onTimeRangeChange('7d');
    onActivityFilterChange('all');
  };

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Filter Aktivitas
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
          >
            Reset Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rentang Waktu
            </label>
            <Select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              options={timeRangeOptions}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Jenis Aktivitas
            </label>
            <Select
              value={activityFilter}
              onChange={(e) => onActivityFilterChange(e.target.value)}
              options={activityFilterOptions}
              className="w-full"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  // Export functionality
                  console.log('Export filtered data');
                }}
              >
                Export
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // Apply filters
                  console.log('Apply filters:', { timeRange, activityFilter });
                }}
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(timeRange !== '7d' || activityFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Filter aktif:</span>
              {timeRange !== '7d' && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
                </span>
              )}
              {activityFilter !== 'all' && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {activityFilterOptions.find(opt => opt.value === activityFilter)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;