import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Download, X, Upload, Check, ChevronLeft, Save, Trash2, AlertTriangle, FileText, Sigma, Superscript, Subscript, Calendar, Mail, ChevronRight, HelpCircle, FileUp, PlayCircle, RefreshCw, LogOut, Sun, Moon, ChevronUp, ChevronDown, GripVertical, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { uploadImageToImgBB, downloadImageAsFile } from '@/utils/imageUpload';
import emailjs from '@emailjs/browser';
import Screen0 from './Screen0';
import Screen1 from './Screen1';
import Screen2 from './Screen2';
import Screen3 from './Screen3';

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

interface Question {
  id: number;
  question: string;
  topic: string;
  summary: string;
  question_order: number;
  points: number;
  image_path: string;
  image_url: string;
  image: string;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  subject?: string;
  options: Option[];
  imageFile?: File;
  originalImageFileName?: string;
  imgbbUrl?: string;
}
// Extend window type for latestQuestionDistribution
declare global {
  interface Window {
    latestQuestionDistribution?: string;
  }
}

interface Instruction {
  id: number;
  instruction_text: string;
  instruction_order: number;
}

interface QuizMetadata {
  id: number;
  code: string;
  name: string;
  instructor: string;
  course: string;
  year: string;
  academic_year: string;
  subject: string;
  subject_code: string;
  allowed_time: number;
  visible: boolean;
  total_points: number;
  num_displayed_questions: number;
  num_easy_questions: number;
  num_medium_questions: number;
  num_high_questions: number;
  allow_resume: boolean;
  created_at: string;
  updated_at: string;
  created_by: null;
  // Structured fields for schema v2+
  schemaVersion?: number;
  program?: string;
  semester?: string;
  departments?: string[];
  sections?: string[];
  courseDisplay?: string;
}

