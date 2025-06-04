import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Download, X, Upload, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import * as FileSaver from 'file-saver';

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
    allowed_time: ,
    visible: true,
    total_points: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  });

  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newInstruction, setNewInstruction] = useState('');

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

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      question: '',
      topic: '',
      summary: '',
      question_order: questions.length,
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
    setQuestions([...questions, newQuestion]);
    setMetadata(prev => ({ ...prev, total_points: questions.length + 1 }));
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

  const removeQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    setMetadata(prev => ({ ...prev, total_points: questions.length - 1 }));
  };

  const handleImageUpload = (questionId: number, file: File) => {
    const fileName = file.name;
    const uuid = crypto.randomUUID();
    const fileExtension = fileName.split('.').pop();
    const newFileName = `${uuid}.${fileExtension}`;
    
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            imageFile: file,
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

      // Update timestamps
      const currentTime = new Date().toISOString();
      const updatedMetadata = {
        ...metadata,
        updated_at: currentTime,
        total_points: questions.length,
      };

      // Prepare quiz data with proper structure
      const quizData = {
        quiz: {
          ...updatedMetadata,
          instructions: instructions.map(inst => ({
            ...inst,
            quiz_id: metadata.id,
          })),
          questions: questions.map(q => ({
            ...q,
            quiz_id: metadata.id,
            options: q.options.map(opt => ({
              ...opt,
              question_id: q.id,
            })),
          })),
        }
      };

      // Add quiz.json
      zip.file('quiz.json', JSON.stringify(quizData, null, 2));

      // Add images
      for (const question of questions) {
        if (question.imageFile) {
          const fileName = question.image.split('/').pop();
          if (fileName && imagesFolder) {
            imagesFolder.file(fileName, question.imageFile);
          }
        }
      }

      // Generate and download zip
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Creator</h1>
          <p className="text-gray-600">Create interactive quizzes with images and export them easily</p>
        </div>

        {/* Quiz Metadata */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Quiz Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiz-id">Quiz ID</Label>
                <Input
                  id="quiz-id"
                  type="number"
                  value={metadata.id}
                  onChange={(e) => setMetadata(prev => ({ ...prev, id: parseInt(e.target.value) || 1 }))}
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
              <div>
                <Label htmlFor="instructor">Instructor Name</Label>
                <Input
                  id="instructor"
                  value={metadata.instructor}
                  onChange={(e) => setMetadata(prev => ({ ...prev, instructor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={metadata.course}
                  onChange={(e) => setMetadata(prev => ({ ...prev, course: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={metadata.year}
                  onChange={(e) => setMetadata(prev => ({ ...prev, year: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="academic-year">Academic Year</Label>
                <Input
                  id="academic-year"
                  value={metadata.academic_year}
                  onChange={(e) => setMetadata(prev => ({ ...prev, academic_year: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={metadata.subject}
                  onChange={(e) => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="subject-code">Subject Code</Label>
                <Input
                  id="subject-code"
                  value={metadata.subject_code}
                  onChange={(e) => setMetadata(prev => ({ ...prev, subject_code: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="allowed-time">Allowed Time (minutes)</Label>
                <Input
                  id="allowed-time"
                  type="number"
                  value={metadata.allowed_time}
                  onChange={(e) => setMetadata(prev => ({ ...prev, allowed_time: parseInt(e.target.value) || 60 }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible"
                checked={metadata.visible}
                onCheckedChange={(checked) => setMetadata(prev => ({ ...prev, visible: !!checked }))}
              />
              <Label htmlFor="visible">Quiz Visible</Label>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add instruction..."
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
              />
              <Button onClick={addInstruction} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {instructions.map((instruction, index) => (
              <div key={instruction.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">#{index + 1}</span>
                <span className="flex-1">{instruction.instruction_text}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInstruction(instruction.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.map((question, questionIndex) => (
          <Card key={question.id} className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Question {questionIndex + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                  <Textarea
                    id={`question-${question.id}`}
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder="Enter your question..."
                  />
                </div>
                <div>
                  <Label htmlFor={`topic-${question.id}`}>Topic</Label>
                  <Input
                    id={`topic-${question.id}`}
                    value={question.topic}
                    onChange={(e) => updateQuestion(question.id, 'topic', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`summary-${question.id}`}>Summary</Label>
                <Input
                  id={`summary-${question.id}`}
                  value={question.summary}
                  onChange={(e) => updateQuestion(question.id, 'summary', e.target.value)}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Question Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(question.id, file);
                      }
                    }}
                    className="hidden"
                    id={`image-${question.id}`}
                  />
                  <Label
                    htmlFor={`image-${question.id}`}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Label>
                  {question.imageFile && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">{question.imageFile.name}</span>
                    </div>
                  )}
                </div>
                {question.imageFile && (
                  <img
                    src={URL.createObjectURL(question.imageFile)}
                    alt="Question preview"
                    className="max-w-xs h-32 object-cover rounded-lg border"
                  />
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Answer Options</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(question.id)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={option.is_correct}
                      onCheckedChange={(checked) => updateOption(question.id, option.id, 'is_correct', !!checked)}
                    />
                    <Input
                      value={option.option_text}
                      onChange={(e) => updateOption(question.id, option.id, 'option_text', e.target.value)}
                      placeholder={`Option ${optionIndex + 1}...`}
                      className="flex-1"
                    />
                    {question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(question.id, option.id)}
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
        ))}

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateZip}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Download className="h-5 w-5 mr-2" />
            Generate Quiz ZIP
          </Button>
        </div>
      </div>

      {/* Fixed Add Question Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={addQuestion}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg font-semibold rounded-full shadow-lg transform transition-all duration-200 hover:scale-110"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Question
        </Button>
      </div>
    </div>
  );
};

export default QuizCreator;
