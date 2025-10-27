
import React from 'react';
import type { AllocationResult, HousingUnit } from '../types';
import { RefreshIcon, TicketIcon, HomeIcon, UsersIcon } from './IconComponents';

const HousingUnitDetails: React.FC<{ unit: HousingUnit }> = ({ unit }) => (
    <tr className="bg-slate-50 dark:bg-gray-900">
        <td colSpan={4} className="p-0">
            <div className="px-6 py-3">
                 <table className="w-full text-sm">
                    <thead className="text-xs text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="text-left py-1 pr-4">户型</th>
                            <th className="text-left py-1 pr-4">区</th>
                            <th className="text-left py-1 pr-4">栋</th>
                            <th className="text-left py-1 pr-4">层</th>
                            <th className="text-left py-1 pr-4">房号</th>
                            <th className="text-left py-1 pr-4">面积</th>
                            <th className="text-left py-1 pr-4">建筑面积</th>
                        </tr>
                    </thead>
                    <tbody>
                         <tr className="text-slate-700 dark:text-slate-300">
                            <td className="py-1 pr-4 font-medium">{unit.type}</td>
                            <td className="py-1 pr-4">{unit.district}</td>
                            <td className="py-1 pr-4">{unit.building}</td>
                            <td className="py-1 pr-4">{unit.floor}</td>
                            <td className="py-1 pr-4">{unit.roomNumber}</td>
                            <td className="py-1 pr-4">{unit.area}</td>
                            <td className="py-1 pr-4">{unit.constructionArea}</td>
                        </tr>
                    </tbody>
                 </table>
            </div>
        </td>
    </tr>
);


const ResultsDisplay: React.FC<{ results: AllocationResult[]; onReset: () => void }> = ({ results, onReset }) => {
  return (
    <div className="animate-slide-in-up w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">🎉 分配结果</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">以下是最终的随机分配结果。</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-700 shadow-md">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-gray-700 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-6 py-3 flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                顺序号
              </th>
              <th scope="col" className="px-6 py-3 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                参与者
              </th>
              <th scope="col" className="px-6 py-3 flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                分配房源数
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <React.Fragment key={result.sequence}>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    <span className="bg-indigo-100 text-indigo-800 text-base font-bold mr-2 px-3 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                      {result.sequence}
                    </span>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {result.participantName}
                  </th>
                  <td className="px-6 py-4">
                     <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                        {result.allocatedUnits.length} 套
                     </span>
                  </td>
                </tr>
                 <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td colSpan={3} className="px-8 py-3">
                        <details>
                            <summary className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:underline">查看详情</summary>
                            <div className="pt-2">
                               {result.allocatedUnits.map(unit => (
                                   <div key={unit.id} className="text-slate-700 dark:text-slate-300 border-l-2 border-teal-500 pl-3 mb-2">
                                       <strong>{unit.type}:</strong> {unit.district}, {unit.building}, {unit.floor}层, {unit.roomNumber}号 (建筑面积: {unit.constructionArea} m²)
                                   </div>
                               ))}
                            </div>
                        </details>
                    </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshIcon className="h-5 w-5" />
          重新开始
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
