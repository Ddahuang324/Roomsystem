import React from 'react';
import type { Participant } from '../types';
import { HomeIcon, TicketIcon } from './IconComponents';

interface SequenceAllocationProps {
  participants: Participant[];
  onDrawSequence: () => void;
  onAllocate: () => void;
  isLoading: boolean;
  isDrawing: boolean;
}

const SequenceAllocation: React.FC<SequenceAllocationProps> = ({ participants, onDrawSequence, onAllocate, isLoading, isDrawing }) => {
  const isSequenced = participants.length > 0 && participants[0].sequence !== undefined;

  const totalNeeds = participants.reduce((acc, p) => acc + p.needs.reduce((sum, need) => sum + need.quantity, 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="bg-slate-50 dark:bg-gray-700/50 p-4 sm:p-6 rounded-xl max-h-96 overflow-y-auto border border-slate-200 dark:border-gray-700 shadow-inner">
        <h3 className="font-semibold mb-4 text-center text-slate-700 dark:text-slate-200">
          参与者列表 ({participants.length} 户, 共需 {totalNeeds} 套房)
        </h3>
        <ul className="space-y-2">
          {participants.map((p) => (
            <li 
              key={p.id} 
              className={`text-slate-800 dark:text-slate-200 flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-all duration-300 ${isDrawing && !isSequenced ? 'animate-shuffle' : ''}`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center mr-3">
                 {isSequenced && (
                    <span 
                      className={`
                        bg-indigo-100 text-indigo-800 text-lg font-bold
                        dark:bg-indigo-900/70 dark:text-indigo-200
                        flex items-center justify-center rounded-full w-10 h-10
                      `}
                    >
                      {p.sequence}
                    </span>
                  )}
                </div>
                <span className="font-medium">{p.name}</span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 text-right">
                {p.needs.map(n => `${n.housingType}(${n.quantity})`).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-slate-200 dark:border-gray-700 pt-6">
        {!isSequenced ? (
          <button
            onClick={onDrawSequence}
            disabled={isLoading || isDrawing}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isDrawing ? '抽取中...' : <><TicketIcon className="h-5 w-5" /> 抽取顺序号</>}
          </button>
        ) : (
          <button
            onClick={onAllocate}
            disabled={isLoading || isDrawing}
            className="w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-teal-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? '分配中...' : <><HomeIcon className="h-5 w-5" /> 开始随机分配</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default SequenceAllocation;