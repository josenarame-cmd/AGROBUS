import { useState } from 'react';
import { Smartphone, RotateCcw, Phone, ChevronRight } from 'lucide-react';

interface Screen {
  title: string;
  content: string[];
  options: { key: string; label: string; next: string }[];
  input?: boolean;
  inputLabel?: string;
}

const screens: Record<string, Screen> = {
  home: {
    title: 'AGROBUS',
    content: ['Welcome to AGROBUS', 'Agricultural Input Credit Platform', ''],
    options: [
      { key: '1', label: 'Apply for Loan', next: 'apply_crop' },
      { key: '2', label: 'Check Loan Status', next: 'check_status' },
      { key: '3', label: 'Make Repayment', next: 'repayment' },
      { key: '4', label: 'My Account', next: 'account' },
      { key: '5', label: 'Help', next: 'help' },
    ],
  },
  apply_crop: {
    title: 'APPLY FOR LOAN',
    content: ['Select your crop type:'],
    options: [
      { key: '1', label: 'Maize', next: 'apply_inputs' },
      { key: '2', label: 'Rice', next: 'apply_inputs' },
      { key: '3', label: 'Beans', next: 'apply_inputs' },
      { key: '4', label: 'Potatoes', next: 'apply_inputs' },
      { key: '5', label: 'Coffee', next: 'apply_inputs' },
      { key: '0', label: 'Back', next: 'home' },
    ],
  },
  apply_inputs: {
    title: 'SELECT INPUTS',
    content: ['Select required inputs:'],
    options: [
      { key: '1', label: 'Seeds only', next: 'apply_size' },
      { key: '2', label: 'Fertilizer only', next: 'apply_size' },
      { key: '3', label: 'Seeds + Fertilizer', next: 'apply_size' },
      { key: '4', label: 'Full package (Seeds + Fertilizer + Pesticide)', next: 'apply_size' },
      { key: '0', label: 'Back', next: 'apply_crop' },
    ],
  },
  apply_size: {
    title: 'FARM SIZE',
    content: ['Enter your farm size in hectares:'],
    options: [{ key: '0', label: 'Back', next: 'apply_inputs' }],
    input: true,
    inputLabel: 'Farm size (ha)',
  },
  apply_confirm: {
    title: 'CONFIRM APPLICATION',
    content: [
      'Loan Application Summary:',
      '------------------------',
      'Crop: Maize',
      'Inputs: Full package',
      'Farm Size: 2.5 ha',
      'Est. Cost: 450,000 RWF',
      'Season: Season B 2026',
      '',
      'Confirm application?',
    ],
    options: [
      { key: '1', label: 'Yes, Submit', next: 'apply_success' },
      { key: '2', label: 'Cancel', next: 'home' },
    ],
  },
  apply_success: {
    title: 'SUCCESS',
    content: [
      '✓ Application Submitted!',
      '',
      'Ref: AGR-2026-0847',
      'Amount: 450,000 RWF',
      '',
      'You will receive an SMS',
      'when your application',
      'is reviewed.',
      '',
      'Thank you for using',
      'AGROBUS!',
    ],
    options: [{ key: '0', label: 'Main Menu', next: 'home' }],
  },
  check_status: {
    title: 'LOAN STATUS',
    content: [
      'Your Active Loans:',
      '------------------------',
      '1. Loan #AGR-0834',
      '   Status: APPROVED ✓',
      '   Amount: 320,000 RWF',
      '   Balance: 180,000 RWF',
      '',
      '2. Loan #AGR-0791',
      '   Status: REPAID ✓',
      '   Amount: 250,000 RWF',
    ],
    options: [
      { key: '1', label: 'View Details', next: 'loan_detail' },
      { key: '0', label: 'Back', next: 'home' },
    ],
  },
  loan_detail: {
    title: 'LOAN DETAIL',
    content: [
      'Loan #AGR-0834',
      '------------------------',
      'Crop: Maize',
      'Inputs: Seeds + Fertilizer',
      'Applied: 15/03/2026',
      'Approved: 18/03/2026',
      'Amount: 320,000 RWF',
      'Repaid: 140,000 RWF',
      'Balance: 180,000 RWF',
      'Due: 30/08/2026',
      '',
      'Progress: [██████░░░░] 44%',
    ],
    options: [{ key: '0', label: 'Back', next: 'check_status' }],
  },
  repayment: {
    title: 'REPAYMENT',
    content: [
      'Select loan to repay:',
      '',
      '1. #AGR-0834',
      '   Balance: 180,000 RWF',
    ],
    options: [
      { key: '1', label: 'Repay Loan #AGR-0834', next: 'repay_amount' },
      { key: '0', label: 'Back', next: 'home' },
    ],
  },
  repay_amount: {
    title: 'ENTER AMOUNT',
    content: ['Balance: 180,000 RWF', '', 'Enter amount to pay:'],
    options: [{ key: '0', label: 'Back', next: 'repayment' }],
    input: true,
    inputLabel: 'Amount (RWF)',
  },
  repay_confirm: {
    title: 'CONFIRM PAYMENT',
    content: [
      'Payment Details:',
      '------------------------',
      'Loan: #AGR-0834',
      'Amount: 50,000 RWF',
      'Method: Mobile Money',
      'Phone: *78*123*456#',
      '',
      'Confirm payment?',
    ],
    options: [
      { key: '1', label: 'Yes, Pay Now', next: 'repay_success' },
      { key: '2', label: 'Cancel', next: 'home' },
    ],
  },
  repay_success: {
    title: 'PAYMENT SUCCESS',
    content: [
      '✓ Payment Received!',
      '',
      'Amount: 50,000 RWF',
      'New Balance: 130,000 RWF',
      'Ref: PAY-2026-3421',
      '',
      'Thank you for your',
      'payment!',
    ],
    options: [{ key: '0', label: 'Main Menu', next: 'home' }],
  },
  account: {
    title: 'MY ACCOUNT',
    content: [
      'Farmer Profile:',
      '------------------------',
      'Name: Jean Mugabo',
      'ID: 1199880012345678',
      'Phone: 0781234567',
      'District: Musanze',
      'Credit Score: 720/1000',
      '',
      'Status: ACTIVE ✓',
    ],
    options: [{ key: '0', label: 'Back', next: 'home' }],
  },
  help: {
    title: 'HELP',
    content: [
      'AGROBUS Help Center',
      '------------------------',
      'Call: 3030 (Toll-free)',
      'SMS: Send HELP to 3030',
      '',
      'Visit your nearest',
      'AGROBUS agent for',
      'assistance.',
      '',
      'Operating Hours:',
      'Mon-Fri: 7AM - 6PM',
      'Sat: 8AM - 1PM',
    ],
    options: [{ key: '0', label: 'Back', next: 'home' }],
  },
};

