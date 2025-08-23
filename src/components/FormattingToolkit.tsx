import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Superscript, Subscript, Sigma, Bold, Italic, Underline, Strikethrough } from 'lucide-react';
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
}) => {
  if (!visible) return null;

  return (
    <TooltipProvider>
      <div className="fixed left-3 top-1/2 transform -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-col items-center gap-2 max-h-[80vh] overflow-y-auto">
        {/* Superscript */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={onOpenSuperscript}
        >
          <Superscript className="h-4 w-4" />
        </Button>

        {/* Subscript */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={onOpenSubscript}
        >
          <Subscript className="h-4 w-4" />
        </Button>

        {/* Math Symbols */}
        <Popover>
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
                    onClick={() => onInsertSymbol(item.symbol)}
                    title={item.name}
                  >
                    {item.symbol}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="border-t border-gray-200 my-1"></div>

        {/* Bold */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={() => onFormat('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>

        {/* Italic */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={() => onFormat('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>

        {/* Underline */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={() => onFormat('underline')}
        >
          <Underline className="h-4 w-4" />
        </Button>

        {/* Strikethrough */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={() => onFormat('strike')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="border-t border-gray-200 my-1"></div>

        {/* Math Toolbox */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-16 p-0 hover:bg-gray-100 text-xs flex items-center justify-center"
            >
              Math🧰
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-44 p-2 space-y-1" 
            side="right" 
            sideOffset={20}
            align="start"
            avoidCollisions={true}
            collisionPadding={20}
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
      </div>
    </TooltipProvider>
  );
};

export default FormattingToolkit;
