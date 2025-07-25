import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

// Function to generate a random 6-character alphanumeric code
const generateQuizCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Define the props type for Screen1
interface Screen1Props {
  metadata: any;
  setMetadata: (fn: any) => void;
  generateYearOptions: () => string[];
  selectedProgram: string;
  setSelectedProgram: (value: string) => void;
  customProgram: string;
  setCustomProgram: (value: string) => void;
  selectedSemester: string;
  setSelectedSemester: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  customDepartment: string;
  setCustomDepartment: (value: string) => void;
  selectedSections: string[];
  setSelectedSections: (value: string[]) => void;
  customSections: string;
  setCustomSections: (value: string) => void;
  checkAllRequiredFieldsFilled: () => boolean;
}

const departments = [
  'CSE', 'ME', 'ECE', 'ECOM', 'CE', 'EE', 'IT', 'BT', 'CH', 'N/A', 'custom'
];
const sections = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'N/A', 'custom'];
const programs = [
  { value: 'BTech', label: 'BTech', years: 4 },
  { value: 'BA', label: 'BA', years: 3 },
  { value: 'MBA', label: 'MBA', years: 2 },
  { value: 'MTech', label: 'MTech', years: 2 },
  { value: 'PhD', label: 'PhD', years: 5 },
  { value: 'custom', label: 'Other (Type your own)', years: 4 }
];

const semesters = [
  'Sem-I', 'Sem-II', 'Sem-III', 'Sem-IV', 'Sem-V', 'Sem-VI', 'Sem-VII', 'Sem-VIII', 'Sem-IX', 'Sem-X'
];

const Screen1: React.FC<Screen1Props> = ({
  metadata,
  setMetadata,
  generateYearOptions,
  selectedProgram,
  setSelectedProgram,
  customProgram,
  setCustomProgram,
  selectedSemester,
  setSelectedSemester,
  selectedDepartment,
  setSelectedDepartment,
  customDepartment,
  setCustomDepartment,
  selectedSections,
  setSelectedSections,
  customSections,
  setCustomSections,
  checkAllRequiredFieldsFilled,
}) => {
  // Generate quiz code on component mount if it doesn't exist
  useEffect(() => {
    if (!metadata.code) {
      const newQuizCode = generateQuizCode();
      setMetadata((prev: any) => ({ ...prev, code: newQuizCode }));
    }
  }, [metadata.code, setMetadata]);

  const [sectionSelectOpen, setSectionSelectOpen] = useState(false);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Quiz Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="subject-code">Course Code <span className="text-red-500">*</span></Label>
            <Input
              id="subject-code"
              value={metadata.subject_code}
              onChange={(e) => setMetadata((prev: any) => ({ ...prev, subject_code: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject Name <span className="text-red-500">*</span></Label>
            <Input
              id="subject"
              value={metadata.subject}
              onChange={(e) => setMetadata((prev: any) => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="quiz-name">Quiz Name <span className="text-red-500">*</span></Label>
            <Input
              id="quiz-name"
              value={metadata.name}
              onChange={(e) => setMetadata((prev: any) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Program <span className="text-red-500">*</span></Label>
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
                onChange={(e) => {
                  const trimmed = e.target.value.replace(/\s+/g, '');
                  setCustomProgram(trimmed);
                }}
                required
              />
            )}
          </div>
          <div>
            <Label>Semester <span className="text-red-500">*</span></Label>
            <Select value={selectedSemester} onValueChange={setSelectedSemester} required>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map(sem => (
                  <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Department <span className="text-red-500">*</span></Label>
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
                onChange={(e) => {
                  const trimmed = e.target.value.replace(/\s+/g, '');
                  setCustomDepartment(trimmed);
                }}
                required
              />
            )}
          </div>
          <div>
            <Label>Section <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                value={selectedSections.includes('custom')
                  ? 'Other: separated by comma if multiple'
                  : selectedSections.length === 0
                    ? ''
                    : selectedSections.join(', ')
                }
                placeholder="Select section"
                readOnly
                className="cursor-pointer"
                onClick={() => setSectionSelectOpen(true)}
                required
              />
              <Select open={sectionSelectOpen} onOpenChange={setSectionSelectOpen}>
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
                            if (sec === 'custom') setSectionSelectOpen(false);
                          } else {
                            setSelectedSections(selectedSections.filter(s => s !== sec));
                          }
                        }}
                      />
                      <Label htmlFor={`sec-${sec}`} className="text-sm cursor-pointer">
                        {sec === 'custom' ? 'Other: separated by comma if multiple' : sec}
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
                onChange={(e) => {
                  // Normalize: only a single space after each comma, no leading/trailing spaces
                  let value = e.target.value;
                  value = value.replace(/\s*,\s*/g, ', '); // comma, then single space
                  value = value.replace(/,{2,}/g, ','); // remove double commas
                  value = value.replace(/^\s+|\s+$/g, ''); // trim
                  setCustomSections(value);
                }}
                required
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="year">Academic Year <span className="text-red-500">*</span></Label>
            <Select value={metadata.year} onValueChange={(value) => setMetadata((prev: any) => ({ ...prev, year: value }))} required>
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
                onChange={(e) => setMetadata((prev: any) => ({ ...prev, year: e.target.value }))}
                required
              />
            )}
          </div>
          <div>
            <Label htmlFor="instructor">Instructor Name <span className="text-red-500">*</span></Label>
            <Input
              id="instructor"
              value={metadata.instructor}
              onChange={(e) => setMetadata((prev: any) => ({ ...prev, instructor: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="allowed-time">Allowed Time (minutes) <span className="text-red-500">*</span></Label>
            <Input
              id="allowed-time"
              type="number"
              value={metadata.allowed_time || ''}
              onChange={(e) => setMetadata((prev: any) => ({ ...prev, allowed_time: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>
        </div>
        <div>
          <div className="mb-2 font-medium">Number of questions to be displayed to the student:</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="num-easy-questions">Easy Difficulty Questions</Label>
              <Input
                id="num-easy-questions"
                type="number"
                min="0"
                max="500"
                value={metadata.num_easy_questions}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                  const total = value + metadata.num_medium_questions + metadata.num_high_questions;
                  setMetadata((prev: any) => ({ 
                    ...prev, 
                    num_easy_questions: value,
                    num_displayed_questions: total
                  }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="num-medium-questions">Medium Difficulty Questions</Label>
              <Input
                id="num-medium-questions"
                type="number"
                min="0"
                max="500"
                value={metadata.num_medium_questions}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                  const total = metadata.num_easy_questions + value + metadata.num_high_questions;
                  setMetadata((prev: any) => ({ 
                    ...prev, 
                    num_medium_questions: value,
                    num_displayed_questions: total
                  }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="num-high-questions">High Difficulty Questions</Label>
              <Input
                id="num-high-questions"
                type="number"
                min="0"
                max="500"
                value={metadata.num_high_questions}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                  const total = metadata.num_easy_questions + metadata.num_medium_questions + value;
                  setMetadata((prev: any) => ({ 
                    ...prev, 
                    num_high_questions: value,
                    num_displayed_questions: total
                  }));
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="num-displayed-questions">Total Questions<span className="text-red-500">*</span></Label>
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
        </div>
        {!checkAllRequiredFieldsFilled() && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Fields marked with * are required.
            </p>
          </div>
        )}
        
        {/* Hidden field to store the auto-generated quiz code */}
        <input 
          type="hidden" 
          value={metadata.code || ''} 
          readOnly 
        />
        
        
      </CardContent>
    </Card>
  );
};

export default Screen1;