
import React, { useState, useRef } from 'react';
import { UploadIcon, UsersIcon, HomeIcon } from './IconComponents';
import type { Participant, HousingUnit, ParticipantNeed } from '../types';

interface DataImportProps {
  onDataLoaded: (participants: Participant[], housingStock: HousingUnit[]) => void;
  isLoading: boolean;
}

const DataImport: React.FC<DataImportProps> = ({ onDataLoaded, isLoading }) => {
  const [participantFile, setParticipantFile] = useState<File | null>(null);
  const [housingFile, setHousingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  
  const participantInputRef = useRef<HTMLInputElement>(null);
  const housingInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = (text: string): Promise<string[][]> => {
    return new Promise((resolve) => {
      const rows = text.trim().split('\n').map(row => row.split(',').map(cell => cell.trim()));
      resolve(rows.slice(1)); // skip header row
    });
  };

  const processData = async () => {
    if (!participantFile || !housingFile) {
      setError("请上传两个必需的CSV文件。");
      return;
    }
    setError(null);
    setSummary('处理中...');

    try {
      const participantText = await participantFile.text();
      const housingText = await housingFile.text();

      const participantRows = await parseCsv(participantText);
      const housingRows = await parseCsv(housingText);

      // Process participants
      const participantMap = new Map<string, ParticipantNeed[]>();
      for (const row of participantRows) {
        const [name, type, quantityStr] = row;
        if (!name || !type || !quantityStr) continue;
        const quantity = parseInt(quantityStr, 10);
        if (isNaN(quantity) || quantity <= 0) continue;

        const needs = participantMap.get(name) || [];
        needs.push({ housingType: type, quantity });
        participantMap.set(name, needs);
      }
      const participants: Participant[] = Array.from(participantMap.entries()).map(([name, needs]) => ({
        id: crypto.randomUUID(),
        name,
        needs,
      }));

      // Process housing stock
      const housingStock: HousingUnit[] = housingRows.map(row => ({
        id: crypto.randomUUID(),
        type: row[0] || '',
        district: row[1] || '',
        building: row[2] || '',
        floor: row[3] || '',
        roomNumber: row[4] || '',
        area: row[5] || '',
        constructionArea: row[6] || '',
      }));

      // Validation
      const needsCount = new Map<string, number>();
      participants.forEach(p => {
        p.needs.forEach(need => {
          needsCount.set(need.housingType, (needsCount.get(need.housingType) || 0) + need.quantity);
        });
      });

      const stockCount = new Map<string, number>();
      housingStock.forEach(h => {
        stockCount.set(h.type, (stockCount.get(h.type) || 0) + 1);
      });

      for (const [type, needed] of needsCount.entries()) {
        const available = stockCount.get(type) || 0;
        if (needed > available) {
          throw new Error(`数据校验失败：户型 "${type}" 的需求量 (${needed}) 超过了可用房源数量 (${available})。`);
        }
      }

      setSummary(`成功加载 ${participants.length} 户参与者和 ${housingStock.length} 套房源。数据校验通过。`);
      onDataLoaded(participants, housingStock);

    } catch (e: any) {
      setError(e.message || "解析文件时发生未知错误。");
      setSummary(null);
    }
  };

  return (
    <div className="animate-slide-in-up">
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-2">
          <UploadIcon className="h-8 w-8 text-indigo-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">第一阶段：数据导入</h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-2">请上传包含参与者需求和可用房源的CSV文件。</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Participants Upload */}
        <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg">
          <UsersIcon className="h-10 w-10 text-slate-400 mb-2" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">上传参与者需求</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">CSV格式: 姓名,户型,数量</p>
          <button onClick={() => participantInputRef.current?.click()} className="text-sm bg-slate-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-slate-300 dark:hover:bg-gray-600">选择文件</button>
          <input type="file" accept=".csv" ref={participantInputRef} onChange={(e) => setParticipantFile(e.target.files?.[0] || null)} className="hidden" />
          {participantFile && <p className="text-sm mt-2 text-green-600 dark:text-green-400">{participantFile.name}</p>}
        </div>

        {/* Housing Upload */}
        <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg">
          <HomeIcon className="h-10 w-10 text-slate-400 mb-2" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">上传可用房源</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">CSV格式: 户型,区,栋,层,房号,...</p>
          <button onClick={() => housingInputRef.current?.click()} className="text-sm bg-slate-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-slate-300 dark:hover:bg-gray-600">选择文件</button>
          <input type="file" accept=".csv" ref={housingInputRef} onChange={(e) => setHousingFile(e.target.files?.[0] || null)} className="hidden" />
          {housingFile && <p className="text-sm mt-2 text-green-600 dark:text-green-400">{housingFile.name}</p>}
        </div>
      </div>
      
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {summary && !error && <p className="text-blue-600 dark:text-blue-400 text-center mt-4">{summary}</p>}


      <button
        onClick={processData}
        disabled={isLoading || !participantFile || !housingFile}
        className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? '处理中...' : '加载并验证数据'}
      </button>
    </div>
  );
};

export default DataImport;
