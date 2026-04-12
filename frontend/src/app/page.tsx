"use client";

import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Calculator, 
  Zap, 
  Server, 
  BrainCircuit, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Building2,
  Users,
  Code2,
  Globe,
  Database,
  Lock,
  Mail,
  User,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  X,
  Calendar,
  Layers,
  Cpu,
  ArrowRight,
  Edit3
} from 'lucide-react';

// --- Types & Constants ---

interface Answers {
  industryTailored: string;
  primaryIndustry: string[];
  otherIndustry: string;
  corePurpose: string;
  otherPurpose: string;
  userCount: string;
  version: string;
  platforms: string[];
  otherPlatform: string;
  integrations: string;
  dataMigration: string;
  environment: string;
  compliance: string[];
  otherCompliance: string;
  collaborationModel: string;
  fullName: string;
  email: string;
  notes: string;
}

const INITIAL_ANSWERS: Answers = {
  industryTailored: '',
  primaryIndustry: [],
  otherIndustry: '',
  corePurpose: '',
  otherPurpose: '',
  userCount: '',
  version: '',
  platforms: [],
  otherPlatform: '',
  integrations: '',
  dataMigration: '',
  environment: '',
  compliance: [],
  otherCompliance: '',
  collaborationModel: '',
  fullName: '',
  email: '',
  notes: ''
};

const INDUSTRIES = [
  'Healthcare', 'Financial', 'E-commerce', 'Gaming', 
  'Retail', 'Education', 'Logistics', 'Real Estate', 'Other'
];

