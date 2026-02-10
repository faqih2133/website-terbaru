import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const BehavioralIndicatorCard = ({
  coreValueId,
  score,
  comment,
  onScoreChange,
  onCommentChange,
  scale = 100 // Default scale 100
}) => {
  const [inputScore, setInputScore] = useState(
    score !== null && score !== undefined ? String(score) : ''
  );

  useEffect(() => {
    setInputScore(score !== null && score !== undefined ? String(score) : '');
  }, [score]);

  // UI sederhana: input angka bulat 0..scale
  const handleScoreChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      setInputScore('');
      onScoreChange(null);
      return;
    }

    if (!/^\d*$/.test(inputValue)) return;

    setInputScore(inputValue);
    const numericValue = Number(inputValue);

    if (!Number.isFinite(numericValue)) return;

    if (numericValue > scale) {
      setInputScore(String(scale));
      onScoreChange(scale);
      return;
    }

    if (numericValue >= 0) onScoreChange(numericValue);
  };

  const handleScoreBlur = () => {
    if (inputScore === '') return;

    const numericValue = Number(inputScore);
    if (!Number.isFinite(numericValue)) {
      setInputScore('');
      onScoreChange(null);
      return;
    }

    const clampedValue = Math.max(0, Math.min(scale, Math.trunc(numericValue)));
    setInputScore(String(clampedValue));
    onScoreChange(clampedValue);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Input Nilai Aspek (0-{scale})
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputScore}
            onChange={handleScoreChange}
            onBlur={handleScoreBlur}
            onFocus={(e) => e.target.select()}
            onWheel={(e) => e.target.blur()}
            className="w-32 px-3 py-2 border border-slate-300 rounded-md text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            placeholder="0"
          />
          <p className="text-xs text-slate-500">
            Gunakan angka bulat dari 1 sampai {scale}. Nilai 0 tidak bisa disubmit.
          </p>
        </div>
        {Number(score) === 0 && (
          <p className="mt-2 text-xs text-red-600">
            Nilai tidak boleh 0. Harap isi nilai lebih dari 0.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Icon name="MessageSquare" size={16} className="text-slate-400" />
          Komentar (opsional)
        </label>
        <textarea
          value={comment || ''}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Tambahkan catatan singkat jika diperlukan..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
};

export default BehavioralIndicatorCard;
