
import React, { useState } from 'react';
import { HairDiagnosis, HairType, ScalpType, MainGoal } from '../types';

interface DiagnosisFormProps {
  onFinish: (diagnosis: HairDiagnosis) => void;
  onCancel: () => void;
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ onFinish, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<HairDiagnosis>>({
    hairType: HairType.STRAIGHT,
    scalpType: ScalpType.NORMAL,
    porosity: 'Média',
    hasChemicals: false,
    frequencyOfWash: '2-3 vezes por semana',
    budgetLevel: 'Baixo (Caseiro)',
    mainGoal: MainGoal.HYDRATION
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const stepsCount = 4;

  return (
    <div className="h-full flex flex-col pt-4 animate-in slide-in-from-right duration-300">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <button onClick={onCancel} className="text-gray-400 text-sm">Cancelar</button>
          <span className="text-xs font-bold text-[#2d4a22]">PASSO {step} DE {stepsCount}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full">
          <div 
            className="h-full bg-[#2d4a22] rounded-full transition-all duration-300" 
            style={{ width: `${(step / stepsCount) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#2d4a22]">Como é seu cabelo?</h2>
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Tipo de Curvatura</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(HairType).map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({...formData, hairType: type})}
                    className={`p-4 rounded-2xl border text-sm font-medium transition-all ${formData.hairType === type ? 'bg-[#2d4a22] text-white border-[#2d4a22]' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500 pt-2">Tipo de Couro Cabeludo</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(ScalpType).map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({...formData, scalpType: type})}
                    className={`p-4 rounded-2xl border text-sm font-medium transition-all ${formData.scalpType === type ? 'bg-[#2d4a22] text-white border-[#2d4a22]' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#2d4a22]">Saúde e Histórico</h2>
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Porosidade do Fio</p>
              <div className="flex space-x-2">
                {['Baixa', 'Média', 'Alta'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFormData({...formData, porosity: p as any})}
                    className={`flex-1 p-4 rounded-2xl border text-sm font-medium transition-all ${formData.porosity === p ? 'bg-[#2d4a22] text-white border-[#2d4a22]' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500 pt-2">Possui químicas? (Progressiva, Luzes, etc)</p>
              <div className="flex space-x-2">
                {[true, false].map(val => (
                  <button
                    key={val ? 'sim' : 'nao'}
                    onClick={() => setFormData({...formData, hasChemicals: val})}
                    className={`flex-1 p-4 rounded-2xl border text-sm font-medium transition-all ${formData.hasChemicals === val ? 'bg-[#2d4a22] text-white border-[#2d4a22]' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {val ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#2d4a22]">Rotina e Orçamento</h2>
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Quantas vezes lava na semana?</p>
              <select 
                value={formData.frequencyOfWash}
                onChange={(e) => setFormData({...formData, frequencyOfWash: e.target.value})}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2d4a22]"
              >
                <option>Diariamente</option>
                <option>2-3 vezes por semana</option>
                <option>Apenas 1 vez por semana</option>
              </select>
              <p className="text-sm font-medium text-gray-500 pt-2">Nível de Investimento</p>
              <div className="space-y-2">
                {['Baixo (Caseiro)', 'Médio', 'Premium'].map(b => (
                  <button
                    key={b}
                    onClick={() => setFormData({...formData, budgetLevel: b as any})}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all ${formData.budgetLevel === b ? 'bg-[#2d4a22] text-white border-[#2d4a22]' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#2d4a22]">Objetivo Principal</h2>
            <div className="space-y-2">
              {Object.values(MainGoal).map(goal => (
                <button
                  key={goal}
                  onClick={() => setFormData({...formData, mainGoal: goal})}
                  className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all ${formData.mainGoal === goal ? 'bg-[#2d4a22] text-white border-[#2d4a22]' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <div className="p-4 bg-[#e8f0e3] rounded-2xl border border-[#2d4a22]/10">
              <p className="text-xs text-[#2d4a22]">Ao clicar em Gerar, nossa IA processará seus dados e criará um cronograma exclusivo focado em resultados reais.</p>
            </div>
          </div>
        )}
      </div>

      <div className="py-8 flex space-x-3">
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="flex-1 p-4 rounded-2xl border border-gray-200 text-gray-500 font-bold"
          >
            Voltar
          </button>
        )}
        <button 
          onClick={step === stepsCount ? () => onFinish(formData as HairDiagnosis) : nextStep}
          className="flex-[2] p-4 rounded-2xl bg-[#2d4a22] text-white font-bold shadow-lg shadow-[#2d4a22]/20 active:scale-[0.98] transition-all"
        >
          {step === stepsCount ? 'Gerar Meu Plano' : 'Próximo'}
        </button>
      </div>
    </div>
  );
};

export default DiagnosisForm;
