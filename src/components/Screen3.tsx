import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Download, X, Upload, Check, ChevronLeft, Save, Trash2, AlertTriangle, FileText, Sigma, Superscript, Subscript, Calendar, Mail, ChevronRight, HelpCircle, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    MathJax?: any;
  }
}

// Define the props type for Screen3
interface Screen3Props {
  questions: any[];
  setQuestions: React.Dispatch<React.SetStateAction<any[]>>;
  numberOfQuestions: number;
  setNumberOfQuestions: React.Dispatch<React.SetStateAction<number>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  questionAdjustTimeout: any;
  setQuestionAdjustTimeout: React.Dispatch<React.SetStateAction<any>>;
  adjustQuestions: (newCount: number) => void;
  updateQuestion: (questionId: number, field: string, value: any) => void;
  updateOption: (questionId: number, optionId: number, field: string, value: any) => void;
  addOption: (questionId: number) => void;
  removeOption: (questionId: number, optionId: number) => void;
  handleImageUpload: (questionId: number, file: File) => void;
  removeImage: (questionId: number) => void;
  deleteQuestion: (questionId: number) => void;
  saveSession: () => void;
  showFlushDialog: boolean;
  setShowFlushDialog: React.Dispatch<React.SetStateAction<boolean>>;
  flushData: () => void;
  activeFormatting: 'none' | 'superscript' | 'subscript';
  setActiveFormatting: React.Dispatch<React.SetStateAction<'none' | 'superscript' | 'subscript'>>;
  currentSymbolPage: number;
  setCurrentSymbolPage: React.Dispatch<React.SetStateAction<number>>;
  insertMathSymbol: (questionId: number, symbol: string, cursorPos?: number) => void;
  handleQuestionTextChange: (questionId: number, value: string, previousValue: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toggleFormatting: (format: 'superscript' | 'subscript') => void;
  renderMathPreview: (text: string) => string;
  getPageTitle: () => string;
  getCurrentSymbols: () => any[];
  optionFormatting: { [optionId: number]: 'none' | 'superscript' | 'subscript' };
  setOptionFormatting: React.Dispatch<React.SetStateAction<{ [optionId: number]: 'none' | 'superscript' | 'subscript' }>>;
  optionSymbolPage: { [optionId: number]: number };
  setOptionSymbolPage: React.Dispatch<React.SetStateAction<{ [optionId: number]: number }>>;
  mostFrequentSymbols: any[];
  frequentSymbols: any[];
  rarelyUsedSymbols: any[];
  showReminderDialog: boolean;
  setShowReminderDialog: React.Dispatch<React.SetStateAction<boolean>>;
  reminderDate: string;
  setReminderDate: React.Dispatch<React.SetStateAction<string>>;
  reminderTime: string;
  setReminderTime: React.Dispatch<React.SetStateAction<string>>;
  reminderEmail: string;
  setReminderEmail: React.Dispatch<React.SetStateAction<string>>;
  handleReminderSubmit: (sendReminder: boolean) => void;
  metadata: any;
  setCurrentScreen: React.Dispatch<React.SetStateAction<number>>;
  toast: any;
}

const Screen3: React.FC<Screen3Props> = (props) => {
  const {
    questions,
    setQuestions,
    numberOfQuestions,
    setNumberOfQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questionAdjustTimeout,
    setQuestionAdjustTimeout,
    adjustQuestions,
    updateQuestion,
    updateOption,
    addOption,
    removeOption,
    handleImageUpload,
    removeImage,
    deleteQuestion,
    saveSession,
    showFlushDialog,
    setShowFlushDialog,
    flushData,
    activeFormatting,
    setActiveFormatting,
    currentSymbolPage,
    setCurrentSymbolPage,
    insertMathSymbol,
    handleQuestionTextChange,
    toggleFormatting,
    renderMathPreview,
    getPageTitle,
    getCurrentSymbols,
    optionFormatting,
    setOptionFormatting,
    optionSymbolPage,
    setOptionSymbolPage,
    mostFrequentSymbols,
    frequentSymbols,
    rarelyUsedSymbols,
    showReminderDialog,
    setShowReminderDialog,
    reminderDate,
    setReminderDate,
    reminderTime,
    setReminderTime,
    reminderEmail,
    setReminderEmail,
    handleReminderSubmit,
    metadata,
    setCurrentScreen,
    toast,
  } = props;
  const currentQuestion = questions[currentQuestionIndex];

  // Matrix dialog state
  const [showMatrixDialog, setShowMatrixDialog] = useState(false);
  const [matrixRows, setMatrixRows] = useState(2);
  const [matrixCols, setMatrixCols] = useState(2);
  const [matrixElements, setMatrixElements] = useState<string[][]>([['', ''], ['', '']]);
  const [matrixTargetId, setMatrixTargetId] = useState<number | null>(null);
  const [matrixInsertPos, setMatrixInsertPos] = useState<number | null>(null);

  // Add state for showing each dialog and their input fields
  const [showFractionDialog, setShowFractionDialog] = useState(false);
  const [fractionNumerator, setFractionNumerator] = useState('');
  const [fractionDenominator, setFractionDenominator] = useState('');
  const [showBinomialDialog, setShowBinomialDialog] = useState(false);
  const [binomialN, setBinomialN] = useState('');
  const [binomialK, setBinomialK] = useState('');
  const [showIntegralDialog, setShowIntegralDialog] = useState(false);
  const [integralLower, setIntegralLower] = useState('');
  const [integralUpper, setIntegralUpper] = useState('');
  const [integralFunction, setIntegralFunction] = useState('');
  const [integralVariable, setIntegralVariable] = useState('x');
  const [showDoubleIntegralDialog, setShowDoubleIntegralDialog] = useState(false);
  const [doubleIntegralLower, setDoubleIntegralLower] = useState('');
  const [doubleIntegralUpper, setDoubleIntegralUpper] = useState('');
  const [doubleIntegralFunction, setDoubleIntegralFunction] = useState('');
  const [doubleIntegralVariable, setDoubleIntegralVariable] = useState('x, y');
  const [showSummationDialog, setShowSummationDialog] = useState(false);
  const [summationIndex, setSummationIndex] = useState('k');
  const [summationLower, setSummationLower] = useState('0');
  const [summationUpper, setSummationUpper] = useState('n');
  const [summationFunction, setSummationFunction] = useState('');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitVariable, setLimitVariable] = useState('x');
  const [limitApproaches, setLimitApproaches] = useState('0');
  const [limitFunction, setLimitFunction] = useState('');
  const [showRootDialog, setShowRootDialog] = useState(false);
  const [rootDegree, setRootDegree] = useState('n');
  const [rootRadicand, setRootRadicand] = useState('x');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productIndex, setProductIndex] = useState('i');
  const [productLower, setProductLower] = useState('1');
  const [productUpper, setProductUpper] = useState('n');
  const [productFunction, setProductFunction] = useState('');

  // Open matrix dialog and store cursor position
  const openMatrixDialog = (questionId: number) => {
    setMatrixRows(2);
    setMatrixCols(2);
    setMatrixElements([['', ''], ['', '']]);
    setMatrixTargetId(questionId);
    // Get cursor position
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowMatrixDialog(true);
  };

  // Update matrix size and elements
  const handleMatrixSizeChange = (rows: number, cols: number) => {
    setMatrixRows(rows);
    setMatrixCols(cols);
    setMatrixElements(prev => {
      const newArr = Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => (prev[i] && prev[i][j]) ? prev[i][j] : '')
      );
      return newArr;
    });
  };

  // Insert matrix into question at cursor as LaTeX (double backslashes for row separation)
  const handleMatrixInsert = () => {
    if (matrixTargetId == null) return;
    // Build LaTeX matrix with double backslashes for row separation
    const latex =
      '\n' +
      '\\[\n' +
      '\\begin{bmatrix}\n'  + 
      matrixElements.map(row => row.join(' & ')).join(' \\\\\\ ') +
      '\n\\end{bmatrix}\n' +
      '\\]\n';
    const q = questions.find(q => q.id === matrixTargetId);
    if (!q) return;
    let newValue = q.question;
    if (matrixInsertPos != null) {
      newValue =
        q.question.slice(0, matrixInsertPos) +
        latex +
        q.question.slice(matrixInsertPos);
    } else {
      newValue = q.question + latex;
    }
    updateQuestion(matrixTargetId, 'question', newValue);
    setShowMatrixDialog(false);
  };

  // Add this function near the top of the component
  function normalizeLatexInput(latex) {
    // Replace quadruple backslashes with double, then double with single
    return latex.replace(/\\\\\\\\/g, '\\\\').replace(/\\\\/g, '\\');
  }

  // 1. Mobile sidebar (question circles)
  const mobileSidebar = (
    <div className="md:hidden col-span-1">
      <Card className="shadow-lg border-0 mb-4">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg py-2">
          <CardTitle className="text-sm">Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="space-y-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="num-questions" className="text-xs">Total:</Label>
                <Input
                  id="num-questions"
                  type="number"
                  min="1"
                  max="500"
                  value={numberOfQuestions}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 1;
                    setNumberOfQuestions(newValue);
                    // Debounce the actual adjustment
                    if (questionAdjustTimeout) {
                      clearTimeout(questionAdjustTimeout);
                    }
                    const timeout = setTimeout(() => {
                      adjustQuestions(newValue);
                    }, 500);
                    setQuestionAdjustTimeout(timeout);
                  }}
                  className="w-16 h-6 text-xs"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newValue = Math.max(1, numberOfQuestions - 1);
                      setNumberOfQuestions(newValue);
                      adjustQuestions(newValue);
                    }}
                    className="h-6 w-6 p-0 text-xs"
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newValue = Math.min(500, numberOfQuestions + 1);
                      setNumberOfQuestions(newValue);
                      adjustQuestions(newValue);
                    }}
                    className="h-6 w-6 p-0 text-xs"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">1</span>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={numberOfQuestions}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    setNumberOfQuestions(newValue);
                    adjustQuestions(newValue);
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-600">500</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-4 gap-1">
              {Array.from({ length: numberOfQuestions }, (_, i) => {
                const question = questions[i];
                const difficulty = question?.difficulty || 'MEDIUM';
                const difficultyLabel = difficulty === 'LOW' ? 'E' : difficulty === 'MEDIUM' ? 'M' : 'H';
                let diffBg = 'bg-yellow-200';
                let diffText = 'text-yellow-900';
                if (difficulty === 'LOW') { diffBg = 'bg-green-200'; diffText = 'text-green-900'; }
                if (difficulty === 'HIGH') { diffBg = 'bg-red-200'; diffText = 'text-red-900'; }
                return (
                  <div key={i} className="relative">
                    <Button
                      variant={currentQuestionIndex === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`w-8 h-8 md:w-7 md:h-7 rounded-full text-xs p-0 relative ${diffBg} ${diffText}`}
                    >
                      {i + 1}
                    </Button>
                    <span className="absolute top-0 left-0 text-[8px] font-bold bg-gray-200 text-gray-700 rounded-full w-3 h-3 flex items-center justify-center">
                      {difficultyLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 2. Main content (question editor)
  const mainContent = (
    <div className="col-span-1 md:col-span-4">
      {currentQuestion && (
        <Card className="shadow-lg border-0 h-full">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Question {currentQuestionIndex + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteQuestion(currentQuestion.id)}
                className="text-white hover:text-red-200 hover:bg-red-600/20 h-8 w-8 p-0"
                title="Delete this question"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2 overflow-y-auto">
            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label htmlFor={`question-${currentQuestion.id}`} className="text-sm">
                  Question Text <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id={`question-textarea-${currentQuestion.id}`}
                    value={currentQuestion.question}
                    onChange={(e) => handleQuestionTextChange(currentQuestion.id, e.target.value, currentQuestion.question, e)}
                    placeholder="Enter your question..."
                    className={`min-h-[120px] text-sm pr-32 ${currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 hover:bg-gray-100 ${activeFormatting === 'superscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => toggleFormatting('superscript')}
                        title="Toggle superscript mode"
                      >
                        <Superscript className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 hover:bg-gray-100 ${activeFormatting === 'subscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => toggleFormatting('subscript')}
                        title="Toggle subscript mode"
                      >
                        <Subscript className="h-3 w-3" />
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            type="button"
                          >
                            <Sigma className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 max-h-96 overflow-y-auto">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{getPageTitle()}</h4>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setCurrentSymbolPage(Math.max(1, currentSymbolPage - 1))}
                                  disabled={currentSymbolPage === 1}
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="text-xs text-gray-600">
                                  {currentSymbolPage}/3
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setCurrentSymbolPage(Math.min(3, currentSymbolPage + 1))}
                                  disabled={currentSymbolPage === 3}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-8 gap-1">
                              {getCurrentSymbols().map((item, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-sm hover:bg-blue-50"
                                  onClick={() => {
                                    const textarea = document.getElementById(`question-textarea-${currentQuestion.id}`) as HTMLTextAreaElement;
                                    const cursorPos = textarea ? textarea.selectionStart : undefined;
                                    insertMathSymbol(currentQuestion.id, item.symbol, cursorPos);
                                  }}
                                  title={item.name}
                                >
                                  {item.symbol}
                                </Button>
                              ))}
                            </div>
                            {activeFormatting !== 'none' && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-blue-600">
                                  {activeFormatting === 'superscript' ? 'Superscript mode active' : 'Subscript mode active'} - symbols will be formatted automatically
                                </p>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Popover>
  <PopoverTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-16 p-0 hover:bg-gray-100 mt-2"
      type="button"
      title="Insert mathematical construct"
    >
      Maths 🧰
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-44 p-2 space-y-1">
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openMatrixDialog(currentQuestion.id)}>Matrix</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openFractionDialog(currentQuestion.id)}>Fraction</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openBinomialDialog(currentQuestion.id)}>Binomial</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openIntegralDialog(currentQuestion.id)}>Integral</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openDoubleIntegralDialog(currentQuestion.id)}>Double Integral</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openSummationDialog(currentQuestion.id)}>Summation</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openLimitDialog(currentQuestion.id)}>Limit</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openRootDialog(currentQuestion.id)}>Root</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openProductDialog(currentQuestion.id)}>Product</Button>
  </PopoverContent>
</Popover>

                  </div>
                </div>
                {currentQuestion.question.trim() === '' && (
                  <p className="text-red-500 text-xs mt-1">Question is required</p>
                )}
                {currentQuestion.question && (currentQuestion.question.includes('^{') || currentQuestion.question.includes('_{') || /\n([\w\W]*?)\n/.test(currentQuestion.question)) && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded-lg">
                    <Label className="text-xs text-gray-600">Preview:</Label>
                    <div
                      className="text-sm mt-1"
                      ref={el => {
                        if (el) {
                          el.textContent = normalizeLatexInput(currentQuestion.question);
                          if (window.MathJax && window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise([el]);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div>
                  <Label htmlFor={`difficulty-${currentQuestion.id}`} className="text-xs">Difficulty</Label>
                  <Select 
                    value={currentQuestion.difficulty} 
                    onValueChange={(value) => updateQuestion(currentQuestion.id, 'difficulty', value)}
                  >
                    <SelectTrigger className="h-5 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`topic-${currentQuestion.id}`} className="text-xs">Topic (Visible only after submission)</Label>
                  <Input
                    id={`topic-${currentQuestion.id}`}
                    value={currentQuestion.topic}
                    onChange={(e) => updateQuestion(currentQuestion.id, 'topic', e.target.value)}
                    className="text-xs h-5"
                    placeholder="Topic"
                  />
                </div>
                <div>
                  <Label htmlFor={`summary-${currentQuestion.id}`} className="text-xs">Summary (Visible only after submission)</Label>
                  <Input
                    id={`summary-${currentQuestion.id}`}
                    value={currentQuestion.summary}
                    onChange={(e) => updateQuestion(currentQuestion.id, 'summary', e.target.value)}
                    className="text-xs h-5"
                    placeholder="Summary"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-4">
              <div>
                <Label htmlFor={`question-mobile-${currentQuestion.id}`} className="text-sm">
                  Question Text <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id={`question-mobile-${currentQuestion.id}`}
                    value={currentQuestion.question}
                    onChange={(e) => handleQuestionTextChange(currentQuestion.id, e.target.value, currentQuestion.question, e)}
                    placeholder="Enter your question..."
                    className={`min-h-[120px] text-sm pr-24 ${currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 hover:bg-gray-100 ${activeFormatting === 'superscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => toggleFormatting('superscript')}
                        title="Toggle superscript mode"
                      >
                        <Superscript className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 hover:bg-gray-100 ${activeFormatting === 'subscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => toggleFormatting('subscript')}
                        title="Toggle subscript mode"
                      >
                        <Subscript className="h-4 w-4" />
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            type="button"
                          >
                            <Sigma className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 max-h-96 overflow-y-auto">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{getPageTitle()}</h4>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setCurrentSymbolPage(Math.max(1, currentSymbolPage - 1))}
                                  disabled={currentSymbolPage === 1}
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="text-xs text-gray-600">
                                  {currentSymbolPage}/3
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setCurrentSymbolPage(Math.min(3, currentSymbolPage + 1))}
                                  disabled={currentSymbolPage === 3}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-8 gap-1">
                              {getCurrentSymbols().map((item, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-sm hover:bg-blue-50"
                                  onClick={() => {
                                    const textarea = document.getElementById(`question-mobile-${currentQuestion.id}`) as HTMLTextAreaElement;
                                    const cursorPos = textarea ? textarea.selectionStart : undefined;
                                    insertMathSymbol(currentQuestion.id, item.symbol, cursorPos);
                                  }}
                                  title={item.name}
                                >
                                  {item.symbol}
                                </Button>
                              ))}
                            </div>
                            {activeFormatting !== 'none' && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-blue-600">
                                  {activeFormatting === 'superscript' ? 'Superscript mode active' : 'Subscript mode active'} - symbols will be formatted automatically
                                </p>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Popover>
  <PopoverTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-24 p-0 hover:bg-gray-100 mt-2"
      type="button"
      title="Insert math"
    >
      Maths 🧰
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-44 p-2 space-y-1">
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openMatrixDialog(currentQuestion.id)}>Matrix</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openFractionDialog(currentQuestion.id)}>Fraction</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openBinomialDialog(currentQuestion.id)}>Binomial</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openIntegralDialog(currentQuestion.id)}>Integral</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openDoubleIntegralDialog(currentQuestion.id)}>Double Integral</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openSummationDialog(currentQuestion.id)}>Summation</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openLimitDialog(currentQuestion.id)}>Limit</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openRootDialog(currentQuestion.id)}>Root</Button>
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => openProductDialog(currentQuestion.id)}>Product</Button>
  </PopoverContent>
</Popover>

                  </div>
                </div>
                {currentQuestion.question.trim() === '' && (
                  <p className="text-red-500 text-xs mt-1">Question is required</p>
                )}
                {currentQuestion.question && (currentQuestion.question.includes('^{') || currentQuestion.question.includes('_{') || /\n([\w\W]*?)\n/.test(currentQuestion.question)) && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded-lg">
                    <Label className="text-xs text-gray-600">Preview:</Label>
                    <div
                      className="text-sm mt-1"
                      ref={el => {
                        if (el) {
                          el.textContent = normalizeLatexInput(currentQuestion.question);
                          if (window.MathJax && window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise([el]);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor={`difficulty-mobile-${currentQuestion.id}`} className="text-sm">Difficulty</Label>
                  <Select 
                    value={currentQuestion.difficulty} 
                    onValueChange={(value) => updateQuestion(currentQuestion.id, 'difficulty', value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`topic-mobile-${currentQuestion.id}`} className="text-sm">Topic (Visible only after submission)</Label>
                  <Input
                    id={`topic-mobile-${currentQuestion.id}`}
                    value={currentQuestion.topic}
                    onChange={(e) => updateQuestion(currentQuestion.id, 'topic', e.target.value)}
                    className="text-sm h-9"
                    placeholder="Topic"
                  />
                </div>
                <div>
                  <Label htmlFor={`summary-mobile-${currentQuestion.id}`} className="text-sm">Summary (Visible only after submission)</Label>
                  <Input
                    id={`summary-mobile-${currentQuestion.id}`}
                    value={currentQuestion.summary}
                    onChange={(e) => updateQuestion(currentQuestion.id, 'summary', e.target.value)}
                    className="text-sm h-9"
                    placeholder="Summary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Question Image</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(currentQuestion.id, file);
                    }
                  }}
                  className="hidden"
                  id={`image-${currentQuestion.id}`}
                />
                <Label
                  htmlFor={`image-${currentQuestion.id}`}
                  className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </Label>
                {currentQuestion.imageFile && (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-3 w-3" />
                      <span className="text-xs">{currentQuestion.imageFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(currentQuestion.id)}
                      className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
              {currentQuestion.imageFile && (
                <img
                  src={URL.createObjectURL(currentQuestion.imageFile)}
                  alt="Question preview"
                  className="max-w-[200px] h-20 object-cover rounded border"
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Answer Options</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(currentQuestion.id)}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 h-7 text-xs px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentQuestion.options.map((option, optionIndex) => {
                  // Use formatting and symbol page from state objects
                  const formatting = optionFormatting[option.id] || 'none';
                  const symbolPage = optionSymbolPage[option.id] || 1;

                  // Helper for inserting symbol into option text
                  const insertOptionSymbol = (symbol: string) => {
                    let formattedSymbol = symbol;
                    if (formatting === 'superscript') {
                      formattedSymbol = `^{${symbol}}`;
                    } else if (formatting === 'subscript') {
                      formattedSymbol = `_{${symbol}}`;
                    }
                    const input = document.getElementById(`option-input-${currentQuestion.id}-${option.id}`) as HTMLInputElement;
                    if (input) {
                      const cursorPos = input.selectionStart ?? option.option_text.length;
                      const newText =
                        option.option_text.slice(0, cursorPos) +
                        formattedSymbol +
                        option.option_text.slice(cursorPos);
                      updateOption(currentQuestion.id, option.id, 'option_text', newText);
                      // Restore cursor position after update (in next tick)
                      setTimeout(() => {
                        input.focus();
                        input.setSelectionRange(cursorPos + formattedSymbol.length, cursorPos + formattedSymbol.length);
                      }, 0);
                    } else {
                      updateOption(currentQuestion.id, option.id, 'option_text', option.option_text + formattedSymbol);
                    }
                  };

                  // Helper for handling text change with formatting
                  const handleOptionTextChange = (e: React.ChangeEvent<HTMLInputElement>, option: any) => {
                    let value = e.target.value;
                    const formatting = optionFormatting[option.id] || 'none';
                    if (formatting !== 'none') {
                      const input = e.target;
                      const selectionStart = input.selectionStart;
                      const selectionEnd = input.selectionEnd;
                      if (selectionStart !== null && selectionEnd !== null && value.length > option.option_text.length) {
                        const diff = value.length - option.option_text.length;
                        const insertedText = value.slice(selectionStart - diff, selectionStart);
                        const before = value.slice(0, selectionStart - diff);
                        const after = value.slice(selectionStart);
                        if (formatting === 'superscript') {
                          value = before + `^{${insertedText}}` + after;
                        } else if (formatting === 'subscript') {
                          value = before + `_{${insertedText}}` + after;
                        }
                        setTimeout(() => {
                          input.focus();
                          const newPos = before.length + 3 + insertedText.length;
                          input.setSelectionRange(newPos, newPos);
                        }, 0);
                      }
                    }
                    updateOption(currentQuestion.id, option.id, 'option_text', value);
                  };

                  // Helper for rendering preview
                  const renderOptionPreview = (text: string) => {
                    let rendered = text;
                    rendered = rendered.replace(/\^{([^}]*)}/g, '<sup>$1</sup>');
                    rendered = rendered.replace(/_{([^}]*)}/g, '<sub>$1</sub>');
                    return rendered;
                  };

                  return (
                    <div key={option.id} className="flex flex-col gap-1 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                    <Checkbox
                      checked={option.is_correct}
                      onCheckedChange={(checked) => updateOption(currentQuestion.id, option.id, 'is_correct', !!checked)}
                    />
                    <Input
                      value={option.option_text}
                      onChange={(e) => handleOptionTextChange(e, option)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1 h-8 text-sm"
                      id={`option-input-${currentQuestion.id}-${option.id}`}
                    />
                        <Button
                          variant={formatting === 'superscript' ? 'secondary' : 'ghost'}
                          size="sm"
                          className={`h-6 w-6 p-0 hover:bg-gray-100 ${formatting === 'superscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                          type="button"
                          onClick={() => setOptionFormatting(prev => ({ ...prev, [option.id]: formatting === 'superscript' ? 'none' : 'superscript' }))}
                          title="Toggle superscript mode"
                        >
                          <Superscript className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={formatting === 'subscript' ? 'secondary' : 'ghost'}
                          size="sm"
                          className={`h-6 w-6 p-0 hover:bg-gray-100 ${formatting === 'subscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                          type="button"
                          onClick={() => setOptionFormatting(prev => ({ ...prev, [option.id]: formatting === 'subscript' ? 'none' : 'subscript' }))}
                          title="Toggle subscript mode"
                        >
                          <Subscript className="h-3 w-3" />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                              type="button"
                            >
                              <Sigma className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-96 max-h-96 overflow-y-auto">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{getPageTitle()}</h4>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setOptionSymbolPage(prev => ({ ...prev, [option.id]: Math.max(1, (symbolPage - 1)) }))}
                                    disabled={symbolPage === 1}
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs text-gray-600">
                                    {symbolPage}/3
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setOptionSymbolPage(prev => ({ ...prev, [option.id]: Math.min(3, (symbolPage + 1)) }))}
                                    disabled={symbolPage === 3}
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-8 gap-1">
                                {(() => {
                                  let symbols = mostFrequentSymbols;
                                  if (symbolPage === 2) symbols = frequentSymbols;
                                  if (symbolPage === 3) symbols = rarelyUsedSymbols;
                                  return symbols;
                                })().map((item, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-sm hover:bg-blue-50"
                                    onClick={() => {
                                      insertOptionSymbol(item.symbol);
                                    }}
                                    title={item.name}
                                  >
                                    {item.symbol}
                                  </Button>
                                ))}
                              </div>
                              {formatting !== 'none' && (
                                <div className="pt-2 border-t">
                                  <p className="text-xs text-blue-600">
                                    {formatting === 'superscript' ? 'Superscript mode active' : 'Subscript mode active'} - symbols will be formatted automatically
                                  </p>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                    {currentQuestion.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(currentQuestion.id, option.id)}
                        className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                      {/* {option.option_text && (option.option_text.includes('^{') || option.option_text.includes('_{')) && (
                        <div className="mt-1 p-1 bg-gray-100 border rounded">
                          <Label className="text-xs text-gray-600">Preview:</Label>
                          <div
                            className="text-xs mt-0.5"
                            dangerouslySetInnerHTML={{ __html: renderOptionPreview(option.option_text) }}
                          />
                        </div>
                      )} */}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t">
              <Button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 hover:text-blue-900 disabled:opacity-50"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                {currentQuestionIndex + 1} of {numberOfQuestions}
              </span>
              
              <Button
                onClick={() => setCurrentQuestionIndex(Math.min(numberOfQuestions - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === numberOfQuestions - 1}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:text-green-900 disabled:opacity-50"
              >
                Next
                <ChevronLeft className="h-3 w-3 rotate-180" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-1 border-t">
              <Button
                onClick={() => setCurrentScreen(2)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs px-3 h-8 md:h-7"
              >
                <FileText className="h-3 w-3" />
                Instructions
              </Button>

              <Button
            onClick={() => setCurrentScreen(0)}
            variant="outline"
                className="flex items-center gap-1 text-xs px-3 h-8 md:h-7"
          >
            <RefreshCw className="h-4 w-4" />
            Back to Home
          </Button>
              
              <Button
                onClick={saveSession}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs px-3 h-8 md:h-7"
              >
                <Save className="h-3 w-3" />
                Save Session
              </Button>
              
              <AlertDialog open={showFlushDialog} onOpenChange={setShowFlushDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50 text-xs px-3 h-8 md:h-7"
                  >
                    <Trash2 className="h-3 w-3" />
                    Flush Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Confirm Data Flush
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all quiz data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={flushData} className="bg-red-600 hover:bg-red-700">
                      Yes, Clear All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
                  <Button
                    size="sm"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs px-3 h-8 md:h-7"
                onClick={() => {
                  // Validate difficulty distribution first
                  const easyQuestions = questions.filter(q => q.difficulty === 'LOW').length;
                  const mediumQuestions = questions.filter(q => q.difficulty === 'MEDIUM').length;
                  const highQuestions = questions.filter(q => q.difficulty === 'HIGH').length;
                  
                  if (easyQuestions < metadata.num_easy_questions) {
                    toast({
                      title: "Validation Error",
                      description: `You need ${metadata.num_easy_questions} easy questions, but only have ${easyQuestions}.`,
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (mediumQuestions < metadata.num_medium_questions) {
                    toast({
                      title: "Validation Error",
                      description: `You need ${metadata.num_medium_questions} medium questions, but only have ${mediumQuestions}.`,
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (highQuestions < metadata.num_high_questions) {
                    toast({
                      title: "Validation Error",
                      description: `You need ${metadata.num_high_questions} high questions, but only have ${highQuestions}.`,
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // If validation passes, show reminder dialog
                  setShowReminderDialog(true);
                }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Generate ZIP
                  </Button>
              
              <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Quiz Reminder
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminder-date">Date</Label>
                      <Input
                        id="reminder-date"
                        type="date"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminder-time">Time</Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminder-email">Email Address</Label>
                      <Input
                        id="reminder-email"
                        type="email"
                        value={reminderEmail}
                        onChange={(e) => setReminderEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2 pt-4">
                      <Button
                        onClick={() => handleReminderSubmit(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Yes, Send an email along with the Generated ZIP
                      </Button>
                      <Button
                        onClick={() => handleReminderSubmit(false)}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Just Generate ZIP
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // 3. Desktop sidebar (question circles)
  const desktopSidebar = (
    <div className="hidden md:block col-span-1">
      <Card className="shadow-lg border-0 sticky top-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg py-2">
          <CardTitle className="text-sm">Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="space-y-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="num-questions-desktop" className="text-xs">Total:</Label>
                <Input
                    id="num-questions-desktop"
                  type="number"
                  min="1"
                  max="500"
                  value={numberOfQuestions}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 1;
                      setNumberOfQuestions(newValue);
                      // Debounce the actual adjustment
                      if (questionAdjustTimeout) {
                        clearTimeout(questionAdjustTimeout);
                      }
                      const timeout = setTimeout(() => {
                        adjustQuestions(newValue);
                      }, 500);
                      setQuestionAdjustTimeout(timeout);
                    }}
                  className="w-16 h-6 text-xs"
                />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newValue = Math.max(1, numberOfQuestions - 1);
                        setNumberOfQuestions(newValue);
                        adjustQuestions(newValue);
                      }}
                      className="h-6 w-6 p-0 text-xs"
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newValue = Math.min(500, numberOfQuestions + 1);
                        setNumberOfQuestions(newValue);
                        adjustQuestions(newValue);
                      }}
                      className="h-6 w-6 p-0 text-xs"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">1</span>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={numberOfQuestions}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      setNumberOfQuestions(newValue);
                      adjustQuestions(newValue);
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-xs text-gray-600">500</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: numberOfQuestions }, (_, i) => {
                  const question = questions[i];
                  const difficulty = question?.difficulty || 'MEDIUM';
                  const difficultyLabel = difficulty === 'LOW' ? 'E' : difficulty === 'MEDIUM' ? 'M' : 'H';
                  let diffBg = 'bg-yellow-200';
                  let diffText = 'text-yellow-900';
                  if (difficulty === 'LOW') { diffBg = 'bg-green-200'; diffText = 'text-green-900'; }
                  if (difficulty === 'HIGH') { diffBg = 'bg-red-200'; diffText = 'text-red-900'; }
                  return (
                    <div key={i} className="relative">
                  <Button
                    variant={currentQuestionIndex === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(i)}
                        className={`w-8 h-8 md:w-7 md:h-7 rounded-full text-xs p-0 relative ${diffBg} ${diffText}`}
                  >
                    {i + 1}
                  </Button>
                      <span className="absolute top-0 left-0 text-[8px] font-bold bg-gray-200 text-gray-700 rounded-full w-3 h-3 flex items-center justify-center">
                        {difficultyLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  // Matrix Dialog rendered at the root
  const matrixDialog = (
    <Dialog open={showMatrixDialog} onOpenChange={setShowMatrixDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Matrix</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <Input
            type="number"
            min={1}
            max={10}
            value={matrixRows}
            onChange={e => handleMatrixSizeChange(Number(e.target.value), matrixCols)}
            className="w-20"
            placeholder="Rows"
          />
          <span>x</span>
          <Input
            type="number"
            min={1}
            max={10}
            value={matrixCols}
            onChange={e => handleMatrixSizeChange(matrixRows, Number(e.target.value))}
            className="w-20"
            placeholder="Cols"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="border border-gray-300 rounded w-full text-center bg-white">
            <tbody>
              {Array.from({ length: matrixRows }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: matrixCols }).map((_, j) => (
                    <td key={j} className="border border-gray-300 p-1">
                      <Input
                        value={matrixElements[i]?.[j] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setMatrixElements(prev => {
                            const copy = prev.map(row => [...row]);
                            copy[i][j] = val;
                            return copy;
                          });
                        }}
                        className="w-16 text-center bg-gray-50 focus:bg-white focus:border-blue-400 rounded shadow-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setShowMatrixDialog(false)} variant="outline">Cancel</Button>
          <Button onClick={handleMatrixInsert}>Insert</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Scaffold Dialogs for each construct (Fraction, Binomial, etc.) with input fields, labels, and a live LaTeX preview (use MathJax rendering as in matrixDialog). Do not implement insertion yet.
  const fractionDialog = (
    <Dialog open={showFractionDialog} onOpenChange={setShowFractionDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Fraction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fraction-numerator">Numerator</Label>
            <Input
              id="fraction-numerator"
              value={fractionNumerator}
              onChange={(e) => setFractionNumerator(e.target.value)}
              placeholder="e.g., a, x, 1"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fraction-denominator">Denominator</Label>
            <Input
              id="fraction-denominator"
              value={fractionDenominator}
              onChange={(e) => setFractionDenominator(e.target.value)}
              placeholder="e.g., b, y, 2"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowFractionDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\frac{${fractionNumerator}}{${fractionDenominator}}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowFractionDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\frac{${fractionNumerator}}{${fractionDenominator}}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const binomialDialog = (
    <Dialog open={showBinomialDialog} onOpenChange={setShowBinomialDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Binomial</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="binomial-n">N</Label>
            <Input
              id="binomial-n"
              value={binomialN}
              onChange={(e) => setBinomialN(e.target.value)}
              placeholder="e.g., 5, n"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="binomial-k">K</Label>
            <Input
              id="binomial-k"
              value={binomialK}
              onChange={(e) => setBinomialK(e.target.value)}
              placeholder="e.g., 2, k"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowBinomialDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\binom{${binomialN}}{${binomialK}}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowBinomialDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\binom{${binomialN}}{${binomialK}}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const integralDialog = (
    <Dialog open={showIntegralDialog} onOpenChange={setShowIntegralDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Integral</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="integral-lower">Lower Bound</Label>
            <Input
              id="integral-lower"
              value={integralLower}
              onChange={(e) => setIntegralLower(e.target.value)}
              placeholder="e.g., 0, a"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="integral-upper">Upper Bound</Label>
            <Input
              id="integral-upper"
              value={integralUpper}
              onChange={(e) => setIntegralUpper(e.target.value)}
              placeholder="e.g., 1, b"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="integral-function">Function</Label>
            <Input
              id="integral-function"
              value={integralFunction}
              onChange={(e) => setIntegralFunction(e.target.value)}
              placeholder="e.g., x^2, sin(x)"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="integral-variable">Variable</Label>
            <Input
              id="integral-variable"
              value={integralVariable}
              onChange={(e) => setIntegralVariable(e.target.value)}
              placeholder="e.g., x, t"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowIntegralDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\int_{${integralLower}}^{${integralUpper}} ${integralFunction} \\, d${integralVariable}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowIntegralDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\int_{${integralLower}}^{${integralUpper}} ${integralFunction} \\, d${integralVariable}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const doubleIntegralDialog = (
    <Dialog open={showDoubleIntegralDialog} onOpenChange={setShowDoubleIntegralDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Double Integral</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="double-integral-lower">Lower Bound (x)</Label>
            <Input
              id="double-integral-lower"
              value={doubleIntegralLower}
              onChange={(e) => setDoubleIntegralLower(e.target.value)}
              placeholder="e.g., 0, a"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="double-integral-upper">Upper Bound (x)</Label>
            <Input
              id="double-integral-upper"
              value={doubleIntegralUpper}
              onChange={(e) => setDoubleIntegralUpper(e.target.value)}
              placeholder="e.g., 1, b"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="double-integral-function">Function (y)</Label>
            <Input
              id="double-integral-function"
              value={doubleIntegralFunction}
              onChange={(e) => setDoubleIntegralFunction(e.target.value)}
              placeholder="e.g., x^2, sin(y)"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="double-integral-variable">Variable (y)</Label>
            <Input
              id="double-integral-variable"
              value={doubleIntegralVariable}
              onChange={(e) => setDoubleIntegralVariable(e.target.value)}
              placeholder="e.g., y, t"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowDoubleIntegralDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\iint_{${doubleIntegralLower}}^{${doubleIntegralUpper}} ${doubleIntegralFunction} \\, d${doubleIntegralVariable}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowDoubleIntegralDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\iint_{${doubleIntegralLower}}^{${doubleIntegralUpper}} ${doubleIntegralFunction} \\, d${doubleIntegralVariable}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const summationDialog = (
    <Dialog open={showSummationDialog} onOpenChange={setShowSummationDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Summation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="summation-index">Index</Label>
            <Input
              id="summation-index"
              value={summationIndex}
              onChange={(e) => setSummationIndex(e.target.value)}
              placeholder="e.g., i, k"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summation-lower">Lower Bound</Label>
            <Input
              id="summation-lower"
              value={summationLower}
              onChange={(e) => setSummationLower(e.target.value)}
              placeholder="e.g., 1, a"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summation-upper">Upper Bound</Label>
            <Input
              id="summation-upper"
              value={summationUpper}
              onChange={(e) => setSummationUpper(e.target.value)}
              placeholder="e.g., n, b"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summation-function">Function</Label>
            <Input
              id="summation-function"
              value={summationFunction}
              onChange={(e) => setSummationFunction(e.target.value)}
              placeholder="e.g., i^2, sin(i)"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowSummationDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\sum_{${summationIndex}=${summationLower}}^{${summationUpper}} ${summationFunction}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowSummationDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\sum_{${summationIndex}=${summationLower}}^{${summationUpper}} ${summationFunction}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const limitDialog = (
    <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Limit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="limit-variable">Variable</Label>
            <Input
              id="limit-variable"
              value={limitVariable}
              onChange={(e) => setLimitVariable(e.target.value)}
              placeholder="e.g., x, t"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit-approaches">Approaches</Label>
            <Input
              id="limit-approaches"
              value={limitApproaches}
              onChange={(e) => setLimitApproaches(e.target.value)}
              placeholder="e.g., 0, a"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit-function">Function</Label>
            <Input
              id="limit-function"
              value={limitFunction}
              onChange={(e) => setLimitFunction(e.target.value)}
              placeholder="e.g., \\frac{1}{x}, \\sin(x)"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowLimitDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\lim_{${limitVariable} \\to ${limitApproaches}} ${limitFunction}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowLimitDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\lim_{${limitVariable} \\to ${limitApproaches}} ${limitFunction}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const rootDialog = (
    <Dialog open={showRootDialog} onOpenChange={setShowRootDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Root</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="root-degree">Degree</Label>
            <Input
              id="root-degree"
              value={rootDegree}
              onChange={(e) => setRootDegree(e.target.value)}
              placeholder="e.g., 2, n"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="root-radicand">Radicand</Label>
            <Input
              id="root-radicand"
              value={rootRadicand}
              onChange={(e) => setRootRadicand(e.target.value)}
              placeholder="e.g., x, 1"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowRootDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\sqrt[${rootDegree}]{${rootRadicand}}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowRootDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\sqrt[${rootDegree}]{${rootRadicand}}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const productDialog = (
    <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product-index">Index</Label>
            <Input
              id="product-index"
              value={productIndex}
              onChange={(e) => setProductIndex(e.target.value)}
              placeholder="e.g., i, k"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-lower">Lower Bound</Label>
            <Input
              id="product-lower"
              value={productLower}
              onChange={(e) => setProductLower(e.target.value)}
              placeholder="e.g., 1, a"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-upper">Upper Bound</Label>
            <Input
              id="product-upper"
              value={productUpper}
              onChange={(e) => setProductUpper(e.target.value)}
              placeholder="e.g., n, b"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-function">Function</Label>
            <Input
              id="product-function"
              value={productFunction}
              onChange={(e) => setProductFunction(e.target.value)}
              placeholder="e.g., i^2, sin(i)"
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowProductDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              const latex = `\n\\[\\prod_{${productIndex}=${productLower}}^{${productUpper}} ${productFunction}\\]\n`;
              const textarea = document.getElementById(`question-textarea-${matrixTargetId}`) as HTMLTextAreaElement;
              let newValue = currentQuestion.question;
              if (matrixInsertPos != null) {
                newValue =
                  currentQuestion.question.slice(0, matrixInsertPos) +
                  latex +
                  currentQuestion.question.slice(matrixInsertPos);
              } else {
                newValue = currentQuestion.question + latex;
              }
              updateQuestion(matrixTargetId, 'question', newValue);
              setShowProductDialog(false);
            }}>Insert</Button>
          </div>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded">
          <Label className="text-xs text-gray-600">Preview:</Label>
          <div
            className="text-sm mt-1"
            ref={el => {
              if (el) {
                el.textContent = normalizeLatexInput(`\n\\[\\prod_{${productIndex}=${productLower}}^{${productUpper}} ${productFunction}\\]\n`);
                if (window.MathJax && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([el]);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  // Trigger MathJax typeset after preview updates
  React.useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [currentQuestion?.question]);

  // Move openXDialog handler function definitions above the JSX where the buttons are rendered
  const openFractionDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowFractionDialog(true);
  };
  const openBinomialDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowBinomialDialog(true);
  };
  const openIntegralDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowIntegralDialog(true);
  };
  const openDoubleIntegralDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowDoubleIntegralDialog(true);
  };
  const openSummationDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowSummationDialog(true);
  };
  const openLimitDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowLimitDialog(true);
  };
  const openRootDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowRootDialog(true);
  };
  const openProductDialog = (questionId) => {
    setMatrixTargetId(questionId);
    const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
    setMatrixInsertPos(textarea ? textarea.selectionStart : null);
    setShowProductDialog(true);
  };

  return (
    <>
      {matrixDialog}
      {fractionDialog}
      {binomialDialog}
      {integralDialog}
      {doubleIntegralDialog}
      {summationDialog}
      {limitDialog}
      {rootDialog}
      {productDialog}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[calc(100vh-14rem)]">
        {mobileSidebar}
        {mainContent}
        {desktopSidebar}
      </div>
    </>
  );
};

export default Screen3; 
