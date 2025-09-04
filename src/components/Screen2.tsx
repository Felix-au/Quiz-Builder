import React, { useMemo, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import FormattingToolkit from './FormattingToolkit';

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
  // Local refs/state for formatting and preview
  const newInstructionRef = useRef<HTMLTextAreaElement | null>(null);
  const [symbolPage, setSymbolPage] = useState(1);

  // BIUS markdown wrapper
  const applyMdFormat = (kind: 'bold' | 'italic' | 'underline' | 'strike') => {
    const el = newInstructionRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (end <= start) return; // only when there's selection
    const value = newInstruction;
    const selected = value.slice(start, end);
    const tokens =
      kind === 'bold' ? ['{bold}', '{bold}'] :
      kind === 'italic' ? ['{italic}', '{italic}'] :
      kind === 'underline' ? ['{underline}', '{underline}'] : ['{strike}', '{strike}'];
    const newValue = value.slice(0, start) + tokens[0] + selected + tokens[1] + value.slice(end);
    setNewInstruction(newValue);
    // Restore caret
    setTimeout(() => {
      el.focus();
      const newPos = start + tokens[0].length + selected.length + tokens[1].length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Keyboard shortcuts for BIUS and Enter submit (on keydown to suppress browser defaults like Ctrl+U)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const selLen = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // BIUS formatting when selection exists
    if (isCtrlOrMeta && !e.shiftKey && !e.altKey && selLen > 0) {
      const k = e.key;
      if (k === 'b' || k === 'B') {
        e.preventDefault();
        e.stopPropagation();
        applyMdFormat('bold');
        return;
      }
      if (k === 'i' || k === 'I') {
        e.preventDefault();
        e.stopPropagation();
        applyMdFormat('italic');
        return;
      }
      if (k === 'u' || k === 'U') {
        e.preventDefault();
        e.stopPropagation();
        applyMdFormat('underline');
        return;
      }
      if (k === '/') {
        e.preventDefault();
        e.stopPropagation();
        applyMdFormat('strike');
        return;
      }
    }

    // Pressing Enter adds instruction (legacy behavior)
    if (!isCtrlOrMeta && !e.shiftKey && !e.altKey && e.key === 'Enter') {
      e.preventDefault();
      addInstruction();
      return;
    }
  };

  // Safe BIUS-only preview renderer
  const renderPreviewHtml = useMemo(() => {
    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Escape first
    let html = escapeHtml(newInstruction || '');
    // Apply BIUS patterns (non-greedy, multiline)
    // Order: bold (**)**, underline (__)__ (double underscore), italic _ _, strike ~~ ~~
    // New curly-brace tags only
    html = html.replace(/\{bold\}(.+?)\{bold\}/gms, '<strong>$1</strong>');
    html = html.replace(/\{italic\}(.+?)\{italic\}/gms, '<em>$1</em>');
    html = html.replace(/\{underline\}(.+?)\{underline\}/gms, '<u>$1</u>');
    html = html.replace(/\{strike\}(.+?)\{strike\}/gms, '<del>$1</del>');
    // Convert line breaks
    html = html.replace(/\n/g, '<br />');
    return html;
  }, [newInstruction]);

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
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Quiz Instructions</span>
              {/* Inline BIUS-only toolkit aligned with label */}
              <FormattingToolkit
                variant="inline-horizontal"
                visible={true}
                // BIUS only
                showBasicStyles={true}
                showSuperSub={false}
                showSymbols={false}
                showMathToolbox={false}
                showHelp={true}
                // Required props (stubbed when hidden)
                currentSymbolPage={symbolPage}
                setCurrentSymbolPage={setSymbolPage}
                getCurrentSymbols={() => []}
                getPageTitle={() => ''}
                onOpenSuperscript={() => {}}
                onOpenSubscript={() => {}}
                onInsertSymbol={() => {}}
                onFormat={applyMdFormat}
                onOpenMathTool={() => {}}
              />
            </div>
            <div className="flex gap-2 mb-2 items-start">
              <Textarea
                placeholder="Add instruction..."
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                ref={newInstructionRef}
                className="resize-none min-h-[100px] flex-1"
                rows={3}
              />
              <Button onClick={addInstruction} className="bg-blue-600 hover:bg-blue-700 self-start" disabled={!newInstruction.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {/* Live Preview for in-progress newInstruction (only when content needs rendering) */}
            {newInstruction && (/(\{bold\}|\{italic\}|\{underline\}|\{strike\})/.test(newInstruction)) && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                <div className="text-xs text-gray-600 mb-1">Preview</div>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderPreviewHtml }} />
              </div>
            )}
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
            <CardTitle className="text-lg">Topics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            <span className="text-sm font-medium mb-1">Add Topic</span>
            <div className="flex gap-2 mb-2">
              <Input
                id="subject-input"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter topic name"
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
            <span className="text-xs text-gray-600 mb-1 block">Topics List</span>
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