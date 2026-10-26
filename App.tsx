
import React, { useState } from 'react';
import { Step } from './types';
import StepLayout from './components/StepLayout';
import { useTRLManager } from './hooks/useTRLManager';

// Components
import WelcomeScreen from './components/WelcomeScreen';
import InfoScreen from './components/InfoScreen';
import ProjectDataScreen from './components/ProjectDataScreen';
import SelectTechScreen from './components/SelectTechScreen';
import AssessmentScreen from './components/AssessmentScreen';
import ResultScreen from './components/ResultScreen';
import ResultLookupScreen from './components/ResultLookupScreen';
import ErrorBanner from './components/ErrorBanner';

const LoadingOverlay = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-fadeIn">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-[#B2CCE8] rounded-full"></div>
      <div className="w-20 h-20 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
    </div>
    <p className="text-[#002B5B] font-black text-2xl mt-8 tracking-tighter">{title}</p>
    <p className="text-black text-sm mt-2">{subtitle}</p>
  </div>
);

const App: React.FC = () => {
  const [showLookup, setShowLookup] = useState(false);
  const [lookupShowingResult, setLookupShowingResult] = useState(false);

  const {
    step,
    projectData,
    selectedTech,
    questionnaire,
    answers,
    currentTrl,
    assessmentResult,
    isRegisteringProject,
    projectError,
    isLoadingQuestionnaire,
    questionnaireError,
    isCalculating,
    assessmentError,
    handleStart,
    handleInfoNext,
    handleProjectDataSubmit,
    retryProjectRegistration,
    handleTechSelect,
    retryQuestionnaire,
    handleLevelNext,
    handleLevelBack,
    handleBack,
    reset
  } = useTRLManager();

  if (showLookup) {
    return (
      <StepLayout fullBleed={lookupShowingResult}>
        <ResultLookupScreen
          onBack={() => setShowLookup(false)}
          onResultVisibleChange={setLookupShowingResult}
        />
      </StepLayout>
    );
  }

  const renderCurrentStep = () => {
    switch (step) {
      case Step.Welcome:     return <WelcomeScreen onStart={handleStart} onLookup={() => setShowLookup(true)} />;
      case Step.Info:        return <InfoScreen onNext={handleInfoNext} onBack={handleBack} />;
      case Step.ProjectData: return <ProjectDataScreen onNext={handleProjectDataSubmit} onBack={handleBack} />;
      case Step.SelectTech:  return <SelectTechScreen onSelect={handleTechSelect} onBack={handleBack} />;
      case Step.Assessment:
        return (selectedTech && questionnaire) ? (
          <AssessmentScreen
            tech={selectedTech}
            questionnaire={questionnaire}
            currentTrl={currentTrl}
            answers={answers}
            onNext={handleLevelNext}
            onPrevLevel={handleLevelBack}
            onBack={handleBack}
          />
        ) : null;
      case Step.Result:
        return (selectedTech && questionnaire && assessmentResult) ? (
          <ResultScreen
            tech={selectedTech}
            questionnaire={questionnaire}
            result={assessmentResult}
            answers={answers}
            projectData={projectData}
            onReset={reset}
          />
        ) : null;
      default: return null;
    }
  };

  const isBusy = isCalculating || isLoadingQuestionnaire || isRegisteringProject;

  return (
    <StepLayout fullBleed={step === Step.Result}>
      {isRegisteringProject && (
        <LoadingOverlay title="REGISTRANDO PROYECTO" subtitle="Guardando los datos de tu proyecto..." />
      )}
      {isCalculating && (
        <LoadingOverlay title="ANALIZANDO PROYECTO" subtitle="Evaluando tus respuestas..." />
      )}
      {isLoadingQuestionnaire && (
        <LoadingOverlay title="CARGANDO CUESTIONARIO" subtitle="Obteniendo preguntas desde el servidor..." />
      )}
      {projectError && step === Step.ProjectData && (
        <ErrorBanner message={projectError} onRetry={retryProjectRegistration} />
      )}
      {questionnaireError && step === Step.SelectTech && (
        <ErrorBanner message={questionnaireError} onRetry={retryQuestionnaire} />
      )}
      {assessmentError && step === Step.Assessment && (
        <ErrorBanner message={assessmentError} />
      )}
      <div className={`w-full transition-all duration-500 ${isBusy ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}`}>
        {renderCurrentStep()}
      </div>
    </StepLayout>
  );
};

export default App;
