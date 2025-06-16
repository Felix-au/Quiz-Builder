import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Download, X, Upload, Check, ChevronLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { uploadImageToImgBB, downloadImageAsFile } from '@/utils/imageUpload';

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
  created_at: string;
  updated_at: string;
  created_by: null;
}

const QuizCreator = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [showFlushDialog, setShowFlushDialog] = useState(false);
  
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

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = localStorage.getItem('quizCreatorData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setMetadata(parsed.metadata || metadata);
        setInstructions(parsed.instructions || []);
        
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
        setNumberOfQuestions(parsed.numberOfQuestions || 1);
        setSelectedProgram(parsed.selectedProgram || '');
        setSelectedDepartment(parsed.selectedDepartment || '');
        setSelectedSections(parsed.selectedSections || []);
      } else {
        // Initialize with one default question if no saved data
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
    });
    setInstructions([]);
    setQuestions([]);
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
    if (newCount > questions.length) {
      const additionalQuestions = [];
      for (let i = questions.length; i < newCount; i++) {
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
    } else if (newCount < questions.length) {
      setQuestions(questions.slice(0, newCount));
      if (currentQuestionIndex >= newCount) {
        setCurrentQuestionIndex(Math.max(0, newCount - 1));
      }
    } else if (questions.length === 0 && newCount > 0) {
      // Handle case where questions array is empty but we need questions
      const newQuestions = [];
      for (let i = 0; i < newCount; i++) {
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
    setNumberOfQuestions(newCount);
    setMetadata(prev => ({ ...prev, total_points: newCount }));
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
          instructions: instructions.map(inst => ({
            ...inst,
            quiz_id: metadata.id,
          })),
          questions: questions.map(q => {
            // Clean up the question object, removing imageFile and quiz_id
            const { imageFile, ...cleanQuestion } = q;
            return {
              ...cleanQuestion,
              quiz_id: metadata.id,
              image_path: cleanQuestion.image_path.replace(/\\/g, '/'), // Fix backslashes to forward slashes
              options: cleanQuestion.options.map(opt => ({
                ...opt,
                question_id: cleanQuestion.id,
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

  const renderScreen1 = () => (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Quiz Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subject-code">Subject Code</Label>
            <Input
              id="subject-code"
              value={metadata.subject_code}
              onChange={(e) => setMetadata(prev => ({ ...prev, subject_code: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject Name</Label>
            <Input
              id="subject"
              value={metadata.subject}
              onChange={(e) => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="quiz-code">Quiz Code</Label>
            <Input
              id="quiz-code"
              value={metadata.code}
              onChange={(e) => setMetadata(prev => ({ ...prev, code: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="quiz-name">Quiz Name</Label>
            <Input
              id="quiz-name"
              value={metadata.name}
              onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label>Program</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
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
                />
              )}
            </div>
            
            <div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Session</Label>
            <Select value={metadata.year} onValueChange={(value) => setMetadata(prev => ({ ...prev, year: value }))}>
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
              />
            )}
          </div>
          <div>
            <Label htmlFor="instructor">Instructor Name</Label>
            <Input
              id="instructor"
              value={metadata.instructor}
              onChange={(e) => setMetadata(prev => ({ ...prev, instructor: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="allowed-time">Allowed Time (minutes)</Label>
            <Input
              id="allowed-time"
              type="number"
              value={metadata.allowed_time || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, allowed_time: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
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
      <div className="grid grid-cols-5 gap-6">
        {/* Question Content - 80% width (4/5 columns) */}
        <div className="col-span-4">
          {currentQuestion && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">Question {currentQuestionIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor={`question-${currentQuestion.id}`}>
                      Question Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id={`question-${currentQuestion.id}`}
                      value={currentQuestion.question}
                      onChange={(e) => updateQuestion(currentQuestion.id, 'question', e.target.value)}
                      placeholder="Enter your question..."
                      className={currentQuestion.question.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                      required
                    />
                    {currentQuestion.question.trim() === '' && (
                      <p className="text-red-500 text-sm mt-1">Question is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`topic-${currentQuestion.id}`}>Topic (Will only be visible after quiz completion)</Label>
                    <Input
                      id={`topic-${currentQuestion.id}`}
                      value={currentQuestion.topic}
                      onChange={(e) => updateQuestion(currentQuestion.id, 'topic', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`summary-${currentQuestion.id}`}>Summary (Will only be visible after quiz completion)</Label>
                  <Input
                    id={`summary-${currentQuestion.id}`}
                    value={currentQuestion.summary}
                    onChange={(e) => updateQuestion(currentQuestion.id, 'summary', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Question Image</Label>
                  <div className="flex items-center gap-4">
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
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Label>
                    {currentQuestion.imageFile && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">{currentQuestion.imageFile.name}</span>
                      </div>
                    )}
                  </div>
                  {currentQuestion.imageFile && (
                    <img
                      src={URL.createObjectURL(currentQuestion.imageFile)}
                      alt="Question preview"
                      className="max-w-xs h-32 object-cover rounded-lg border"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Answer Options</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(currentQuestion.id)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  {currentQuestion.options.map((option, optionIndex) => (
                    <div key={option.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        checked={option.is_correct}
                        onCheckedChange={(checked) => updateOption(currentQuestion.id, option.id, 'is_correct', !!checked)}
                      />
                      <Input
                        value={option.option_text}
                        onChange={(e) => updateOption(currentQuestion.id, option.id, 'option_text', e.target.value)}
                        placeholder={`Option ${optionIndex + 1}...`}
                        className="flex-1"
                      />
                      {currentQuestion.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(currentQuestion.id, option.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Questions Navigation - 20% width (1/5 column) */}
        <div className="col-span-1">
          <Card className="shadow-lg border-0 sticky top-6">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="num-questions" className="text-sm">Total:</Label>
                  <Input
                    id="num-questions"
                    type="number"
                    min="1"
                    max="50"
                    value={numberOfQuestions}
                    onChange={(e) => adjustQuestions(parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: numberOfQuestions }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentQuestionIndex === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(i)}
                      className="w-8 h-8 rounded text-xs p-0"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Quiz: Quiz Builder</h1>
          <p className="text-gray-600">Create interactive quizzes with images and export them easily</p>
        </div>

        {currentScreen === 1 && renderScreen1()}
        {currentScreen === 2 && renderScreen2()}
        {currentScreen === 3 && renderScreen3()}

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
            {currentScreen < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={generateZip}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <Download className="h-5 w-5 mr-2" />
                Generate Quiz ZIP
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
