
import React, { useState } from 'react';
import { Dimension, DimensionResult, LevelResult, LevelStatus } from '../types';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Copy, Check, Printer } from 'lucide-react';
import { getLevelShortTitle } from '../utils/levelTitle';
import { TRL_DIMENSION_TEXTS } from '../utils/trlDimensionTexts';
import { DIMENSION_DEFINITIONS } from '../utils/dimensionDefinitions';

export interface DimensionRadarPoint {
  subject: string;
  value: number;
  full: number;
}

const NOT_REACHED_DOT_COLOR = 'bg-white border-black text-black';

export const STATUS_DOT_COLOR: Record<LevelStatus, string> = {
  'No cumple': NOT_REACHED_DOT_COLOR,
  'Insuficiente': NOT_REACHED_DOT_COLOR,
  'En proceso': NOT_REACHED_DOT_COLOR,
  'Cumplido': 'bg-[#003B91] border-[#003B91] text-white'
};

export const DIMENSION_META: Record<Dimension, { label: string; color: string }> = {
  TECHNOLOGICAL: { label: 'Tecnología', color: '#00AEEF' },
  LEGAL_REGULATORY: { label: 'Regulatoria & PI', color: '#F9B115' },
  COMMERCIAL: { label: 'Comercial', color: '#e11d48' },
  ORGANIZATIONAL: { label: 'Organizacional', color: '#6366f1' }
};

const ResultCodeBadge = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable, ignore silently
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-3 bg-white rounded-full pl-4 md:pl-5 pr-3 md:pr-4 py-2 shadow-sm border border-slate-400 hover:bg-slate-50 transition-colors shrink-0"
      title="Copiar código de resultado"
    >
      <div className="text-left">
        <p className="text-[9px] text-black font-bold uppercase leading-none mb-0.5">Código de resultado</p>
        <p className="text-[#003B91] font-black text-base md:text-lg tracking-widest leading-none">{code}</p>
      </div>
      {copied ? <Check className="w-4 h-4 text-[#2ECC71]" /> : <Copy className="w-4 h-4 text-black print:hidden" />}
    </button>
  );
};

