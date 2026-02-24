
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HairPlan, DayTask } from '../types';

interface ScheduleViewProps {
  plan: HairPlan;
  onToggleTask: (day: number) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ plan, onToggleTask }) => {
  const [selectedTask, setSelectedTask] = useState<DayTask | null>(null);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Hidratação': return 'bg-blue-400';
      case 'Nutrição': return 'bg-orange-300';
      case 'Reconstrução': return 'bg-pink-400';
      case 'Detox': return 'bg-emerald-400';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="py-6 space-y-8 pb-32">
      <header className="px-2">
        <h2 className="text-3xl font-bold text-[#2d4a22] font-serif italic">Seu Calendário</h2>
        <p className="text-sm text-gray-400 font-medium">Acompanhe seu progresso de 30 dias.</p>
      </header>

      {/* Grid of days */}
      <div className="grid grid-cols-5 gap-3">
        {plan.tasks.map((task) => (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={task.day}
            onClick={() => setSelectedTask(task)}
            className={`
              aspect-square rounded-[1.5rem] border flex flex-col items-center justify-center relative overflow-hidden transition-colors
              ${task.completed ? 'bg-[#e8f0e3] border-emerald-200 shadow-sm' : 'bg-white border-gray-100 shadow-sm'}
            `}
          >
            <span className={`text-[8px] font-bold ${task.completed ? 'text-[#2d4a22]' : 'text-gray-300'}`}>D{task.day}</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${getCategoryColor(task.category)} shadow-sm`}></div>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 bg-[#2d4a22] rounded-full p-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-[#2d4a22]/20 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 space-y-6 shadow-2xl relative pointer-events-auto border-t border-emerald-50"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-2" />

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${getCategoryColor(selectedTask.category)}`}></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {selectedTask.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#2d4a22] font-serif">Dia {selectedTask.day}: {selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-6 pr-2 no-scrollbar">
                <section className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#2d4a22]/60 uppercase tracking-widest">Ritual de Hoje</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedTask.description}</p>
                </section>

                {selectedTask.recipe && (
                  <section className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem] space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥣</span>
                      <h4 className="text-[10px] font-bold text-[#2d4a22] uppercase tracking-widest">Receita Alquimia Natural</h4>
                    </div>
                    <div className="text-sm text-[#2d4a22]/80 whitespace-pre-line leading-relaxed italic font-medium">
                      {selectedTask.recipe}
                    </div>
                  </section>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    onToggleTask(selectedTask.day);
                    setSelectedTask(null);
                  }}
                  className={`w-full py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest transition-all ${selectedTask.completed
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-[#2d4a22] text-white shadow-xl shadow-emerald-900/20 active:scale-95'
                    }`}
                >
                  {selectedTask.completed ? 'Reabrir Tarefa' : 'Completar Ritual'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleView;
