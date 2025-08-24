import React, { useState, useEffect, useRef } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
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
import { Plus, Download, X, Upload, Check, ChevronLeft, Save, Trash2, AlertTriangle, FileText, Sigma, Superscript, Subscript, Calendar, Mail, ChevronRight, HelpCircle, Home, RefreshCw } from 'lucide-react';
import FormattingToolkit from './FormattingToolkit';

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
  subjects: string[];
  onDistributionSet?: (numDisplayed: number, numEasy: number, numMedium: number, numHigh: number) => void;
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
    subjects,
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
  const [doubleIntegralVariable, setDoubleIntegralVariable] = useState('x, dy');
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

  // Add state for superscript/subscript dialog
  const [showSuperSubDialog, setShowSuperSubDialog] = useState<false | 'sup' | 'sub'>(false);
  const [superSubValue, setSuperSubValue] = useState('');
  const [superSubTargetId, setSuperSubTargetId] = useState<number | null>(null);
  const [superSubInsertPos, setSuperSubInsertPos] = useState<number | null>(null);
  // Add to state:
  const [superSubTargetType, setSuperSubTargetType] = useState<'question' | 'option'>('question');
  const [superSubOptionId, setSuperSubOptionId] = useState<number | null>(null);
  // Generic math construct target
  const [mathTargetId, setMathTargetId] = useState<number | null>(null);
  
  // Focus tracking for unified toolkit
  const [focusedField, setFocusedField] = useState<{
    type: 'question' | 'option';
    qid: number;
    oid?: number;
    caretPos?: number;
  } | null>(null);
  
  // Math insert target for all constructs
  const [mathInsertTarget, setMathInsertTarget] = useState<{
    type: 'question' | 'option';
    qid: number;
    oid?: number;
    caretPos?: number;
  } | null>(null);
  
  // Show unified toolkit (always on)
  const showUnifiedToolkit = true;
  // Distribution dialog state
  const [showDistributionDialog, setShowDistributionDialog] = useState(false);
  const [distNumDisplayed, setDistNumDisplayed] = useState<number>(numberOfQuestions || 1);
  const [distEasy, setDistEasy] = useState<number>(0);
  const [distMedium, setDistMedium] = useState<number>(numberOfQuestions || 0);
  const [distHigh, setDistHigh] = useState<number>(0);

  // Old per-topic distribution grid state and helpers
  const [distributionGrid, setDistributionGrid] = useState<any>({});

  // Count questions already added by subject and difficulty
  function getAddedCounts() {
    const counts: any = {};
    subjects.forEach(subj => {
      counts[subj] = { LOW: 0, MEDIUM: 0, HIGH: 0, total: 0 };
    });
    questions.forEach((q: any) => {
      if (q.subject && counts[q.subject]) {
        const diff = q.difficulty as 'LOW' | 'MEDIUM' | 'HIGH';
        counts[q.subject][diff] = (counts[q.subject][diff] || 0) + 1;
        counts[q.subject].total++;
      }
    });
    return counts;
  }

  // Prefill the grid when dialog opens
  useEffect(() => {
    if (!showDistributionDialog) return;
    const added = getAddedCounts();
    const grid: any = {};
    subjects.forEach(subj => {
      grid[subj] = {
        LOW: added[subj]?.LOW || 0,
        MEDIUM: added[subj]?.MEDIUM || 0,
        HIGH: added[subj]?.HIGH || 0,
        total: added[subj]?.total || 0,
        added: { ...added[subj] },
      };
    });
    setDistributionGrid(grid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDistributionDialog]);

  // Update a single cell and recompute row total
  const updateGridCell = (subj: string, diff: 'LOW' | 'MEDIUM' | 'HIGH', value: string) => {
    setDistributionGrid((prev: any) => {
      const n = parseInt(value) || 0;
      const updated = { ...prev };
      updated[subj] = { ...updated[subj], [diff]: n };
      updated[subj].total = (updated[subj].LOW || 0) + (updated[subj].MEDIUM || 0) + (updated[subj].HIGH || 0);
      return updated;
    });
  };

  // Build question_distribution string for downstream consumers
  function buildQuestionDistribution() {
    const obj: any = { subjects: {} };
    subjects.forEach(subj => {
      obj.subjects[subj] = {
        LOW: distributionGrid[subj]?.LOW || 0,
        MEDIUM: distributionGrid[subj]?.MEDIUM || 0,
        HIGH: distributionGrid[subj]?.HIGH || 0,
      };
    });
    return JSON.stringify(obj);
  }

  // Add these arrays near the top of the component:
  const courseOutcomes = ['N/A', 'CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'];
  const bloomsLevels = ['N/A', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

  // --- Selection-based formatting state ---
  const [formatTarget, setFormatTarget] = useState<null | { type: 'question' | 'option'; qid: number; oid?: number }>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<null | { top: number; left: number }>(null);
  const [toolbarStrategy, setToolbarStrategy] = useState<'absolute' | 'fixed'>('absolute');
  const [showToolbar, setShowToolbar] = useState(false);
  const toolbarTimer = useRef<number | null>(null);

  const getFieldId = (t: 'question' | 'option', qid: number, oid?: number) =>
    t === 'question' ? `question-textarea-${qid}` : `option-input-${qid}-${oid}`;

  // Focus tracking handlers
  const handleFieldFocus = (type: 'question' | 'option', qid: number, oid?: number) => {
    const element = document.getElementById(getFieldId(type, qid, oid)) as HTMLTextAreaElement;
    const caretPos = element ? element.selectionStart || 0 : 0;
    setFocusedField({ type, qid, oid, caretPos });
  };

  const handleFieldSelect = (type: 'question' | 'option', qid: number, oid?: number) => {
    const element = document.getElementById(getFieldId(type, qid, oid)) as HTMLTextAreaElement;
    const caretPos = element ? element.selectionStart || 0 : 0;
    setFocusedField({ type, qid, oid, caretPos });
  };

  // Generic LaTeX insertion utility
  const insertLatexAtTarget = (latex: string) => {
    if (!mathInsertTarget) return;
    
    const { type, qid, oid, caretPos } = mathInsertTarget;
    const element = document.getElementById(getFieldId(type, qid, oid)) as HTMLTextAreaElement;
    
    if (type === 'question') {
      const q = questions.find(q => q.id === qid);
      if (!q) return;
      
      const insertPos = caretPos != null ? caretPos : q.question.length;
      const newValue = q.question.slice(0, insertPos) + latex + q.question.slice(insertPos);
      updateQuestion(qid, 'question', newValue);
      
      // Restore focus and caret
      setTimeout(() => {
        if (element) {
          element.focus();
          const newPos = insertPos + latex.length;
          element.setSelectionRange(newPos, newPos);
          autoResize(element);
        }
      }, 0);
    } else if (type === 'option' && oid != null) {
      const q = questions.find(q => q.id === qid);
      if (!q) return;
      
      const option = q.options.find((o: any) => o.id === oid);
      if (!option) return;
      
      const insertPos = caretPos != null ? caretPos : option.option_text.length;
      const newValue = option.option_text.slice(0, insertPos) + latex + option.option_text.slice(insertPos);
      updateOption(qid, oid, 'option_text', newValue);
      
      // Restore focus and caret
      setTimeout(() => {
        if (element) {
          element.focus();
          const newPos = insertPos + latex.length;
          element.setSelectionRange(newPos, newPos);
          autoResize(element);
        }
      }, 0);
    }
  };

  // Keyboard shortcuts for formatting when text is selected
  const handleKeyDownFormat = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    t: 'question' | 'option',
    qid: number,
    oid?: number
  ) => {
    const el = e.currentTarget;
    const sel = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
    if (sel <= 0) return; // only act when there's a selection

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    // Ctrl/Cmd+B => bold
    if (isCtrlOrMeta && !e.shiftKey && !e.altKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      setFormatTarget({ type: t, qid, oid });
      setHasSelection(true);
      setTimeout(() => applyMdFormat('bold'), 0);
      return;
    }
    // Ctrl/Cmd+I => italic
    if (isCtrlOrMeta && !e.shiftKey && !e.altKey && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      setFormatTarget({ type: t, qid, oid });
      setHasSelection(true);
      setTimeout(() => applyMdFormat('italic'), 0);
      return;
    }
    // Ctrl/Cmd+U => underline
    if (isCtrlOrMeta && !e.shiftKey && !e.altKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      setFormatTarget({ type: t, qid, oid });
      setHasSelection(true);
      setTimeout(() => applyMdFormat('underline'), 0);
      return;
    }
    // Ctrl/Cmd+/ => strikethrough
    if (isCtrlOrMeta && !e.shiftKey && !e.altKey && e.key === '/') {
      e.preventDefault();
      setFormatTarget({ type: t, qid, oid });
      setHasSelection(true);
      setTimeout(() => applyMdFormat('strike'), 0);
      return;
    }
  };

  const handleSelect = (
    e: React.SyntheticEvent<HTMLTextAreaElement>,
    t: 'question' | 'option',
    qid: number,
    oid?: number
  ) => {
    const el = e.currentTarget;
    const hasSel = el.selectionEnd - el.selectionStart > 0;
    setHasSelection(hasSel);
    // reset any pending show timers
    if (toolbarTimer.current) {
      window.clearTimeout(toolbarTimer.current);
      toolbarTimer.current = null;
    }
    setShowToolbar(false);
    if (hasSel) setFormatTarget({ type: t, qid, oid });
    else setFormatTarget(null);

    if (hasSel) {
      const container = el.parentElement as HTMLElement | null; // parent has position: relative
      if (!container) return;
      // For option fields: anchor toolbar at the top-left of the textarea
      if (t === 'option') {
        const rect = el.getBoundingClientRect();
        // Use fixed positioning relative to viewport so it's not clipped by the option container
        const left = Math.max(8, Math.min(window.innerWidth - 128, rect.left + window.scrollX + 8));
        const top = Math.max(0, rect.top + window.scrollY - 34);
        setToolbarPos({ top, left });
        setToolbarStrategy('fixed');
      } else {
        // For question fields: use caret X and place above (fallback below)
        const caretPos = el.selectionStart ?? 0;
        const coords = getCaretCoordinates(el, caretPos);
        let left = (coords?.left ?? 8) - 12;
        const maxLeft = Math.max(8, container.clientWidth - 120);
        if (left < 8) left = 8;
        if (left > maxLeft) left = maxLeft;
        const aboveTop = el.offsetTop - 34;
        const belowTop = el.offsetTop + el.clientHeight + 6;
        const top = aboveTop >= 0 ? aboveTop : belowTop;
        setToolbarPos({ top, left });
        setToolbarStrategy('absolute');
      }
      // Delay the toolbar appearance slightly
      toolbarTimer.current = window.setTimeout(() => setShowToolbar(true), 140);
    } else {
      setToolbarPos(null);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toolbarTimer.current) {
        window.clearTimeout(toolbarTimer.current);
      }
    };
  }, []);

  // When the reminder dialog opens, default date/time to now + 6 hours if not already set
  useEffect(() => {
    if (!showReminderDialog) return;
    const toPadded = (n: number) => String(n).padStart(2, '0');
    const nowPlus6 = new Date();
    nowPlus6.setMinutes(0, 0, 0);
    nowPlus6.setHours(nowPlus6.getHours() + 6);
    const yyyy = nowPlus6.getFullYear();
    const mm = toPadded(nowPlus6.getMonth() + 1);
    const dd = toPadded(nowPlus6.getDate());
    const hh = toPadded(nowPlus6.getHours());
    const min = toPadded(nowPlus6.getMinutes());
    if (!reminderDate) setReminderDate(`${yyyy}-${mm}-${dd}`);
    if (!reminderTime) setReminderTime(`${hh}:${min}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReminderDialog]);

  // Compute caret pixel coordinates inside a textarea using a mirror element
  const getCaretCoordinates = (ta: HTMLTextAreaElement, pos: number) => {
    try {
      const style = window.getComputedStyle(ta);
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordWrap = 'break-word';
      div.style.overflow = 'hidden';
      // Copy typography and box styles that affect layout
      const props = ['boxSizing','width','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textTransform'];
      props.forEach(p => {
        // @ts-ignore
        div.style[p] = style.getPropertyValue(p.replace(/[A-Z]/g, m => '-' + m.toLowerCase())) || (ta as any).style[p];
      });
      div.style.width = ta.clientWidth + 'px';
      // Align mirror to the textarea's position within the container
      div.style.top = ta.offsetTop + 'px';
      div.style.left = ta.offsetLeft + 'px';
      const span = document.createElement('span');
      const before = ta.value.substring(0, pos);
      const after = ta.value.substring(pos) || '.'; // ensure span has size
      div.textContent = before;
      span.textContent = after;
      div.appendChild(span);
      ta.parentElement?.appendChild(div);
      const containerRect = (ta.parentElement as HTMLElement).getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();
      const left = spanRect.left - containerRect.left; // relative to container
      ta.parentElement?.removeChild(div);
      // We only use left; top will be computed from textarea offset.
      return { top: 0, left };
    } catch {
      return null;
    }
  };

  const applyMdFormat = (kind: 'bold' | 'italic' | 'underline' | 'strike') => {
    if (!formatTarget) return;
    const { type, qid, oid } = formatTarget;
    const el = document.getElementById(getFieldId(type, qid, oid)) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (end <= start) return;
    const value = el.value;
    const selected = value.slice(start, end);
    const tokens =
      kind === 'bold' ? ['**', '**'] :
      kind === 'italic' ? ['_', '_'] :
      kind === 'underline' ? ['__', '__'] : ['~~', '~~'];
    const newValue = value.slice(0, start) + tokens[0] + selected + tokens[1] + value.slice(end);
    if (type === 'question') {
      updateQuestion(qid, 'question', newValue);
    } else if (type === 'option' && oid != null) {
      updateOption(qid, oid, 'option_text', newValue);
    }
    setTimeout(() => {
      if (!el) return;
      el.focus();
      const newPos = start + tokens[0].length + selected.length + tokens[1].length;
      el.setSelectionRange(newPos, newPos);
      autoResize(el);
    }, 0);
  };
  
  // Unified toolkit handlers
  const handleToolkitFormat = (kind: 'bold' | 'italic' | 'underline' | 'strike') => {
    if (!focusedField) return;
    setFormatTarget({ type: focusedField.type, qid: focusedField.qid, oid: focusedField.oid });
    setHasSelection(true);
    setTimeout(() => applyMdFormat(kind), 0);
  };
  
  const handleToolkitSymbolInsert = (symbol: string) => {
    // Ensure we have a focused field, default to current question if none
    if (!focusedField) {
      setFocusedField({ type: 'question', qid: currentQuestion.id, caretPos: 0 });
      // Use current question as fallback
      const textarea = document.getElementById(`question-textarea-${currentQuestion.id}`) as HTMLTextAreaElement;
      const cursorPos = textarea ? textarea.selectionStart : 0;
      insertMathSymbol(currentQuestion.id, symbol, cursorPos);
      // Restore focus and advance caret for multiple inserts
      setTimeout(() => {
        if (textarea) {
          const newPos = cursorPos + symbol.length;
          textarea.focus();
          textarea.setSelectionRange(newPos, newPos);
          autoResize(textarea);
        }
      }, 0);
      return;
    }
    
    if (focusedField.type === 'question') {
      const textarea = document.getElementById(`question-textarea-${focusedField.qid}`) as HTMLTextAreaElement;
      const cursorPos = textarea ? textarea.selectionStart : undefined;
      insertMathSymbol(focusedField.qid, symbol, cursorPos);
      // Restore focus and advance caret for multiple inserts
      setTimeout(() => {
        if (textarea && cursorPos != null) {
          const newPos = cursorPos + symbol.length;
          textarea.focus();
          textarea.setSelectionRange(newPos, newPos);
          autoResize(textarea);
        }
      }, 0);
    } else if (focusedField.type === 'option' && focusedField.oid != null) {
      // Insert symbol into option at caret
      const q = questions.find(q => q.id === focusedField.qid);
      if (!q) return;
      const option = q.options.find((o: any) => o.id === focusedField.oid);
      if (!option) return;
      
      const input = document.getElementById(`option-input-${focusedField.qid}-${focusedField.oid}`) as HTMLTextAreaElement;
      const cursorPos = input ? input.selectionStart : option.option_text.length;
      const newText = option.option_text.slice(0, cursorPos) + symbol + option.option_text.slice(cursorPos);
      updateOption(focusedField.qid, focusedField.oid, 'option_text', newText);
      
      // Restore cursor position
      setTimeout(() => {
        if (input) {
          input.focus();
          input.setSelectionRange(cursorPos + symbol.length, cursorPos + symbol.length);
          autoResize(input);
        }
      }, 0);
    }
  };
  
  const handleToolkitMathTool = (tool: 'matrix' | 'fraction' | 'binomial' | 'integral' | 'doubleIntegral' | 'summation' | 'limit' | 'root' | 'product') => {
    // Ensure we have a focused field, default to current question if none
    if (!focusedField) {
      setFocusedField({ type: 'question', qid: currentQuestion.id, caretPos: 0 });
    }
    
    switch (tool) {
      case 'matrix': openMatrixDialog(); break;
      case 'fraction': openFractionDialog(); break;
      case 'binomial': openBinomialDialog(); break;
      case 'integral': openIntegralDialog(); break;
      case 'doubleIntegral': openDoubleIntegralDialog(); break;
      case 'summation': openSummationDialog(); break;
      case 'limit': openLimitDialog(); break;
      case 'root': openRootDialog(); break;
      case 'product': openProductDialog(); break;
    }
  };

  const FormatToolbar: React.FC = () => {
    // Hidden - replaced by unified FormattingToolkit
    return null;
  };

  // Helper to check if cursor is inside a LaTeX math block (\[ ... \])
  function isCursorInLatexBlock(text: string, cursorPos: number) {
    const before = text.slice(0, cursorPos);
    const open = before.lastIndexOf('\\[');
    const close = before.lastIndexOf('\\]');
    return open > close;
  }

  // Handler to open superscript/subscript dialog (updated to use focusedField)
  const openSuperSubDialog = (
    type: 'sup' | 'sub',
    targetType?: 'question' | 'option',
    questionId?: number,
    optionId?: number
  ) => {
    setSuperSubValue('');
    
    // Use focusedField if no explicit target provided (for unified toolkit)
    if (!targetType && focusedField) {
      setSuperSubTargetType(focusedField.type);
      setSuperSubTargetId(focusedField.qid);
      setSuperSubOptionId(focusedField.oid ?? null);
      setSuperSubInsertPos(focusedField.caretPos ?? null);
    } else {
      // Legacy behavior for existing buttons
      setSuperSubTargetType(targetType || 'question');
      setSuperSubTargetId(questionId || currentQuestion.id);
      setSuperSubOptionId(optionId ?? null);
      let insertPos = null;
      if (targetType === 'question') {
        const textarea = document.getElementById(`question-textarea-${questionId}`) as HTMLTextAreaElement;
        insertPos = textarea ? textarea.selectionStart : null;
      } else if (targetType === 'option' && optionId != null) {
        const input = document.getElementById(`option-input-${questionId}-${optionId}`) as HTMLTextAreaElement;
        insertPos = input ? input.selectionStart : null;
      }
      setSuperSubInsertPos(insertPos);
    }
    
    setShowSuperSubDialog(type);
  };

  // Handler to insert superscript/subscript at cursor
  const handleSuperSubInsert = () => {
    if (superSubTargetId == null || !showSuperSubDialog) return;
    const latex = showSuperSubDialog === 'sup' ? `^{${superSubValue}}` : `_{${superSubValue}}`;
    if (superSubTargetType === 'question') {
      const q = questions.find(q => q.id === superSubTargetId);
      if (!q) return;
      let newValue = q.question;
      const insertPos = superSubInsertPos != null ? superSubInsertPos : q.question.length;
      const isInLatex = isCursorInLatexBlock(q.question, insertPos);
      if (!isInLatex) {
        let left = insertPos;
        let right = insertPos;
        while (left > 0 && q.question[left - 1] !== ' ') left--;
        while (right < q.question.length && q.question[right] !== ' ') right++;
        newValue =
          q.question.slice(0, left) +
          '\\(' +
          q.question.slice(left, insertPos) +
          latex +
          q.question.slice(insertPos, right) +
          '\\)' +
          q.question.slice(right);
      } else {
        newValue = q.question.slice(0, insertPos) + latex + q.question.slice(insertPos);
      }
      updateQuestion(superSubTargetId, 'question', newValue);
    } else if (superSubTargetType === 'option' && superSubOptionId != null) {
      const q = questions.find(q => q.id === superSubTargetId);
      if (!q) return;
      const option = q.options.find((o: any) => o.id === superSubOptionId);
      if (!option) return;
      let newValue = option.option_text;
      const insertPos = superSubInsertPos != null ? superSubInsertPos : option.option_text.length;
      // Always use inline delimiters for options
      let left = insertPos;
      let right = insertPos;
      while (left > 0 && option.option_text[left - 1] !== ' ') left--;
      while (right < option.option_text.length && option.option_text[right] !== ' ') right++;
      newValue =
        option.option_text.slice(0, left) +
        '\\(' +
        option.option_text.slice(left, insertPos) +
        latex +
        option.option_text.slice(insertPos, right) +
        '\\)' +
        option.option_text.slice(right);
      updateOption(superSubTargetId, superSubOptionId, 'option_text', newValue);
    }
    setShowSuperSubDialog(false);
  };

  // --- Math construct open handlers (updated to use focusedField) ---
  const openFractionDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowFractionDialog(true);
  };
  
  const openBinomialDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowBinomialDialog(true);
  };
  
  const openIntegralDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowIntegralDialog(true);
  };
  
  const openDoubleIntegralDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowDoubleIntegralDialog(true);
  };
  
  const openSummationDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowSummationDialog(true);
  };
  
  const openLimitDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowLimitDialog(true);
  };
  
  const openRootDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowRootDialog(true);
  };
  
  const openProductDialog = (questionId?: number) => {
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    setShowProductDialog(true);
  };

  // Open matrix dialog and store cursor position (updated to use focusedField)
  const openMatrixDialog = (questionId?: number) => {
    setMatrixRows(2);
    setMatrixCols(2);
    setMatrixElements([['', ''], ['', '']]);
    
    // Use focusedField if no explicit questionId provided (for unified toolkit)
    if (!questionId && focusedField) {
      setMathInsertTarget(focusedField);
    } else {
      // Legacy behavior for existing buttons
      const qid = questionId || currentQuestion.id;
      const textarea = document.getElementById(`question-textarea-${qid}`) as HTMLTextAreaElement;
      setMathInsertTarget({
        type: 'question',
        qid,
        caretPos: textarea ? textarea.selectionStart : null
      });
    }
    
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

  // Insert matrix using generic target system
  const handleMatrixInsert = () => {
    if (!mathInsertTarget) return;
    
    // Build LaTeX matrix with double backslashes for row separation, use inline math delimiters
    const latex =
      '\\(' +
      '\\begin{bmatrix} ' +
      matrixElements.map(row => row.join(' & ')).join(' \\\\ ') +
      ' \\end{bmatrix}' +
      '\\)';
    
    insertLatexAtTarget(latex);
    setShowMatrixDialog(false);
  };

  // Add this function near the top of the component
  function normalizeLatexInput(latex) {
    // Replace quadruple backslashes with double, then double with single
    return latex.replace(/\\\\\\\\/g, '\\\\').replace(/\\\\/g, '\\');
  }
  
  // Math construct confirm handlers using generic insertion
  const handleFractionInsert = () => {
    if (!fractionNumerator.trim() || !fractionDenominator.trim()) return;
    const latex = `\\(\\frac{${fractionNumerator}}{${fractionDenominator}}\\)`;
    insertLatexAtTarget(latex);
    setShowFractionDialog(false);
    setFractionNumerator('');
    setFractionDenominator('');
  };
  
  const handleBinomialInsert = () => {
    if (!binomialN.trim() || !binomialK.trim()) return;
    const latex = `\\(\\binom{${binomialN}}{${binomialK}}\\)`;
    insertLatexAtTarget(latex);
    setShowBinomialDialog(false);
    setBinomialN('');
    setBinomialK('');
  };
  
  const handleIntegralInsert = () => {
    if (!integralFunction.trim()) return;
    const latex = `\\(\\int_{${integralLower}}^{${integralUpper}} ${integralFunction} \\, d${integralVariable}\\)`;
    insertLatexAtTarget(latex);
    setShowIntegralDialog(false);
    setIntegralLower('');
    setIntegralUpper('');
    setIntegralFunction('');
    setIntegralVariable('x');
  };
  
  const handleDoubleIntegralInsert = () => {
    if (!doubleIntegralFunction.trim()) return;
    const latex = `\\(\\iint_{${doubleIntegralLower}}^{${doubleIntegralUpper}} ${doubleIntegralFunction} \\, d${doubleIntegralVariable}\\)`;
    insertLatexAtTarget(latex);
    setShowDoubleIntegralDialog(false);
    setDoubleIntegralLower('');
    setDoubleIntegralUpper('');
    setDoubleIntegralFunction('');
    setDoubleIntegralVariable('x, y');
  };
  
  const handleSummationInsert = () => {
    if (!summationFunction.trim()) return;
    const latex = `\\(\\sum_{${summationIndex}=${summationLower}}^{${summationUpper}} ${summationFunction}\\)`;
    insertLatexAtTarget(latex);
    setShowSummationDialog(false);
    setSummationIndex('k');
    setSummationLower('0');
    setSummationUpper('n');
    setSummationFunction('');
  };
  
  const handleLimitInsert = () => {
    if (!limitFunction.trim()) return;
    const latex = `\\(\\lim_{${limitVariable} \\to ${limitApproaches}} ${limitFunction}\\)`;
    insertLatexAtTarget(latex);
    setShowLimitDialog(false);
    setLimitVariable('x');
    setLimitApproaches('0');
    setLimitFunction('');
  };
  
  const handleRootInsert = () => {
    if (!rootRadicand.trim()) return;
    const latex = rootDegree.trim() === 'n' || rootDegree.trim() === '2' 
      ? `\\(\\sqrt{${rootRadicand}}\\)`
      : `\\(\\sqrt[${rootDegree}]{${rootRadicand}}\\)`;
    insertLatexAtTarget(latex);
    setShowRootDialog(false);
    setRootDegree('n');
    setRootRadicand('x');
  };
  
  const handleProductInsert = () => {
    if (!productFunction.trim()) return;
    const latex = `\\(\\prod_{${productIndex}=${productLower}}^{${productUpper}} ${productFunction}\\)`;
    insertLatexAtTarget(latex);
    setShowProductDialog(false);
    setProductIndex('i');
    setProductLower('1');
    setProductUpper('n');
    setProductFunction('');
  };

  // Helper to auto-resize textareas based on content
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Ensure initial sizing and when switching questions/options
  useEffect(() => {
    if (!currentQuestion) return;
    const qDesktop = document.getElementById(`question-textarea-${currentQuestion.id}`) as HTMLTextAreaElement | null;
    const qMobile = document.getElementById(`question-mobile-${currentQuestion.id}`) as HTMLTextAreaElement | null;
    autoResize(qDesktop);
    autoResize(qMobile);
    if (Array.isArray(currentQuestion.options)) {
      currentQuestion.options.forEach((o: any) => {
        const el = document.getElementById(`option-input-${currentQuestion.id}-${o.id}`) as HTMLTextAreaElement | null;
        if (el) {
          // Ensure default soft wrapping
          el.removeAttribute('wrap');
          el.style.overflowX = '';
        }
        autoResize(el);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, currentQuestion?.question, JSON.stringify(currentQuestion?.options?.map((o: any) => o.option_text || ''))]);

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
    <div className="col-span-1 md:col-span-4 relative">
      {currentQuestion && (
        <>
          <Card className="shadow-lg border-0">
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
                {/* Label + inline formatting toolkit in same row */}
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label htmlFor={`question-${currentQuestion.id}`} className="text-sm">
                    Question Text <span className="text-red-500">*</span>
                  </Label>
                  <FormattingToolkit
                    currentSymbolPage={currentSymbolPage}
                    setCurrentSymbolPage={setCurrentSymbolPage}
                    getCurrentSymbols={getCurrentSymbols}
                    getPageTitle={getPageTitle}
                    onOpenSuperscript={() => openSuperSubDialog('sup')}
                    onOpenSubscript={() => openSuperSubDialog('sub')}
                    onInsertSymbol={handleToolkitSymbolInsert}
                    onFormat={handleToolkitFormat}
                    onOpenMathTool={handleToolkitMathTool}
                    visible={showUnifiedToolkit}
                    variant="inline-horizontal"
                  />
                </div>
                <div className="relative">
                  <Textarea
                    id={`question-textarea-${currentQuestion.id}`}
                    value={currentQuestion.question}
                    onChange={(e) => {
                      autoResize(e.target as HTMLTextAreaElement);
                      handleQuestionTextChange(currentQuestion.id, e.target.value, currentQuestion.question, e);
                    }}
                    onFocus={() => handleFieldFocus('question', currentQuestion.id)}
                    onSelect={(e) => {
                      handleSelect(e, 'question', currentQuestion.id);
                      handleFieldSelect('question', currentQuestion.id);
                    }}
                    onKeyDown={(e) => handleKeyDownFormat(e, 'question', currentQuestion.id)}
                    placeholder="Enter your question..."
                    className={`min-h-[120px] text-sm pr-32 resize-none overflow-hidden ${currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1" style={{ display: 'none' }}>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 hover:bg-gray-100 ${activeFormatting === 'superscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => openSuperSubDialog('sup', 'question', currentQuestion.id)}
                        title="Insert superscript"
                      >
                        <Superscript className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 hover:bg-gray-100 ${activeFormatting === 'subscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => openSuperSubDialog('sub', 'question', currentQuestion.id)}
                        title="Insert subscript"
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
                {/* Show preview only if question contains LaTeX delimiters */}
                {currentQuestion.question && (/\\\(|\\\[|\$.*\$|\*\*|__|~~|_/.test(currentQuestion.question)) && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded-lg">
                    <Label className="text-xs text-gray-600">Preview:</Label>
                    <LatexPreview text={currentQuestion.question} />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex gap-2 items-end">
                  <div>
                    <Label htmlFor={`difficulty-${currentQuestion.id}`} className="text-xs">Difficulty</Label>
                    <Select 
                      value={currentQuestion.difficulty} 
                      onValueChange={(value) => updateQuestion(currentQuestion.id, 'difficulty', value)}
                    >
                      <SelectTrigger className="h-5 text-xs w-32">
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
                    <Label htmlFor={`subject-${currentQuestion.id}`} className="text-xs">Topic</Label>
                    <Select
                      value={currentQuestion.subject || ''}
                      onValueChange={value => updateQuestion(currentQuestion.id, 'subject', value)}
                    >
                      <SelectTrigger className="h-5 text-xs w-40">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subj => (
                          <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`topic-${currentQuestion.id}`} className="text-xs">Course Outcome & Bloom's Taxonomy <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Select
                      value={currentQuestion.topic?.split(' - ')[0] || 'N/A'}
                      onValueChange={co => {
                        const bloom = currentQuestion.topic?.split(' - ')[1] || 'N/A';
                        updateQuestion(currentQuestion.id, 'topic', `${co}${bloom ? ' - ' + bloom : ''}`);
                      }}
                    >
                      <SelectTrigger className="h-5 text-xs w-32">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOutcomes.map(co => (
                          <SelectItem key={co} value={co}>{co}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={currentQuestion.topic?.split(' - ')[1] || 'N/A'}
                      onValueChange={bloom => {
                        const co = currentQuestion.topic?.split(' - ')[0] || 'N/A';
                        updateQuestion(currentQuestion.id, 'topic', `${co ? co + ' - ' : ''}${bloom}`);
                      }}
                    >
                      <SelectTrigger className="h-5 text-xs w-40">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloomsLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <FormatToolbar />
                  <Textarea
                    id={`question-mobile-${currentQuestion.id}`}
                    value={currentQuestion.question}
                    onChange={(e) => {
                      autoResize(e.target as HTMLTextAreaElement);
                      handleQuestionTextChange(currentQuestion.id, e.target.value, currentQuestion.question, e);
                    }}
                    onFocus={() => handleFieldFocus('question', currentQuestion.id)}
                    onSelect={(e) => {
                      handleSelect(e, 'question', currentQuestion.id);
                      handleFieldSelect('question', currentQuestion.id);
                    }}
                    onKeyDown={(e) => handleKeyDownFormat(e, 'question', currentQuestion.id)}
                    placeholder="Enter your question..."
                    className={`min-h-[120px] text-sm pr-24 resize-none overflow-hidden ${currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1" style={{ display: 'none' }}>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 hover:bg-gray-100 ${activeFormatting === 'superscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => openSuperSubDialog('sup', 'question', currentQuestion.id)}
                        title="Insert superscript"
                      >
                        <Superscript className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 hover:bg-gray-100 ${activeFormatting === 'subscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                        type="button"
                        onClick={() => openSuperSubDialog('sub', 'question', currentQuestion.id)}
                        title="Insert subscript"
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
                          // Custom inline superscript/subscript rendering for \( ... \) blocks
                          const inlineRegex = /\\\((.*?)\\\)/g;
                          let html = currentQuestion.question;
                          let replaced = false;
                          html = html.replace(inlineRegex, (match, inner) => {
                            if (/\^\{[^}]+\}|_\{[^}]+\}/.test(inner)) {
                              replaced = true;
                              let rendered = inner;
                              rendered = rendered.replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>');
                              rendered = rendered.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
                              return rendered;
                            }
                            return match;
                          });
                          if (replaced) {
                            // Replace newlines with <br>
                            html = html.replace(/\n/g, '<br>');
                            el.innerHTML = html;
                          } else {
                            // Replace newlines with <br> for plain text as well
                            el.innerHTML = normalizeLatexInput(currentQuestion.question).replace(/\n/g, '<br>');
                            if (window.MathJax && window.MathJax.typesetPromise) {
                              window.MathJax.typesetPromise([el]);
                            }
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
                  <Label htmlFor={`topic-mobile-${currentQuestion.id}`} className="text-sm">Course Outcome & Bloom's Taxonomy <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Select
                      value={currentQuestion.topic?.split(' - ')[0] || 'N/A'}
                      onValueChange={co => {
                        const bloom = currentQuestion.topic?.split(' - ')[1] || 'N/A';
                        updateQuestion(currentQuestion.id, 'topic', `${co}${bloom ? ' - ' + bloom : ''}`);
                      }}
                    >
                      <SelectTrigger className="h-5 text-xs w-32">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOutcomes.map(co => (
                          <SelectItem key={co} value={co}>{co}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={currentQuestion.topic?.split(' - ')[1] || 'N/A'}
                      onValueChange={bloom => {
                        const co = currentQuestion.topic?.split(' - ')[0] || 'N/A';
                        updateQuestion(currentQuestion.id, 'topic', `${co ? co + ' - ' : ''}${bloom}`);
                      }}
                    >
                      <SelectTrigger className="h-5 text-xs w-40">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloomsLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`summary-mobile-${currentQuestion.id}`} className="text-sm">Topic/Summary (Visible only after submission)</Label>
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
                    const input = document.getElementById(`option-input-${currentQuestion.id}-${option.id}`) as HTMLTextAreaElement;
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
                        autoResize(input);
                      }, 0);
                    } else {
                      updateOption(currentQuestion.id, option.id, 'option_text', option.option_text + formattedSymbol);
                    }
                  };

                  // Helper for handling text change with formatting
                  const handleOptionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, option: any) => {
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
                          autoResize(input as HTMLTextAreaElement);
                        }, 0);
                      }
                    }
                    updateOption(currentQuestion.id, option.id, 'option_text', value);
                  };

  

                  // Helper for rendering preview
                  const renderOptionPreview = (text: string) => {
                    const inlineRegex = /\\\((.*?)\\\)/g;
                    let html = text;
                    let replaced = false;
                    html = html.replace(inlineRegex, (match, inner) => {
                      if (/\^\{[^}]+\}|_\{[^}]+\}/.test(inner)) {
                        replaced = true;
                        let rendered = inner;
                        rendered = rendered.replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>');
                        rendered = rendered.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
                        return rendered;
                      }
                      return match;
                    });
                    if (replaced) {
                      return <span dangerouslySetInnerHTML={{ __html: html }} />;
                    } else {
                      return <span>{text}</span>;
                    }
                  };

                  return (
                    <div key={option.id} className="flex flex-col gap-1 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                    <Checkbox
                      checked={option.is_correct}
                      onCheckedChange={(checked) => updateOption(currentQuestion.id, option.id, 'is_correct', !!checked)}
                    />
                    <div className="relative w-full">
                      {/* FormatToolbar hidden - replaced by unified FormattingToolkit */}
                      <Textarea
                      id={`option-input-${currentQuestion.id}-${option.id}`}
                      value={option.option_text}
                      onChange={(e) => {
                        autoResize(e.target as HTMLTextAreaElement);
                        handleOptionTextChange(e, option);
                      }}
                      onFocus={() => handleFieldFocus('option', currentQuestion.id, option.id)}
                      onSelect={(e) => {
                        handleSelect(e, 'option', currentQuestion.id, option.id);
                        handleFieldSelect('option', currentQuestion.id, option.id);
                      }}
                      onKeyDown={(e) => handleKeyDownFormat(e, 'option', currentQuestion.id, option.id)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1 min-h-[32px] text-sm resize-none overflow-hidden"
                      rows={1}
                      />
                    </div>
                    <div style={{ display: 'none' }}>
                        <Button
                          variant={formatting === 'superscript' ? 'secondary' : 'ghost'}
                          size="sm"
                          className={`h-6 w-6 p-0 hover:bg-gray-100 ${formatting === 'superscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                          type="button"
                          onClick={() => openSuperSubDialog('sup', 'option', currentQuestion.id, option.id)}
                          title="Insert superscript"
                        >
                          <Superscript className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={formatting === 'subscript' ? 'secondary' : 'ghost'}
                          size="sm"
                          className={`h-6 w-6 p-0 hover:bg-gray-100 ${formatting === 'subscript' ? 'bg-blue-100 text-blue-600' : ''}`}
                          type="button"
                          onClick={() => openSuperSubDialog('sub', 'option', currentQuestion.id, option.id)}
                          title="Insert subscript"
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
                    </div>
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
                      {/* Show preview only if option contains LaTeX delimiters */}
                      {option.option_text && (/\\\(|\\\[|\$.*\$|\*\*|__|~~|_/.test(option.option_text)) && (
                        <div className="mt-1 p-1 bg-gray-100 border rounded">
                          <Label className="text-xs text-gray-600">Preview:</Label>
                          <LatexPreview text={option.option_text} small />
                        </div>
                      )}
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
            </CardContent>
          </Card>
          
          {/* Bottom action bar positioned absolutely after the Card */}
          <div className="mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
              {/* Left: Instructions & Back to Home */}
              <div className="flex justify-start gap-2">
                <Button
                  onClick={() => setCurrentScreen(2)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1 text-sm px-4 h-9 md:h-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
                >
                  <FileText className="h-4 w-4" />
                  Instructions
                </Button>
                <Button
                  onClick={() => setCurrentScreen(0)}
                  variant="outline"
                  className="flex items-center gap-1 text-sm px-4 h-9 md:h-8 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>

              {/* Middle: Save, Delete - centered between left/right, stronger right lean */}
              <div className="flex justify-center gap-2 flex-nowrap relative left-4 md:left-14">
                <Button
                  onClick={saveSession}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-sm px-4 h-9 md:h-8 text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Save className="h-4 w-4" />
                  Save Session
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={flushData}
                  className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50 text-sm px-4 h-9 md:h-8"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Question
                </Button>
              </div>

              {/* Right: Set Distribution */}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm px-4 h-9 md:h-8"
                  onClick={() => setShowDistributionDialog(true)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Set Distribution
                </Button>
              </div>
            </div>
          </div>
        </>
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

  return (
    <>
      {/* Removed global fixed-left FormattingToolkit; now rendered inline above question field */}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        {mobileSidebar}
        {mainContent}
        {desktopSidebar}
      </div>

      {/* Reminder dialog at root */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Quiz reminder email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-date">Reminder date</Label>
              <Input
                id="reminder-date"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Reminder time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-email">Email address</Label>
              <Input
                id="reminder-email"
                type="email"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full"
              />
            </div>
            <p className="text-xs text-gray-600">
              Note: Date and time are required so we can include a link to add a Google Calendar event 1 hour before the selected time.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => handleReminderSubmit(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email the ZIP and reminder
              </Button>
              <Button
                onClick={() => handleReminderSubmit(false)}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download ZIP only
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Distribution dialog at root (restored per-topic grid) */}
      <Dialog open={showDistributionDialog} onOpenChange={setShowDistributionDialog}>
        <DialogContent className="max-w-3xl p-0 max-h-[calc(97.5vh-2rem)] overflow-y-auto">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <Download className="h-6 w-6 text-green-600" />
              Set Question Distribution
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">Distribute the number of questions per topic and difficulty. <span className='font-semibold text-blue-700'>"To be set"</span> is your target, <span className='font-semibold text-green-700'>"Added"</span> is how many you have created.</p>
          </DialogHeader>
          <div className="overflow-x-auto px-6 pb-2">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden shadow">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900">
                  <th className="p-3 border font-semibold text-left">Topic</th>
                  <th className="p-3 border font-semibold text-center">Easy<br/><span className='text-xs'>(To be shown<span className='text-blue-700'>|</span> <span className='text-green-700'>Added</span>)</span></th>
                  <th className="p-3 border font-semibold text-center">Medium<br/><span className='text-xs'>(To be shown<span className='text-blue-700'>|</span> <span className='text-green-700'>Added</span>)</span></th>
                  <th className="p-3 border font-semibold text-center">High<br/><span className='text-xs'>(To be shown<span className='text-blue-700'>|</span> <span className='text-green-700'>Added</span>)</span></th>
                  <th className="p-3 border font-semibold text-center">Total<br/><span className='text-xs'>(To be shown<span className='text-blue-700'>|</span> <span className='text-green-700'>Added</span>)</span></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subj => (
                  <tr key={subj} className="hover:bg-blue-50 transition">
                    <td className="p-3 border font-semibold text-blue-800 bg-blue-50">{subj}</td>
                    {(['LOW','MEDIUM','HIGH'] as const).map(diff => (
                      <td className="p-3 border text-center" key={diff}>
                        <input
                          type="number"
                          min={0}
                          value={distributionGrid[subj]?.[diff] ?? 0}
                          onChange={e => updateGridCell(subj, diff, e.target.value)}
                          className="w-16 border rounded px-2 py-1 text-sm mr-2 focus:ring-2 focus:ring-blue-300 bg-white text-blue-900 font-semibold shadow-sm"
                        />
                        <span className="text-green-700 font-semibold">{distributionGrid[subj]?.added?.[diff] ?? 0}</span>
                      </td>
                    ))}
                    <td className="p-3 border font-bold text-center bg-blue-100">
                      <span className="text-blue-800">{distributionGrid[subj]?.total ?? 0}</span>
                      <span className="text-green-700 font-semibold ml-2">{distributionGrid[subj]?.added?.total ?? 0}</span>
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-green-100 font-bold sticky bottom-0">
                  <td className="p-3 border text-green-900">Total</td>
                  {(['LOW','MEDIUM','HIGH'] as const).map(diff => (
                    <td className="p-3 border text-green-900 text-center" key={diff}>
                      {subjects.reduce((sum, s) => sum + (distributionGrid[s]?.[diff] ?? 0), 0)}
                      <span className="text-green-700 font-semibold ml-2">{subjects.reduce((sum, s) => sum + (distributionGrid[s]?.added?.[diff] ?? 0), 0)}</span>
                    </td>
                  ))}
                  <td className="p-3 border text-green-900 text-center bg-green-200">
                    {subjects.reduce((sum, s) => sum + (distributionGrid[s]?.total ?? 0), 0)}
                    <span className="text-green-700 font-semibold ml-2">{subjects.reduce((sum, s) => sum + (distributionGrid[s]?.added?.total ?? 0), 0)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex flex-wrap gap-4 mt-4 justify-between items-center border-t pt-4">
              <div className="text-sm text-gray-700">
                <span className="font-semibold text-blue-800">Tip:</span> The <span className="font-semibold text-blue-800">To Be Shown</span> values must be less than the <span className="font-semibold text-green-700">added</span> values for each cell.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDistributionDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow"
                  onClick={() => {
                    setShowDistributionDialog(false);
                    // Calculate totals for all subjects
                    const numEasy = subjects.reduce((sum, s) => sum + (distributionGrid[s]?.LOW || 0), 0);
                    const numMedium = subjects.reduce((sum, s) => sum + (distributionGrid[s]?.MEDIUM || 0), 0);
                    const numHigh = subjects.reduce((sum, s) => sum + (distributionGrid[s]?.HIGH || 0), 0);
                    const numDisplayed = subjects.reduce((sum, s) => sum + (distributionGrid[s]?.total || 0), 0);
                    if (props.onDistributionSet) {
                      props.onDistributionSet(numDisplayed, numEasy, numMedium, numHigh);
                    }
                    (window as any).latestQuestionDistribution = buildQuestionDistribution();
                    setShowReminderDialog(true);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Generate ZIP
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showSuperSubDialog && (
        <Dialog open={!!showSuperSubDialog} onOpenChange={setShowSuperSubDialog as any}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert {showSuperSubDialog === 'sup' ? 'Superscript' : 'Subscript'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={superSubValue}
                onChange={e => setSuperSubValue(e.target.value)}
                placeholder={`Enter ${showSuperSubDialog === 'sup' ? 'superscript' : 'subscript'} value`}
                className="w-full"
              />
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowSuperSubDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSuperSubInsert} disabled={!superSubValue.trim()}>Insert</Button>
              </div>
            </div>
            <div className="mt-4 p-2 bg-gray-50 border rounded">
              <Label className="text-xs text-gray-600">Preview:</Label>
              <div
                className="text-sm mt-1"
                ref={el => {
                  if (el) {
                    const latex = showSuperSubDialog === 'sup' ? `^{${superSubValue}}` : `_{${superSubValue}}`;
                    el.textContent = !superSubValue ? '' : `\\[${latex}\\]`;
                    if (window.MathJax && window.MathJax.typesetPromise) {
                      window.MathJax.typesetPromise([el]);
                    }
                  }
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Math construct dialogs */}
      {showFractionDialog && (
        <Dialog open={showFractionDialog} onOpenChange={setShowFractionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Fraction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Numerator</Label>
                <Input value={fractionNumerator} onChange={e => setFractionNumerator(e.target.value)} placeholder="Numerator" />
              </div>
              <div>
                <Label>Denominator</Label>
                <Input value={fractionDenominator} onChange={e => setFractionDenominator(e.target.value)} placeholder="Denominator" />
              </div>
              {(fractionNumerator.trim() || fractionDenominator.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\frac{${fractionNumerator || '?'}}{${fractionDenominator || '?'}}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowFractionDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleFractionInsert} disabled={!fractionNumerator.trim() || !fractionDenominator.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {showBinomialDialog && (
        <Dialog open={showBinomialDialog} onOpenChange={setShowBinomialDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Binomial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>n (top)</Label>
                <Input value={binomialN} onChange={e => setBinomialN(e.target.value)} placeholder="n" />
              </div>
              <div>
                <Label>k (bottom)</Label>
                <Input value={binomialK} onChange={e => setBinomialK(e.target.value)} placeholder="k" />
              </div>
              {(binomialN.trim() || binomialK.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\binom{${binomialN || '?'}}{${binomialK || '?'}}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowBinomialDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleBinomialInsert} disabled={!binomialN.trim() || !binomialK.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {showIntegralDialog && (
        <Dialog open={showIntegralDialog} onOpenChange={setShowIntegralDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Integral</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Lower bound</Label>
                  <Input value={integralLower} onChange={e => setIntegralLower(e.target.value)} placeholder="Lower" />
                </div>
                <div>
                  <Label>Upper bound</Label>
                  <Input value={integralUpper} onChange={e => setIntegralUpper(e.target.value)} placeholder="Upper" />
                </div>
              </div>
              <div>
                <Label>Function</Label>
                <Input value={integralFunction} onChange={e => setIntegralFunction(e.target.value)} placeholder="f(x)" />
              </div>
              <div>
                <Label>Variable</Label>
                <Input value={integralVariable} onChange={e => setIntegralVariable(e.target.value)} placeholder="x" />
              </div>
              {(integralFunction.trim() || integralLower.trim() || integralUpper.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\int_{${integralLower || '?'}}^{${integralUpper || '?'}} ${integralFunction || '?'} \\, d${integralVariable || 'x'}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowIntegralDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleIntegralInsert} disabled={!integralFunction.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {showDoubleIntegralDialog && (
        <Dialog open={showDoubleIntegralDialog} onOpenChange={setShowDoubleIntegralDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Double Integral</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Lower bound</Label>
                  <Input value={doubleIntegralLower} onChange={e => setDoubleIntegralLower(e.target.value)} placeholder="Lower" />
                </div>
                <div>
                  <Label>Upper bound</Label>
                  <Input value={doubleIntegralUpper} onChange={e => setDoubleIntegralUpper(e.target.value)} placeholder="Upper" />
                </div>
              </div>
              <div>
                <Label>Function</Label>
                <Input value={doubleIntegralFunction} onChange={e => setDoubleIntegralFunction(e.target.value)} placeholder="f(x,y)" />
              </div>
              <div>
                <Label>Variable</Label>
                <Input value={doubleIntegralVariable} onChange={e => setDoubleIntegralVariable(e.target.value)} placeholder="x, dy" />
              </div>
              {(doubleIntegralFunction.trim() || doubleIntegralLower.trim() || doubleIntegralUpper.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\iint_{${doubleIntegralLower || '?'}}^{${doubleIntegralUpper || '?'}} ${doubleIntegralFunction || '?'} \\, d${doubleIntegralVariable || 'x, dy'}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowDoubleIntegralDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleDoubleIntegralInsert} disabled={!doubleIntegralFunction.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {showSummationDialog && (
        <Dialog open={showSummationDialog} onOpenChange={setShowSummationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Summation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Index</Label>
                  <Input value={summationIndex} onChange={e => setSummationIndex(e.target.value)} placeholder="k" />
                </div>
                <div>
                  <Label>From</Label>
                  <Input value={summationLower} onChange={e => setSummationLower(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>To</Label>
                  <Input value={summationUpper} onChange={e => setSummationUpper(e.target.value)} placeholder="n" />
                </div>
              </div>
              <div>
                <Label>Function</Label>
                <Input value={summationFunction} onChange={e => setSummationFunction(e.target.value)} placeholder="f(k)" />
              </div>
              {(summationFunction.trim() || summationLower.trim() || summationUpper.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\sum_{${summationIndex || 'k'}=${summationLower || '?'}}^{${summationUpper || '?'}} ${summationFunction || '?'}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowSummationDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSummationInsert} disabled={!summationFunction.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {showLimitDialog && (
        <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Limit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Variable</Label>
                  <Input value={limitVariable} onChange={e => setLimitVariable(e.target.value)} placeholder="x" />
                </div>
                <div>
                  <Label>Approaches</Label>
                  <Input value={limitApproaches} onChange={e => setLimitApproaches(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div>
                <Label>Function</Label>
                <Input value={limitFunction} onChange={e => setLimitFunction(e.target.value)} placeholder="f(x)" />
              </div>
              {(limitFunction.trim() || limitVariable.trim() || limitApproaches.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\lim_{${limitVariable || 'x'} \\to ${limitApproaches || '?'}} ${limitFunction || '?'}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowLimitDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleLimitInsert} disabled={!limitFunction.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {showRootDialog && (
        <Dialog open={showRootDialog} onOpenChange={setShowRootDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Root</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Degree (leave as 'n' or '2' for square root)</Label>
                <Input value={rootDegree} onChange={e => setRootDegree(e.target.value)} placeholder="n" />
              </div>
              <div>
                <Label>Radicand</Label>
                <Input value={rootRadicand} onChange={e => setRootRadicand(e.target.value)} placeholder="x" />
              </div>
              {(rootDegree.trim() || rootRadicand.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\sqrt${rootDegree !== '2' && rootDegree !== '' ? `[${rootDegree || 'n'}]` : ''}{${rootRadicand || '?'}}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowRootDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleRootInsert} disabled={!rootRadicand.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {showProductDialog && (
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Index</Label>
                  <Input value={productIndex} onChange={e => setProductIndex(e.target.value)} placeholder="i" />
                </div>
                <div>
                  <Label>From</Label>
                  <Input value={productLower} onChange={e => setProductLower(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <Label>To</Label>
                  <Input value={productUpper} onChange={e => setProductUpper(e.target.value)} placeholder="n" />
                </div>
              </div>
              <div>
                <Label>Function</Label>
                <Input value={productFunction} onChange={e => setProductFunction(e.target.value)} placeholder="f(i)" />
              </div>
              {(productFunction.trim() || productLower.trim() || productUpper.trim()) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\prod_{${productIndex || 'i'}=${productLower || '?'}}^{${productUpper || '?'}} ${productFunction || '?'}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowProductDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleProductInsert} disabled={!productFunction.trim()}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Matrix dialog */}
      {showMatrixDialog && (
        <Dialog open={showMatrixDialog} onOpenChange={setShowMatrixDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Insert Matrix</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-4 items-center">
                <div>
                  <Label>Rows</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={matrixRows}
                    onChange={(e) => handleMatrixSizeChange(parseInt(e.target.value) || 2, matrixCols)}
                    className="w-20"
                  />
                </div>
                <div>
                  <Label>Columns</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={matrixCols}
                    onChange={(e) => handleMatrixSizeChange(matrixRows, parseInt(e.target.value) || 2)}
                    className="w-20"
                  />
                </div>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixCols}, 1fr)` }}>
                {matrixElements.map((row, i) =>
                  row.map((cell, j) => (
                    <Input
                      key={`${i}-${j}`}
                      value={cell}
                      onChange={(e) => {
                        const newElements = [...matrixElements];
                        newElements[i][j] = e.target.value;
                        setMatrixElements(newElements);
                      }}
                      placeholder={`(${i + 1},${j + 1})`}
                      className="text-center"
                    />
                  ))
                )}
              </div>
              {matrixElements.some(row => row.some(cell => cell.trim())) && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded p-2 bg-gray-50">
                    <LatexPreview text={`$\\begin{pmatrix} ${matrixElements.map(row => row.map(cell => cell || '?').join(' & ')).join(' \\\\ ')} \\end{pmatrix}$`} small />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowMatrixDialog(false)} variant="outline">Cancel</Button>
                <Button onClick={handleMatrixInsert}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};


export default Screen3;

// Utility: Split text into plain, inline, and block math segments
type LatexSegment = { type: 'inline' | 'block' | 'text'; content: string };
function parseLatexSegments(text: string): LatexSegment[] {
  // Support $...$ (inline), $$...$$ (block), \(...\) (inline), \[...\] (block)
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/g;
  let lastIndex = 0;
  const segments: LatexSegment[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const m = match[0];
    if (m.startsWith('$$') && m.endsWith('$$')) {
      segments.push({ type: 'block', content: m.slice(2, -2) });
    } else if (m.startsWith('\\[') && m.endsWith('\\]')) {
      segments.push({ type: 'block', content: m.slice(2, -2) });
    } else if (m.startsWith('$') && m.endsWith('$')) {
      segments.push({ type: 'inline', content: m.slice(1, -1) });
    } else if (m.startsWith('\\(') && m.endsWith('\\)')) {
      segments.push({ type: 'inline', content: m.slice(2, -2) });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

// LatexPreview component
interface LatexPreviewProps {
  text: string;
  small?: boolean;
}
const LatexPreview: React.FC<LatexPreviewProps> = ({ text, small }) => {
  const segments = parseLatexSegments(text);
  // Simple Markdown (tokens only) -> HTML for preview
  const mdToHtml = (s: string) => {
    let out = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    out = out.replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>');
    out = out.replace(/__(.+?)__/gs, '<u>$1</u>');
    out = out.replace(/~~(.+?)~~/gs, '<s>$1</s>');
    out = out.replace(/_(.+?)_/gs, '<em>$1</em>');
    out = out.replace(/\n/g, '<br />');
    return out;
  };

  return (
    <div className={small ? 'text-xs mt-0.5' : 'text-sm mt-1'}>
      {segments.map((seg, i) => {
        if (seg.type === 'inline') {
          return <InlineMath key={i}>{seg.content}</InlineMath>;
        } else if (seg.type === 'block') {
          return <BlockMath key={i}>{seg.content}</BlockMath>;
        } else {
          // Render text with Markdown tokens applied
          return (
            <span key={i} dangerouslySetInnerHTML={{ __html: mdToHtml(seg.content) }} />
          );
        }
      })}
    </div>
  );
};
