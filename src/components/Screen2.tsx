import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

// Define the props type for Screen2
interface Screen2Props {
  instructions: any[];
  setInstructions: (fn: any) => void;
  newInstruction: string;
  setNewInstruction: (value: string) => void;
  addInstruction: () => void;
  removeInstruction: (id: number) => void;
}

const Screen2: React.FC<Screen2Props> = ({
  instructions,
  setInstructions,
  newInstruction,
  setNewInstruction,
  addInstruction,
  removeInstruction,
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
      </CardContent>
    </Card>
  );
};

export default Screen2; 