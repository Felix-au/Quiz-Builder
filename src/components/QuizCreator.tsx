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
import { Plus, Download, X, Upload, Check, ChevronLeft, Save, Trash2, AlertTriangle, FileText, Sigma, Superscript, Subscript, Calendar, Mail, ChevronRight, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  created_at: string;
  updated_at: string;
  created_by: null;
}

const QuizCreator = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [showFlushDialog, setShowFlushDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  
  // Reminder dialog state
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');
  
  // Formatting state
  const [activeFormatting, setActiveFormatting] = useState<'none' | 'superscript' | 'subscript'>('none');
  
  // Math symbols pagination state
  const [currentSymbolPage, setCurrentSymbolPage] = useState(1);

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
    num_displayed_questions: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  });

  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newInstruction, setNewInstruction] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Course dropdowns state
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [customProgram, setCustomProgram] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [customSections, setCustomSections] = useState('');

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

  // Mathematical symbols organized by frequency
  const mostFrequentSymbols = [
    // Basic operations and common symbols
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
    // Common Greek letters
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
    // More operations
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
    // More Greek letters
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
    // Set theory basics
    { symbol: '∈', name: 'Element of' },
    { symbol: '∉', name: 'Not an element of' },
    { symbol: '⊂', name: 'Subset of' },
    { symbol: '⊃', name: 'Superset of' },
    { symbol: '∪', name: 'Union' },
    { symbol: '∩', name: 'Intersection' },
    { symbol: '∅', name: 'Empty set' },
  ];

  const rarelyUsedSymbols = [
    // Advanced symbols
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
    // Capital Greek letters
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
    // Geometry and arrows
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
    // Miscellaneous
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

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('wnSCgvOBG9hB6q1_g');
  }, []);

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = localStorage.getItem('quizCreatorData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setMetadata(parsed.metadata || metadata);
        
        // Load instructions or set default if none exist
        if (parsed.instructions && parsed.instructions.length > 0) {
          setInstructions(parsed.instructions);
        } else {
          // Add default instruction
          const defaultInstruction: Instruction = {
            id: 1,
            instruction_text: 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
            instruction_order: 1,
          };
          setInstructions([defaultInstruction]);
        }
        
        const loadedQuestions = parsed.questions || [];
        
        // Download images from ImgBB and recreate File objects
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
        setCurrentScreen(parsed.currentScreen || 1);
        
        // Set numberOfQuestions based on num_displayed_questions from metadata, or parsed value
        const displayedQuestions = parsed.metadata?.num_displayed_questions || 1;
        const totalQuestions = Math.max(displayedQuestions, parsed.numberOfQuestions || 1);
        setNumberOfQuestions(totalQuestions);
        
        setSelectedProgram(parsed.selectedProgram || '');
        setSelectedDepartment(parsed.selectedDepartment || '');
        setSelectedSections(parsed.selectedSections || []);
      } else {
        // Initialize with default instruction
        const defaultInstruction: Instruction = {
          id: 1,
          instruction_text: 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
          instruction_order: 1,
        };
        setInstructions([defaultInstruction]);
        
        // Initialize with default question instead of empty array
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
    // Update course field when dropdowns change
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
      const endYear = startYear + programYears; // Fixed: removed - 1
      options.push(`${startYear}-${endYear}`);
    }
    
    return options;
  };

  const sendReminderEmail = async (date: string, time: string, email: string) => {
    try {
      // Create Google Calendar link
      // Convert input date/time string to a proper Date object with IST offset
const startDateTime = new Date(`${date}T${time}:00+05:30`);
const endDateTime = new Date(startDateTime.getTime() + (metadata.allowed_time * 60 * 1000));

// Format to Google Calendar's expected format: YYYYMMDDTHHMMSSZ
const formatDateForGoogle = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Simplified Google Calendar link with just title and time
const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent(`Quiz: ${metadata.name}`)}` +
  `&dates=${formatDateForGoogle(startDateTime)}/${formatDateForGoogle(endDateTime)}`;

// ✅ Pass just the clean URL (no emoji or \n) so EmailJS template can link it
const templateParams = {
  to_email: email,
  from_name: 'Quiz Builder',
  from_email: 'quizbuilder86@gmail.com',
  quiz_name: metadata.name,
  quiz_date: date,
  quiz_time: time,
  subject: metadata.subject,
  instructor: metadata.instructor,
  course: metadata.course,
  allowed_time: metadata.allowed_time,
  quiz_code: metadata.code,
  link: calendarUrl, // ✅ just the raw link
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
      throw error; // Re-throw to prevent ZIP generation if email fails
    }
  };

  const saveSession = async () => {
    try {
      // Upload images to ImgBB before saving
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

      // Update questions with uploaded image URLs
      setQuestions(questionsWithUploadedImages);

      // Create a cleaned version of questions without imageFile properties for localStorage
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
      num_displayed_questions: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
    });
    
    // Reset to default instruction
    const defaultInstruction: Instruction = {
      id: 1,
      instruction_text: 'Once the quiz starts, full screen will trigger automatically, everytime window goes out of focus or is switched, one fault is counted. Faculty may terminate quiz or negative marks may be given based on it.',
      instruction_order: 1,
    };
    setInstructions([defaultInstruction]);
    
    // Initialize with default question instead of empty array
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
    // Ensure newCount cannot be less than num_displayed_questions
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
      // Handle case where questions array is empty but we need questions
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
            image_path: `quiz_images\\${newFileName}`,
            image_url: `http://192.168.1.194:8080/${newFileName}`,
            image: `images/${newFileName}`,
          }
        : q
    ));
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
            // Clean up the question object, removing imageFile, originalImageFileName, and imgbbUrl
            const { imageFile, originalImageFileName, imgbbUrl, ...cleanQuestion } = q;
            return {
              id: cleanQuestion.id,
              quiz_id: metadata.id,
              question: cleanQuestion.question,
              topic: cleanQuestion.topic,
              summary: cleanQuestion.summary,
              question_order: index,
              points: cleanQuestion.points,
              image_path: cleanQuestion.image_path.replace(/\\/g, '/'),
              image_url: cleanQuestion.image_url,
              image: cleanQuestion.image,
              options: cleanQuestion.options.map((opt, optIndex) => ({
                id: opt.id,
                question_id: cleanQuestion.id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                option_order: optIndex + 1,
              })),
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
        description: "Your quiz ZIP file has been downloaded.",
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

      // Validate email format
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
        // Send email reminder first
        await sendReminderEmail(reminderDate, reminderTime, reminderEmail);
        
        // Generate ZIP after successful email
        await generateZip();
      } catch (error) {
        // Don't generate ZIP if email fails
        return;
      }
    } else {
      // Just generate ZIP without reminder
      await generateZip();
    }
    
    // Close dialog and reset fields
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

  const handleNext = () => {
    if (currentScreen === 3 && !validateCurrentQuestion()) {
      toast({
        title: "Question Required",
        description: "Please enter a question before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const checkAllRequiredFieldsFilled = () => {
    const program = selectedProgram === 'custom' ? customProgram : selectedProgram;
    const department = selectedDepartment === 'custom' ? customDepartment : selectedDepartment;
    const sectionStr = selectedSections.includes('custom') ? customSections : selectedSections.join(', ');
    
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
      metadata.num_displayed_questions > 0
    );
  };

  const insertMathSymbol = (questionId: number, symbol: string) => {
    const currentQuestion = questions.find(q => q.id === questionId);
    if (currentQuestion) {
      let formattedSymbol = symbol;
      
      // Apply active formatting
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
    
    // If formatting is active and new text was added
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
    // Convert ^{...} to <sup>...</sup> and _{...} to <sub>...</sub>
    let rendered = text;
    
    // Handle superscript: ^{content}
    rendered = rendered.replace(/\^{([^}]*)}/g, '<sup>$1</sup>');
    
    // Handle subscript: _{content}
    rendered = rendered.replace(/_{([^}]*)}/g, '<sub>$1</sub>');
    
    return rendered;
  };

  const renderScreen1 = () => (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Quiz Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    The number of questions a student will attempt when taking the quiz. This allows you to create a larger question pool while only showing a subset to each student.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="num-displayed-questions"
            type="number"
            min="1"
            max="500"
            value={metadata.num_displayed_questions || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setMetadata(prev => ({ ...prev, num_displayed_questions: value }));
              // Adjust numberOfQuestions if it's less than the new displayed questions value
              if (numberOfQuestions < value) {
                setNumberOfQuestions(value);
                adjustQuestions(value);
              }
            }}
            required
          />
        </div>
        
        {!checkAllRequiredFieldsFilled() && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Fields marked with * are required
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
      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-12rem)]">
        {/* Question Content - Optimized layout */}
        <div className="col-span-4">
          {currentQuestion && (
            <Card className="shadow-lg border-0 h-full">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg py-3">
                <CardTitle className="text-lg">Question {currentQuestionIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 overflow-y-auto">
                {/* Compact form layout */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Question text - spans 2 columns */}
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
                        className={`min-h-[80px] text-sm pr-32 ${currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}`}
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
                    
                    {/* Math Preview */}
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
                  
                  {/* Topic and Summary - stacked in 1 column */}
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`topic-${currentQuestion.id}`} className="text-sm">Topic (Visible only after submission)</Label>
                      <Input
                        id={`topic-${currentQuestion.id}`}
                        value={currentQuestion.topic}
                        onChange={(e) => updateQuestion(currentQuestion.id, 'topic', e.target.value)}
                        className="text-sm h-8"
                        placeholder="Topic"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`summary-${currentQuestion.id}`} className="text-sm">Summary (Visible only after submission)</Label>
                      <Input
                        id={`summary-${currentQuestion.id}`}
                        value={currentQuestion.summary}
                        onChange={(e) => updateQuestion(currentQuestion.id, 'summary', e.target.value)}
                        className="text-sm h-8"
                        placeholder="Summary"
                      />
                    </div>
                  </div>
                </div>

                {/* Image upload - compact */}
                <div className="space-y-2">
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
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-3 w-3" />
                        <span className="text-xs">{currentQuestion.imageFile.name}</span>
                      </div>
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

                {/* Options - 2 per row layout */}
                <div className="space-y-2">
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
                  
                  {/* Options grid - 2 columns */}
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

                {/* Navigation buttons */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
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
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronLeft className="h-3 w-3 rotate-180" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center gap-2 pt-2 border-t">
                  <Button
                    onClick={() => setCurrentScreen(2)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs px-3"
                  >
                    <FileText className="h-3 w-3" />
                    Instructions
                  </Button>
                  
                  <Button
                    onClick={saveSession}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs px-3"
                  >
                    <Save className="h-3 w-3" />
                    Save Session
                  </Button>
                  
                  <AlertDialog open={showFlushDialog} onOpenChange={setShowFlushDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50 text-xs px-3"
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
                  
                  <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs px-3"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Generate ZIP
                      </Button>
                    </DialogTrigger>
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

        {/* Questions Navigation - Compact sidebar */}
        <div className="col-span-1">
          <Card className="shadow-lg border-0 sticky top-6">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg py-2">
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="num-questions" className="text-xs">Total:</Label>
                  <Input
                    id="num-questions"
                    type="number"
                    min="1"
                    max="500"
                    value={numberOfQuestions}
                    onChange={(e) => adjustQuestions(parseInt(e.target.value) || 1)}
                    className="w-16 h-6 text-xs"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: numberOfQuestions }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentQuestionIndex === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(i)}
                      className="w-6 h-6 rounded-full text-xs p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Quiz: Quiz Builder</h1>
          <p className="text-gray-600">Create interactive quizzes with images and export them easily</p>
        </div>

        {currentScreen === 1 && renderScreen1()}
        {currentScreen === 2 && renderScreen2()}
        {currentScreen === 3 && renderScreen3()}

        {/* Main navigation - only show for screens 1 and 2 */}
        {currentScreen < 3 && (
          <div className="flex justify-between items-center">
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
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCreator;
