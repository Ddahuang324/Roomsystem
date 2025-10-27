import React, { useState } from 'react';
import type { AllocationResult, HousingUnit } from '../types';
import { RefreshIcon, HomeIcon, UsersIcon, ChevronDownIcon, DownloadIcon } from './IconComponents';

const ResultRow: React.FC<{ result: AllocationResult }> = ({ result }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <React.Fragment>
            <tr 
                className="border-b dark:border-gray-700 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    <span className="bg-indigo-100 text-indigo-800 text-base font-bold h-9 w-9 flex items-center justify-center rounded-full dark:bg-indigo-900/70 dark:text-indigo-200">
                        {result.sequence}
                    </span>
                </td>
                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {result.participantName}
                </th>
                <td className="px-6 py-4">
                    <span className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-teal-900/70 dark:text-teal-200">
                        {result.allocatedUnits.length} 套
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-188' : ''}`} />
                </td>
            </tr>
            {isOpen && (
                <tr className="bg-slate-50 dark:bg-gray-800/50">
                    <td colSpan={4} className="p-0">
                        <div className="px-6 py-4 animate-fade-in">
                            <h4 className="text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">分配详情:</h4>
                            <div className="space-y-2">
                               {result.allocatedUnits.map(unit => (
                                   <div key={unit.id} className="text-slate-700 dark:text-slate-300 border-l-4 border-teal-500 pl-4 py-1 text-sm bg-white dark:bg-gray-900/50 rounded-r-md">
                                       <strong>{unit.type}:</strong> {unit.district}, {unit.building}, {unit.floor}层, {unit.roomNumber}号 (建面: {unit.constructionArea}m², 套内: {unit.area}m²)
                                   </div>
                               ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};


const ResultsDisplay: React.FC<{ results: AllocationResult[]; onReset: () => void }> = ({ results, onReset }) => {
  const downloadCSV = () => {
    const headers = [
      '顺序号', '参与者', '分配房源数量', '房源类型', '区', '栋', 
      '层', '房号', '面积(m²)', '建筑面积(m²)'
    ];
    
    const rows = results.flatMap(result => 
      result.allocatedUnits.map((unit, index) => [
        index === 0 ? result.sequence : '',
        index === 0 ? result.participantName : '',
        index === 0 ? result.allocatedUnits.length : '',
        unit.type,
        unit.district,
        unit.building,
        unit.floor,
        unit.roomNumber,
        unit.area,
        unit.constructionArea
      ])
    );

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "房屋分配结果.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in w-full">
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-gray-700 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-6 py-3 w-20">
                顺序号
              </th>
              <th scope="col" className="px-6 py-3">
                参与者
              </th>
              <th scope="col" className="px-6 py-3">
                分配房源数
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
                <ResultRow key={result.sequence} result={result} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onReset}
          className="bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <RefreshIcon className="h-5 w-5" />
          重新开始
        </button>
        <button
          onClick={downloadCSV}
          className="bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <DownloadIcon className="h-5 w-5" />
          下载结果 (CSV)
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;