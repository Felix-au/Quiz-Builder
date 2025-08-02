import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

// Define the props type for Screen2
interface Screen2Props {
  instructions: any[];
  setInstructions: (fn: any) => void;
  newInstruction: string;
  setNewInstruction: (value: string) => void;
  addInstruction: () => void;
  removeInstruction: (id: number) => void;
  subjects: string[];
  setSubjects: (fn: any) => void;
  newSubject: string;
  setNewSubject: (value: string) => void;
}

const Screen2: React.FC<Screen2Props> = ({
  instructions,
  setInstructions,
  newInstruction,
  setNewInstruction,
  addInstruction,
  removeInstruction,
  subjects,
  setSubjects,
  newSubject,
  setNewSubject,
}) => {
  // Handler to add a subject
  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setSubjects((prev: string[]) => [...prev, newSubject.trim()]);
      setNewSubject('');
    }
  };
  // Handler to remove a subject
  const handleRemoveSubject = (subject: string) => {
    setSubjects((prev: string[]) => prev.filter((s) => s !== subject));
  };
  return (
    <div className="flex flex-row gap-6 w-full">
      {/* Instructions - 80% */}
      <div className="w-4/5">
        <Card className="h-full shadow-lg border-0 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg py-2">
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            <span className="text-sm font-medium mb-1">Quiz Instructions</span>
            <div className="flex gap-2 mb-2">
              <Textarea
                placeholder="Add instruction..."
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addInstruction()}
                className="resize-none min-h-[80px] flex-1"
                rows={3}
              />
              <Button onClick={addInstruction} className="bg-blue-600 hover:bg-blue-700 self-start" disabled={!newInstruction.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              <ol className="list-decimal list-inside space-y-2">
                {instructions.map((instruction) => (
                  <li key={instruction.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
      </div>
      {/* Subjects - 20% */}
      <div className="w-1/5 min-w-[220px]">
        <Card className="h-full shadow-lg border-0 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg py-2">
            <CardTitle className="text-lg">Subjects</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            <span className="text-sm font-medium mb-1">Add Subject</span>
            <div className="flex gap-2 mb-2">
              <Input
                id="subject-input"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter subject name"
                className="text-sm flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddSubject();
                }}
              />
              <Button
                onClick={handleAddSubject}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                disabled={!newSubject.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs text-gray-600 mb-1 block">Subjects List</span>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {subjects.length === 0 && <p className="text-xs text-gray-500">No subjects added yet.</p>}
              {subjects.map((subject, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-50 rounded px-2 py-1">
                  <span className="text-sm text-green-900">{subject}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                    onClick={() => handleRemoveSubject(subject)}
                    title="Remove subject"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* End of flex row */}
    </div>
  );
};

export default Screen2;