const RadarPlot = ({
  title,
  color,
  data,
  tickSize = 8
}: {
  title: string;
  color: string;
  data: DimensionRadarPoint[];
  tickSize?: number;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
      <PolarGrid stroke="#e2e8f0" />
      <PolarAngleAxis dataKey="subject" tick={{ fill: '#000000', fontSize: tickSize }} />
      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
      <Radar name={title} dataKey="value" stroke={color} fill={color} fillOpacity={0.5} />
    </RadarChart>
  </ResponsiveContainer>
);

const DimensionRadarCard = ({
  title,
  color,
  data,
  description
}: {
  title: string;
  color: string;
  data: DimensionRadarPoint[];
  description?: { title: string; text: string };
}) => (
  <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-400 flex flex-col items-center h-full print:h-auto print:rounded-lg print:p-3">
    <h4 className="text-[#003B91] font-bold text-sm print:text-[11px] mb-1 print:mb-0 self-start">{title}</h4>
    <div className="w-full h-[210px] lg:h-auto lg:flex-1 lg:min-h-[150px] print:h-[190px] flex items-center justify-center">
      <RadarPlot title={title} color={color} data={data} />
    </div>
    {description && (
      <p className="w-full shrink-0 text-xs print:text-[10px] text-black leading-snug mt-2 max-h-[30%] overflow-y-auto">
        <span className="font-bold">{description.title}</span> {description.text}
      </p>
    )}
  </div>
);

export interface ResultDashboardProps {
  projectTitle: string;
  techTitle: string;
  resultCode: string;
  finalTrl: number | null;
  currentLevelTitle?: string;
  levels: LevelResult[];
  dimensions: DimensionResult[];
  dimensionRadarData: Partial<Record<Dimension, DimensionRadarPoint[]>> | null;
  /** Used when per-dimension detail isn't available (code lookups). */
  levelRadarData?: DimensionRadarPoint[];
  footerLine1: string;
  footerLine2: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  topRightNote?: React.ReactNode;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({
  projectTitle,
  techTitle,
  resultCode,
  finalTrl,
  currentLevelTitle,
  levels,
  dimensions,
  dimensionRadarData,
  levelRadarData,
  footerLine1,
  footerLine2,
  primaryActionLabel,
  onPrimaryAction,
  topRightNote
}) => {
  const levelText = finalTrl ? TRL_DIMENSION_TEXTS[finalTrl] : undefined;
  // The radar already plots Technology, so it drops out of the bar list when that radar is shown.
  const radarShowsTechnology = Boolean(dimensionRadarData?.TECHNOLOGICAL?.length);
  const visibleDimensions = radarShowsTechnology
    ? dimensions.filter((d) => d.dimension !== 'TECHNOLOGICAL')
    : dimensions;
  const sortedLevels = [...levels].sort((a, b) => a.trl - b.trl);

  const shortCurrentLevelTitle = currentLevelTitle ? getLevelShortTitle(currentLevelTitle) : undefined;

  return (
    <div className="w-full lg:h-full max-w-[1400px] mx-auto flex flex-col px-0 py-4 md:p-6 font-['Plus_Jakarta_Sans'] lg:overflow-hidden print:h-auto print:overflow-visible print:p-0">

      {/* HEADER */}
      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between lg:items-end mb-4 lg:gap-3 print:flex-row print:items-center print:mb-2">
        <div className="min-w-0">
          <p className="text-base md:text-xl lg:text-2xl print:text-[16px] font-bold text-[#00AEEF] uppercase tracking-wider truncate print:whitespace-normal mb-1 print:mb-0.5">
            {projectTitle}
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl print:text-base font-bold text-[#002B5B] leading-tight">Resultados de la Evaluación</h1>
          <p className="text-[#003B91]/70 font-medium text-xs md:text-sm lg:hidden print:hidden truncate">{techTitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end lg:gap-2 print:flex-row print:gap-2">
          <p className="hidden lg:block print:block bg-white/85 backdrop-blur-sm rounded-full px-4 py-1 print:px-2 print:py-0.5 text-[#003B91] font-medium text-lg print:text-[11px]">Tecnología Evaluada: {techTitle}</p>
          <div className="flex items-center gap-3 print:hidden">
            {topRightNote}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-bold text-[#003B91] shadow-sm border border-slate-400 hover:bg-slate-50 transition-colors shrink-0"
              title="Imprimir resultados"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>
          <ResultCodeBadge code={resultCode} />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-grow lg:overflow-hidden print:grid-cols-12 print:overflow-visible print:gap-2">

        {/* COLUMNAS IZQUIERDA + CENTRAL */}
        <div className="lg:col-span-8 print:col-span-8 flex flex-col gap-4 lg:gap-5 lg:overflow-hidden print:overflow-visible print:gap-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-4 lg:gap-5 print:gap-2 lg:flex-1 lg:min-h-0">
        {/* COLUMNA IZQUIERDA */}
        <div className="flex flex-col gap-4 lg:gap-5 lg:overflow-hidden print:overflow-visible print:gap-2">
          {/* Nivel de Madurez */}
          <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-[24px] p-6 md:p-8 text-white shadow-lg flex flex-col lg:flex-1 print:h-auto print:overflow-visible print:break-inside-avoid print:rounded-lg print:p-3">
            <div className="flex items-start justify-between gap-4 print:gap-2">
              <h2 className="text-xl md:text-2xl print:text-[13px] font-bold leading-tight">Nivel de Madurez<br className="print:hidden" /><span className="hidden print:inline"> </span>Global Alcanzado:</h2>
              <span className="text-[64px] md:text-[90px] print:text-3xl font-bold leading-none shrink-0">
                {finalTrl ?? 0}
              </span>
            </div>
            <div className="mt-6 lg:mt-auto print:mt-1">
              <h3 className="text-lg md:text-xl print:text-[13px] font-bold mb-1 print:mb-0">
                {shortCurrentLevelTitle ?? 'Aún no alcanza TRL 1'}
              </h3>
              <p className="text-xs md:text-sm print:text-[10px] opacity-80 leading-snug">
                {shortCurrentLevelTitle
                  ? 'Nivel confirmado con base en las respuestas registradas.'
                  : 'Ningún nivel fue completamente cumplido en esta evaluación.'}
              </p>
            </div>
          </div>

          {/* Progreso General */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-sm flex flex-col border border-slate-400 lg:flex-1 print:h-auto print:overflow-visible print:break-inside-avoid print:rounded-lg print:p-3 print:border print:border-slate-400">
            <h4 className="text-[#003B91] font-bold text-base md:text-lg print:text-[12px] mb-6 print:mb-2">Progreso General:</h4>
            <div className="flex items-center justify-between px-1 md:px-2 mb-6 md:mb-8 print:mb-2 relative">
              <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-slate-100 -translate-y-1/2">
                <div
                  className="h-full bg-[#003B91] transition-all duration-1000"
                  style={{ width: `${Math.max(0, ((finalTrl ?? 0) - 1)) * (100 / Math.max(1, sortedLevels.length - 1))}%` }}
                ></div>
              </div>
              {sortedLevels.map((level) => (
                <div
                  key={level.trl}
                  title={level.status}
                  className={`relative z-10 w-7 h-7 md:w-8 md:h-8 print:w-6 print:h-6 rounded-full border-2 flex items-center justify-center font-bold text-[10px] md:text-xs print:text-[9px] transition-colors duration-500 shrink-0 ${STATUS_DOT_COLOR[level.status]}`}
                >
                  {level.trl}
                </div>
              ))}
            </div>
            <p className="text-xs text-black text-center px-2 md:px-4 print:px-0 print:text-[10px] leading-relaxed">
              {finalTrl
                ? `Su tecnología ha demostrado cumplir con los criterios hasta el TRL ${finalTrl}. El siguiente paso es trabajar hacia el TRL ${finalTrl + 1}.`
                : 'Aún no se cumplen todos los criterios del TRL 1. Revise los puntos pendientes en ese nivel.'}
            </p>
          </div>

        </div>

        {/* COLUMNA CENTRAL */}
        <div className="flex flex-col gap-4 lg:gap-5 lg:overflow-hidden print:overflow-visible">
          <div className="lg:h-full">
            {dimensionRadarData ? (
              (() => {
                const techData = dimensionRadarData.TECHNOLOGICAL;
                if (!techData || techData.length === 0) return null;
                const meta = DIMENSION_META.TECHNOLOGICAL;
                return (
                  <div className="h-[260px] lg:h-full print:h-auto print:break-inside-avoid">
                    <DimensionRadarCard
                      title={meta.label}
                      color={meta.color}
                      data={techData}
                      description={levelText ? { title: levelText.TECHNOLOGICAL.title, text: levelText.TECHNOLOGICAL.description } : undefined}
                    />
                  </div>
                );
              })()
            ) : (
              /* Per-dimension detail needs the raw answers, which a code lookup doesn't return.
                 Level scores do come back, so this plots real data instead of guessing. */
              <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-400 flex flex-col h-full print:break-inside-avoid print:p-2">
                <h4 className="text-[#003B91] font-bold text-sm print:text-[11px] mb-1">Cumplimiento por nivel TRL</h4>
                <div className="w-full h-[260px] lg:h-full lg:min-h-[150px] print:h-[220px]">
                  <RadarPlot
                    title="Cumplimiento"
                    color="#00AEEF"
                    data={levelRadarData ?? []}
                    tickSize={9}
                  />
                </div>
                <p className="text-[10px] text-black leading-snug mt-1 print:hidden">
                  El desglose por dimensión y nivel solo está disponible en el equipo donde se realizó la evaluación.
                </p>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-4 print:col-span-4 flex flex-col gap-4 lg:gap-5 lg:overflow-hidden print:overflow-visible print:gap-2">
          {/* Análisis Dimensional */}
          <div className="result-scroll bg-white rounded-[24px] p-6 md:p-8 shadow-sm flex flex-col border border-slate-400 lg:h-full lg:overflow-y-auto print:h-auto print:overflow-visible print:break-inside-avoid print:rounded-lg print:p-3 print:border print:border-slate-400">
            <h4 className="text-[#003B91] font-bold text-base md:text-lg print:text-[12px] mb-3 print:mb-1">Análisis dimensional</h4>
            <p className="text-xs text-black leading-relaxed mb-4 md:mb-5 print:hidden">
              Porcentaje de preguntas cumplidas por dimensión sobre el total evaluado en el cuestionario.
            </p>
            <div className="space-y-3 md:space-y-4 print:space-y-1.5 flex-grow flex flex-col justify-start lg:min-h-0 print:overflow-visible">
              {visibleDimensions.map((item) => {
                const meta = DIMENSION_META[item.dimension];
                const text = levelText?.[item.dimension];
                return (
                  <div key={item.dimension} className="space-y-2 print:space-y-0.5 shrink-0">
                    <div className="flex justify-between items-center text-xs print:text-[11px] font-bold text-black">
                      <span>{meta.label}</span>
                      <span>{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 print:h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%`, backgroundColor: meta.color }}
                      />
                    </div>
                    {text && (
                      <p className="text-xs print:text-[10px] text-black leading-snug">
                        <span className="font-bold">{text.title}</span> {text.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DEFINICIÓN DE LAS DIMENSIONES: informativo, igual para todo resultado */}
      <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-sm flex flex-col border border-slate-400 mt-4 lg:mt-5 print:mt-2 print:h-auto print:overflow-visible print:break-inside-avoid print:rounded-lg print:p-3 print:border print:border-slate-400">
        <h4 className="text-[#003B91] font-bold text-base md:text-lg print:text-[12px] mb-3 md:mb-4 print:mb-1">Definición de las dimensiones</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4 print:grid-cols-4 print:gap-y-1.5 print:gap-x-3">
          {DIMENSION_DEFINITIONS.map((item) => (
            <div key={item.dimension} className="border-l-4 pl-3 print:pl-1.5" style={{ borderColor: DIMENSION_META[item.dimension].color }}>
              <p className="text-xs md:text-sm print:text-[10px] font-bold text-black mb-1 print:mb-0.5">{item.title}</p>
              <p className="text-xs md:text-[13px] print:text-[10px] text-black leading-snug">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER & ACTIONS */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center mt-5 pt-4 print:mt-1 print:pt-1 border-t border-black">
        <div className="text-[10px] print:text-[9px] text-black font-bold space-y-0.5 min-w-0">
          <p className="truncate print:whitespace-normal">{footerLine1}</p>
          {/* Technical identifiers: useful on desktop/print, noise on a phone */}
          <p className="hidden sm:block print:block break-all">{footerLine2}</p>
        </div>
        <button
          onClick={onPrimaryAction}
          className="w-full sm:w-auto shrink-0 bg-[#3F51B5] hover:bg-[#303F9F] text-white px-6 md:px-8 py-3 rounded-full font-bold text-sm md:text-base transition-all shadow-md print:hidden"
        >
          {primaryActionLabel}
        </button>
      </div>
    </div>
  );
};

export default ResultDashboard;
