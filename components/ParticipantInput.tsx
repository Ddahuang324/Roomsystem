import React, { useState, useRef } from 'react';
import { UploadIcon, UsersIcon, HomeIcon } from './IconComponents';
import type { Participant, HousingUnit, ParticipantNeed } from '../types';

interface DataImportProps {
  onDataLoaded: (participants: Participant[], housingStock: HousingUnit[]) => void;
  isLoading: boolean;
}

const FileUploadArea: React.FC<{
    title: string;
    description: string;
    Icon: React.FC<{className?: string}>;
    file: File | null;
    onFileChange: (file: File | null) => void;
    inputRef: React.RefObject<HTMLInputElement>;
}> = ({ title, description, Icon, file, onFileChange, inputRef }) => (
    <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-gray-700/50 transition-colors duration-300">
        <Icon className="h-12 w-12 text-slate-400 dark:text-gray-500 mb-3" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>
        <button 
            onClick={() => inputRef.current?.click()} 
            className="text-sm bg-slate-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors duration-200 text-slate-800 dark:text-slate-200 font-medium"
        >
            选择文件
        </button>
        <input type="file" accept=".csv" ref={inputRef} onChange={(e) => onFileChange(e.target.files?.[0] || null)} className="hidden" />
        {file && <p className="text-sm mt-3 text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">{file.name}</p>}
    </div>
);


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
    <div className="animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        <FileUploadArea
            title="上传参与者需求"
            description="CSV格式: 姓名,户型,数量"
            Icon={UsersIcon}
            file={participantFile}
            onFileChange={setParticipantFile}
            inputRef={participantInputRef}
        />
        <FileUploadArea
            title="上传可用房源"
            description="CSV格式: 户型,区,栋,层,..."
            Icon={HomeIcon}
            file={housingFile}
            onFileChange={setHousingFile}
            inputRef={housingInputRef}
        />
      </div>
      
      {error && <p className="text-red-500 text-center mt-4 font-medium animate-fade-in">{error}</p>}
      {summary && !error && <p className="text-blue-600 dark:text-blue-400 text-center mt-4 font-medium animate-fade-in">{summary}</p>}

      <div className="mt-8 border-t border-slate-200 dark:border-gray-700 pt-6">
        <button
          onClick={processData}
          disabled={isLoading || !participantFile || !housingFile}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? '处理中...' : <> <UploadIcon className="h-5 w-5" /> 加载并验证数据 </>}
        </button>
      </div>
    </div>
  );
};

export default DataImport;