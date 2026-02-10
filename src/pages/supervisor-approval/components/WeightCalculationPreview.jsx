import React from 'react';
import Icon from '../../../components/AppIcon';

const WeightCalculationPreview = ({ proposals, positionType = 'structural' }) => {
  const calculateWeights = () => {
    const hasSupervisor = proposals?.some(p => p?.category === 'supervisor' && p?.evaluators?.length > 0);
    const hasPeer = proposals?.some(p => p?.category === 'peer' && p?.evaluators?.length > 0);
    const hasSubordinate = proposals?.some(p => p?.category === 'subordinate' && p?.evaluators?.length > 0);

    if (positionType === 'structural') {
      // A. Pejabat Struktural/Fungsional dengan Fungsi Supervisi
      if (hasSupervisor && hasPeer && hasSubordinate) {
        return { supervisor: 60, peer: 15, subordinate: 25, scenario: 'Kondisi Normal (Lengkap)' };
      } else if (!hasSupervisor && hasPeer && hasSubordinate) {
        return { supervisor: 0, peer: 40, subordinate: 60, scenario: 'Tidak Ada Nilai dari Atasan' };
      } else if (hasSupervisor && !hasPeer && hasSubordinate) {
        return { supervisor: 70, peer: 0, subordinate: 30, scenario: 'Tidak Ada Nilai dari Peers' };
      } else if (hasSupervisor && hasPeer && !hasSubordinate) {
        return { supervisor: 80, peer: 20, subordinate: 0, scenario: 'Tidak Ada Nilai dari Bawahan' };
      } else if (!hasSupervisor && !hasPeer && hasSubordinate) {
        return { supervisor: 0, peer: 0, subordinate: 100, scenario: 'Tidak Ada Nilai dari Atasan & Peers' };
      } else if (!hasSupervisor && hasPeer && !hasSubordinate) {
        return { supervisor: 0, peer: 100, subordinate: 0, scenario: 'Tidak Ada Nilai dari Atasan & Bawahan' };
      } else if (hasSupervisor && !hasPeer && !hasSubordinate) {
        return { supervisor: 100, peer: 0, subordinate: 0, scenario: 'Tidak Ada Nilai dari Peers & Bawahan' };
      }
    } else {
      // B. Pejabat Fungsional TANPA Fungsi Supervisi / Pelaksana
      if (hasSupervisor && hasPeer) {
        return { supervisor: 60, peer: 40, subordinate: 0, scenario: 'Kondisi Normal' };
      } else if (!hasSupervisor && hasPeer) {
        return { supervisor: 0, peer: 100, subordinate: 0, scenario: 'Tidak Ada Nilai dari Atasan' };
      } else if (hasSupervisor && !hasPeer) {
        return { supervisor: 100, peer: 0, subordinate: 0, scenario: 'Tidak Ada Nilai dari Peers' };
      }
    }

    return { supervisor: 0, peer: 0, subordinate: 0, scenario: 'Tidak Valid' };
  };

  const weights = calculateWeights();

  const getWeightColor = (weight) => {
    if (weight === 0) return 'text-muted-foreground';
    if (weight >= 60) return 'text-primary';
    if (weight >= 40) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name="Calculator" size={20} color="var(--color-accent)" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Pratinjau Perhitungan Bobot
          </h3>
          <p className="text-sm caption text-muted-foreground">
            {weights?.scenario} • Jabatan {positionType === 'structural' ? 'Struktural' : 'Fungsional'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm caption text-muted-foreground">Atasan</span>
            <Icon name="UserCheck" size={16} className="text-muted-foreground" />
          </div>
          <p className={`text-2xl font-heading font-semibold data-text ${getWeightColor(weights?.supervisor)}`}>
            {weights?.supervisor}%
          </p>
          <p className="text-xs caption text-muted-foreground mt-1">
            {proposals?.find(p => p?.category === 'supervisor')?.evaluators?.length || 0} evaluator
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm caption text-muted-foreground">Rekan Sejawat</span>
            <Icon name="Users" size={16} className="text-muted-foreground" />
          </div>
          <p className={`text-2xl font-heading font-semibold data-text ${getWeightColor(weights?.peer)}`}>
            {weights?.peer}%
          </p>
          <p className="text-xs caption text-muted-foreground mt-1">
            {proposals?.find(p => p?.category === 'peer')?.evaluators?.length || 0} evaluator
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm caption text-muted-foreground">Bawahan</span>
            <Icon name="UserMinus" size={16} className="text-muted-foreground" />
          </div>
          <p className={`text-2xl font-heading font-semibold data-text ${getWeightColor(weights?.subordinate)}`}>
            {weights?.subordinate}%
          </p>
          <p className="text-xs caption text-muted-foreground mt-1">
            {proposals?.find(p => p?.category === 'subordinate')?.evaluators?.length || 0} evaluator
          </p>
        </div>
      </div>
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-2">
              Informasi Perhitungan
            </p>
            <p className="text-sm text-muted-foreground">
              Bobot akan otomatis disesuaikan berdasarkan ketersediaan evaluator di setiap kategori sesuai PP 30 Tahun 2019. Perubahan jumlah evaluator akan mempengaruhi distribusi bobot penilaian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightCalculationPreview;