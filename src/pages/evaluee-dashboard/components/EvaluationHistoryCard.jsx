import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EvaluationHistoryCard = ({ evaluationHistory }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Mock detailed data for each evaluation
  const getEvaluationDetails = (evaluationId) => {
    const mockDetails = {
      'eval-2025-sem2': {
        period: 'Semester II 2025',
        date: '15 Desember 2025',
        score: 87.5,
        evaluators: 5,
        status: 'completed',
        coreValues: [
          { name: 'Berorientasi Pelayanan', score: 88, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Profesional', score: 89, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Harmonis', score: 85, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Loyal', score: 90, maxScore: 100, rating: 'Sesuai Ekspektasi' },
          { name: 'Inovatif', score: 86, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Kolaboratif', score: 87, maxScore: 100, rating: 'Di Bawah Ekspektasi' }
        ],
        evaluatorDetails: [
          { name: 'Evaluator 1', role: 'Atasan', score: 89, status: 'Selesai' },
          { name: 'Evaluator 2', role: 'Rekan Kerja', score: 87, status: 'Selesai' },
          { name: 'Evaluator 3', role: 'Rekan Kerja', score: 88, status: 'Selesai' },
          { name: 'Evaluator 4', role: 'Rekan Kerja', score: 86, status: 'Selesai' },
          { name: 'Evaluator 5', role: 'Bawahan', score: 86, status: 'Selesai' }
        ],
        comments: [
          'Pegawai menunjukkan komitmen tinggi terhadap pelayanan publik',
          'Kemampuan analisis dan pengambilan keputusan sangat baik',
          'Perlu ditingkatkan kemampuan koordinasi lintas unit'
        ],
        recommendations: [
          'Dapat dipertimbangkan untuk posisi yang lebih strategis',
          'Perlu pengembangan leadership skills',
          'Saran mengikuti training manajemen waktu'
        ]
      },
      'eval-2025-sem1': {
        period: 'Semester I 2025',
        date: '15 Juni 2025',
        score: 84.2,
        evaluators: 4,
        status: 'completed',
        coreValues: [
          { name: 'Berorientasi Pelayanan', score: 85, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Profesional', score: 86, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Harmonis', score: 83, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Loyal', score: 87, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Inovatif', score: 82, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Kolaboratif', score: 84, maxScore: 100, rating: 'Di Bawah Ekspektasi' }
        ],
        evaluatorDetails: [
          { name: 'Evaluator 1', role: 'Atasan', score: 86, status: 'Selesai' },
          { name: 'Evaluator 2', role: 'Rekan Kerja', score: 84, status: 'Selesai' },
          { name: 'Evaluator 3', role: 'Rekan Kerja', score: 85, status: 'Selesai' },
          { name: 'Evaluator 4', role: 'Rekan Kerja', score: 83, status: 'Selesai' }
        ],
        comments: [
          'Kinerja stabil dengan peningkatan yang signifikan',
          'Kemampuan komunikasi perlu ditingkatkan',
          'Kontribusi terhadap tim cukup baik'
        ],
        recommendations: [
          'Lanjutkan performa yang baik',
          'Perlu training public speaking',
          'Dapat dipertimbangkan promosi'
        ]
      },
      'eval-2024-sem2': {
        period: 'Semester II 2024',
        date: '15 Desember 2024',
        score: 89.1,
        evaluators: 6,
        status: 'completed',
        coreValues: [
          { name: 'Berorientasi Pelayanan', score: 90, maxScore: 100, rating: 'Sesuai Ekspektasi' },
          { name: 'Profesional', score: 91, maxScore: 100, rating: 'Sesuai Ekspektasi' },
          { name: 'Harmonis', score: 88, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Loyal', score: 92, maxScore: 100, rating: 'Sesuai Ekspektasi' },
          { name: 'Inovatif', score: 87, maxScore: 100, rating: 'Di Bawah Ekspektasi' },
          { name: 'Kolaboratif', score: 88, maxScore: 100, rating: 'Di Bawah Ekspektasi' }
        ],
        evaluatorDetails: [
          { name: 'Evaluator 1', role: 'Atasan', score: 91, status: 'Selesai' },
          { name: 'Evaluator 2', role: 'Rekan Kerja', score: 89, status: 'Selesai' },
          { name: 'Evaluator 3', role: 'Rekan Kerja', score: 90, status: 'Selesai' },
          { name: 'Evaluator 4', role: 'Rekan Kerja', score: 88, status: 'Selesai' },
          { name: 'Evaluator 5', role: 'Bawahan', score: 87, status: 'Selesai' },
          { name: 'Evaluator 6', role: 'Bawahan', score: 88, status: 'Selesai' }
        ],
        comments: [
          'Kinerja luar biasa dengan kontribusi signifikan',
          'Leadership skills sangat baik',
          'Menjadi role model bagi pegawai lain'
        ],
        recommendations: [
          'Sangat direkomendasikan untuk promosi',
          'Dapat menjadi mentor pegawai junior',
          'Pertimbangkan untuk training advanced'
        ]
      }
    };

    return mockDetails[evaluationId] || {};
  };

  const handleViewDetail = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const handleExportPDF = async (evaluation) => {
    setIsExporting(true);
    
    try {
      const details = getEvaluationDetails(evaluation.id);
      
      // Create PDF
      const pdf = new jsPDF();
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Laporan Evaluasi Kinerja', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Periode: ${details.period}`, 20, 45);
      pdf.text(`Tanggal: ${details.date}`, 20, 55);
      pdf.text(`Nilai Akhir: ${details.score}`, 20, 65);
      
      // Add core values table
      const tableData = details.coreValues?.map(cv => [
        cv.name,
        cv.score.toString(),
        cv.rating
      ]) || [];
      
      pdf.autoTable({
        head: [['Nilai Inti ASN', 'Skor', 'Rating']],
        body: tableData,
        startY: 80,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue header
          textColor: 255,
          fontStyle: 'bold',
        },
      });
      
      // Add evaluators table
      const evaluatorData = details.evaluatorDetails?.map(ev => [
        ev.name,
        ev.role,
        ev.score.toString(),
        ev.status
      ]) || [];
      
      pdf.autoTable({
        head: [['Nama Evaluator', 'Peran', 'Nilai', 'Status']],
        body: evaluatorData,
        startY: pdf.lastAutoTable.finalY + 20,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [16, 185, 129], // Green header
          textColor: 255,
          fontStyle: 'bold',
        },
      });
      
      // Save PDF
      pdf.save(`Evaluasi_${evaluation.period.replace(/\s+/g, '_')}.pdf`);
      
      console.log('✅ PDF exported successfully');
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      alert('❌ Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async (evaluation) => {
    setIsExporting(true);
    
    try {
      const details = getEvaluationDetails(evaluation.id);
      
      // Prepare data for Excel
      const workbook = XLSX.utils.book_new();
      
      // Core Values sheet
      const coreValuesData = [
        ['Nilai Inti ASN', 'Skor', 'Rating'],
        ...details.coreValues?.map(cv => [cv.name, cv.score, cv.rating]) || []
      ];
      
      const coreValuesSheet = XLSX.utils.aoa_to_sheet(coreValuesData);
      XLSX.utils.book_append_sheet(workbook, coreValuesSheet, 'Nilai Inti ASN');
      
      // Evaluators sheet
      const evaluatorsData = [
        ['Nama Evaluator', 'Peran', 'Nilai', 'Status'],
        ...details.evaluatorDetails?.map(ev => [ev.name, ev.role, ev.score, ev.status]) || []
      ];
      
      const evaluatorsSheet = XLSX.utils.aoa_to_sheet(evaluatorsData);
      XLSX.utils.book_append_sheet(workbook, evaluatorsSheet, 'Evaluator');
      
      // Summary sheet
      const summaryData = [
        ['Informasi Evaluasi'],
        ['Periode', details.period],
        ['Tanggal', details.date],
        ['Nilai Akhir', details.score],
        ['Jumlah Evaluator', details.evaluators],
        ['Status', details.status],
        [],
        ['Komentar Evaluator'],
        ...details.comments?.map(comment => [comment]) || [],
        [],
        ['Rekomendasi'],
        ...details.recommendations?.map(rec => [rec]) || []
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
      
      // Save Excel file
      XLSX.writeFile(workbook, `Evaluasi_${evaluation.period.replace(/\s+/g, '_')}.xlsx`);
      
      console.log('✅ Excel exported successfully');
    } catch (error) {
      console.error('❌ Excel export failed:', error);
      alert('❌ Gagal mengunduh Excel. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 94) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 90) return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const getRatingLabel = (score) => {
    if (score >= 94) return 'Di Atas Ekspektasi';
    if (score >= 90) return 'Sesuai Ekspektasi';
    return 'Di Bawah Ekspektasi';
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/40">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="History" size={24} color="white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Riwayat Evaluasi</h3>
              <p className="text-sm text-slate-600">Laporan evaluasi kinerja sebelumnya</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{evaluationHistory.length}</div>
            <div className="text-sm text-slate-600">Total Evaluasi</div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {evaluationHistory.map((evaluation) => {
            const scoreColors = getScoreColor(evaluation.score);
            
            return (
              <div
                key={evaluation.id}
                className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300"
              >
                
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${evaluation.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{evaluation.period}</h4>
                      <p className="text-sm text-slate-600">{evaluation.date}</p>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.border}`}>
                    {getRatingLabel(evaluation.score)}
                  </div>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                    <div className="text-lg font-bold text-slate-900">{evaluation.score}</div>
                    <div className="text-xs text-slate-600">Nilai Akhir</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                    <div className="text-lg font-bold text-blue-600">{evaluation.evaluators}</div>
                    <div className="text-xs text-slate-600">Evaluator</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                    <div className="text-lg font-bold text-emerald-600">100%</div>
                    <div className="text-xs text-slate-600">Kelengkapan</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleViewDetail(evaluation)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 font-medium"
                  >
                    <Icon name="Eye" size={16} color="currentColor" />
                    <span>Lihat Detail</span>
                  </button>
                  
                  <button
                    onClick={() => handleExportPDF(evaluation)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="Download" size={16} color="currentColor" />
                    <span>{isExporting ? 'Memproses...' : 'PDF'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleExportExcel(evaluation)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200 hover:border-amber-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="FileSpreadsheet" size={16} color="currentColor" />
                    <span>{isExporting ? 'Memproses...' : 'Excel'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900">
                {(evaluationHistory.reduce((sum, item) => sum + item.score, 0) / evaluationHistory.length).toFixed(1)}
              </div>
              <div className="text-xs text-slate-600">Rata-rata Nilai</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {evaluationHistory.reduce((sum, item) => sum + item.evaluators, 0)}
              </div>
              <div className="text-xs text-slate-600">Total Evaluator</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">
                {Math.max(...evaluationHistory.map(item => item.score))}
              </div>
              <div className="text-xs text-slate-600">Nilai Tertinggi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEvaluation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Detail Evaluasi</h2>
                  <p className="text-blue-100">{selectedEvaluation.period}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon name="X" size={20} color="white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {(() => {
                const details = getEvaluationDetails(selectedEvaluation.id);
                
                return (
                  <div className="space-y-6">
                    
                    {/* Overview Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-2xl font-bold text-slate-900">{details.score}</div>
                        <div className="text-sm text-slate-600">Nilai Akhir</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{details.evaluators}</div>
                        <div className="text-sm text-slate-600">Evaluator</div>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="text-2xl font-bold text-emerald-600">{getRatingLabel(details.score)}</div>
                        <div className="text-sm text-slate-600">Rating</div>
                      </div>
                    </div>

                    {/* Core Values Breakdown */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Breakdown Nilai Inti ASN</h3>
                      <div className="space-y-3">
                        {details.coreValues?.map((value, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{value.name}</div>
                              <div className="text-sm text-slate-600">{value.rating}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-slate-900">{value.score}</div>
                              <div className="text-xs text-slate-600">dari {value.maxScore}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evaluator Details */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Detail Penilaian Evaluator</h3>
                      <div className="space-y-3">
                        {details.evaluatorDetails?.map((evaluator, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{evaluator.name}</div>
                              <div className="text-sm text-slate-600">{evaluator.role}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="text-lg font-bold text-slate-900">{evaluator.score}</div>
                                <div className="text-xs text-slate-600">Nilai</div>
                              </div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                evaluator.status === 'Selesai' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {evaluator.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comments & Recommendations */}
                    {(details.comments?.length > 0 || details.recommendations?.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {details.comments?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Komentar Evaluator</h3>
                            <div className="space-y-3">
                              {details.comments.map((comment, index) => (
                                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-start space-x-2">
                                    <Icon name="MessageCircle" size={16} color="var(--color-blue)" />
                                    <p className="text-sm text-blue-800">{comment}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {details.recommendations?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Rekomendasi</h3>
                            <div className="space-y-3">
                              {details.recommendations.map((rec, index) => (
                                <div key={index} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <div className="flex items-start space-x-2">
                                    <Icon name="Lightbulb" size={16} color="var(--color-emerald)" />
                                    <p className="text-sm text-emerald-800">{rec}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Export Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                      <button
                        onClick={() => handleExportPDF(selectedEvaluation)}
                        disabled={isExporting}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon name="Download" size={18} color="white" />
                        <span>{isExporting ? 'Memproses...' : 'Download PDF'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleExportExcel(selectedEvaluation)}
                        disabled={isExporting}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon name="FileSpreadsheet" size={18} color="white" />
                        <span>{isExporting ? 'Memproses...' : 'Download Excel'}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EvaluationHistoryCard;