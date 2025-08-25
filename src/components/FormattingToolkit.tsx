import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Superscript, Subscript, Sigma, Bold, Italic, Underline, Strikethrough, HelpCircle } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FormattingToolkitProps {
  // Symbol page state
  currentSymbolPage: number;
  setCurrentSymbolPage: React.Dispatch<React.SetStateAction<number>>;
  getCurrentSymbols: () => any[];
  getPageTitle: () => string;
  
  // Action handlers
  onOpenSuperscript: () => void;
  onOpenSubscript: () => void;
  onInsertSymbol: (symbol: string) => void;
  onFormat: (kind: 'bold' | 'italic' | 'underline' | 'strike') => void;
  onOpenMathTool: (tool: 'matrix' | 'fraction' | 'binomial' | 'integral' | 'doubleIntegral' | 'summation' | 'limit' | 'root' | 'product') => void;
  
  // Optional: show/hide toolkit
  visible?: boolean;
  // Layout variant: fixed vertical on left, or inline horizontal in-pane
  variant?: 'fixed-left' | 'inline-horizontal';
  // Feature flags to control which groups are visible
  showBasicStyles?: boolean;
  showSuperSub?: boolean;
  showSymbols?: boolean;
  showMathToolbox?: boolean;
  showHelp?: boolean;
}

const FormattingToolkit: React.FC<FormattingToolkitProps> = ({
  currentSymbolPage,
  setCurrentSymbolPage,
  getCurrentSymbols,
  getPageTitle,
  onOpenSuperscript,
  onOpenSubscript,
  onInsertSymbol,
  onFormat,
  onOpenMathTool,
  visible = true,
  variant = 'fixed-left',
  showBasicStyles = true,
  showSuperSub = true,
  showSymbols = true,
  showMathToolbox = true,
  showHelp = true,
}) => {
  if (!visible) return null;

  // Keep symbols popover open for multi-insert
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const symbolClickGuard = useRef(false);

  return (
    <TooltipProvider>
      <div
        className={
          variant === 'fixed-left'
            ? 'fixed left-3 top-1/2 transform -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-col items-center gap-2 max-h-[80vh] overflow-y-auto'
            : 'inline-flex items-center gap-1'
        }
      >
        {/* Basic styles (Bold, Italic, Underline, Strikethrough) */}
        {showBasicStyles && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
              onClick={() => onFormat('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
              onClick={() => onFormat('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
              onClick={() => onFormat('underline')}
            >
              <Underline className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
              onClick={() => onFormat('strike')}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Divider (only for fixed-left variant) */}
        {variant === 'fixed-left' && (showBasicStyles || showSuperSub || showSymbols || showMathToolbox) && (
          <div className="border-t border-gray-200 my-1"></div>
        )}

        {/* Superscript/Subscript */}
        {showSuperSub && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
              onClick={onOpenSuperscript}
            >
              <Superscript className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
              onClick={onOpenSubscript}
            >
              <Subscript className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Math Symbols */}
        {showSymbols && (
          <Popover
            open={symbolsOpen}
            onOpenChange={(open) => {
              if (!open && symbolClickGuard.current) {
                // Prevent closing due to internal focus changes from symbol clicks
                symbolClickGuard.current = false;
                setSymbolsOpen(true);
                return;
              }
              setSymbolsOpen(open);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
              >
                <Sigma className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-96 max-h-96 overflow-y-auto" 
              side="right" 
              sideOffset={20}
              align="start"
              avoidCollisions={true}
              collisionPadding={20}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onFocusOutside={(e) => {
                // Prevent closing when we programmatically refocus the textarea for multi-insert
                e.preventDefault();
              }}
              onPointerDownOutside={(e) => {
                // We'll decide closability ourselves to avoid symbol-click race conditions
                e.preventDefault();
                setSymbolsOpen(false);
              }}
            >
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
                      onMouseDown={(e) => {
                        // Mark that an internal symbol click is happening before any outside events fire
                        symbolClickGuard.current = true;
                        e.preventDefault();
                      }}
                      onClick={() => {
                        onInsertSymbol(item.symbol);
                        // Keep popover open for multi-insert until user clicks outside or toggles trigger
                        setSymbolsOpen(true);
                      }}
                      title={item.name}
                    >
                      {item.symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Divider (only for fixed-left variant) */}
        {variant === 'fixed-left' && (showSymbols || showMathToolbox) && (
          <div className="border-t border-gray-200 my-1"></div>
        )}

        {/* Math Toolbox */}
        {showMathToolbox && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
                aria-label="Math toolbox"
                title="Math toolbox"
              >
                <span className="text-[13px] leading-none">🧰</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-44 p-2 space-y-1" 
              side="right" 
              sideOffset={20}
              align="start"
              avoidCollisions={true}
              collisionPadding={20}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('matrix')}>Matrix</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('fraction')}>Fraction</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('binomial')}>Binomial</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('integral')}>Integral</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('doubleIntegral')}>Double Integral</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('summation')}>Summation</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('limit')}>Limit</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('root')}>Root</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpenMathTool('product')}>Product</Button>
            </PopoverContent>
          </Popover>
        )}

        {/* Help tooltip */}
        {showHelp && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
                aria-label="Formatting help"
                title="Formatting help"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm p-3 text-xs">
              <p className="mb-1 font-medium">Formatting help</p>
              <p className="mb-2">Use this toolbox to format Question or Option text. Select text, then click a button or use keyboard shortcuts:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><span className="font-semibold">Bold</span> — Ctrl + B</li>
                <li><span className="font-semibold">Italic</span> — Ctrl + I</li>
                <li><span className="font-semibold">Underline</span> — Ctrl + U</li>
                <li><span className="font-semibold">Strikethrough</span> — Ctrl + /</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FormattingToolkit;