const QuizCreator = () => {
  // Subjects state for the quiz
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'gradientMeshPop';
  const targetTheme = isDark ? 'solarizedDuo' : 'gradientMeshPop';
  // Match HomePage header styles in both themes
  const headerShell = isDark
    ? 'bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20 text-white'
    : 'bg-[#fdf6e3]/80 backdrop-blur-xl shadow-lg border-b border-amber-200 text-black';
  const footerShellDesktop = isDark
    ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-t border-white/15 text-gray-200'
    : 'bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl border-t border-indigo-200/60 text-gray-700';
  const footerShellMobile = isDark
    ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-t border-white/15 text-gray-200'
    : 'bg-gradient-to-br from-white/70 to-indigo-50/60 backdrop-blur-xl border-t border-indigo-200/60 text-gray-700';
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showFlushDialog, setShowFlushDialog] = useState(false);
  const [showFlushAllDialog, setShowFlushAllDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');
  
  const [activeFormatting, setActiveFormatting] = useState<'none' | 'superscript' | 'subscript'>('none');
  
  const [currentSymbolPage, setCurrentSymbolPage] = useState(1);
  const [showMultiImportDialog, setShowMultiImportDialog] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importingFiles, setImportingFiles] = useState<string[]>([]);
  const [currentImportFile, setCurrentImportFile] = useState('');
  const [pendingZipFiles, setPendingZipFiles] = useState<File[]>([]);
  const [isImportingZips, setIsImportingZips] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop reordering state for pending ZIP rows
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [metadata, setMetadata] = useState<QuizMetadata>({
    id: 1,
    code: '',
    name: '',
    instructor: '',
    course: '',
    year: '',
    academic_year: new Date().getFullYear().toString(),
    subject: '',
    subject_code: '',
    allowed_time: 0,
    visible: true,
    total_points: 0,
    num_displayed_questions: 0,
    num_easy_questions: 0,
    num_medium_questions: 0,
    num_high_questions: 0,
    allow_resume: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  });

  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newInstruction, setNewInstruction] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAdjustTimeout, setQuestionAdjustTimeout] = useState<NodeJS.Timeout | null>(null);

  // Screen1 selection state (moved up to avoid use-before-declare in import helpers)
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [customProgram, setCustomProgram] = useState('');
  const [customDepartments, setCustomDepartments] = useState('');
  const [customSections, setCustomSections] = useState('');

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (questionAdjustTimeout) {
        clearTimeout(questionAdjustTimeout);
      }
    };
  }, [questionAdjustTimeout]);

  // Open the multi-zip import modal
  const openZipImportModal = () => {
    if (isImportingZips) return;
    setPendingZipFiles([]);
    setImportProgress(0);
    setImportingFiles([]);
    setCurrentImportFile('');
    setShowMultiImportDialog(true);
  };

  // Add selected zip files to pending list (dedupe by name+lastModified)
  const addZipFiles = (files: FileList | File[]) => {
    const current = [...pendingZipFiles];
    const seen = new Set(current.map(f => `${f.name}|${f.lastModified}`));
    const toAdd: File[] = [];
    Array.from(files as any).forEach((f: File) => {
      const isZip = f.name.toLowerCase().endsWith('.zip');
      if (!isZip) {
        toast({ title: 'Unsupported file', description: `${f.name} is not a .zip`, variant: 'destructive' });
        return;
      }
      const key = `${f.name}|${f.lastModified}`;
      if (!seen.has(key)) {
        seen.add(key);
        toAdd.push(f);
      }
    });
    if (toAdd.length > 0) setPendingZipFiles([...current, ...toAdd]);
  };

  const movePendingUp = (index: number) => {
    if (index <= 0 || isImportingZips) return;
    const next = [...pendingZipFiles];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setPendingZipFiles(next);
  };

  const movePendingDown = (index: number) => {
    if (index >= pendingZipFiles.length - 1 || isImportingZips) return;
    const next = [...pendingZipFiles];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setPendingZipFiles(next);
  };

  const removePendingAt = (index: number) => {
    if (isImportingZips) return;
    setPendingZipFiles(pendingZipFiles.filter((_, i) => i !== index));
  };

  const handleDropZips: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (isImportingZips) return;
    if (e.dataTransfer?.files?.length) addZipFiles(e.dataTransfer.files);
  };

  // DnD handlers for reordering rows
  const handleRowDragStart = (index: number) => {
    if (isImportingZips) return;
    setDragIndex(index);
  };

  const handleRowDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (isImportingZips) return;
    // If dragging external files, don't show row highlight
    const types = (e.dataTransfer && Array.from(e.dataTransfer.types)) || [];
    if (types.includes('Files')) return;
    setDragOverIndex(index);
  };

  const handleRowDrop = (index: number) => {
    if (isImportingZips) return;
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...pendingZipFiles];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setPendingZipFiles(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleRowDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ===== Structured metadata helpers =====
  const SEM_PATTERN = /^Sem-?([IVX]+|\d+)$/i;
  const KNOWN_PROGRAMS = ['BTech', 'BA', 'MBA', 'MTech', 'PhD'];
  const KNOWN_DEPARTMENTS = ['CSE', 'ME', 'ECE', 'ECOM', 'CE', 'EE', 'IT', 'BT', 'CH', 'N/A'];
  const KNOWN_SECTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'N/A'];

  const normalizeList = (values: string[] = [], known: string[]) => {
    const trimmed = values.map(v => (v || '').trim()).filter(Boolean);
    const knownVals: string[] = [];
    const customVals: string[] = [];
    for (const v of trimmed) {
      if (known.includes(v)) knownVals.push(v);
      else customVals.push(v);
    }
    return { knownVals, customVals };
  };

  // Parse legacy combined course string like:
  //   "BTech_Sem-I CSE, ECE I, II" OR "MBA Sem-II ME IV"
  const parseLegacyCourse = (courseStr: string | undefined) => {
    const result = { program: '', semester: '', departments: [] as string[], sections: [] as string[] };
    if (!courseStr) return result;
    const str = courseStr.trim();
    if (!str) return result;

    const parts = str.split(/\s+/);
    let idx = 0;
    if (parts.length === 0) return result;

    // First token may be PROGRAM or PROGRAM_SEM
    const first = parts[0];
    if (first.includes('_')) {
      const [prog, semMaybe] = first.split('_', 2);
      result.program = prog || '';
      if (semMaybe && SEM_PATTERN.test(semMaybe)) {
        result.semester = semMaybe;
      }
      idx = 1;
    } else {
      // PROG [SEM]?  then rest
      result.program = first;
      idx = 1;
      if (parts[idx] && SEM_PATTERN.test(parts[idx])) {
        result.semester = parts[idx];
        idx += 1;
      }
    }

    const rest = parts.slice(idx).join(' ').trim();
    if (rest) {
      // Try to detect sections at the tail, consisting of roman numerals and/or N/A, comma separated
      const sectionTailMatch = rest.match(/((?:I|II|III|IV|V|VI|VII|VIII|IX|X|N\/A)(?:\s*,\s*(?:I|II|III|IV|V|VI|VII|VIII|IX|X|N\/A))*)\s*$/);
      if (sectionTailMatch) {
        const sectionStr = sectionTailMatch[1];
        result.sections = sectionStr.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
        const deptStr = rest.slice(0, sectionTailMatch.index).trim();
        if (deptStr) result.departments = deptStr.split(/\s*,\s*/).map(d => d.trim()).filter(Boolean);
      } else {
        // No obvious sections tail; treat entire rest as departments
        result.departments = rest.split(/\s*,\s*/).map(d => d.trim()).filter(Boolean);
      }
    }
    return result;
  };

  const applyStructuredToUI = (program: string, semester: string, departments: string[], sections: string[]) => {
    // Program
    if (program && KNOWN_PROGRAMS.includes(program)) {
      setSelectedProgram(program);
      setCustomProgram('');
    } else if (program) {
      setSelectedProgram('custom');
      setCustomProgram(program);
    } else {
      setSelectedProgram('');
      setCustomProgram('');
    }

    // Semester (keep as-is; UI has fixed options but we preserve value)
    setSelectedSemester(semester || '');

    // Departments
    const { knownVals: knownDepts, customVals: customDepts } = normalizeList(departments, KNOWN_DEPARTMENTS);
    if (customDepts.length > 0) {
      setSelectedDepartments([...knownDepts, 'custom']);
      setCustomDepartments(customDepts.join(', '));
    } else {
      setSelectedDepartments(knownDepts);
      setCustomDepartments('');
    }

    // Sections
    const { knownVals: knownSecs, customVals: customSecs } = normalizeList(sections, KNOWN_SECTIONS);
    if (customSecs.length > 0) {
      setSelectedSections([...knownSecs, 'custom']);
      setCustomSections(customSecs.join(', '));
    } else {
      setSelectedSections(knownSecs);
      setCustomSections('');
    }
  };

  const startOrderedZipImport = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsImportingZips(true);
    setImportProgress(0);
    setImportingFiles(files.map(f => f.name));
    setCurrentImportFile('');

    let allQuestions: Question[] = [];
    let firstMetadata: QuizMetadata | null = null;
    let mergedInstructions: Instruction[] = [];
    const seenInstructionKeys = new Set<string>();
    const subjectsSet = new Set<string>();
    let questionIdCounter = 1;

    try {
      toast({ title: 'Multi-ZIP Import Started', description: 'Combining subjects, instructions, and questions in selected order.' });
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentImportFile(file.name);
        setImportProgress(((i + 1) / files.length) * 100);

        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const quizJsonFile = zipContent.file('quiz.json');
        if (!quizJsonFile) {
          toast({ title: 'Invalid ZIP file', description: `No quiz.json file found in ${file.name}`, variant: 'destructive' });
          continue;
        }
        const quizJsonContent = await quizJsonFile.async('text');
        const quizData = JSON.parse(quizJsonContent);
        if (!quizData.quiz) {
          toast({ title: 'Invalid quiz format', description: `The quiz.json in ${file.name} is invalid.`, variant: 'destructive' });
          continue;
        }
        const quiz = quizData.quiz;

        if (!firstMetadata) {
          firstMetadata = {
            id: quiz.id || 1,
            code: quiz.code || '',
            name: quiz.name || '',
            instructor: quiz.instructor || '',
            course: quiz.course || '',
            year: quiz.year || '',
            academic_year: quiz.academic_year || new Date().getFullYear().toString(),
            subject: quiz.subject || '',
            subject_code: quiz.subject_code || '',
            allowed_time: quiz.allowed_time || 0,
            visible: quiz.visible !== undefined ? quiz.visible : true,
            total_points: quiz.total_points || 0,
            num_displayed_questions: quiz.num_displayed_questions || 1,
            num_easy_questions: quiz.num_easy_questions || 0,
            num_medium_questions: quiz.num_medium_questions || 0,
            num_high_questions: quiz.num_high_questions || 0,
            allow_resume: quiz.allow_resume !== undefined ? quiz.allow_resume : false,
            created_at: quiz.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: quiz.created_by || null,
            // carry forward any structured fields if present
            schemaVersion: quiz.schemaVersion,
            program: quiz.program,
            semester: quiz.semester,
            departments: quiz.departments,
            sections: quiz.sections,
            courseDisplay: quiz.courseDisplay,
          };
        }

        // Merge instructions with dedupe by normalized text
        const insts: Instruction[] = (quiz.instructions?.map((inst: any) => ({
          id: inst.id,
          instruction_text: inst.instruction_text,
          instruction_order: inst.instruction_order,
        })) || []);
        for (const inst of insts) {
          const key = inst.instruction_text?.trim().toLowerCase();
          if (key && !seenInstructionKeys.has(key)) {
            seenInstructionKeys.add(key);
            mergedInstructions.push({ ...inst });
          }
        }

        // Merge subjects (topics)
        const subjArr: string[] = quiz.subjects || [];
        for (const s of subjArr) {
          if (!subjectsSet.has(s)) subjectsSet.add(s);
        }

        // Load questions with images from this ZIP
        const questionsWithImages = await Promise.all(
          quiz.questions?.map(async (q: any) => {
            let imageFile: File | undefined;
            if (q.image && zipContent.folder('images')) {
              const imageFileName = q.image.split('/').pop();
              const imageFileInZip = zipContent.file(`images/${imageFileName}`);
              if (imageFileInZip) {
                try {
                  const imageBlob = await imageFileInZip.async('blob');
                  imageFile = new File([imageBlob], imageFileName || 'image.png', { type: imageBlob.type });
                } catch (error) {
                  console.error('Failed to load image:', error);
                }
              }
            }
            return {
              id: questionIdCounter++,
              question: q.question || '',
              topic: q.topic || 'NA',
              summary: q.summary || 'NA',
              question_order: allQuestions.length,
              points: q.points || 1,
              image_path: q.image_path || '',
              image_url: q.image_url || '',
              image: q.image || '',
              difficulty: q.difficulty || 'MEDIUM',
              subject: q.subject || '',
              imageFile,
              originalImageFileName: imageFile?.name,
              options: q.options?.map((opt: any) => ({
                id: opt.id,
                option_text: opt.option_text || '',
                is_correct: opt.is_correct || false,
                option_order: opt.option_order || 0,
              })) || [],
            } as Question;
          }) || []
        );
        allQuestions = [...allQuestions, ...questionsWithImages];
      }

      // Renumber questions sequentially to ensure consistent ordering
      allQuestions = allQuestions.map((q, idx) => ({ ...q, question_order: idx }));

      // Ensure full-screen instruction exists once
      const fullScreenInstructionText = 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.';
      const hasFull = mergedInstructions.some(inst =>
        inst.instruction_text.includes('full screen') ||
        inst.instruction_text.includes('window goes out of focus')
      );
      if (!hasFull) {
        mergedInstructions = [
          {
            id: (mergedInstructions.reduce((m, i) => Math.max(m, i.id || 0), 0) + 1) || 1,
            instruction_text: fullScreenInstructionText,
            instruction_order: 1,
          },
          ...mergedInstructions,
        ];
      }
      // Renumber instruction_order sequentially
      mergedInstructions = mergedInstructions.map((inst, idx) => ({ ...inst, instruction_order: idx + 1 }));

      // Apply combined data
      if (firstMetadata) {
        setMetadata(firstMetadata);
        // Prefer structured fields when schemaVersion >= 2
        if (firstMetadata.schemaVersion && Number(firstMetadata.schemaVersion) >= 2 && (firstMetadata.program || firstMetadata.departments || firstMetadata.sections)) {
          applyStructuredToUI(
            firstMetadata.program || '',
            firstMetadata.semester || '',
            firstMetadata.departments || [],
            firstMetadata.sections || []
          );
        } else {
          const legacy = parseLegacyCourse(firstMetadata.course || '');
          applyStructuredToUI(legacy.program, legacy.semester, legacy.departments, legacy.sections);
        }
      }

      setInstructions(mergedInstructions);
      setSubjects(Array.from(subjectsSet));
      setQuestions(allQuestions);
      setNumberOfQuestions(allQuestions.length);
      setCurrentScreen(1);

      setIsImportingZips(false);
      setShowMultiImportDialog(false);
      setImportProgress(100);
      setImportingFiles([]);
      setCurrentImportFile('');
      setPendingZipFiles([]);

      toast({ title: 'Multi-ZIP Import Successful', description: `Imported ${allQuestions.length} questions from ${files.length} ZIP(s).` });
    } catch (error) {
      console.error('Multi-import error:', error);
      toast({ title: 'Multi-ZIP Import Failed', description: 'Failed to import one or more ZIP files. Please check formats.', variant: 'destructive' });
      setIsImportingZips(false);
      setShowMultiImportDialog(false);
      setImportProgress(0);
      setImportingFiles([]);
      setCurrentImportFile('');
    }
  };

  const flushAllScreens = () => {
    // Screen 1 fields
    setMetadata(prev => ({
      ...prev,
      code: '',
      name: '',
      instructor: '',
      course: '',
      year: '',
      academic_year: new Date().getFullYear().toString(),
      subject: '',
      subject_code: '',
      allowed_time: 0,
      total_points: 0,
      num_displayed_questions: 0,
      num_easy_questions: 0,
      num_medium_questions: 0,
      num_high_questions: 0,
      allow_resume: false,
      updated_at: new Date().toISOString(),
    }));
    setSelectedProgram('');
    setSelectedSemester('');
    setSelectedDepartments([]);
    setSelectedSections([]);
    setCustomProgram('');
    setCustomDepartments('');
    setCustomSections('');
    // Clear Screen 2 topic/subject list
    setSubjects([]);
    setNewSubject('');
    // Clear Screen 2 topic/subject list
    setSubjects([]);
    setNewSubject('');

    // Screen 2 fields
    const defaultInstruction: Instruction = {
      id: 1,
      instruction_text:
        'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
      instruction_order: 1,
    };
    setInstructions([defaultInstruction]);
    setNewInstruction('');
    setSubjects([]);
    setNewSubject('');

    // Screen 3 fields
    initializeDefaultQuestion();
    setNumberOfQuestions(1);
    setCurrentQuestionIndex(0);
    setOptionFormatting({});
    setOptionSymbolPage({});
    if (questionAdjustTimeout) clearTimeout(questionAdjustTimeout);
    setQuestionAdjustTimeout(null);

    setShowFlushAllDialog(false);
    toast({
      title: 'All Screens Cleared',
      description: 'All fields were cleared. Saved session remains intact.',
    });
  };

  const [skipLoadSavedData, setSkipLoadSavedData] = useState(false);

  // Place these at the top level of QuizCreator, after other useState hooks:
  const [optionFormatting, setOptionFormatting] = useState<{ [optionId: number]: 'none' | 'superscript' | 'subscript' }>({});
  const [optionSymbolPage, setOptionSymbolPage] = useState<{ [optionId: number]: number }>({});

  const programs = [
    { value: 'BTech', label: 'BTech', years: 4 },
    { value: 'BA', label: 'BA', years: 3 },
    { value: 'MBA', label: 'MBA', years: 2 },
    { value: 'MTech', label: 'MTech', years: 2 },
    { value: 'PhD', label: 'PhD', years: 5 },
    { value: 'custom', label: 'Other (Type your own)', years: 4 }
  ];

  const departments = [
    'CSE', 'ME', 'ECE', 'ECOM', 'CE', 'EE', 'IT', 'BT', 'CH', 'custom'
  ];

  const sections = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'custom'];

  const mostFrequentSymbols = [
    { symbol: '±', name: 'Plus-minus' },
    { symbol: '×', name: 'Multiplication' },
    { symbol: '÷', name: 'Division' },
    { symbol: '≠', name: 'Not equal' },
    { symbol: '≈', name: 'Approximately' },
    { symbol: '≤', name: 'Less than or equal' },
    { symbol: '≥', name: 'Greater than or equal' },
    { symbol: '∞', name: 'Infinity' },
    { symbol: 'π', name: 'Pi' },
    { symbol: '√', name: 'Square root' },
    { symbol: '²', name: 'Superscript 2' },
    { symbol: '³', name: 'Superscript 3' },
    { symbol: '∑', name: 'Summation' },
    { symbol: '∫', name: 'Integral' },
    { symbol: '∂', name: 'Partial derivative' },
    { symbol: '∆', name: 'Delta/Laplacian' },
    { symbol: '°', name: 'Degree' },
    { symbol: '%', name: 'Percent' },
    { symbol: 'α', name: 'Alpha' },
    { symbol: 'β', name: 'Beta' },
    { symbol: 'γ', name: 'Gamma' },
    { symbol: 'δ', name: 'Delta' },
    { symbol: 'θ', name: 'Theta' },
    { symbol: 'λ', name: 'Lambda' },
    { symbol: 'μ', name: 'Mu' },
    { symbol: 'σ', name: 'Sigma' },
    { symbol: 'φ', name: 'Phi' },
    { symbol: 'ω', name: 'Omega' },
  ];

  const frequentSymbols = [
    { symbol: '∓', name: 'Minus-plus' },
    { symbol: '∙', name: 'Bullet operator' },
    { symbol: '∘', name: 'Ring operator' },
    { symbol: '≡', name: 'Identical to' },
    { symbol: '≪', name: 'Much less than' },
    { symbol: '≫', name: 'Much greater than' },
    { symbol: '∝', name: 'Proportional to' },
    { symbol: 'e', name: 'Euler\'s number' },
    { symbol: '∛', name: 'Cube root' },
    { symbol: '∜', name: 'Fourth root' },
    { symbol: '⁴', name: 'Superscript 4' },
    { symbol: '⁵', name: 'Superscript 5' },
    { symbol: '⁻¹', name: 'Superscript -1' },
    { symbol: '∏', name: 'Product' },
    { symbol: '∬', name: 'Double integral' },
    { symbol: '∭', name: 'Triple integral' },
    { symbol: '∇', name: 'Nabla/Del' },
    { symbol: '∴', name: 'Therefore' },
    { symbol: '∵', name: 'Because' },
    { symbol: 'ε', name: 'Epsilon' },
    { symbol: 'ζ', name: 'Zeta' },
    { symbol: 'η', name: 'Eta' },
    { symbol: 'ι', name: 'Iota' },
    { symbol: 'κ', name: 'Kappa' },
    { symbol: 'ν', name: 'Nu' },
    { symbol: 'ξ', name: 'Xi' },
    { symbol: 'ρ', name: 'Rho' },
    { symbol: 'τ', name: 'Tau' },
    { symbol: 'υ', name: 'Upsilon' },
    { symbol: 'χ', name: 'Chi' },
    { symbol: 'ψ', name: 'Psi' },
    { symbol: '∈', name: 'Element of' },
    { symbol: '∉', name: 'Not an element of' },
    { symbol: '⊂', name: 'Subset of' },
    { symbol: '⊃', name: 'Superset of' },
    { symbol: '∪', name: 'Union' },
    { symbol: '∩', name: 'Intersection' },
    { symbol: '∅', name: 'Empty set' },
  ];

  const rarelyUsedSymbols = [
    { symbol: 'ℏ', name: 'Reduced Planck constant' },
    { symbol: 'ℓ', name: 'Script l' },
    { symbol: '∮', name: 'Contour integral' },
    { symbol: '⊆', name: 'Subset of or equal to' },
    { symbol: '⊇', name: 'Superset of or equal to' },
    { symbol: '∀', name: 'For all' },
    { symbol: '∃', name: 'There exists' },
    { symbol: '∄', name: 'There does not exist' },
    { symbol: '∧', name: 'Logical and' },
    { symbol: '∨', name: 'Logical or' },
    { symbol: '¬', name: 'Logical not' },
    { symbol: '⊕', name: 'Exclusive or' },
    { symbol: '→', name: 'Implies' },
    { symbol: '↔', name: 'If and only if' },
    { symbol: 'Α', name: 'Alpha (capital)' },
    { symbol: 'Β', name: 'Beta (capital)' },
    { symbol: 'Γ', name: 'Gamma (capital)' },
    { symbol: 'Δ', name: 'Delta (capital)' },
    { symbol: 'Ε', name: 'Epsilon (capital)' },
    { symbol: 'Ζ', name: 'Zeta (capital)' },
    { symbol: 'Η', name: 'Eta (capital)' },
    { symbol: 'Θ', name: 'Theta (capital)' },
    { symbol: 'Ι', name: 'Iota (capital)' },
    { symbol: 'Κ', name: 'Kappa (capital)' },
    { symbol: 'Λ', name: 'Lambda (capital)' },
    { symbol: 'Μ', name: 'Mu (capital)' },
    { symbol: 'Ν', name: 'Nu (capital)' },
    { symbol: 'Ξ', name: 'Xi (capital)' },
    { symbol: 'Ο', name: 'Omicron (capital)' },
    { symbol: 'Π', name: 'Pi (capital)' },
    { symbol: 'Ρ', name: 'Rho (capital)' },
    { symbol: 'Σ', name: 'Sigma (capital)' },
    { symbol: 'Τ', name: 'Tau (capital)' },
    { symbol: 'Υ', name: 'Upsilon (capital)' },
    { symbol: 'Φ', name: 'Phi (capital)' },
    { symbol: 'Χ', name: 'Chi (capital)' },
    { symbol: 'Ψ', name: 'Psi (capital)' },
    { symbol: 'Ω', name: 'Omega (capital)' },
    { symbol: '∠', name: 'Angle' },
    { symbol: '⊥', name: 'Perpendicular' },
    { symbol: '∥', name: 'Parallel' },
    { symbol: '△', name: 'Triangle' },
    { symbol: '□', name: 'Square' },
    { symbol: '◯', name: 'Circle' },
    { symbol: '↑', name: 'Up arrow' },
    { symbol: '↓', name: 'Down arrow' },
    { symbol: '←', name: 'Left arrow' },
    { symbol: '⇒', name: 'Double right arrow' },
    { symbol: '⇔', name: 'Double left-right arrow' },
    { symbol: '§', name: 'Section sign' },
    { symbol: '¶', name: 'Paragraph sign' },
    { symbol: '†', name: 'Dagger' },
    { symbol: '‡', name: 'Double dagger' },
    { symbol: '•', name: 'Bullet' },
    { symbol: '‰', name: 'Per mille' },
    { symbol: '℃', name: 'Celsius' },
    { symbol: '℉', name: 'Fahrenheit' },
    { symbol: 'Å', name: 'Angstrom' },
    { symbol: '℧', name: 'Mho' },
  ];

  const getCurrentSymbols = () => {
    switch (currentSymbolPage) {
      case 1:
        return mostFrequentSymbols;
      case 2:
        return frequentSymbols;
      case 3:
        return rarelyUsedSymbols;
      default:
        return mostFrequentSymbols;
    }
  };

  const getPageTitle = () => {
    switch (currentSymbolPage) {
      case 1:
        return 'Most Frequent Symbols';
      case 2:
        return 'Frequent Symbols';
      case 3:
        return 'Rarely Used Symbols';
      default:
        return 'Mathematical Symbols';
    }
  };

  useEffect(() => {
    emailjs.init('wnSCgvOBG9hB6q1_g');
  }, []);

  useEffect(() => {
    const loadSavedData = async () => {
      // Skip loading saved data if user explicitly wants to start new quiz
      if (skipLoadSavedData) {
        setSkipLoadSavedData(false); // Reset the flag
        return;
      }
      
      const savedData = localStorage.getItem('quizCreatorData');
      if (savedData) {
        await loadSavedDataFromStorage();
        setCurrentScreen(0);
      } else {
        const defaultInstruction: Instruction = {
          id: 1,
          instruction_text: 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
          instruction_order: 1,
        };
        setInstructions([defaultInstruction]);
        
        initializeDefaultQuestion();
      }

      // Always regenerate quiz code on fresh website load (regardless of saved session)
      const newCode = (() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let out = '';
        for (let i = 0; i < 6; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
        return out;
      })();
      setMetadata(prev => ({ ...prev, code: newCode }));
    };
    
    loadSavedData();
  }, []);

  const initializeDefaultQuestion = () => {
    const defaultQuestion: Question = {
      id: 1,
      question: '',
      topic: 'N/A - N/A',
      summary: 'NA',
      question_order: 0,
      points: 1,
      image_path: '',
      image_url: '',
      image: '',
      difficulty: 'MEDIUM',
      options: [
        { id: 1, option_text: '', is_correct: false, option_order: 0 },
        { id: 2, option_text: '', is_correct: false, option_order: 0 },
        { id: 3, option_text: '', is_correct: false, option_order: 0 },
        { id: 4, option_text: '', is_correct: false, option_order: 0 },
      ],
    };
    setQuestions([defaultQuestion]);
  };

  useEffect(() => {
    let courseValue = '';
    const program = selectedProgram === 'custom' ? customProgram : selectedProgram;
    const semester = selectedSemester;
    const departmentStr = selectedDepartments.includes('custom')
      ? customDepartments
      : selectedDepartments.join(', ');
    const sectionStr = selectedSections.includes('custom')
      ? customSections
      : selectedSections.join(', ');
    
    if (program || semester || departmentStr || sectionStr) {
      courseValue = `${program}${semester ? `_${semester}` : ''} ${departmentStr} ${sectionStr}`.trim();
    }
    
    setMetadata(prev => ({ ...prev, course: courseValue }));
  }, [selectedProgram, selectedSemester, selectedDepartments, selectedSections, customProgram, customDepartments, customSections]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const programYears = programs.find(p => p.value === selectedProgram)?.years || 4;
    const options = [];
    
    for (let startYear = 2021; startYear <= currentYear + 1; startYear++) {
      const endYear = startYear + programYears;
      options.push(`${startYear}-${endYear}`);
    }
    
    return options;
  };

  const loadSavedDataFromStorage = async () => {
    const savedData = localStorage.getItem('quizCreatorData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setMetadata(parsed.metadata || metadata);
      
      if (parsed.instructions && parsed.instructions.length > 0) {
        setInstructions(parsed.instructions);
      } else {
        const defaultInstruction: Instruction = {
          id: 1,
          instruction_text: 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
          instruction_order: 1,
        };
        setInstructions([defaultInstruction]);
      }
      
      const loadedQuestions = parsed.questions || [];
      
      const questionsWithImages = await Promise.all(
        loadedQuestions.map(async (q: Question) => {
          if (q.imgbbUrl && q.originalImageFileName) {
            try {
              const imageFile = await downloadImageAsFile(q.imgbbUrl, q.originalImageFileName);
              return { ...q, imageFile };
            } catch (error) {
              console.error('Failed to download image for question', q.id, error);
              toast({
                title: "Image Download Failed",
                description: `Failed to restore image for question ${q.id}`,
                variant: "destructive",
              });
              return { ...q, imageFile: undefined };
            }
          }
          return { ...q, imageFile: undefined };
        })
      );
      
      setQuestions(questionsWithImages);
      
      const displayedQuestions = parsed.metadata?.num_displayed_questions || 1;
      const totalQuestions = Math.max(displayedQuestions, parsed.numberOfQuestions || 1);
      setNumberOfQuestions(totalQuestions);
      
      setSelectedProgram(parsed.selectedProgram || '');
      setSelectedSemester(parsed.selectedSemester || '');
      // Migrate legacy single department (string) to new array-based departments
      if (parsed.selectedDepartments) {
        setSelectedDepartments(parsed.selectedDepartments);
      } else if (parsed.selectedDepartment) {
        setSelectedDepartments(parsed.selectedDepartment ? [parsed.selectedDepartment] : []);
      } else {
        setSelectedDepartments([]);
      }
      setSelectedSections(parsed.selectedSections || []);
      setCustomProgram(parsed.customProgram || '');
      if (parsed.customDepartments !== undefined) {
        setCustomDepartments(parsed.customDepartments);
      } else if (parsed.customDepartment !== undefined) {
        setCustomDepartments(parsed.customDepartment);
      } else {
        setCustomDepartments('');
      }
      setCustomSections(parsed.customSections || '');
      setSubjects(parsed.subjects || []); // Load the subjects list for Screen2/Screen3
      
      toast({
        title: "Session Loaded",
        description: "Your saved session has been restored successfully.",
      });
    } else {
      toast({
        title: "No Saved Session",
        description: "No saved session found. Start creating a new quiz.",
        variant: "destructive",
      });
    }
  };

  const loadFromSavedSession = async () => {
    await loadSavedDataFromStorage();
    setCurrentScreen(1);
  };

  const startNewQuiz = () => {
    // Set flag to skip loading saved data
    setSkipLoadSavedData(true);
    
    // Reset metadata to default values (don't clear localStorage)
    setMetadata({
      id: 1,
      code: '',
      name: '',
      instructor: '',
      course: '',
      year: '',
      academic_year: new Date().getFullYear().toString(),
      subject: '',
      subject_code: '',
      allowed_time: 0,
      visible: true,
      total_points: 0,
      num_displayed_questions: 0,
      num_easy_questions: 0,
      num_medium_questions: 0,
      num_high_questions: 0,
      allow_resume: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
    });
    
    // Reset instructions to default
    const defaultInstruction: Instruction = {
      id: 1,
      instruction_text: 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
      instruction_order: 1,
    };
    setInstructions([defaultInstruction]);
    
    // Reset questions to default
    initializeDefaultQuestion();
    
    // Reset form state variables
    setCurrentScreen(1);
    setNumberOfQuestions(1);
    setSelectedProgram('');
    setSelectedSemester('');
    setSelectedDepartments([]);
    setSelectedSections([]);
    setCustomProgram('');
    setCustomDepartments('');
    setCustomSections('');
    // Clear Screen 2 topic/subject list
    setSubjects([]);
    setNewSubject('');
    
    toast({
      title: "New Quiz Started",
      description: "Form has been reset. Your previous saved session is still available.",
    });
  };

  const importFromZip = async (file: File) => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      const quizJsonFile = zipContent.file('quiz.json');
      if (!quizJsonFile) {
        toast({
          title: "Invalid ZIP file",
          description: "No quiz.json file found in the ZIP.",
          variant: "destructive",
        });
        return;
      }

      const quizJsonContent = await quizJsonFile.async('text');
      const quizData = JSON.parse(quizJsonContent);
      
      if (!quizData.quiz) {
        toast({
          title: "Invalid quiz format",
          description: "The quiz.json file does not contain valid quiz data.",
          variant: "destructive",
        });
        return;
      }

      const quiz = quizData.quiz;
      
      // Load metadata
      setMetadata({
        id: quiz.id || 1,
        code: quiz.code || '',
        name: quiz.name || '',
        instructor: quiz.instructor || '',
        course: quiz.course || '',
        year: quiz.year || '',
        academic_year: quiz.academic_year || new Date().getFullYear().toString(),
        subject: quiz.subject || '',
        subject_code: quiz.subject_code || '',
        allowed_time: quiz.allowed_time || 0,
        visible: quiz.visible !== undefined ? quiz.visible : true,
        total_points: quiz.total_points || 0,
        num_displayed_questions: quiz.num_displayed_questions || 1,
        num_easy_questions: quiz.num_easy_questions || 0,
        num_medium_questions: quiz.num_medium_questions || 0,
        num_high_questions: quiz.num_high_questions || 0,
        allow_resume: quiz.allow_resume !== undefined ? quiz.allow_resume : false,
        created_at: quiz.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: quiz.created_by || null,
      });

      // Parse course field to set program/departments/sections
      if (quiz.course) {
        const courseParts = quiz.course.split(' ').filter(part => part.trim() !== '');
        if (courseParts.length > 0) {
          // Set as custom since we can't match exactly
          setSelectedProgram('custom');
          setCustomProgram(courseParts[0] || '');

          if (courseParts.length > 1) {
            setSelectedDepartments(['custom']);
            setCustomDepartments(courseParts[1] || '');
          }

          if (courseParts.length > 2) {
            setSelectedSections(['custom']);
            setCustomSections(courseParts.slice(2).join(' '));
          }
        }
      }

      // Load instructions
      const importedInstructions: Instruction[] = quiz.instructions?.map((inst: any) => ({
        id: inst.id,
        instruction_text: inst.instruction_text,
        instruction_order: inst.instruction_order,
      })) || [];
      
      // Check if full screen instruction exists, if not add it
      const fullScreenInstructionText = 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.';
      const hasFullScreenInstruction = importedInstructions.some(inst => 
        inst.instruction_text.includes('full screen') || 
        inst.instruction_text.includes('window goes out of focus')
      );
      
      let finalInstructions = importedInstructions;
      if (!hasFullScreenInstruction) {
        const fullScreenInstruction: Instruction = {
          id: Math.max(...importedInstructions.map(inst => inst.id), 0) + 1,
          instruction_text: fullScreenInstructionText,
          instruction_order: Math.max(...importedInstructions.map(inst => inst.instruction_order), 0) + 1,
        };
        finalInstructions = [fullScreenInstruction, ...importedInstructions];
      }
      
      setInstructions(finalInstructions);

      // Load subjects list for Screen2/Screen3
      setSubjects(quiz.subjects || []);

      // Load questions with images
      const questionsWithImages = await Promise.all(
        quiz.questions?.map(async (q: any) => {
          let imageFile: File | undefined;
          
          if (q.image && zipContent.folder('images')) {
            const imageFileName = q.image.split('/').pop();
            const imageFileInZip = zipContent.file(`images/${imageFileName}`);
            
            if (imageFileInZip) {
              try {
                const imageBlob = await imageFileInZip.async('blob');
                imageFile = new File([imageBlob], imageFileName || 'image.png', { type: imageBlob.type });
              } catch (error) {
                console.error('Failed to load image:', error);
              }
            }
          }

          return {
            id: q.id,
            question: q.question || '',
            topic: q.topic || 'NA',
            summary: q.summary || 'NA',
            question_order: q.question_order || 0,
            points: q.points || 1,
            image_path: q.image_path || '',
            image_url: q.image_url || '',
            image: q.image || '',
            difficulty: q.difficulty || 'MEDIUM',
            subject: q.subject || '',
            imageFile,
            originalImageFileName: imageFile?.name,
            options: q.options?.map((opt: any) => ({
              id: opt.id,
              option_text: opt.option_text || '',
              is_correct: opt.is_correct || false,
              option_order: opt.option_order || 0,
            })) || [],
          };
        }) || []
      );

      setQuestions(questionsWithImages);
      setNumberOfQuestions(questionsWithImages.length);
      setCurrentScreen(1);
      
      toast({
        title: "Import Successful",
        description: "Quiz data has been imported successfully.",
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import the ZIP file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const sendReminderEmail = async (date: string, time: string, email: string) => {
    try {
      const startDateTime = new Date(`${date}T${time}:00+05:30`);
      const endDateTime = new Date(startDateTime.getTime() + (metadata.allowed_time * 60 * 1000));

      const formatDateForGoogle = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(`Quiz: ${metadata.name}`)}` +
        `&dates=${formatDateForGoogle(startDateTime)}/${formatDateForGoogle(endDateTime)}`;

      const templateParams = {
        to_email: email,
        from_name: 'PrashnaSetu',
        from_email: 'quizbuilder86@gmail.com',
        quiz_name: metadata.name,
        quiz_date: date,
        quiz_time: time,
        subject: metadata.subject,
        instructor: metadata.instructor,
        course: metadata.course,
        allowed_time: metadata.allowed_time,
        quiz_code: metadata.code,
        link: calendarUrl,
      };

      const response = await emailjs.send(
        'default_service',
        'template_quiz_reminder',
        templateParams,
        'wnSCgvOBG9hB6q1_g'
      );

      if (response.status === 200) {
        toast({
          title: "Email Sent Successfully!",
          description: `Quiz email has been sent to ${email} for ${date} at ${time}`,
        });
      }
    } catch (error) {
      console.error('Failed to send reminder email:', error);
      toast({
        title: "Reminder Failed",
        description: "Failed to schedule email reminder. Please check your email address and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const saveSession = async () => {
    try {
      const questionsWithUploadedImages = await Promise.all(
        questions.map(async (q) => {
          if (q.imageFile && !q.imgbbUrl) {
            try {
              const imgbbUrl = await uploadImageToImgBB(q.imageFile);
              return {
                ...q,
                imgbbUrl,
                originalImageFileName: q.imageFile.name,
              };
            } catch (error) {
              console.error('Failed to upload image for question', q.id, error);
              toast({
                title: "Image Upload Failed",
                description: `Failed to save image for question ${q.id}`,
                variant: "destructive",
              });
              return q;
            }
          }
          return q;
        })
      );

      setQuestions(questionsWithUploadedImages);

      const questionsForSave = questionsWithUploadedImages.map(q => {
        const { imageFile, ...questionWithoutFile } = q;
        return questionWithoutFile;
      });

      const dataToSave = {
        metadata,
        instructions,
        questions: questionsForSave,
        currentScreen,
        numberOfQuestions,
        selectedProgram,
        selectedSemester,
        selectedDepartments,
        selectedSections,
        customProgram,
        customDepartments,
        customSections,
        subjects, // Save the subject list from Screen2/Screen3
      };
      
      localStorage.setItem('quizCreatorData', JSON.stringify(dataToSave));
      toast({
        title: "Session Saved",
        description: "Your progress and images have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const flushData = () => {
    // Clear only fields of the CURRENT screen. Do not modify localStorage so user can restore previous session.
    switch (currentScreen) {
      case 1: {
        // Screen 1: Quiz Information
        setMetadata(prev => ({
          ...prev,
          code: '',
          name: '',
          instructor: '',
          course: '',
          year: '',
          academic_year: new Date().getFullYear().toString(),
          subject: '',
          subject_code: '',
          allowed_time: 0,
          total_points: 0,
          num_displayed_questions: 0,
          num_easy_questions: 0,
          num_medium_questions: 0,
          num_high_questions: 0,
          allow_resume: false,
          updated_at: new Date().toISOString(),
        }));

        setSelectedProgram('');
        setSelectedSemester('');
        setSelectedDepartments([]);
        setSelectedSections([]);
        setCustomProgram('');
        setCustomDepartments('');
        setCustomSections('');
        break;
      }
      case 2: {
        // Screen 2: Instructions and Topics
        const defaultInstruction: Instruction = {
          id: 1,
          instruction_text:
            'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
          instruction_order: 1,
        };
        setInstructions([defaultInstruction]);
        setNewInstruction('');
        setSubjects([]);
        setNewSubject('');
        break;
      }
      case 3: {
        // Screen 3: Delete the current question (same behavior as the trash button)
        const current = questions[currentQuestionIndex];
        if (current) {
          deleteQuestion(current.id);
        }
        break;
      }
      default: {
        // Home or other screens: nothing to clear
        break;
      }
    }

    setShowFlushDialog(false);
    if (currentScreen === 3) {
      toast({
        title: 'Question Deleted',
      });
    } else {
      toast({
        title: 'Screen Cleared',
        description: 'Only the current screen\'s fields were cleared. Saved session remains intact.',
      });
    }
  };

  const adjustQuestions = (newCount: number) => {
    // Use the requested count directly; no minimum enforcement based on num_displayed_questions
    const actualCount = Math.max(newCount, 0);
    
    if (actualCount > questions.length) {
      const additionalQuestions = [];
      // Generate unique IDs starting after the current max ID
      const startId = (questions.reduce((m, q) => Math.max(m, q.id || 0), 0)) + 1;
      for (let i = questions.length; i < actualCount; i++) {
        additionalQuestions.push({
          id: startId + (i - questions.length),
          question: '',
          topic: 'NA',
          summary: 'NA',
          question_order: i,
          points: 1,
          image_path: '',
          image_url: '',
          image: '',
          difficulty: 'MEDIUM',
          options: [
            { id: 1, option_text: '', is_correct: false, option_order: 0 },
            { id: 2, option_text: '', is_correct: false, option_order: 0 },
            { id: 3, option_text: '', is_correct: false, option_order: 0 },
            { id: 4, option_text: '', is_correct: false, option_order: 0 },
          ],
        });
      }
      setQuestions([...questions, ...additionalQuestions]);
    } else if (actualCount < questions.length) {
      setQuestions(questions.slice(0, actualCount));
      if (currentQuestionIndex >= actualCount) {
        setCurrentQuestionIndex(Math.max(0, actualCount - 1));
      }
    } else if (questions.length === 0 && actualCount > 0) {
      const newQuestions = [];
      // Start IDs from 1 when list is empty
      const startId = 1;
      for (let i = 0; i < actualCount; i++) {
        newQuestions.push({
          id: startId + i,
          question: '',
          topic: 'NA',
          summary: 'NA',
          question_order: i,
          points: 1,
          image_path: '',
          image_url: '',
          image: '',
          difficulty: 'MEDIUM',
          options: [
            { id: 1, option_text: '', is_correct: false, option_order: 0 },
            { id: 2, option_text: '', is_correct: false, option_order: 0 },
            { id: 3, option_text: '', is_correct: false, option_order: 0 },
            { id: 4, option_text: '', is_correct: false, option_order: 0 },
          ],
        });
      }
      setQuestions(newQuestions);
    }
    setNumberOfQuestions(actualCount);
    setMetadata(prev => ({ ...prev, total_points: actualCount }));
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      const instruction: Instruction = {
        id: instructions.length + 1,
        instruction_text: newInstruction,
        instruction_order: instructions.length + 1,
      };
      setInstructions([...instructions, instruction]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (id: number) => {
    setInstructions(instructions.filter(inst => inst.id !== id));
  };

  const updateQuestion = (questionId: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: number, optionId: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map(opt => 
              opt.id === optionId ? { ...opt, [field]: value } : opt
            )
          }
        : q
    ));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: [...q.options, {
              id: q.options.reduce((maxId, o) => Math.max(maxId, o.id), 0) + 1,
              option_text: '',
              is_correct: false,
              option_order: q.options.length,
            }]
          }
        : q
    ));
  };

  const removeOption = (questionId: number, optionId: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.filter(opt => opt.id !== optionId) }
        : q
    ));
  };

  const handleImageUpload = async (questionId: number, file: File) => {
    const fileName = file.name;
    const uuid = crypto.randomUUID();
    const fileExtension = fileName.split('.').pop();
    const newFileName = `${uuid}.${fileExtension}`;
    
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            imageFile: file,
            originalImageFileName: file.name,
            imgbbUrl: undefined,
            image_path: `quiz_images\\${newFileName}`,
            image_url: `http://192.168.1.194:8080/${newFileName}`,
            image: `images/${newFileName}`,
          }
        : q
    ));
  };

  const removeImage = (questionId: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            imageFile: undefined,
            originalImageFileName: undefined,
            imgbbUrl: undefined,
            image_path: '',
            image_url: '',
            image: '',
          }
        : q
    ));
  };

  const deleteQuestion = (questionId: number) => {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) return;

    // Remove the question
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    
    // Update question_order for remaining questions
    const reorderedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      question_order: index
    }));
    
    setQuestions(reorderedQuestions);
    setNumberOfQuestions(reorderedQuestions.length);
    
    // Adjust current question index if needed
    if (reorderedQuestions.length === 0) {
      setCurrentQuestionIndex(0);
    } else if (currentQuestionIndex >= reorderedQuestions.length) {
      setCurrentQuestionIndex(reorderedQuestions.length - 1);
    } else if (currentQuestionIndex >= questionIndex) {
      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }
    
    toast({
      title: "Question Deleted",
    });
  };

  const importFromMultipleZips = async (files: FileList) => {
    if (files.length === 0) return;

    setShowMultiImportDialog(true);
    setImportProgress(0);
    setImportingFiles(Array.from(files).map(f => f.name));
    setCurrentImportFile('');

    let allQuestions: Question[] = [];
    let firstMetadata: QuizMetadata | null = null;
    let firstInstructions: Instruction[] = [];
    let questionIdCounter = 1;

    try {
      // Show initial toast
      toast({
        title: "Multi-ZIP Import Started",
        description: `Questions will be combined. Quiz metadata and instructions will be from the first ZIP file.`,
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentImportFile(file.name);
        setImportProgress(((i + 1) / files.length) * 100);

        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        const quizJsonFile = zipContent.file('quiz.json');
        if (!quizJsonFile) {
          toast({
            title: "Invalid ZIP file",
            description: `No quiz.json file found in ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        const quizJsonContent = await quizJsonFile.async('text');
        const quizData = JSON.parse(quizJsonContent);
        
        if (!quizData.quiz) {
          toast({
            title: "Invalid quiz format",
            description: `The quiz.json file in ${file.name} does not contain valid quiz data.`,
            variant: "destructive",
          });
          continue;
        }

        const quiz = quizData.quiz;

        // Use metadata and instructions from first ZIP only
        if (i === 0) {
          firstMetadata = {
            id: quiz.id || 1,
            code: quiz.code || '',
            name: quiz.name || '',
            instructor: quiz.instructor || '',
            course: quiz.course || '',
            year: quiz.year || '',
            academic_year: quiz.academic_year || new Date().getFullYear().toString(),
            subject: quiz.subject || '',
            subject_code: quiz.subject_code || '',
            allowed_time: quiz.allowed_time || 0,
            visible: quiz.visible !== undefined ? quiz.visible : true,
            total_points: quiz.total_points || 0,
            num_displayed_questions: quiz.num_displayed_questions || 1,
            num_easy_questions: quiz.num_easy_questions || 0,
            num_medium_questions: quiz.num_medium_questions || 0,
            num_high_questions: quiz.num_high_questions || 0,
            allow_resume: quiz.allow_resume !== undefined ? quiz.allow_resume : false,
            created_at: quiz.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: quiz.created_by || null,
          };

          firstInstructions = quiz.instructions?.map((inst: any) => ({
            id: inst.id,
            instruction_text: inst.instruction_text,
            instruction_order: inst.instruction_order,
          })) || [];
          
          // Check if full screen instruction exists, if not add it
          const fullScreenInstructionText = 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.';
          const hasFullScreenInstruction = firstInstructions.some(inst => 
            inst.instruction_text.includes('full screen') || 
            inst.instruction_text.includes('window goes out of focus')
          );
          
          if (!hasFullScreenInstruction) {
            const fullScreenInstruction: Instruction = {
              id: Math.max(...firstInstructions.map(inst => inst.id), 0) + 1,
              instruction_text: fullScreenInstructionText,
              instruction_order: Math.max(...firstInstructions.map(inst => inst.instruction_order), 0) + 1,
            };
            firstInstructions = [fullScreenInstruction, ...firstInstructions];
          }
          
          // Load subjects list from first ZIP only (for Screen2/Screen3)
          setSubjects(quiz.subjects || []);
        }

        // Load questions with images from all ZIPs
        const questionsWithImages = await Promise.all(
          quiz.questions?.map(async (q: any) => {
            let imageFile: File | undefined;
            
            if (q.image && zipContent.folder('images')) {
              const imageFileName = q.image.split('/').pop();
              const imageFileInZip = zipContent.file(`images/${imageFileName}`);
              
              if (imageFileInZip) {
                try {
                  const imageBlob = await imageFileInZip.async('blob');
                  imageFile = new File([imageBlob], imageFileName || 'image.png', { type: imageBlob.type });
                } catch (error) {
                  console.error('Failed to load image:', error);
                }
              }
            }

            return {
              id: questionIdCounter++,
              question: q.question || '',
              topic: q.topic || 'NA',
              summary: q.summary || 'NA',
              question_order: allQuestions.length,
              points: q.points || 1,
              image_path: q.image_path || '',
              image_url: q.image_url || '',
              image: q.image || '',
              difficulty: q.difficulty || 'MEDIUM',
              subject: q.subject || '',
              imageFile,
              originalImageFileName: imageFile?.name,
              options: q.options?.map((opt: any) => ({
                id: opt.id,
                option_text: opt.option_text || '',
                is_correct: opt.is_correct || false,
                option_order: opt.option_order || 0,
              })) || [],
            };
          }) || []
        );

        allQuestions = [...allQuestions, ...questionsWithImages];
      }

      // Set the combined data
      if (firstMetadata) {
        setMetadata(firstMetadata);
        // Prefer structured fields when schemaVersion >= 2
        if (firstMetadata.schemaVersion && Number(firstMetadata.schemaVersion) >= 2 && (firstMetadata.program || firstMetadata.departments || firstMetadata.sections)) {
          applyStructuredToUI(
            firstMetadata.program || '',
            firstMetadata.semester || '',
            firstMetadata.departments || [],
            firstMetadata.sections || []
          );
        } else {
          const legacy = parseLegacyCourse(firstMetadata.course || '');
          applyStructuredToUI(legacy.program, legacy.semester, legacy.departments, legacy.sections);
        }
      }

      setInstructions(firstInstructions);
      setQuestions(allQuestions);
      setNumberOfQuestions(allQuestions.length);
      setCurrentScreen(1);
      
      setShowMultiImportDialog(false);
      setImportProgress(0);
      setImportingFiles([]);
      setCurrentImportFile('');

      toast({
        title: "Multi-ZIP Import Successful",
        description: `Successfully imported ${allQuestions.length} questions from ${files.length} ZIP files.`,
      });

    } catch (error) {
      console.error('Multi-import error:', error);
      toast({
        title: "Multi-ZIP Import Failed",
        description: "Failed to import one or more ZIP files. Please check the file formats.",
        variant: "destructive",
      });
      setShowMultiImportDialog(false);
      setImportProgress(0);
      setImportingFiles([]);
      setCurrentImportFile('');
    }
  };

  const logToGoogleForm = (metadata: QuizMetadata) => {
    try {
      const formUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSftIXPhGzEGDsyCtApgXxpsS48Na74HnL6zcZV-fR37WROuuQ/formResponse";

      const formData = new FormData();
      formData.append("entry.1545203247", metadata.subject_code || "");            // Subject Code
      formData.append("entry.1231558053", metadata.subject || "");                 // Subject Name
      formData.append("entry.1842965857", metadata.code || "");                    // Quiz Code
      formData.append("entry.1921568803", metadata.name || "");                    // Quiz Name
      formData.append("entry.603641309",  metadata.course || "");                  // Program/Course entry.
      formData.append("entry.1652494894",  metadata.instructor || "");                 // Instructor Name
      formData.append("entry.2088200475", metadata.allowed_time?.toString() || "");         // Allowed Time
      formData.append("entry.1993777212", metadata.num_displayed_questions?.toString() || ""); // Displayed Questions

      fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });

      console.log('✅ Quiz data logged to Google Form successfully');
    } catch (error) {
      console.error('❌ Failed to log to Google Form:', error);
    }
  };

  const generateZip = async () => {
    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder('images');

      const currentTime = new Date().toISOString();
      const updatedMetadata = {
        ...metadata,
        updated_at: currentTime,
        total_points: questions.length,
      };

      // Log to Google Form
      logToGoogleForm(updatedMetadata);

      // Structured metadata derived from current UI selections
      const uiProgram = (selectedProgram === 'custom' ? customProgram : selectedProgram) || '';
      const uiSemester = selectedSemester || '';
      const uiDepartments = (
        selectedDepartments.includes('custom')
          ? [
              ...selectedDepartments.filter(d => d !== 'custom'),
              ...((customDepartments || '').split(',').map(s => s.trim()).filter(Boolean)),
            ]
          : selectedDepartments
      ).filter(Boolean);
      const uiSections = (
        selectedSections.includes('custom')
          ? [
              ...selectedSections.filter(s => s !== 'custom'),
              ...((customSections || '').split(',').map(s => s.trim()).filter(Boolean)),
            ]
          : selectedSections
      ).filter(Boolean);
      const courseDisplay = metadata.course || '';

      const quizData = {
        quiz: {
          ...updatedMetadata,
          // New structured fields (schema v2+) alongside legacy 'course'
          schemaVersion: 2,
          program: uiProgram,
          semester: uiSemester,
          departments: uiDepartments,
          sections: uiSections,
          courseDisplay,
          instructions: instructions.map((inst, index) => ({
            id: inst.id,
            quiz_id: metadata.id,
            instruction_text: inst.instruction_text,
            instruction_order: index + 1,
          })),
          questions: questions.map((q, index) => {
            const { imageFile, originalImageFileName, imgbbUrl, ...cleanQuestion } = q;
            const filteredOptions = cleanQuestion.options
              .filter(opt => opt.option_text.trim() !== '')
              .map((opt, optIndex) => ({
                id: opt.id,
                question_id: cleanQuestion.id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                option_order: optIndex + 1,
              }));
            return {
              id: cleanQuestion.id,
              quiz_id: metadata.id,
              question: cleanQuestion.question,
              topic: cleanQuestion.topic,
              summary: cleanQuestion.summary,
              question_order: index,
              points: cleanQuestion.points,
              image_path: cleanQuestion.image_path || null,
              image_url: cleanQuestion.image_url || null,
              image: cleanQuestion.image || null,
              difficulty: cleanQuestion.difficulty,
              subject: cleanQuestion.subject || '',
              options: filteredOptions,
            };
          }),
          // Add subjects list for Screen2/Screen3
          subjects: subjects,
          // Add question_distribution if set from distribution dialog
          ...(window.latestQuestionDistribution ? { question_distribution: window.latestQuestionDistribution } : {}),
        }
      };

      zip.file('quiz.json', JSON.stringify(quizData, null, 2));

      for (const question of questions) {
        if (question.imageFile) {
          const fileName = question.image.split('/').pop();
          if (fileName && imagesFolder) {
            imagesFolder.file(fileName, question.imageFile);
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(content, `${metadata.name || 'quiz'}.zip`);

      // Send zip to backend email service
      try {
        const formData = new FormData();
        formData.append('to', reminderEmail || '');
        formData.append('quizName', metadata.name || '');
        formData.append('quizCode', metadata.code || '');
        formData.append('subject', metadata.subject || '');
        formData.append('course', metadata.course || '');
        formData.append('instructor', metadata.instructor || '');
        formData.append('date', reminderDate || '');
        formData.append('time', reminderTime || '');
        formData.append('duration', metadata.allowed_time ? `${metadata.allowed_time} minutes` : '');
        formData.append('quizZip', new File([content], `${metadata.name || 'quiz'}.zip`, { type: 'application/zip' }));

        if (!reminderEmail) {
          toast({
            title: 'Email Not Sent',
            description: 'No recipient email provided. Please enter an email address to send the quiz.',
            variant: 'destructive',
          });
        } else {
          const response = await fetch('https://quiz-builder-9afc.onrender.com/send-quiz-email', {
            method: 'POST',
            body: formData,
          });
          if (response.ok) {
            toast({
              title: 'Quiz Email Sent!',
              description: `Quiz ZIP has been sent to ${reminderEmail}.`,
            });
          } else {
            toast({
              title: 'Email Failed',
              description: 'Failed to send quiz email. Please try again.',
              variant: 'destructive',
            });
          }
        }
      } catch (err) {
        toast({
          title: 'Email Error',
          description: 'An error occurred while sending the quiz email.',
          variant: 'destructive',
        });
      }
      
      toast({
        title: "Quiz Generated Successfully!",
        description: "Your quiz ZIP file has been downloaded and data logged.",
      });
    } catch (error) {
      console.error('Error generating ZIP:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz ZIP file.",
        variant: "destructive",
      });
    }
  };

  const handleReminderSubmit = async (sendReminder: boolean) => {
    if (sendReminder) {
      if (!reminderDate || !reminderTime || !reminderEmail) {
        toast({
          title: "Missing Information",
          description: "Please fill in all reminder fields.",
          variant: "destructive",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reminderEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        await sendReminderEmail(reminderDate, reminderTime, reminderEmail);
        await generateZip();
      } catch (error) {
        return;
      }
    } else {
      await generateZip();
    }
    
    setShowReminderDialog(false);
    setReminderDate('');
    setReminderTime('');
    setReminderEmail('');
  };

  const validateCurrentQuestion = () => {
    if (currentScreen === 3 && questions[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex];
      return currentQuestion.question.trim() !== '';
    }
    return true;
  };

  const preloadQuestionsWithDifficulty = () => {
    const totalQuestions = metadata.num_displayed_questions;
    const easyCount = metadata.num_easy_questions;
    const mediumCount = metadata.num_medium_questions;
    const highCount = metadata.num_high_questions;
    

    
    const newQuestions = [];
    let questionId = 1;
    
    // Create easy questions
    for (let i = 0; i < easyCount; i++) {
      newQuestions.push({
        id: questionId++,
        question: '',
        topic: 'NA',
        summary: 'NA',
        question_order: i,
        points: 1,
        image_path: '',
        image_url: '',
        image: '',
        difficulty: 'LOW',
        options: [
          { id: 1, option_text: '', is_correct: false, option_order: 0 },
          { id: 2, option_text: '', is_correct: false, option_order: 0 },
          { id: 3, option_text: '', is_correct: false, option_order: 0 },
          { id: 4, option_text: '', is_correct: false, option_order: 0 },
        ],
      });
    }
    
    // Create medium questions
    for (let i = 0; i < mediumCount; i++) {
      newQuestions.push({
        id: questionId++,
        question: '',
        topic: 'NA',
        summary: 'NA',
        question_order: easyCount + i,
        points: 1,
        image_path: '',
        image_url: '',
        image: '',
        difficulty: 'MEDIUM',
        options: [
          { id: 1, option_text: '', is_correct: false, option_order: 0 },
          { id: 2, option_text: '', is_correct: false, option_order: 0 },
          { id: 3, option_text: '', is_correct: false, option_order: 0 },
          { id: 4, option_text: '', is_correct: false, option_order: 0 },
        ],
      });
    }
    
    // Create high questions
    for (let i = 0; i < highCount; i++) {
      newQuestions.push({
        id: questionId++,
        question: '',
        topic: 'NA',
        summary: 'NA',
        question_order: easyCount + mediumCount + i,
        points: 1,
        image_path: '',
        image_url: '',
        image: '',
        difficulty: 'HIGH',
        options: [
          { id: 1, option_text: '', is_correct: false, option_order: 0 },
          { id: 2, option_text: '', is_correct: false, option_order: 0 },
          { id: 3, option_text: '', is_correct: false, option_order: 0 },
          { id: 4, option_text: '', is_correct: false, option_order: 0 },
        ],
      });
    }
    

    
    setQuestions(newQuestions);
    setNumberOfQuestions(totalQuestions);
  };

  const handleNext = () => {
    if (currentScreen === 3 && !validateCurrentQuestion()) {
      toast({
        title: "Question Required",
        description: "Please enter a question before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentScreen === 1) {
      // Simple approach: Always ensure we have the exact number of questions needed
      const totalNeeded = metadata.num_easy_questions + metadata.num_medium_questions + metadata.num_high_questions;
      
      if (questions.length === 0) {
        // No existing questions, create all needed questions
        preloadQuestionsWithDifficulty();
      } else {
        // We have existing questions, preserve them and add only what's missing
        const existingQuestions = [...questions];
        
        // Count existing questions by difficulty
        const existingEasy = existingQuestions.filter(q => q.difficulty === 'LOW').length;
        const existingMedium = existingQuestions.filter(q => q.difficulty === 'MEDIUM').length;
        const existingHigh = existingQuestions.filter(q => q.difficulty === 'HIGH').length;
        
        // Calculate what we need to add
        const needEasy = Math.max(0, metadata.num_easy_questions - existingEasy);
        const needMedium = Math.max(0, metadata.num_medium_questions - existingMedium);
        const needHigh = Math.max(0, metadata.num_high_questions - existingHigh);
        

        
        // Only add questions if we actually need them
        if (needEasy > 0 || needMedium > 0 || needHigh > 0) {
          let nextId = Math.max(...existingQuestions.map(q => q.id), 0) + 1;
          let nextOrder = existingQuestions.length;
          
          // Add easy questions
          for (let i = 0; i < needEasy; i++) {
            existingQuestions.push({
              id: nextId++,
              question: '',
              topic: 'NA',
              summary: 'NA',
              question_order: nextOrder++,
              points: 1,
              image_path: '',
              image_url: '',
              image: '',
              difficulty: 'LOW',
              options: [
                { id: 1, option_text: '', is_correct: false, option_order: 0 },
                { id: 2, option_text: '', is_correct: false, option_order: 0 },
                { id: 3, option_text: '', is_correct: false, option_order: 0 },
                { id: 4, option_text: '', is_correct: false, option_order: 0 },
              ],
            });
          }
          
          // Add medium questions
          for (let i = 0; i < needMedium; i++) {
            existingQuestions.push({
              id: nextId++,
              question: '',
              topic: 'NA',
              summary: 'NA',
              question_order: nextOrder++,
              points: 1,
              image_path: '',
              image_url: '',
              image: '',
              difficulty: 'MEDIUM',
              options: [
                { id: 1, option_text: '', is_correct: false, option_order: 0 },
                { id: 2, option_text: '', is_correct: false, option_order: 0 },
                { id: 3, option_text: '', is_correct: false, option_order: 0 },
                { id: 4, option_text: '', is_correct: false, option_order: 0 },
              ],
            });
          }
          
          // Add high questions
          for (let i = 0; i < needHigh; i++) {
            existingQuestions.push({
              id: nextId++,
              question: '',
              topic: 'NA',
              summary: 'NA',
              question_order: nextOrder++,
              points: 1,
              image_path: '',
              image_url: '',
              image: '',
              difficulty: 'HIGH',
              options: [
                { id: 1, option_text: '', is_correct: false, option_order: 0 },
                { id: 2, option_text: '', is_correct: false, option_order: 0 },
                { id: 3, option_text: '', is_correct: false, option_order: 0 },
                { id: 4, option_text: '', is_correct: false, option_order: 0 },
              ],
            });
          }
          

          
          setQuestions(existingQuestions);
          setNumberOfQuestions(existingQuestions.length);
        }
      }
    }
    
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const checkAllRequiredFieldsFilled = () => {
    const program = selectedProgram === 'custom' ? customProgram : selectedProgram;
    const department = selectedDepartments.includes('custom') ? customDepartments : selectedDepartments.join(', ');
    const sectionStr = selectedSections.includes('custom') ? customSections : selectedSections.join(', ');
    
    const totalDifficultyQuestions = metadata.num_easy_questions + metadata.num_medium_questions + metadata.num_high_questions;
    const difficultySumMatches = totalDifficultyQuestions === metadata.num_displayed_questions;
    
    return (
      metadata.subject_code.trim() !== '' &&
      metadata.subject.trim() !== '' &&
      metadata.code.trim() !== '' &&
      metadata.name.trim() !== '' &&
      program.trim() !== '' &&
      department.trim() !== '' &&
      sectionStr.trim() !== '' &&
      metadata.year.trim() !== '' &&
      metadata.instructor.trim() !== '' &&
      metadata.allowed_time > 0 &&
      metadata.num_displayed_questions >= 0 &&
      metadata.num_easy_questions >= 0 &&
      metadata.num_medium_questions >= 0 &&
      metadata.num_high_questions >= 0 &&
      difficultySumMatches
    );
  };

  const insertMathSymbol = (questionId: number, symbol: string, cursorPos?: number) => {
    const currentQuestion = questions.find(q => q.id === questionId);
    if (currentQuestion) {
      let formattedSymbol = symbol;
      
      if (activeFormatting === 'superscript') {
        formattedSymbol = `^{${symbol}}`;
      } else if (activeFormatting === 'subscript') {
        formattedSymbol = `_{${symbol}}`;
      }
      
      let updatedQuestion = currentQuestion.question;
      if (typeof cursorPos === 'number') {
        updatedQuestion =
          currentQuestion.question.slice(0, cursorPos) +
          formattedSymbol +
          currentQuestion.question.slice(cursorPos);
      } else {
        updatedQuestion = currentQuestion.question + formattedSymbol;
      }
      updateQuestion(questionId, 'question', updatedQuestion);
    }
  };

  const handleQuestionTextChange = (questionId: number, value: string, previousValue: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => {
    let formattedValue = value;
    if (activeFormatting !== 'none' && e) {
      const textarea = e.target;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      if (selectionStart !== null && selectionEnd !== null) {
        let before = value.slice(0, selectionStart);
        let after = value.slice(selectionEnd);
        let selected = value.slice(selectionStart, selectionEnd);
        // If nothing is selected, wrap the last inserted character(s)
        if (selectionStart === selectionEnd) {
          const diff = value.length - previousValue.length;
          if (diff > 0) {
            selected = value.slice(selectionStart - diff, selectionStart);
            before = value.slice(0, selectionStart - diff);
          } else {
            selected = '';
          }
        }
        if (selected) {
          if (activeFormatting === 'superscript') {
            formattedValue = before + `^{${selected}}` + after;
          } else if (activeFormatting === 'subscript') {
            formattedValue = before + `_{${selected}}` + after;
          }
          setTimeout(() => {
            textarea.focus();
            const newPos = before.length + 3 + selected.length; // 3 for ^{ or _{
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
      }
    }
    updateQuestion(questionId, 'question', formattedValue);
  };

  const toggleFormatting = (format: 'superscript' | 'subscript') => {
    if (activeFormatting === format) {
      setActiveFormatting('none');
    } else {
      setActiveFormatting(format);
    }
  };

  const renderMathPreview = (text: string) => {
    let rendered = text;
    
    rendered = rendered.replace(/\^{([^}]*)}/g, '<sup>$1</sup>');
    rendered = rendered.replace(/_{([^}]*)}/g, '<sub>$1</sub>');
    
    return rendered;
  };

  return (
    <div className={`relative z-10 min-h-screen overflow-x-hidden overflow-y-auto no-scrollbar ${isDark ? 'bg-black' : 'bg-[#fdf6e3]'}`}>
      {/* Fixed background overlays to cover during scroll */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {isDark ? (
          <>
            <div
              className="absolute inset-0 opacity-85 transition-opacity duration-700"
              style={{
                background:
                  'radial-gradient(circle at 18% 28%, rgba(34,211,238,0.38), transparent 40%), radial-gradient(circle at 82% 22%, rgba(244,63,94,0.38), transparent 40%), radial-gradient(circle at 62% 82%, rgba(250,204,21,0.32), transparent 42%)',
              }}
            />
            <div className="absolute inset-0 opacity-40 transition-opacity duration-700" style={{background:"conic-gradient(from_180deg_at_50%_50%, rgba(99,102,241,0.18), rgba(34,211,238,0.14), rgba(244,63,94,0.14), rgba(99,102,241,0.18))"}} />
            <div className="absolute inset-0 opacity-20 transition-opacity duration-700" style={{background:"repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 24px)"}} />
            <div className="absolute w-[30rem] h-[30rem] rounded-full blur-3xl -top-28 -left-28 transition-all duration-700" style={{background:"radial-gradient(circle_at_30%_30%, rgba(99,102,241,0.45), transparent_60%)"}} />
            <div className="absolute w-[32rem] h-[32rem] rounded-full blur-3xl -bottom-28 -right-28 transition-all duration-700" style={{background:"radial-gradient(circle_at_70%_70%, rgba(34,211,238,0.45), transparent_60%)"}} />
            <div className="absolute inset-0 transition-opacity duration-700" style={{ background: "radial-gradient(ellipse_at_center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)" }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0 transition-all duration-700" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(38,139,210,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(203,75,22,0.15), transparent 40%)' }} />
            <div className="absolute inset-0 opacity-20 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12), transparent 50%)' }} />
          </>
        )}
      </div>

      {/* Header (theme-aware) */}
      <div className={`${headerShell} fixed top-0 left-0 w-full z-40 transition-all duration-700`}>
        <div className="container flex flex-col justify-center px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-20">
            <div className="flex items-center gap-0 cursor-pointer h-full" onClick={() => (currentScreen === 0 ? navigate('/') : setCurrentScreen(0))}>
              <img src={isDark ? "/logo1dark.png" : "/logo1light.png"} alt="PrashnaSetu Logo" className="h-[90%] w-auto object-contain" />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDark ? 'text-white/85' : 'text-gray-700'}`}>
                Welcome, {user?.displayName || user?.email}
              </span>
              <AlertDialog open={showFlushAllDialog} onOpenChange={setShowFlushAllDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Flush Quiz</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Confirm Flush All
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear fields on all three screens including Metadata(Quiz Code, Quiz Name, Course Code, Program, Semester, Department, Section etc.), Instructions and Tpoic List and all questions. Your saved session will remain intact.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={flushAllScreens} className="bg-red-600 hover:bg-red-700">
                      Yes, Flush Entire Quiz
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className={`flex items-center space-x-2 transition-colors ${isDark ? 'bg-white/10 text-white border-white/15 hover:bg-white/15' : ''}`}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                title={isDark ? 'Light theme' : 'Dark theme'}
                onClick={() => setTheme(targetTheme as any)}
                className="ml-1"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
                              </div>
                                </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-0 cursor-pointer h-full" onClick={() => (currentScreen === 0 ? navigate('/') : setCurrentScreen(0))}>
                <img src={isDark ? "/logo1dark.png" : "/logo1light.png"} alt="PrashnaSetu Logo" className="h-[90%] w-auto object-contain" />
              </div>
              <AlertDialog open={showFlushAllDialog} onOpenChange={setShowFlushAllDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center space-x-1 h-8 px-2 text-red-600 border-red-600 hover:bg-red-50 transition-colors ${isDark ? 'bg-white/10' : ''}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="text-xs">Flush All</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Confirm Flush All
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                    This will clear fields on all three screens including Metadata(Quiz Code, Quiz Name, Course Code, Program, Semester, Department, Section etc.), Instructions and Tpoic List and all questions. Your saved session will remain intact.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={flushAllScreens} className="bg-red-600 hover:bg-red-700">
                      Yes, Flush Entire Quiz
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className={`flex items-center space-x-1 h-8 px-2 transition-colors ${isDark ? 'bg-white/10 text-white border-white/15 hover:bg-white/15' : ''}`}
              >
                <LogOut className="h-3 w-3" />
                <span className="text-xs">Logout</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                title={isDark ? 'Light theme' : 'Dark theme'}
                onClick={() => setTheme(targetTheme as any)}
                className="ml-1 h-8 w-8"
              >
                {isDark ? (
                  <Sun className="h-3 w-3" />
                ) : (
                  <Moon className="h-3 w-3" />
                )}
              </Button>
                              </div>
            <div className={`text-sm ${isDark ? 'text-white/85' : 'text-gray-700'}`}>
              &nbsp;&nbsp;&nbsp;Welcome, {user?.displayName || user?.email}
            </div>
          </div>
        </div>
      </div>
      {/* Add top padding for header and bottom padding for fixed footer */}
      <div className="p-4 pt-24 pb-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2"></h1>
            <p className="text-lg text-gray-700"></p>
          </div>
          {currentScreen === 0 && (
            <Screen0
              loadFromSavedSession={loadFromSavedSession}
              startNewQuiz={startNewQuiz}
              openZipImportModal={openZipImportModal}
            />
          )}
          {currentScreen === 1 && (
            <>
              <Screen1
                metadata={metadata}
                setMetadata={setMetadata}
                generateYearOptions={generateYearOptions}
                selectedProgram={selectedProgram}
                setSelectedProgram={setSelectedProgram}
                customProgram={customProgram}
                setCustomProgram={setCustomProgram}
                selectedSemester={selectedSemester}
                setSelectedSemester={setSelectedSemester}
                selectedDepartments={selectedDepartments}
                setSelectedDepartments={setSelectedDepartments}
                customDepartments={customDepartments}
                setCustomDepartments={setCustomDepartments}
                selectedSections={selectedSections}
                setSelectedSections={setSelectedSections}
                customSections={customSections}
                setCustomSections={setCustomSections}
                checkAllRequiredFieldsFilled={checkAllRequiredFieldsFilled}
              />
              {/* Desktop Layout */}
              <div className="hidden md:flex justify-between items-center mt-6">
                <div className="flex gap-4">
                  <Button
                onClick={() => setCurrentScreen(0)}
                variant="outline"
                    className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={saveSession}
                    variant="outline"
                    className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Save className="h-4 w-4" />
                    Save Session
                  </Button>
                  <AlertDialog open={showFlushDialog} onOpenChange={setShowFlushDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
                          This action will clear the fields of the current screen, user can still revert to last saved session.
                                  
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
                        </div>
                <div>
                          <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    disabled={currentScreen === 1 && !checkAllRequiredFieldsFilled()}
                  >
                    Next
                          </Button>
                        </div>
                      </div>
              {/* Mobile Layout - Dynamic Grid */}
              <div className="md:hidden space-y-3 mt-6">
                <div className="grid grid-cols-2 gap-3">
                      <Button
                    onClick={saveSession}
                        variant="outline"
                    className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Save className="h-4 w-4" />
                    Save Session
                      </Button>
                  <AlertDialog open={showFlushDialog} onOpenChange={setShowFlushDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
                        This action will clear the fields of the current screen, user can still revert to last saved session.            
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
                    </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                    onClick={() => setCurrentScreen(0)}
                variant="outline" 
                    className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                    <Home className="h-4 w-4" />
                    Back to Home
              </Button>
              <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    disabled={currentScreen === 1 && !checkAllRequiredFieldsFilled()}
                  >
                    Next
              </Button>
            </div>
            </div>
            </>
          )}
          {currentScreen === 2 && (
            <>
              <Screen2
                instructions={instructions}
                setInstructions={setInstructions}
                newInstruction={newInstruction}
                setNewInstruction={setNewInstruction}
                addInstruction={addInstruction}
                removeInstruction={removeInstruction}
                subjects={subjects}
                setSubjects={setSubjects}
                newSubject={newSubject}
                setNewSubject={setNewSubject}
              />
            {/* Desktop Layout */}
              <div className="hidden md:flex justify-between items-center mt-6">
            <div className="flex gap-4">
                <Button
                    onClick={() => setCurrentScreen(1)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              <Button
                onClick={() => setCurrentScreen(0)}
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <div className="flex gap-4 relative -left-8 md:-left-16">
              <Button
                onClick={saveSession}
                variant="outline"
                className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
              >
                <Save className="h-4 w-4" />
                Save Session
              </Button>
              <AlertDialog open={showFlushDialog} onOpenChange={setShowFlushDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
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
                      This will clear only the fields on the current screen. Your saved session will remain intact, so you can restore previous data if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={flushData} className="bg-red-600 hover:bg-red-700">
                      Yes, Clear This Screen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Next
              </Button>
            </div>
          </div>
            {/* Mobile Layout - Dynamic Grid */}
              <div className="md:hidden space-y-3 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={saveSession}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Session
                </Button>
                <AlertDialog open={showFlushDialog} onOpenChange={setShowFlushDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
                        This will clear only the fields on the current screen. Your saved session will remain intact, so you can restore previous data if needed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={flushData} className="bg-red-600 hover:bg-red-700">
                        Yes, Clear This Screen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setCurrentScreen(1)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentScreen(0)}
                    variant="outline"
                    className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
                <div className="flex justify-center">
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  Next
                </Button>
        </div>
            </div>
          </>
        )}
          {currentScreen === 3 && (
            <Screen3
              questions={questions}
              setQuestions={setQuestions}
              numberOfQuestions={numberOfQuestions}
              setNumberOfQuestions={setNumberOfQuestions}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              questionAdjustTimeout={questionAdjustTimeout}
              setQuestionAdjustTimeout={setQuestionAdjustTimeout}
              adjustQuestions={adjustQuestions}
              updateQuestion={updateQuestion}
              updateOption={updateOption}
              addOption={addOption}
              removeOption={removeOption}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              deleteQuestion={deleteQuestion}
              saveSession={saveSession}
              showFlushDialog={showFlushDialog}
              setShowFlushDialog={setShowFlushDialog}
              flushData={flushData}
              activeFormatting={activeFormatting}
              setActiveFormatting={setActiveFormatting}
              currentSymbolPage={currentSymbolPage}
              setCurrentSymbolPage={setCurrentSymbolPage}
              insertMathSymbol={insertMathSymbol}
              handleQuestionTextChange={handleQuestionTextChange}
              toggleFormatting={toggleFormatting}
              renderMathPreview={renderMathPreview}
              getPageTitle={getPageTitle}
              getCurrentSymbols={getCurrentSymbols}
              optionFormatting={optionFormatting}
              setOptionFormatting={setOptionFormatting}
              optionSymbolPage={optionSymbolPage}
              setOptionSymbolPage={setOptionSymbolPage}
              mostFrequentSymbols={mostFrequentSymbols}
              frequentSymbols={frequentSymbols}
              rarelyUsedSymbols={rarelyUsedSymbols}
              showReminderDialog={showReminderDialog}
              setShowReminderDialog={setShowReminderDialog}
              reminderDate={reminderDate}
              setReminderDate={setReminderDate}
              reminderTime={reminderTime}
              setReminderTime={setReminderTime}
              reminderEmail={reminderEmail}
              setReminderEmail={setReminderEmail}
              handleReminderSubmit={handleReminderSubmit}
              metadata={metadata}
              setCurrentScreen={setCurrentScreen}
              toast={toast}
              subjects={subjects}
              onDistributionSet={(numDisplayed, numEasy, numMedium, numHigh) => {
                setMetadata(prev => ({
                  ...prev,
                  num_displayed_questions: numDisplayed,
                  num_easy_questions: numEasy,
                  num_medium_questions: numMedium,
                  num_high_questions: numHigh,
                }));
              }}
            />
          )}

          {/* Multi-ZIP Import Modal */}
          <Dialog
            open={showMultiImportDialog}
            onOpenChange={(open) => {
              if (!isImportingZips) setShowMultiImportDialog(open);
            }}
         >
            <DialogContent
              className="max-w-2xl"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropZips}
            >
              <DialogHeader>
                <DialogTitle>Import from ZIP files</DialogTitle>
              </DialogHeader>
              {/* Metadata precedence note */}
              <div className="mb-3 text-sm rounded-md border p-3 text-red-600">
                <div className="font-medium"><span className="underline"></span></div>
                <p className="mt-1 leading-snug">
                  Note: The quiz metadata — for example <em>Quiz Name</em>, <em>Quiz Code</em>, time, visibility etc. — will be taken from the quiz ZIP listed at position <strong>1</strong> below.
                  
                </p>
              </div>

              {/* Selection / Drag-drop area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropZips}
                className="border-2 border-dashed rounded-md p-6 text-center mb-4"
              >
                <p className="mb-3">Drag and drop one or more .zip files here</p>
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingZips}
                    className="flex items-center gap-2"
                  >
                    <FileUp className="h-4 w-4" /> Select ZIPs
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) addZipFiles(e.target.files);
                      e.currentTarget.value = '';
                    }}
                  />
                </div>
              </div>

              {/* Pending list */}
              <div className="space-y-2 max-h-64 overflow-auto">
                {pendingZipFiles.length === 0 && (
                  <div className="text-sm opacity-70">No files selected yet.</div>
                )}
                {pendingZipFiles.length > 0 && (
                  <div className="text-xs opacity-70">Tip: Drag rows or use arrows to reorder.</div>
                )}
                {pendingZipFiles.map((f, idx) => (
                  <div
                    key={`${f.name}-${f.lastModified}-${idx}`}
                    className={`flex items-center justify-between border rounded p-2 transition-colors ${dragOverIndex === idx ? 'ring-2 ring-indigo-400 bg-indigo-50/50 dark:bg-white/10' : 'hover:bg-muted/60'}`}
                    draggable={!isImportingZips}
                    onDragStart={() => handleRowDragStart(idx)}
                    onDragOver={(e) => handleRowDragOver(e, idx)}
                    onDrop={() => handleRowDrop(idx)}
                    onDragEnd={handleRowDragEnd}
                    aria-grabbed={dragIndex === idx}
                    aria-dropeffect="move"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 opacity-70 cursor-move" />
                      <span className="text-xs px-2 py-1 rounded bg-muted">{idx + 1}</span>
                      <span className="text-sm break-all">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => movePendingUp(idx)} disabled={idx === 0 || isImportingZips} aria-label="Move up"><ChevronUp className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => movePendingDown(idx)} disabled={idx === pendingZipFiles.length - 1 || isImportingZips} aria-label="Move down"><ChevronDown className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => removePendingAt(idx)} disabled={isImportingZips} aria-label="Remove"><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {isImportingZips && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm">Importing: {currentImportFile || 'Starting...'}</div>
                  <Progress value={importProgress} />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMultiImportDialog(false)}
                  disabled={isImportingZips}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => startOrderedZipImport(pendingZipFiles)}
                  disabled={pendingZipFiles.length === 0 || isImportingZips}
                >
                  Import
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* ... navigation and dialogs ... */}
        </div>
      </div>

      {/* Footer Desktop (theme-aware) */}
      {currentScreen !== 3 && (
        <div className={`hidden md:block fixed bottom-0 left-0 w-full ${footerShellDesktop} py-3 text-center text-xs z-50 shadow-lg transition-all duration-300`}>
          <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        </div>
      )}

      {/* Footer Mobile (theme-aware) */}
      {currentScreen !== 3 && (
        <div className={`md:hidden text-center text-xs mt-6 mb-2 ${footerShellMobile} py-3 shadow transition-all duration-300`}>
          <p>© Copyrighted by CAD-CS, BML Munjal University</p>
        </div>
      )}

    </div>
  );
};

export default QuizCreator;
