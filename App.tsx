import React, { useState, useMemo } from 'react';
import type { Participant, HousingUnit, AllocationResult } from './types';
import DataImport from './components/ParticipantInput';
import SequenceAllocation from './components/HousingInput';
import ResultsDisplay from './components/ResultsDisplay';

type Stage = 'DATA_IMPORT' | 'ALLOCATION_SEQUENCE' | 'RESULTS';

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const App: React.FC = () => {
  const [stage, setStage] = useState<Stage>('DATA_IMPORT');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [housingStock, setHousingStock] = useState<HousingUnit[]>([]);
  const [allocationResults, setAllocationResults] = useState<AllocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = (loadedParticipants: Participant[], loadedHousing: HousingUnit[]) => {
    setIsLoading(true);
    // Simulate a brief processing delay for better UX
    setTimeout(() => {
        setParticipants(loadedParticipants);
        setHousingStock(loadedHousing);
        setStage('ALLOCATION_SEQUENCE');
        setIsLoading(false);
    }, 500);
  };
  
  const handleDrawSequence = () => {
    setIsLoading(true);
    setTimeout(() => {
      const shuffledParticipants = shuffleArray(participants);
      // FIX: Replaced object spread with `Object.assign` to fix "Spread types may only be created from object types" error.
      const sequencedParticipants = shuffledParticipants.map((p, index) => (
        Object.assign({}, p, { sequence: index + 1 })
      ));
      sequencedParticipants.sort((a, b) => a.sequence! - b.sequence!);
      setParticipants(sequencedParticipants);
      setIsLoading(false);
    }, 500);
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

        // Shuffle each type of housing stock for randomness
        for(const [type, units] of availableStock.entries()){
            availableStock.set(type, shuffleArray(units));
        }

        const results: AllocationResult[] = participants.map(participant => {
            const allocatedUnits: HousingUnit[] = [];
            participant.needs.forEach(need => {
                const stockForType = availableStock.get(need.housingType) || [];
                const assigned = stockForType.splice(0, need.quantity); // Take N units from the shuffled stock
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
  };

  const sortedParticipants = useMemo(() => {
      if (participants.length > 0 && participants[0].sequence !== undefined) {
        return [...participants].sort((a, b) => a.sequence! - b.sequence!);
      }
      return participants;
  }, [participants]);


  const renderStage = () => {
    switch (stage) {
      case 'DATA_IMPORT':
        return <DataImport onDataLoaded={handleDataLoaded} isLoading={isLoading} />;
      case 'ALLOCATION_SEQUENCE':
        return <SequenceAllocation participants={sortedParticipants} onDrawSequence={handleDrawSequence} onAllocate={handleAllocate} isLoading={isLoading} />;
      case 'RESULTS':
        return <ResultsDisplay results={allocationResults} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-slate-800 dark:text-slate-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-4xl p-6 md:p-8 transition-all duration-500">
        <header className="text-center mb-4 border-b border-slate-200 dark:border-gray-700 pb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-500">
                房屋分配助手
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">一个公平、透明、高效的随机分配工具</p>
        </header>
        <div className="mt-6">
            {renderStage()}
        </div>
      </div>
       <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Housing Allocation Assistant. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default App;
