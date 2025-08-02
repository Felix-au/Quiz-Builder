import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  FileText, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Copy, 
  ExternalLink, 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  GraduationCap, 
  Building, 
  Hash, 
  Timer, 
  FileDown, 
  Shuffle, 
  Target, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Award, 
  Star, 
  Zap, 
  Shield, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  Maximize, 
  Minimize, 
  RefreshCw, 
  LogOut 
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { uploadImageToImgBB, downloadImageAsFile } from '@/utils/imageUpload';

// Import screen components
import Screen0 from './Screen0';
import Screen1 from './Screen1';
import Screen2 from './Screen2';
import Screen3 from './Screen3';

// Types
interface Question {
  id: number;
  question_text: string;
  question_image?: string;
  question_image_file?: File;
  options: string[];
  correct_answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subject?: string;
  marks: number;
}

interface Instruction {
  id: number;
  instruction_text: string;
}

interface QuizMetadata {
  name: string;
  subject: string;
  subject_code: string;
  instructor: string;
  year: string;
  allowed_time: number;
  code: string;
  total_questions?: number;
  easy_questions?: number;
  medium_questions?: number;
  hard_questions?: number;
}

interface Distribution {
  easy: number;
  medium: number;
  hard: number;
}

interface SessionData {
  metadata: QuizMetadata;
  instructions: Instruction[];
  subjects: string[];
  questions: Question[];
  selectedProgram: string;
  customProgram: string;
  selectedSemester: string;
  selectedDepartment: string;
  customDepartment: string;
  selectedSections: string[];
  customSections: string;
  distribution: Distribution;
  selectedSubject: string;
  currentScreen: number;
}