export default function USSDPage() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [history, setHistory] = useState<string[]>(['home']);
  const [inputValue, setInputValue] = useState('');
  const [dialCode, setDialCode] = useState('*182#');

  const screen = screens[currentScreen];

  const handleOption = (next: string) => {
    setCurrentScreen(next);
    setHistory(prev => [...prev, next]);
    setInputValue('');
  };

  const handleInput = () => {
    if (!inputValue) return;
    if (currentScreen === 'apply_size') {
      handleOption('apply_confirm');
    } else if (currentScreen === 'repay_amount') {
      handleOption('repay_confirm');
    }
  };

  const reset = () => {
    setCurrentScreen('home');
    setHistory(['home']);
    setInputValue('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">USSD Simulator</h1>
        <p className="text-sm text-gray-500 mt-1">Experience the farmer's USSD journey — dial <span className="font-mono font-bold text-green-600">*182#</span></p>
      </div>

      <div className="max-w-sm mx-auto">
        {/* Phone frame */}
        <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-black/30">
          {/* Notch */}
          <div className="flex justify-center mb-1">
            <div className="w-32 h-6 bg-black rounded-full" />
          </div>

          {/* Screen */}
          <div className="ussd-screen rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-900/30">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-xs opacity-70">{dialCode}</span>
              </div>
              <span className="text-xs opacity-70">AGROBUS USSD</span>
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold tracking-wider">{screen.title}</h2>
              <div className="w-20 h-0.5 bg-green-500/30 mx-auto mt-1" />
            </div>

            {/* Content */}
            <div className="mb-4 space-y-0.5 min-h-[180px]">
              {screen.content.map((line, i) => (
                <p key={i} className={`text-sm ${line.startsWith('✓') ? 'text-green-400 font-bold' : line.includes('---') ? 'opacity-30' : ''}`}>
                  {line || '\u00A0'}
                </p>
              ))}
            </div>

            {/* Options */}
            <div className="space-y-1.5 mb-4">
              {screen.options.map(opt => (
                <button key={opt.key} onClick={() => handleOption(opt.next)}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-green-900/20 transition-colors flex items-center justify-between group text-sm">
                  <span><span className="text-green-400 font-bold mr-2">{opt.key}.</span>{opt.label}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Input field */}
            {screen.input && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInput()}
                  placeholder={screen.inputLabel}
                  className="flex-1 bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2 text-sm text-green-400 placeholder:text-green-800 focus:outline-none focus:border-green-500/50"
                />
                <button onClick={handleInput} className="px-4 py-2 bg-green-700/30 rounded-lg text-sm hover:bg-green-700/50 transition-colors">
                  Send
                </button>
              </div>
            )}

            {/* Navigation breadcrumb */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-900/30">
              <span className="text-[10px] opacity-40">
                {history.map((h, i) => screens[h]?.title).slice(-3).join(' > ')}
              </span>
              <button onClick={reset} className="flex items-center gap-1 text-[10px] opacity-50 hover:opacity-100 transition-opacity">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Home button */}
          <div className="flex justify-center mt-3">
            <div className="w-10 h-10 rounded-full border-2 border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors" onClick={reset}>
              <div className="w-4 h-4 rounded-sm border-2 border-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3">How USSD Works for Farmers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { step: '1', title: 'Dial *182#', desc: 'Farmer dials USSD code on any phone' },
            { step: '2', title: 'Select Option', desc: 'Navigate menu to apply for inputs' },
            { step: '3', title: 'Submit Request', desc: 'Complete loan application via USSD' },
            { step: '4', title: 'Get Inputs', desc: 'Receive farming inputs from agent' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 gradient-green rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{item.step}</div>
              <div><p className="font-semibold text-gray-900">{item.title}</p><p className="text-gray-500 text-xs">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
