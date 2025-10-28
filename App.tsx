import React, { useState, useMemo } from 'react';
import type { Participant, HousingUnit, AllocationResult } from './types';
import DataImport from './components/ParticipantInput';
import SequenceAllocation from './components/HousingInput';
import ResultsDisplay from './components/ResultsDisplay';
import { UploadIcon, TicketIcon, HomeIcon } from './components/IconComponents';

type Stage = 'DATA_IMPORT' | 'ALLOCATION_SEQUENCE' | 'RESULTS';

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const STAGES_CONFIG = [
    { id: 'DATA_IMPORT', title: '数据导入', Icon: UploadIcon },
    { id: 'ALLOCATION_SEQUENCE', title: '抽取顺序', Icon: TicketIcon },
    { id: 'RESULTS', title: '分配结果', Icon: HomeIcon },
];

const App: React.FC = () => {
  const [stage, setStage] = useState<Stage>('DATA_IMPORT');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [housingStock, setHousingStock] = useState<HousingUnit[]>([]);
  const [allocationResults, setAllocationResults] = useState<AllocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false); // For sequence drawing animation

  const handleDataLoaded = (loadedParticipants: Participant[], loadedHousing: HousingUnit[]) => {
    setIsLoading(true);
    setTimeout(() => {
        setParticipants(loadedParticipants);
        setHousingStock(loadedHousing);
        setAllocationResults([]); // Clear previous results
        setStage('ALLOCATION_SEQUENCE');
        setIsLoading(false);
    }, 500);
  };
  
  const handleDrawSequence = () => {
    setIsDrawing(true);
    setAllocationResults([]); // Clear previous results on re-draw
    const shuffledParticipants = shuffleArray(participants);
    const sequencedParticipants = shuffledParticipants.map((p, index) => (
      Object.assign({}, p, { sequence: index + 1 })
    ));
    sequencedParticipants.sort((a, b) => a.sequence! - b.sequence!);
    
    // Simulate a very short drawing animation
    setTimeout(() => {
        setParticipants(sequencedParticipants);
        setIsDrawing(false);
    }, 300);
  };

  const handleAllocate = () => {
    setIsLoading(true);
    setTimeout(() => {
        const availableStock = new Map<string, HousingUnit[]>();
        housingStock.forEach(unit => {
            const units = availableStock.get(unit.type) || [];
            units.push(unit);
            availableStock.set(unit.type, units);
        });

        for(const [type, units] of availableStock.entries()){
            availableStock.set(type, shuffleArray(units));
        }

        const sortedParticipants = [...participants].sort((a, b) => a.sequence! - b.sequence!);

        const results: AllocationResult[] = sortedParticipants.map(participant => {
            const allocatedUnits: HousingUnit[] = [];
            participant.needs.forEach(need => {
                const stockForType = availableStock.get(need.housingType) || [];
                const assigned = stockForType.splice(0, need.quantity);
                allocatedUnits.push(...assigned);
            });
            return {
                participantName: participant.name,
                sequence: participant.sequence!,
                allocatedUnits: allocatedUnits,
            };
        });

        setAllocationResults(results);
        setStage('RESULTS');
        setIsLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setStage('DATA_IMPORT');
    setParticipants([]);
    setHousingStock([]);
    setAllocationResults([]);
    setIsLoading(false);
    setIsDrawing(false);
  };
  
  const handleStageClick = (targetStage: Stage) => {
    const isUnlocked = 
        (targetStage === 'DATA_IMPORT') ||
        (targetStage === 'ALLOCATION_SEQUENCE' && participants.length > 0) ||
        (targetStage === 'RESULTS' && allocationResults.length > 0);

    if (isUnlocked) {
        const targetIndex = STAGES_CONFIG.findIndex(s => s.id === targetStage);
        const resultsIndex = STAGES_CONFIG.findIndex(s => s.id === 'RESULTS');
        
        // If moving backwards to a stage before results, clear the results.
        if (targetIndex < resultsIndex) {
            setAllocationResults([]);
        }
        setStage(targetStage);
    }
  };


  const sortedSequencedParticipants = useMemo(() => {
      if (stage === 'ALLOCATION_SEQUENCE' && participants.length > 0 && participants[0].sequence !== undefined) {
        return [...participants].sort((a, b) => a.sequence! - b.sequence!);
      }
      return participants;
  }, [participants, stage]);


  const renderStage = () => {
    switch (stage) {
      case 'DATA_IMPORT':
        return <DataImport onDataLoaded={handleDataLoaded} isLoading={isLoading} />;
      case 'ALLOCATION_SEQUENCE':
        return <SequenceAllocation participants={sortedSequencedParticipants} onDrawSequence={handleDrawSequence} onAllocate={handleAllocate} isLoading={isLoading} isDrawing={isDrawing} />;
      case 'RESULTS':
        return <ResultsDisplay results={allocationResults} onReset={handleReset} />;
      default:
        return null;
    }
  };

  const currentStageIndex = STAGES_CONFIG.findIndex(s => s.id === stage);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-slate-800 dark:text-slate-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-4xl transition-all duration-500">
        <header className="text-center p-6 border-b border-slate-200 dark:border-gray-700">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-500">
                房屋分配助手
            </h1>
        </header>

        <div className="p-6 md:p-8">
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    {STAGES_CONFIG.map((stageConfig, index) => {
                        const isCompleted = index < currentStageIndex;
                        const isCurrent = index === currentStageIndex;
                        const { Icon } = stageConfig;
                        
                        const isUnlocked = 
                            (stageConfig.id === 'DATA_IMPORT') ||
                            (stageConfig.id === 'ALLOCATION_SEQUENCE' && participants.length > 0) ||
                            (stageConfig.id === 'RESULTS' && allocationResults.length > 0);

                        return (
                             <React.Fragment key={stageConfig.id}>
                                <div className="flex flex-col items-center text-center w-24">
                                    <div 
                                        onClick={() => handleStageClick(stageConfig.id as Stage)}
                                        className={`flex flex-col items-center gap-2 ${isUnlocked ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <span className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-300 ${isCurrent ? 'bg-indigo-600' : isCompleted ? 'bg-teal-500' : 'bg-slate-200 dark:bg-gray-700'}`}>
                                            <Icon className={`w-8 h-8 ${isCurrent || isCompleted ? 'text-white' : 'text-slate-500 dark:text-gray-400'}`} />
                                        </span>
                                        <span className={`text-sm font-semibold ${isCurrent ? 'text-indigo-600 dark:text-indigo-300' : isCompleted ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>{stageConfig.title}</span>
                                    </div>
                                </div>
                                {index < STAGES_CONFIG.length - 1 && (
                                    <div className="flex-1 mt-8">
                                        <div className={`h-1 rounded transition-colors duration-300 ${isCompleted ? 'bg-teal-500 dark:bg-teal-400' : 'bg-slate-200 dark:bg-gray-600'}`}></div>
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>

            <div className="mt-6 min-h-[300px]">
                {renderStage()}
            </div>
        </div>
      </div>
       <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Housing Allocation Assistant. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default App;