const QuizCreator: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(0);
  
  // State for metadata
  const [metadata, setMetadata] = useState<QuizMetadata>({
    name: '',
    subject: '',
    subject_code: '',
    instructor: '',
    year: '',
    allowed_time: 60,
    code: '',
    total_questions: 0,
    easy_questions: 0,
    medium_questions: 0,
    hard_questions: 0,
  });

  // State for instructions
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [newInstruction, setNewInstruction] = useState('');

  // State for subjects
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  // State for questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // State for Screen1 form fields
  const [selectedProgram, setSelectedProgram] = useState('');
  const [customProgram, setCustomProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [customSections, setCustomSections] = useState('');

  // State for Screen3 distribution
  const [distribution, setDistribution] = useState<Distribution>({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [selectedSubject, setSelectedSubject] = useState('');

  // Load session on component mount
  useEffect(() => {
    loadSession();
  }, []);

  // Save session function - updated to include subjects and selectedSubject
  const saveSession = () => {
    const sessionData: SessionData = {
      metadata,
      instructions,
      subjects, // Added subjects array from Screen2
      questions,
      selectedProgram,
      customProgram,
      selectedSemester,
      selectedDepartment,
      customDepartment,
      selectedSections,
      customSections,
      distribution,
      selectedSubject, // Added selectedSubject from Screen3
      currentScreen,
    };

    localStorage.setItem('quizCreatorSession', JSON.stringify(sessionData));
    toast({
      title: "Session saved",
      description: "Your progress has been saved successfully.",
    });
  };

  // Load session function - updated to load subjects and selectedSubject
  const loadSession = () => {
    const savedSession = localStorage.getItem('quizCreatorSession');
    if (savedSession) {
      try {
        const sessionData: SessionData = JSON.parse(savedSession);
        
        setMetadata(sessionData.metadata || {
          name: '',
          subject: '',
          subject_code: '',
          instructor: '',
          year: '',
          allowed_time: 60,
          code: '',
          total_questions: 0,
          easy_questions: 0,
          medium_questions: 0,
          hard_questions: 0,
        });
        
        setInstructions(sessionData.instructions || []);
        setSubjects(sessionData.subjects || []); // Load subjects array
        setQuestions(sessionData.questions || []);
        setSelectedProgram(sessionData.selectedProgram || '');
        setCustomProgram(sessionData.customProgram || '');
        setSelectedSemester(sessionData.selectedSemester || '');
        setSelectedDepartment(sessionData.selectedDepartment || '');
        setCustomDepartment(sessionData.customDepartment || '');
        setSelectedSections(sessionData.selectedSections || []);
        setCustomSections(sessionData.customSections || '');
        setDistribution(sessionData.distribution || { easy: 0, medium: 0, hard: 0 });
        setSelectedSubject(sessionData.selectedSubject || ''); // Load selectedSubject
        setCurrentScreen(sessionData.currentScreen || 0);
        
        toast({
          title: "Session loaded",
          description: "Your previous session has been restored.",
        });
      } catch (error) {
        console.error('Error loading session:', error);
        toast({
          title: "Error loading session",
          description: "There was an error loading your saved session.",
          variant: "destructive",
        });
      }
    }
  };

  // Clear session function
  const clearSession = () => {
    localStorage.removeItem('quizCreatorSession');
    
    // Reset all state
    setMetadata({
      name: '',
      subject: '',
      subject_code: '',
      instructor: '',
      year: '',
      allowed_time: 60,
      code: '',
      total_questions: 0,
      easy_questions: 0,
      medium_questions: 0,
      hard_questions: 0,
    });
    setInstructions([]);
    setSubjects([]);
    setQuestions([]);
    setSelectedProgram('');
    setCustomProgram('');
    setSelectedSemester('');
    setSelectedDepartment('');
    setCustomDepartment('');
    setSelectedSections([]);
    setCustomSections('');
    setDistribution({ easy: 0, medium: 0, hard: 0 });
    setSelectedSubject('');
    setCurrentScreen(0);
    
    toast({
      title: "Session cleared",
      description: "All data has been cleared and you can start fresh.",
    });
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveSession();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [metadata, instructions, subjects, questions, selectedProgram, customProgram, selectedSemester, selectedDepartment, customDepartment, selectedSections, customSections, distribution, selectedSubject, currentScreen]);

  // Helper functions
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(`${i}-${(i + 1).toString().slice(-2)}`);
    }
    return years;
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      const newInstr: Instruction = {
        id: Date.now(),
        instruction_text: newInstruction.trim(),
      };
      setInstructions([...instructions, newInstr]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (id: number) => {
    setInstructions(instructions.filter(instr => instr.id !== id));
  };

  const checkAllRequiredFieldsFilled = () => {
    const program = selectedProgram === 'custom' ? customProgram : selectedProgram;
    const department = selectedDepartment === 'custom' ? customDepartment : selectedDepartment;
    const sections = selectedSections.includes('custom') ? customSections : selectedSections.join(', ');
    const year = metadata.year === 'custom' ? metadata.year : metadata.year;

    return !!(
      metadata.subject_code &&
      metadata.subject &&
      metadata.name &&
      program &&
      selectedSemester &&
      department &&
      sections &&
      year &&
      metadata.instructor &&
      metadata.allowed_time
    );
  };

  // Import from ZIP functionality
  const importFromZip = async (file: File) => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Read quiz.json
      const quizJsonFile = zipContent.file('quiz.json');
      if (!quizJsonFile) {
        throw new Error('quiz.json not found in ZIP file');
      }
      
      const quizJsonContent = await quizJsonFile.async('text');
      const quizData = JSON.parse(quizJsonContent);
      
      // Load the quiz data
      setMetadata(quizData.metadata || {});
      setInstructions(quizData.instructions || []);
      setSubjects(quizData.subjects || []); // Load subjects from imported data
      setQuestions(quizData.questions || []);
      setSelectedProgram(quizData.selectedProgram || '');
      setCustomProgram(quizData.customProgram || '');
      setSelectedSemester(quizData.selectedSemester || '');
      setSelectedDepartment(quizData.selectedDepartment || '');
      setCustomDepartment(quizData.customDepartment || '');
      setSelectedSections(quizData.selectedSections || []);
      setCustomSections(quizData.customSections || '');
      setDistribution(quizData.distribution || { easy: 0, medium: 0, hard: 0 });
      setSelectedSubject(quizData.selectedSubject || ''); // Load selectedSubject from imported data
      
      // Move to Screen 1 after import
      setCurrentScreen(1);
      
      toast({
        title: "Quiz imported successfully",
        description: "The quiz has been loaded from the ZIP file.",
      });
    } catch (error) {
      console.error('Error importing quiz:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing the quiz from the ZIP file.",
        variant: "destructive",
      });
    }
  };

  const importFromMultipleZips = async (files: FileList) => {
    // Handle multiple ZIP imports - merge functionality
    toast({
      title: "Multiple ZIP import",
      description: "Multiple ZIP import functionality to be implemented.",
    });
  };

  const loadFromSavedSession = () => {
    loadSession();
    if (currentScreen === 0) {
      setCurrentScreen(1);
    }
  };

  const startNewQuiz = () => {
    clearSession();
    setCurrentScreen(1);
  };

  // Navigation functions
  const goToNextScreen = () => {
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const goToPreviousScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 0:
        return (
          <Screen0
            loadFromSavedSession={loadFromSavedSession}
            startNewQuiz={startNewQuiz}
            importFromZip={importFromZip}
            importFromMultipleZips={importFromMultipleZips}
          />
        );
      case 1:
        return (
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
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            customDepartment={customDepartment}
            setCustomDepartment={setCustomDepartment}
            selectedSections={selectedSections}
            setSelectedSections={setSelectedSections}
            customSections={customSections}
            setCustomSections={setCustomSections}
            checkAllRequiredFieldsFilled={checkAllRequiredFieldsFilled}
          />
        );
      case 2:
        return (
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
        );
      case 3:
        return (
          <Screen3
            distribution={distribution}
            setDistribution={setDistribution}
            subjects={subjects}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            metadata={metadata}
            setMetadata={setMetadata}
          />
        );
      default:
        return <div>Screen not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src="/logo23.png" alt="PrashnaSetu" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold">PrashnaSetu</h1>
              <p className="text-sm text-muted-foreground">Quiz Builder</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveSession}>
              <Save className="h-4 w-4 mr-2" />
              Save Session
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        {currentScreen > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentScreen} of 3
              </span>
            </div>
            <Progress value={(currentScreen / 3) * 100} className="h-2" />
          </div>
        )}

        {/* Main content */}
        <div className="space-y-6">
          {renderCurrentScreen()}
        </div>

        {/* Navigation buttons */}
        {currentScreen > 0 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={goToPreviousScreen}
              disabled={currentScreen <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={goToNextScreen}
              disabled={currentScreen >= 3 || (currentScreen === 1 && !checkAllRequiredFieldsFilled())}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCreator;