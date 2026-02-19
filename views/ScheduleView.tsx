
import React, { useState } from 'react';
import { HairPlan, DayTask } from '../types';

interface ScheduleViewProps {
  plan: HairPlan;
  onToggleTask: (day: number) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ plan, onToggleTask }) => {
  const [selectedTask, setSelectedTask] = useState<DayTask | null>(null);

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Hidratação': return 'bg-blue-500';
      case 'Nutrição': return 'bg-orange-400';
      case 'Reconstrução': return 'bg-red-500';
      case 'Detox': return 'bg-emerald-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="py-4 space-y-6 animate-in slide-in-from-bottom duration-300 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-[#2d4a22]">Seu Cronograma</h2>
        <p className="text-sm text-gray-500">Acompanhe seu progresso de 30 dias.</p>
      </header>

      {/* Grid of days */}
      <div className="grid grid-cols-5 gap-3">
        {plan.tasks.map((task) => (
          <button
            key={task.day}
            onClick={() => setSelectedTask(task)}
            className={`
              aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all
              ${task.completed ? 'bg-[#e8f0e3] border-[#2d4a22]' : 'bg-white border-gray-100'}
            `}
          >
            <span className={`text-[8px] font-bold ${task.completed ? 'text-[#2d4a22]' : 'text-gray-400'}`}>DIA {task.day}</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${getCategoryColor(task.category)}`}></div>
            {task.completed && (
              <div className="absolute top-1 right-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#2d4a22]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Task Detail Modal-like overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${getCategoryColor(selectedTask.category)}`}>
                  {selectedTask.category}
                </span>
                <h3 className="text-xl font-bold text-[#2d4a22] mt-2">Dia {selectedTask.day}: {selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-gray-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Instruções</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedTask.description}</p>
              </section>

              {selectedTask.recipe && (
                <section className="bg-[#fcfbf7] border border-[#e8f0e3] p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-[#2d4a22] uppercase tracking-widest mb-2">Receita Natural ✨</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed italic">
                    {selectedTask.recipe}
                  </div>
                </section>
              )}
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  onToggleTask(selectedTask.day);
                  setSelectedTask(null);
                }}
                className={`w-full p-4 rounded-2xl font-bold transition-all ${selectedTask.completed ? 'bg-gray-100 text-gray-400' : 'bg-[#2d4a22] text-white shadow-lg shadow-[#2d4a22]/20'}`}
              >
                {selectedTask.completed ? 'Marcar como Pendente' : 'Concluir Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
