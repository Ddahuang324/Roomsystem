
import React from 'react';
import type { Participant } from '../types';
import { HomeIcon, TicketIcon } from './IconComponents';

interface SequenceAllocationProps {
  participants: Participant[];
  onDrawSequence: () => void;
  onAllocate: () => void;
  isLoading: boolean;
}

const SequenceAllocation: React.FC<SequenceAllocationProps> = ({ participants, onDrawSequence, onAllocate, isLoading }) => {
  const isSequenced = participants.length > 0 && participants[0].sequence !== undefined;
  
  const totalNeeds = participants.reduce((acc, p) => acc + p.needs.reduce((sum, need) => sum + need.quantity, 0), 0);

  return (
    <div className="animate-slide-in-up">
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-2">
          <TicketIcon className="h-8 w-8 text-teal-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
            {isSequenced ? '第三阶段：分配房源' : '第二阶段：抽取顺序号'}
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {isSequenced ? '已生成抽取顺序。点击下方按钮开始为所有参与者随机分配房源。' : '数据已加载。点击下方按钮为所有参与者随机生成抽取顺序号。'}
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-gray-700 p-4 rounded-lg max-h-80 overflow-y-auto border border-slate-200 dark:border-gray-600">
        <h3 className="font-semibold mb-3 text-center text-slate-700 dark:text-slate-300">
          参与者列表 ({participants.length} 户, 共需 {totalNeeds} 套房)
        </h3>
        <ul className="space-y-2">
          {participants.map((p) => (
            <li key={p.id} className="text-slate-800 dark:text-slate-200 flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md">
              <div>
                {isSequenced && (
                  <span className="bg-indigo-100 text-indigo-800 text-sm font-bold mr-3 px-3 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{p.sequence}</span>
                )}
                <span className="font-medium">{p.name}</span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {p.needs.map(n => `${n.housingType}(${n.quantity})`).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        {!isSequenced ? (
          <button
            onClick={onDrawSequence}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? '处理中...' : <><TicketIcon className="h-5 w-5" /> 抽取顺序号</>}
          </button>
        ) : (
          <button
            onClick={onAllocate}
            disabled={isLoading}
            className="w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-teal-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? '分配中...' : <><HomeIcon className="h-5 w-5" /> 开始随机分配</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default SequenceAllocation;
