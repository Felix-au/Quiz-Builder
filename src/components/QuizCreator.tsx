import React, { useState, useEffect, useRef } from 'react';
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
import { Plus, Download, X, Upload, Check, ChevronLeft, Save, Trash2, AlertTriangle, FileText, Sigma, Superscript, Subscript, Calendar, Mail, ChevronRight, HelpCircle, FileUp, PlayCircle, RefreshCw, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { uploadImageToImgBB, downloadImageAsFile } from '@/utils/imageUpload';
import emailjs from '@emailjs/browser';

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
  options: Option[];
  imageFile?: File;
  originalImageFileName?: string;
  imgbbUrl?: string;
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
}

const QuizCreator = () => {
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showFlushDialog, setShowFlushDialog] = useState(false);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (questionAdjustTimeout) {
        clearTimeout(questionAdjustTimeout);
      }
    };
  }, [questionAdjustTimeout]);

  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [customProgram, setCustomProgram] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [customSections, setCustomSections] = useState('');
  const [skipLoadSavedData, setSkipLoadSavedData] = useState(false);

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
    };
    
    loadSavedData();
  }, []);

  const initializeDefaultQuestion = () => {
    const defaultQuestion: Question = {
      id: 1,
      question: '',
      topic: 'NA',
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
    const department = selectedDepartment === 'custom' ? customDepartment : selectedDepartment;
    const sectionStr = selectedSections.includes('custom') 
      ? customSections 
      : selectedSections.join(', ');
    
    if (program || department || sectionStr) {
      courseValue = `${program} ${department} ${sectionStr}`.trim();
    }
    
    setMetadata(prev => ({ ...prev, course: courseValue }));
  }, [selectedProgram, selectedDepartment, selectedSections, customProgram, customDepartment, customSections]);

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
      setSelectedDepartment(parsed.selectedDepartment || '');
      setSelectedSections(parsed.selectedSections || []);
      setCustomProgram(parsed.customProgram || '');
      setCustomDepartment(parsed.customDepartment || '');
      setCustomSections(parsed.customSections || '');
      
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
    setSelectedDepartment('');
    setSelectedSections([]);
    setCustomProgram('');
    setCustomDepartment('');
    setCustomSections('');
    
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

      // Parse course field to set program/department/sections
      if (quiz.course) {
        const courseParts = quiz.course.split(' ').filter(part => part.trim() !== '');
        if (courseParts.length > 0) {
          // Set as custom since we can't match exactly
          setSelectedProgram('custom');
          setCustomProgram(courseParts[0] || '');
          
          if (courseParts.length > 1) {
            setSelectedDepartment('custom');
            setCustomDepartment(courseParts[1] || '');
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
          title: "Reminder Set Successfully!",
          description: `Quiz reminder email has been sent to ${email} for ${date} at ${time}`,
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
        selectedDepartment,
        selectedSections,
        customProgram,
        customDepartment,
        customSections
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
    localStorage.removeItem('quizCreatorData');
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
    
    const defaultInstruction: Instruction = {
      id: 1,
      instruction_text: 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
      instruction_order: 1,
    };
    setInstructions([defaultInstruction]);
    
    initializeDefaultQuestion();
    
    setCurrentScreen(1);
    setNumberOfQuestions(1);
    setSelectedProgram('');
    setSelectedDepartment('');
    setSelectedSections([]);
    setCustomProgram('');
    setCustomDepartment('');
    setCustomSections('');
    setShowFlushDialog(false);
    toast({
      title: "Data Flushed",
      description: "All data has been cleared. Starting fresh.",
    });
  };

  const adjustQuestions = (newCount: number) => {
    const minCount = metadata.num_displayed_questions;
    const actualCount = Math.max(newCount, minCount);
    
    if (actualCount !== newCount) {
      toast({
        title: "Question Count Adjusted",
        description: `Cannot have fewer than ${minCount} questions (Number of Displayed Questions).`,
        variant: "destructive",
      });
    }
    
    if (actualCount > questions.length) {
      const additionalQuestions = [];
      for (let i = questions.length; i < actualCount; i++) {
        additionalQuestions.push({
          id: i + 1,
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
      for (let i = 0; i < actualCount; i++) {
        newQuestions.push({
          id: i + 1,
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
              id: q.options.length + 1,
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
      description: "The question has been successfully deleted.",
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
        
        // Parse course field to set program/department/sections
        if (firstMetadata.course) {
          const courseParts = firstMetadata.course.split(' ').filter(part => part.trim() !== '');
          if (courseParts.length > 0) {
            setSelectedProgram('custom');
            setCustomProgram(courseParts[0] || '');
            
            if (courseParts.length > 1) {
              setSelectedDepartment('custom');
              setCustomDepartment(courseParts[1] || '');
            }
            
            if (courseParts.length > 2) {
              setSelectedSections(['custom']);
              setCustomSections(courseParts.slice(2).join(' '));
            }
          }
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

      const quizData = {
        quiz: {
          ...updatedMetadata,
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
              options: filteredOptions,
            };
          }),
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
    const department = selectedDepartment === 'custom' ? customDepartment : selectedDepartment;
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

  const insertMathSymbol = (questionId: number, symbol: string) => {
    const currentQuestion = questions.find(q => q.id === questionId);
    if (currentQuestion) {
      let formattedSymbol = symbol;
      
      if (activeFormatting === 'superscript') {
        formattedSymbol = `^{${symbol}}`;
      } else if (activeFormatting === 'subscript') {
        formattedSymbol = `_{${symbol}}`;
      }
      
      const updatedQuestion = currentQuestion.question + formattedSymbol;
      updateQuestion(questionId, 'question', updatedQuestion);
    }
  };

  const handleQuestionTextChange = (questionId: number, value: string, previousValue: string) => {
    let formattedValue = value;
    
    if (activeFormatting !== 'none' && value.length > previousValue.length) {
      const newText = value.slice(previousValue.length);
      const beforeNewText = value.slice(0, previousValue.length);
      
      if (activeFormatting === 'superscript') {
        formattedValue = beforeNewText + `^{${newText}}`;
      } else if (activeFormatting === 'subscript') {
        formattedValue = beforeNewText + `_{${newText}}`;
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

  const renderScreen0 = () => (
    <Card className="shadow-lg border-0 max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl text-center">Choose how you'd like to start creating your quiz</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
    
        
        <div className="space-y-4">
          <Button
            onClick={loadFromSavedSession}
            className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white justify-start py-4"
            size="lg"
          >
            <PlayCircle className="h-6 w-6 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="font-semibold">Load Last Saved Session</div>
              <div className="text-sm opacity-90 leading-tight break-words whitespace-normal">Continue from where you left off</div>
            </div>
          </Button>
          
          <Button
            onClick={startNewQuiz}
            className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white justify-start py-4"
            size="lg"
          >
            <RefreshCw className="h-6 w-6 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="font-semibold">Start New Quiz</div>
              <div className="text-sm opacity-90 leading-tight break-words whitespace-normal">Begin with a fresh new quiz</div>
            </div>
          </Button>
          
          <div className="relative">
            <Input
              type="file"
              accept=".zip"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  if (files.length === 1) {
                    importFromZip(files[0]);
                  } else {
                    importFromMultipleZips(files);
                  }
                }
              }}
              className="hidden"
              id="import-zip"
            />
            <Label htmlFor="import-zip" className="cursor-pointer">
              <Button
                asChild
                className="w-full h-16 md:h-16 min-h-[96px] md:min-h-[64px] text-left flex items-center gap-4 bg-orange-600 hover:bg-orange-700 text-white justify-start py-4"
                size="lg"
              >
                <div>
                  <FileUp className="h-6 w-6 flex-shrink-0" />
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold">Import from ZIP</div>
                    <div className="text-sm opacity-90 leading-tight break-words whitespace-normal">Load one or multiple exported quizzes</div>
                  </div>
                </div>
              </Button>
            </Label>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-8">
          Select an option above to begin creating your quiz
        </div>
        
        {/* Copyright Footer */}
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>© Copyrighted by CAD-CS, BML Munjal University</p>
          <p><Mail className="inline-block w-4 h-4 mr-1 -mt-1 align-middle text-gray-500" /> : <a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>
      </CardContent>
    </Card>
  );

  const renderScreen1 = () => (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Quiz Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="subject-code">Subject Code <span className="text-red-500">*</span></Label>
            <Input
              id="subject-code"
              value={metadata.subject_code}
              onChange={(e) => setMetadata(prev => ({ ...prev, subject_code: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject Name <span className="text-red-500">*</span></Label>
            <Input
              id="subject"
              value={metadata.subject}
              onChange={(e) => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="quiz-code">Quiz Code <span className="text-red-500">*</span></Label>
            <Input
              id="quiz-code"
              value={metadata.code}
              onChange={(e) => setMetadata(prev => ({ ...prev, code: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="quiz-name">Quiz Name <span className="text-red-500">*</span></Label>
            <Input
              id="quiz-name"
              value={metadata.name}
              onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="year">Session <span className="text-red-500">*</span></Label>
            <Select value={metadata.year} onValueChange={(value) => setMetadata(prev => ({ ...prev, year: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {generateYearOptions().map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
                <SelectItem value="custom">Other (Type your own)</SelectItem>
              </SelectContent>
            </Select>
            {metadata.year === 'custom' && (
              <Input
                className="mt-2"
                placeholder="Enter custom session"
                onChange={(e) => setMetadata(prev => ({ ...prev, year: e.target.value }))}
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="instructor">Instructor Name <span className="text-red-500">*</span></Label>
            <Input
              id="instructor"
              value={metadata.instructor}
              onChange={(e) => setMetadata(prev => ({ ...prev, instructor: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="allowed-time">Allowed Time (minutes) <span className="text-red-500">*</span></Label>
            <Input
              id="allowed-time"
              type="number"
              value={metadata.allowed_time || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, allowed_time: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="num-easy-questions">Number of Easy Questions</Label>
            <Input
              id="num-easy-questions"
              type="number"
              min="0"
              max="500"
              value={metadata.num_easy_questions}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                const total = value + metadata.num_medium_questions + metadata.num_high_questions;
                setMetadata(prev => ({ 
                  ...prev, 
                  num_easy_questions: value,
                  num_displayed_questions: total
                }));
              }}
            />
          </div>
          <div>
            <Label htmlFor="num-medium-questions">Number of Medium Questions</Label>
            <Input
              id="num-medium-questions"
              type="number"
              min="0"
              max="500"
              value={metadata.num_medium_questions}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                const total = metadata.num_easy_questions + value + metadata.num_high_questions;
                setMetadata(prev => ({ 
                  ...prev, 
                  num_medium_questions: value,
                  num_displayed_questions: total
                }));
              }}
            />
          </div>
          <div>
            <Label htmlFor="num-high-questions">Number of High Questions</Label>
            <Input
              id="num-high-questions"
              type="number"
              min="0"
              max="500"
              value={metadata.num_high_questions}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                const total = metadata.num_easy_questions + metadata.num_medium_questions + value;
                setMetadata(prev => ({ 
                  ...prev, 
                  num_high_questions: value,
                  num_displayed_questions: total
                }));
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="num-displayed-questions">Number of Displayed Questions <span className="text-red-500">*</span></Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The number of questions a student will attempt when taking the quiz. This is automatically calculated as the sum of Easy + Medium + High questions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="num-displayed-questions"
              type="number"
              min="0"
              max="500"
              value={metadata.num_displayed_questions}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <Label>Program <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Select value={selectedProgram} onValueChange={setSelectedProgram} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.value} value={program.value}>
                      {program.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProgram === 'custom' && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom program"
                  value={customProgram}
                  onChange={(e) => setCustomProgram(e.target.value)}
                  required
                />
              )}
            </div>
            
            <div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'custom' ? 'Other (Type your own)' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDepartment === 'custom' && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom department"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  required
                />
              )}
            </div>
            
            <div>
              <div className="relative">
                <Input
                  value={selectedSections.length === 0 
                    ? "" 
                    : selectedSections.includes('custom')
                      ? customSections || selectedSections.filter(s => s !== 'custom').join(', ')
                      : selectedSections.join(', ')
                  }
                  placeholder="Select section"
                  readOnly
                  className="cursor-pointer"
                  onClick={() => {
                    // This will be handled by the select dropdown
                  }}
                  required
                />
                <Select>
                  <SelectTrigger className="absolute inset-0 opacity-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(sec => (
                      <div key={sec} className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-accent">
                        <Checkbox
                          id={`sec-${sec}`}
                          checked={selectedSections.includes(sec)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSections([...selectedSections, sec]);
                            } else {
                              setSelectedSections(selectedSections.filter(s => s !== sec));
                            }
                          }}
                        />
                        <Label htmlFor={`sec-${sec}`} className="text-sm cursor-pointer">
                          {sec === 'custom' ? 'Other' : sec}
                        </Label>
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedSections.includes('custom') && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom sections"
                  value={customSections}
                  onChange={(e) => setCustomSections(e.target.value)}
                  required
                />
              )}
            </div>
          </div>
        </div>
        
        {!checkAllRequiredFieldsFilled() && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Fields marked with * are required.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderScreen2 = () => (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Instructions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Add instruction..."
            value={newInstruction}
            onChange={(e) => setNewInstruction(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
            className="resize-none min-h-[120px]"
            rows={5}
          />
          <Button onClick={addInstruction} className="bg-green-600 hover:bg-green-700 self-start">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            {instructions.map((instruction) => (
              <li key={instruction.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="flex-1 ml-2">{instruction.instruction_text}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInstruction(instruction.id)}
                  className="text-red-600 hover:text-red-800 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );

  const renderScreen3 = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[calc(100vh-14rem)]">
        {/* Mobile: Question circles on top */}
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
                        id={`question-${currentQuestion.id}`}
                        value={currentQuestion.question}
                        onChange={(e) => handleQuestionTextChange(currentQuestion.id, e.target.value, currentQuestion.question)}
                        placeholder="Enter your question..."
                        className={`min-h-[120px] text-sm pr-32 ${currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
                        required
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
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
                                    onClick={() => insertMathSymbol(currentQuestion.id, item.symbol)}
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
                    </div>
                    {currentQuestion.question.trim() === '' && (
                      <p className="text-red-500 text-xs mt-1">Question is required</p>
                    )}
                    
                    {currentQuestion.question && (currentQuestion.question.includes('^{') || currentQuestion.question.includes('_{')) && (
                      <div className="mt-2 p-2 bg-gray-50 border rounded-lg">
                        <Label className="text-xs text-gray-600">Preview:</Label>
                        <div 
                          className="text-sm mt-1"
                          dangerouslySetInnerHTML={{ __html: renderMathPreview(currentQuestion.question) }}
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
                        onChange={(e) => handleQuestionTextChange(currentQuestion.id, e.target.value, currentQuestion.question)}
                        placeholder="Enter your question..."
                        className={`min-h-[120px] text-sm pr-24 ${currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
                        required
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
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
                                    onClick={() => insertMathSymbol(currentQuestion.id, item.symbol)}
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
                    </div>
                    {currentQuestion.question.trim() === '' && (
                      <p className="text-red-500 text-xs mt-1">Question is required</p>
                    )}
                    
                    {currentQuestion.question && (currentQuestion.question.includes('^{') || currentQuestion.question.includes('_{')) && (
                      <div className="mt-2 p-2 bg-gray-50 border rounded-lg">
                        <Label className="text-xs text-gray-600">Preview:</Label>
                        <div 
                          className="text-sm mt-1"
                          dangerouslySetInnerHTML={{ __html: renderMathPreview(currentQuestion.question) }}
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
                    {currentQuestion.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Checkbox
                          checked={option.is_correct}
                          onCheckedChange={(checked) => updateOption(currentQuestion.id, option.id, 'is_correct', !!checked)}
                        />
                        <Input
                          value={option.option_text}
                          onChange={(e) => updateOption(currentQuestion.id, option.id, 'option_text', e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="flex-1 h-8 text-sm"
                        />
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
                    ))}
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
                            Yes, Send a Google Calender Link & Generate ZIP
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

        {/* Desktop: Question circles on right sidebar */}
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Welcome Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex flex-col justify-center px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-12 w-12 object-contain" />
              <div className="flex flex-col justify-center">
                <h1 className="text-lg font-semibold leading-tight">PrashnaSetu</h1>
                <span className="text-xs text-muted-foreground leading-tight">Think. Compete. Conquer.</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.displayName || user?.email}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src="/logo2.png" alt="PrashnaSetu Logo" className="h-8 w-8 object-contain" />
                <div className="flex flex-col">
                  <h1 className="text-sm font-semibold leading-tight">PrashnaSetu</h1>
                  <span className="text-xs text-muted-foreground leading-tight">Think. Compete. Conquer.</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="flex items-center space-x-1 h-8 px-2"
              >
                <LogOut className="h-3 w-3" />
                <span className="text-xs">Logout</span>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Welcome, {user?.displayName || user?.email}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2"></h1>
            <p className="text-lg text-gray-700"></p>
          </div>

        {currentScreen === 0 && renderScreen0()}
        {currentScreen === 1 && renderScreen1()}
        {currentScreen === 2 && renderScreen2()}
        {currentScreen === 3 && renderScreen3()}

        {currentScreen > 0 && currentScreen < 3 && (
          <>
            {/* Desktop Layout */}
            <div className="hidden md:flex justify-between items-center">
            <div className="flex gap-4">
              {currentScreen > 1 && (
                <Button
                  onClick={() => setCurrentScreen(currentScreen - 1)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              
              <Button
                onClick={() => setCurrentScreen(0)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            
            <div className="flex gap-4">
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
                      This action will permanently delete all quiz data including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Quiz information and metadata</li>
                        <li>All instructions</li>
                        <li>All questions and their options</li>
                        <li>Uploaded images</li>
                        <li>Saved session data</li>
                      </ul>
                      This action cannot be undone.
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={currentScreen === 1 && !checkAllRequiredFieldsFilled()}
              >
                Next
              </Button>
            </div>
          </div>

            {/* Mobile Layout - Dynamic Grid */}
            <div className="md:hidden space-y-3">
              {/* Row 1: Save Session | Flush Data */}
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
                        This action will permanently delete all quiz data including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Quiz information and metadata</li>
                          <li>All instructions</li>
                          <li>All questions and their options</li>
                          <li>Uploaded images</li>
                          <li>Saved session data</li>
                        </ul>
                        This action cannot be undone.
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

              {/* Row 2: Previous | Next (for screen 2+) or Back to Home | Next (for screen 1) */}
              <div className="grid grid-cols-2 gap-3">
                {currentScreen > 1 ? (
                  <Button
                    onClick={() => setCurrentScreen(currentScreen - 1)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentScreen(0)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Back to Home
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={currentScreen === 1 && !checkAllRequiredFieldsFilled()}
                >
                  Next
                </Button>
        </div>

              {/* Row 3: Back to Home (only for screen 2+) */}
              {currentScreen > 1 && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentScreen(0)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Multi-ZIP Import Progress Dialog */}
        <Dialog open={showMultiImportDialog} onOpenChange={setShowMultiImportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Importing ZIP Files
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
              </div>
              
              {currentImportFile && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Currently processing:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono break-all">
                    {currentImportFile}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">Files to import:</span>
                <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                  {importingFiles.map((fileName, index) => (
                    <div key={index} className="text-xs p-1 bg-gray-50 rounded">
                      {fileName}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Note:</strong> Questions will be combined from all ZIP files. 
                Quiz metadata and instructions will be taken from the first ZIP file.
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