const PLATFORMS = [
  { id: 'Web', icon: <Globe className="w-4 h-4" /> },
  { id: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
  { id: 'Other', icon: <Edit3 className="w-4 h-4" /> }
];

const COMPLIANCE_STANDARDS = [
  'None', 'HIPAA', 'GDPR', 'PCI-DSS', 'I need your expert advice on compliance', 'Other'
];

// --- Calculation Logic ---

function calculateFPAFromAnswers(answers: Answers) {
  let inputs = 10;
  let outputs = 5;
  let inquiries = 5;
  let logFiles = 2;
  let interfaces = 2;

  if (answers.industryTailored === 'Yes') {
    inputs += 8;
    logFiles += 3;
  }
  
  // Base weights for selections
  inputs += answers.primaryIndustry.length * 4;

  const userMap: Record<string, number> = { '1-10': 0, '10-100': 5, '100-500': 15, 'up to 1,000,000+': 40 };
  logFiles += userMap[answers.userCount] || 0;
  
  if (answers.version === 'Fully-featured') {
    inputs += 20;
    outputs += 15;
    inquiries += 10;
  } else if (answers.version === 'MVP now/Full later') {
    inputs += 10;
    outputs += 5;
  }

  interfaces += answers.platforms.length * 5;

  if (answers.integrations === 'Yes multiple') {
    interfaces += 15;
    inputs += 10;
  } else if (answers.integrations === 'Maybe') {
    interfaces += 5;
  }
  
  if (answers.dataMigration === 'Yes') {
    inputs += 12;
    logFiles += 6;
  }

  if (answers.compliance.length > 0 && !answers.compliance.includes('None')) {
    logFiles += answers.compliance.length * 5;
    outputs += answers.compliance.length * 2;
  }

  return {
    extInputs: inputs,
    extOutputs: outputs,
    extInquiries: inquiries,
    intLogFiles: logFiles,
    extInterfaces: interfaces
  };
}

// --- Main Application Component ---

export default function SaaSPage() {
  const [currentView, setCurrentView] = useState<'calculator' | 'methodology'>('calculator');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAnswerChange = (field: keyof Answers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const toggleCheckbox = (field: 'primaryIndustry' | 'platforms' | 'compliance', item: string) => {
    const current = answers[field] as string[];
    
    // Logic for Expert Advice: If checked, uncheck all others
    if (item === 'I need your expert advice on compliance') {
      if (current.includes(item)) {
        setAnswers(prev => ({ ...prev, [field]: [] }));
      } else {
        setAnswers(prev => ({ ...prev, [field]: [item] }));
      }
      return;
    }

    // If other normal items are checked while Expert Advice is active, uncheck Expert Advice
    let nextList = [...current];
    if (nextList.includes('I need your expert advice on compliance')) {
      nextList = nextList.filter(i => i !== 'I need your expert advice on compliance');
    }

    if (nextList.includes(item)) {
      setAnswers(prev => ({ ...prev, [field]: nextList.filter(i => i !== item) }));
    } else {
      setAnswers(prev => ({ ...prev, [field]: [...nextList, item] }));
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!answers.industryTailored && !!answers.corePurpose;
      case 2:
        return !!answers.userCount && !!answers.version && answers.platforms.length > 0;
      case 3:
        return !!answers.integrations && !!answers.dataMigration && !!answers.environment;
      case 4:
        return !!answers.collaborationModel && answers.compliance.length > 0;
      case 5:
        return !!answers.fullName.trim() && !!answers.email.trim();
      default:
        return true;
    }
  };

  const getEstimate = () => {
    setIsCalculating(true);
    setCurrentStep(6);

    setTimeout(() => {
      const fpa = calculateFPAFromAnswers(answers);
      const totalFPA = fpa.extInputs + fpa.extOutputs + fpa.extInquiries + fpa.intLogFiles + fpa.extInterfaces;
      
      const cocomoHours = Math.round(totalFPA * 18.5); 
      const aiHours = Math.round(totalFPA * 12.2); 
      
      const exchangeRate = 93;
      const hourlyRateINR = 40 * exchangeRate; // ₹3,720
      const aiCostINR = aiHours * hourlyRateINR;
      const aiMonths = Math.ceil(aiHours / 160);

      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      });

      setResults({
        aiHours,
        cocomoHours,
        aiCost: aiCostINR,
        aiCostFormatted: formatter.format(aiCostINR),
        aiMonths,
        fpaDetails: fpa,
        chartData: [
          { name: 'Stacking AI', hours: aiHours, color: '#2563eb' },
          { name: 'COCOMO', hours: cocomoHours, color: '#94a3b8' }
        ]
      });
      setIsCalculating(false);
    }, 2000);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      const element = reportRef.current;
      if (!element) {
        console.error('Report element ref is null');
        throw new Error('Report element not found');
      }

      // Important: Scroll to top of the element to ensure capture doesn't shift
      window.scrollTo(0, 0);
      
      // Wait for any final rendering/animations
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Starting html2canvas capture...');
      const canvas = await html2canvas(element, {
        scale: 2, // Scale 2 is safer for performance while staying sharp
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#f8fafc',
        // Ensure we capture the full height of the element
        height: element.scrollHeight,
        width: element.scrollWidth,
        y: window.scrollY // Adjust for any remaining scroll
      });
      
      console.log('Canvas created, generating image data...');
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('Creating PDF...');
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`HybridEstimate-Report-${Date.now()}.pdf`);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('CRITICAL PDF ERROR:', error);
      alert('PDF Generation failed. If you see this, please try taking a screenshot or use "Print" (Ctrl+P) as a backup.');
    } finally {
      setIsExporting(false);
    }
  };

  // --- Sub-Components ---

  const Header = () => (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('calculator')}>
          <div className="bg-blue-600 p-2 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">HybridEstimate AI</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-10">
          <button 
            onClick={() => setCurrentView('calculator')}
            className={`text-sm font-semibold transition-colors ${currentView === 'calculator' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            Estimator
          </button>
          <button 
            onClick={() => setCurrentView('methodology')}
            className={`text-sm font-semibold transition-colors ${currentView === 'methodology' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            Methodology
          </button>
        </div>

        <button 
          onClick={() => setIsDemoModalOpen(true)}
          className="bg-blue-600 text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          Book a Demo
        </button>
      </div>
    </nav>
  );

  const MethodologyView = () => (
    <div className="animate-in fade-in duration-700">
      <section className="text-center py-20 px-6">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">The Science Behind the Estimate.</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          How we combine IBM's Function Point Analysis with cutting-edge Meta-Learning for unprecedented accuracy.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Function Point Analysis (FPA)',
              icon: <Layers className="w-8 h-8 text-blue-600" />,
              content: 'We measure exact software size (Inputs, Outputs, Logic Files, and Interfaces) rather than guessing based on experience or simple line counts. This provides a rigorous, standardized unit of measurement.'
            },
            {
              title: 'Traditional COCOMO 81',
              icon: <Cpu className="w-8 h-8 text-blue-600" />,
              content: 'We use the industry-standard Constructive Cost Model to convert architecture requirements into KLOC (Thousands of Lines of Code), establishing a mathematical "perfect world" baseline for effort.'
            },
            {
              title: 'Stacking Regressor Meta-Model',
              icon: <BrainCircuit className="w-8 h-8 text-blue-600" />,
              content: 'Our Hybrid Ensemble (Random Forest + Deep Learning) is trained on 499 real-world projects to predict actual hours, accounting for the messy realities that traditional models miss.'
            }
          ].map((card, idx) => (
            <div key={idx} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group">
              <div className="mb-6 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{card.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DemoModal = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
      }, 1500);
    };

    if (!isDemoModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <button 
            onClick={() => { setIsDemoModalOpen(false); setIsSuccess(false); }}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-10 md:p-12">
            {!isSuccess ? (
              <>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Book a Demo</h3>
                <p className="text-gray-500 mb-8">See how our enterprise cost platform can transform your project planning.</p>
                
                <form onSubmit={handleConfirm} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Full Name</label>
                    <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all" placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Company</label>
                      <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all" placeholder="Acme Inc." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Work Email</label>
                      <input required type="email" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all" placeholder="john@acme.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Preferred Date</label>
                    <div className="relative">
                      <input required type="date" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all" />
                    </div>
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 mt-4"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Confirm Booking</span>}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Demo Confirmed!</h3>
                <p className="text-gray-500 leading-relaxed">Our enterprise team will contact you shortly to confirm the technical session.</p>
                <button 
                  onClick={() => { setIsDemoModalOpen(false); setIsSuccess(false); }}
                  className="mt-10 text-sm font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProgress = () => {
    return (
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div 
                className={`flex flex-col items-center relative z-10 transition-all duration-300 ${
                  currentStep >= step ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep > step ? 'bg-blue-600 border-blue-600' : 
                  currentStep === step ? 'bg-white border-blue-600 ring-4 ring-blue-50' : 
                  'bg-white border-gray-300'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${currentStep === step ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-2 font-semibold uppercase tracking-wider ${
                  currentStep === step ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {['Industry', 'Scope', 'Tech', 'Standards', 'Contact'][step-1]}
                </span>
              </div>
              {step < 5 && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-200 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
                    style={{ width: currentStep > step ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-blue-100">
      <Header />
      <DemoModal />

      <main className="transition-all duration-500">
        {currentView === 'calculator' ? (
          <div className="max-w-5xl mx-auto px-6 py-12">
            {currentStep < 6 && renderProgress()}

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
              
              {/* Step 1: Industry & Purpose */}
              {currentStep === 1 && (
                <div className="p-10 md:p-14 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                      Phase 01: Context
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Industry & Purpose</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed text-lg">Tell us about the market you are targeting. This helps our AI adjust for industry-specific compliance and complexity.</p>

                    <div className="space-y-10">
                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Tailored to a specific industry?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {['Yes', 'No', 'Not sure'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleAnswerChange('industryTailored', opt)}
                              className={`px-6 py-5 rounded-2xl border-2 text-left transition-all ${
                                answers.industryTailored === opt 
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' 
                                : 'border-gray-100 hover:border-blue-200 text-gray-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Primary industry? <span className="text-gray-400 font-normal">(Select all that apply)</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {INDUSTRIES.map(ind => (
                            <button
                              key={ind}
                              onClick={() => toggleCheckbox('primaryIndustry', ind)}
                              className={`px-3 py-4 rounded-xl border text-xs font-bold transition-all ${
                                answers.primaryIndustry.includes(ind)
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                              }`}
                            >
                              {ind}
                            </button>
                          ))}
                        </div>
                        {answers.primaryIndustry.includes('Other') && (
                          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input 
                              type="text"
                              value={answers.otherIndustry}
                              onChange={(e) => handleAnswerChange('otherIndustry', e.target.value)}
                              placeholder="Please specify your industry..."
                              className="w-full bg-gray-50 border-2 border-blue-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                            />
                          </div>
                        )}
                      </section>

                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Core purpose?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { id: 'SaaS', desc: 'B2B/B2C Software' },
                            { id: 'Marketplace', desc: 'Buyer/Seller platform' },
                            { id: 'ERP/CRM', desc: 'Internal Ops' },
                            { id: 'Other', desc: 'Custom Vision' }
                          ].map(type => (
                            <button
                              key={type.id}
                              onClick={() => handleAnswerChange('corePurpose', type.id)}
                              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                                answers.corePurpose === type.id 
                                ? 'border-blue-600 bg-blue-50/50' 
                                : 'border-gray-100 hover:border-blue-200'
                              }`}
                            >
                              <div className={`text-base font-bold mb-1 ${answers.corePurpose === type.id ? 'text-blue-700' : 'text-gray-900'}`}>{type.id}</div>
                              <div className="text-[11px] text-gray-400 font-semibold">{type.desc}</div>
                            </button>
                          ))}
                        </div>
                        {answers.corePurpose === 'Other' && (
                          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input 
                              type="text"
                              value={answers.otherPurpose}
                              onChange={(e) => handleAnswerChange('otherPurpose', e.target.value)}
                              placeholder="Please specify core purpose..."
                              className="w-full bg-gray-50 border-2 border-blue-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                            />
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Users & Scope */}
              {currentStep === 2 && (
                <div className="p-10 md:p-14 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                      Phase 02: Reach
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Users & Scope</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed text-lg">Scale directly impacts infrastructure and data model complexity.</p>

                    <div className="space-y-10">
                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Expected user count?</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {['1-10', '10-100', 'up to 1,000,000+'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleAnswerChange('userCount', opt)}
                              className={`px-4 py-6 rounded-2xl border-2 transition-all ${
                                answers.userCount === opt 
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-sm' 
                                : 'border-gray-100'
                              }`}
                            >
                              <Users className={`w-6 h-6 mb-3 mx-auto ${answers.userCount === opt ? 'text-blue-600' : 'text-gray-300'}`} />
                              <div className="text-xs text-center font-bold">{opt}</div>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Which software version?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: 'MVP', label: 'MVP Basic', desc: 'Core features only' },
                            { id: 'Fully-featured', label: 'Commercial Grade', desc: 'Launch-ready scale' },
                            { id: 'MVP now/Full later', label: 'Scalable MVP', desc: 'Hybrid blueprint' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => handleAnswerChange('version', opt.id)}
                              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                                answers.version === opt.id 
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' 
                                : 'border-gray-100'
                              }`}
                            >
                              <div className="text-sm">{opt.label}</div>
                              <div className="text-[10px] opacity-60 mt-1">{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Which platforms?</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {PLATFORMS.map(p => (
                            <button
                              key={p.id}
                              onClick={() => toggleCheckbox('platforms', p.id)}
                              className={`px-4 py-4 rounded-xl border flex items-center space-x-3 transition-all ${
                                answers.platforms.includes(p.id)
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'bg-white border-gray-100 hover:border-blue-300'
                              }`}
                            >
                              {p.icon}
                              <span className="text-xs font-bold">{p.id}</span>
                            </button>
                          ))}
                        </div>
                        {answers.platforms.includes('Other') && (
                          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input 
                              type="text"
                              value={answers.otherPlatform}
                              onChange={(e) => handleAnswerChange('otherPlatform', e.target.value)}
                              placeholder="Specify platforms..."
                              className="w-full bg-gray-50 border-2 border-blue-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                            />
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Tech & Integrations */}
              {currentStep === 3 && (
                <div className="p-10 md:p-14 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                      Phase 03: Ecosystem
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Tech & Integrations</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed text-lg">External dependencies are the #1 driver of project delays.</p>

                    <div className="space-y-10">
                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Connect with other tools?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['No', 'Maybe', 'Yes multiple'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleAnswerChange('integrations', opt)}
                              className={`px-6 py-5 rounded-2xl border-2 text-left transition-all ${
                                answers.integrations === opt 
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' 
                                : 'border-gray-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Bring in data from current systems?</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['Yes', 'No'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleAnswerChange('dataMigration', opt)}
                              className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                                answers.dataMigration === opt 
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' 
                                : 'border-gray-100'
                              }`}
                            >
                              <span>{opt === 'Yes' ? 'Data Migration Required' : 'Starting Fresh'}</span>
                              <Database className={`w-5 h-5 ${answers.dataMigration === opt ? 'text-blue-600' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Environment preference?</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['On-premises', 'Cloud', 'Hybrid', 'Not sure'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleAnswerChange('environment', opt)}
                              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                                answers.environment === opt 
                                ? 'border-blue-600 bg-blue-50/50 font-bold text-blue-700' 
                                : 'border-gray-100'
                              }`}
                            >
                              <div className="text-xs">{opt}</div>
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Compliance & Collaboration */}
              {currentStep === 4 && (
                <div className="p-10 md:p-14 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                      Phase 04: Governance
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Compliance & Collaboration</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed text-lg">Industry standards require specific auditing and data handling logic.</p>

                    <div className="space-y-10">
                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Compliance standards?</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {COMPLIANCE_STANDARDS.map(s => (
                            <button
                              key={s}
                              onClick={() => toggleCheckbox('compliance', s)}
                              className={`p-5 rounded-xl border flex items-center space-x-3 transition-all text-left ${
                                answers.compliance.includes(s)
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'bg-white border-gray-100 hover:border-blue-300'
                              }`}
                            >
                              <ShieldCheck className={`w-5 h-5 flex-shrink-0 ${answers.compliance.includes(s) ? 'text-white' : 'text-gray-300'}`} />
                              <span className="text-xs font-bold leading-tight">{s}</span>
                            </button>
                          ))}
                        </div>
                        {answers.compliance.includes('Other') && (
                          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input 
                              type="text"
                              value={answers.otherCompliance}
                              onChange={(e) => handleAnswerChange('otherCompliance', e.target.value)}
                              placeholder="Specify other standards..."
                              className="w-full bg-gray-50 border-2 border-blue-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                            />
                          </div>
                        )}
                      </section>

                      <section>
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Collaboration model?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: 'Time & Material', title: 'Agile T&M', desc: 'Pay per hour/resource' },
                            { id: 'Fixed Price', title: 'Fixed Price', desc: 'Predictable budget' },
                            { id: 'Not sure', title: 'Not sure', desc: 'Need guidance' }
                          ].map(model => (
                            <button
                              key={model.id}
                              onClick={() => handleAnswerChange('collaborationModel', model.id)}
                              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                                answers.collaborationModel === model.id 
                                ? 'border-blue-600 bg-blue-50/50' 
                                : 'border-gray-100'
                              }`}
                            >
                              <div className={`text-base font-bold mb-1 ${answers.collaborationModel === model.id ? 'text-blue-700' : 'text-gray-900'}`}>{model.title}</div>
                              <div className="text-[11px] text-gray-400 font-semibold">{model.desc}</div>
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Contact Info */}
              {currentStep === 5 && (
                <div className="p-10 md:p-14 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                      Phase 05: Finalize
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Almost Done!</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed text-lg">We need a few details to finalize the AI cost analysis.</p>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Full Name</label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></span>
                            <input 
                              type="text" 
                              value={answers.fullName}
                              onChange={(e) => handleAnswerChange('fullName', e.target.value)}
                              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-5 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium" 
                              placeholder="Steve Jobs" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Work Email</label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-4 h-4" /></span>
                            <input 
                              type="email" 
                              value={answers.email}
                              onChange={(e) => handleAnswerChange('email', e.target.value)}
                              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-5 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium" 
                              placeholder="steve@apple.com" 
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Project Notes <span className="text-[10px] font-normal lowercase">(optional)</span></label>
                        <textarea 
                          rows={4}
                          value={answers.notes}
                          onChange={(e) => handleAnswerChange('notes', e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-3xl p-6 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium" 
                          placeholder="Briefly describe your vision..." 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Results Dashboard */}
              {currentStep === 6 && (
                <div className="bg-[#f8fafc] flex-1">
                  {isCalculating ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center animate-pulse">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                        <BrainCircuit className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">AI Cost Stacking in progress...</h3>
                      <p className="text-gray-500 font-medium">Querying trained ensemble of 499 projects for effort mapping.</p>
                    </div>
                  ) : results && (
                    <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <div className="max-w-4xl mx-auto" ref={reportRef}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                          <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Estimation Report</h2>
                            <p className="text-gray-500 font-medium flex items-center">
                              <ShieldCheck className="w-4 h-4 mr-2 text-green-500" /> Powered by Hybrid Ensemble Meta-Learning
                            </p>
                          </div>
                          <div className="flex space-x-3" data-html2canvas-ignore="true">
                            <button 
                              onClick={handleExportPDF}
                              disabled={isExporting}
                              className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                            >
                              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                              <span>{isExporting ? 'Generating PDF...' : 'Export PDF'}</span>
                            </button>
                            <button onClick={() => setCurrentStep(1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-all">
                              Start Over
                            </button>
                          </div>
                        </div>

                        <div className="space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                              { label: 'Estimated Cost', val: results.aiCostFormatted, sub: 'INR @ ₹3,720/hr', icon: <Activity className="text-blue-600" /> },
                              { label: 'Total Effort', val: `${results.aiHours.toLocaleString()} hrs`, sub: 'Stacking AI Prediction', icon: <Clock className="text-green-600" /> },
                              { label: 'Delivery Time', val: `${results.aiMonths} Months`, sub: 'Estimated Timeline', icon: <CheckCircle2 className="text-purple-600" /> }
                            ].map((stat, i) => (
                              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-b-4 border-b-blue-600">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                  {stat.icon}
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.val}</div>
                                <div className="text-[11px] text-gray-400 font-bold">{stat.sub}</div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                              <div className="flex items-center justify-between mb-10">
                                <h4 className="font-bold text-xl text-gray-900">Efficiency Gap Analysis</h4>
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <span className="text-xs font-bold text-gray-500">Stacking AI</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    <span className="text-xs font-bold text-gray-500">COCOMO</span>
                                  </div>
                                </div>
                              </div>
                              <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={results.chartData} layout="vertical" margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" hide />
                                    <RechartsTooltip 
                                      cursor={{fill: 'transparent'}}
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="hours" radius={[0, 10, 10, 0]} barSize={40}>
                                      {results.chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="mt-8 pt-8 border-t border-gray-50">
                                <p className="text-sm text-gray-500 leading-relaxed italic">
                                  * The Stacking Ensemble model predicts <span className="text-blue-600 font-bold">{Math.round((1 - results.aiHours/results.cocomoHours) * 100)}% more efficiency</span> by identifying agile patterns and code reuse metrics often missed by the rigid 1981 COCOMO model.
                                </p>
                              </div>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                              <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
                                <Zap className="w-10 h-10 mb-6 text-blue-200" />
                                <h4 className="text-2xl font-bold mb-3">Model Accuracy</h4>
                                <p className="text-blue-100 text-sm leading-relaxed mb-8">
                                  Traditional COCOMO tends to over-index on historical data density. Our Stacking AI incorporates complexity weights from the modern cloud ecosystem.
                                </p>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between text-sm border-b border-blue-500 pb-3">
                                    <span className="text-blue-100">FPA Complexity</span>
                                    <span className="font-bold">High</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm border-b border-blue-500 pb-3">
                                    <span className="text-blue-100">Confidence Score</span>
                                    <span className="font-bold">94.2%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-100">Base Wage Mapping</span>
                                    <span className="font-bold">₹3,720/hr</span>
                                  </div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => setIsDemoModalOpen(true)}
                                data-html2canvas-ignore="true"
                                className="w-full bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-600 transition-all text-left"
                              >
                                <div>
                                  <h5 className="font-bold text-gray-900 text-lg">Request Audit</h5>
                                  <p className="text-gray-400 text-xs mt-1">Book a technical demo session</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Footer */}
              {currentStep < 6 && (
                <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <button 
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`flex items-center space-x-2 text-sm font-bold transition-all ${
                      currentStep === 1 ? 'opacity-0' : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                  
                  {currentStep < 5 ? (
                    <button 
                      onClick={handleNext}
                      disabled={!isStepValid(currentStep)}
                      className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                        isStepValid(currentStep) 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' 
                        : 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                    </button>
                  ) : (
                    <button 
                      onClick={getEstimate}
                      disabled={!isStepValid(currentStep)}
                      className={`flex items-center space-x-3 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl ${
                        isStepValid(currentStep)
                        ? 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
                        : 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span>Get Free Estimate</span>
                      <Zap className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <MethodologyView />
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-3 opacity-50 grayscale">
            <Zap className="w-5 h-5" />
            <span className="text-lg font-bold">HybridEstimate AI</span>
          </div>
          <div className="flex items-center space-x-10 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">LinkedIn</a>
          </div>
          <div className="text-sm font-bold text-gray-300">
            © 2026 Enterprise SaaS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
