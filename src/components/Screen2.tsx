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
  return (
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
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Subjects for this Quiz</h2>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add subject (e.g. Math, Physics)"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newSubject.trim()) {
                  setSubjects((prev: string[]) => [...prev, newSubject.trim()]);
                  setNewSubject('');
                }
              }}
              className="w-64"
            />
            <Button
              onClick={() => {
                if (newSubject.trim()) {
                  setSubjects((prev: string[]) => [...prev, newSubject.trim()]);
                  setNewSubject('');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subj, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
                {subj}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-red-600"
                  onClick={() => setSubjects((prev: string[]) => prev.filter((_, i) => i !== idx))}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Screen2; 