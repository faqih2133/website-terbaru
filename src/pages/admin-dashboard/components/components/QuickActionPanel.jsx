import React from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';

const QuickActionPanel = () => {
  const quickActions = [
    {
      id: 'add-user',
      title: 'Tambah Pengguna',
      description: 'Daftarkan pengguna baru ke sistem',
      icon: 'UserPlus',
      action: () => console.log('Add user'),
      color: 'text-primary'
    },
    {
      id: 'generate-report',
      title: 'Generate Laporan',
      description: 'Buat laporan evaluasi periodik',
      icon: 'FileText',
      action: () => console.log('Generate report'),
      color: 'text-success'
    },
    {
      id: 'system-settings',
      title: 'Pengaturan Sistem',
      description: 'Konfigurasi parameter sistem NPK',
      icon: 'Settings',
      action: () => console.log('System settings'),
      color: 'text-warning'
    },
    {
      id: 'backup-data',
      title: 'Backup Data',
      description: 'Cadangkan data sistem ke storage',
      icon: 'Database',
      action: () => console.log('Backup data'),
      color: 'text-info'
    }
  ];

  return (
    <div className="card">
      <div className="p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Aksi Cepat
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={action.action}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-current/10`}>
                  <Icon name={action.icon} size={16} className={action.color} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-sm text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionPanel;