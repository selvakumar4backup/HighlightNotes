import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Palette, Type, Trash2 } from 'lucide-react';

const colorOptions = [
  { 
    id: 'highlighter-yellow', 
    color: '#b45309', 
    bgColor: '#fef08a', 
    name: 'Highlighter Yellow',
    style: 'traditional' // This matches the image style
  },
  { 
    id: 'blue', 
    color: '#1e40af', 
    bgColor: '#dbeafe', 
    name: 'Ocean Blue',
    style: 'subtle'
  },
  { 
    id: 'green', 
    color: '#166534', 
    bgColor: '#dcfce7', 
    name: 'Forest Green',
    style: 'subtle'
  },
  { 
    id: 'pink', 
    color: '#be185d', 
    bgColor: '#fce7f3', 
    name: 'Rose Pink',
    style: 'subtle'
  },
];

const TextHighlighter = () => {
  const [highlights, setHighlights] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const [selectedRange, setSelectedRange] = useState(null);
  const textRef = useRef(null);

  const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?`;

  const getTextOffset = useCallback((container, offset) => {
    if (!textRef.current) return 0;
    
    let textOffset = 0;
    const walker = document.createTreeWalker(
      textRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === container) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent?.length || 0;
    }
    return textOffset;
  }, []);

  const handleTextSelection = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !textRef.current) {
        setShowColorPicker(false);
        setSelectedRange(null);
        return;
      }

      const range = selection.getRangeAt(0);
      
      if (!textRef.current.contains(range.commonAncestorContainer)) {
        setShowColorPicker(false);
        setSelectedRange(null);
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length === 0) {
        setShowColorPicker(false);
        setSelectedRange(null);
        return;
      }

      const startOffset = getTextOffset(range.startContainer, range.startOffset);
      const endOffset = getTextOffset(range.endContainer, range.endOffset);

      const rect = range.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      setPickerPosition({
        x: rect.left + scrollX + (rect.width / 2),
        y: rect.top + scrollY - 10
      });

      setSelectedRange({
        start: startOffset,
        end: endOffset,
        text: selectedText
      });

      setShowColorPicker(true);
    }, 10);
  }, [getTextOffset]);

  const handleColorSelect = useCallback((colorOption) => {
    if (!selectedRange) return;

    const newHighlight = {
      id: Date.now().toString(),
      startOffset: selectedRange.start,
      endOffset: selectedRange.end,
      color: colorOption.id,
      text: selectedRange.text
    };

    // Add the new highlight without removing overlapping ones
    setHighlights(prev => {
      return [...prev, newHighlight].sort((a, b) => a.startOffset - b.startOffset);
    });

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    
    setShowColorPicker(false);
    setSelectedRange(null);
  }, [selectedRange]);

  const removeHighlight = useCallback((highlightId, event) => {
    event.stopPropagation();
    event.preventDefault();
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
  }, []);

  const clearAllHighlights = useCallback(() => {
    setHighlights([]);
  }, []);

  // Create segments for rendering overlapping highlights
  const createTextSegments = () => {
    if (highlights.length === 0) return [];

    // Get all unique positions where highlights start or end
    const positions = new Set();
    highlights.forEach(highlight => {
      positions.add(highlight.startOffset);
      positions.add(highlight.endOffset);
    });
    
    const sortedPositions = Array.from(positions).sort((a, b) => a - b);
    
    // Create segments between each position
    const segments = [];
    for (let i = 0; i < sortedPositions.length - 1; i++) {
      const start = sortedPositions[i];
      const end = sortedPositions[i + 1];
      
      // Find all highlights that cover this segment
      const segmentHighlights = highlights.filter(highlight => 
        highlight.startOffset <= start && highlight.endOffset >= end
      );
      
      segments.push({
        start,
        end,
        text: sampleText.slice(start, end),
        highlights: segmentHighlights
      });
    }
    
    return segments;
  };

  const renderHighlightedText = () => {
    const paragraphs = sampleText.split('\n\n');
    
    if (highlights.length === 0) {
      return paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-6 last:mb-0">
          {paragraph}
        </p>
      ));
    }

    const segments = createTextSegments();
    let currentOffset = 0;
    
    return paragraphs.map((paragraph, paragraphIndex) => {
      const paragraphStart = currentOffset;
      const paragraphEnd = currentOffset + paragraph.length;
      
      // Get segments that belong to this paragraph
      const paragraphSegments = segments.filter(segment => 
        segment.start < paragraphEnd && segment.end > paragraphStart
      );

      let paragraphContent = [];
      let lastOffset = paragraphStart;

      paragraphSegments.forEach((segment, segmentIndex) => {
        const segmentStart = Math.max(segment.start, paragraphStart);
        const segmentEnd = Math.min(segment.end, paragraphEnd);
        
        // Add text before this segment (if any)
        if (segmentStart > lastOffset) {
          const beforeText = sampleText.slice(lastOffset, segmentStart);
          paragraphContent.push(beforeText);
        }

        const segmentText = sampleText.slice(segmentStart, segmentEnd);
        
        if (segment.highlights.length === 0) {
          // No highlights for this segment
          paragraphContent.push(segmentText);
        } else if (segment.highlights.length === 1) {
          // Single highlight
          const highlight = segment.highlights[0];
          const colorOption = colorOptions.find(c => c.id === highlight.color);
          
          const isTraditionalHighlighter = colorOption.style === 'traditional';
          const highlightClasses = isTraditionalHighlighter 
            ? "relative group cursor-pointer transition-all duration-200 hover:shadow-lg px-1 py-1 rounded-sm font-medium"
            : "relative group cursor-pointer transition-all duration-200 hover:shadow-sm px-1 py-0.5 rounded-sm";
          
          const highlightStyle = isTraditionalHighlighter 
            ? {
                backgroundColor: colorOption.bgColor,
                color: colorOption.color,
                border: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontWeight: '600'
              }
            : {
                backgroundColor: colorOption.bgColor,
                color: colorOption.color,
                border: 'none'
              };

          paragraphContent.push(
            <mark
              key={`${highlight.id}-${segmentIndex}`}
              className={highlightClasses}
              style={highlightStyle}
              title={`Highlighted with ${colorOption.name}`}
            >
              {segmentText}
              <button
                onClick={(e) => removeHighlight(highlight.id, e)}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full text-xs transition-opacity duration-200 hover:bg-red-600 z-10 flex items-center justify-center shadow-lg"
                style={{ fontSize: '10px', width: '18px', height: '18px', lineHeight: '1' }}
              >
                ×
              </button>
            </mark>
          );
        } else {
          // Multiple overlapping highlights - create nested structure
          let nestedElement = segmentText;
          
          // Apply highlights from innermost to outermost (reverse order for proper nesting)
          segment.highlights.reverse().forEach((highlight, highlightIndex) => {
            const colorOption = colorOptions.find(c => c.id === highlight.color);
            const isTraditionalHighlighter = colorOption.style === 'traditional';
            
            // For overlapping highlights, we need to blend the styles
            const isOutermost = highlightIndex === segment.highlights.length - 1;
            const highlightClasses = isTraditionalHighlighter 
              ? `relative ${isOutermost ? 'group cursor-pointer' : ''} transition-all duration-200 hover:shadow-lg px-1 py-1 rounded-sm font-medium`
              : `relative ${isOutermost ? 'group cursor-pointer' : ''} transition-all duration-200 hover:shadow-sm px-1 py-0.5 rounded-sm`;
            
            // Create a blended background for overlapping highlights
            const opacity = 0.7 - (highlightIndex * 0.1); // Reduce opacity for inner highlights
            const backgroundColor = colorOption.bgColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            
            const highlightStyle = isTraditionalHighlighter 
              ? {
                  backgroundColor: backgroundColor,
                  color: colorOption.color,
                  border: `1px solid ${colorOption.color}20`,
                  boxShadow: isOutermost ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: '600'
                }
              : {
                  backgroundColor: backgroundColor,
                  color: colorOption.color,
                  border: `1px solid ${colorOption.color}20`
                };

            nestedElement = (
              <mark
                key={`${highlight.id}-${segmentIndex}-${highlightIndex}`}
                className={highlightClasses}
                style={highlightStyle}
                title={`Highlighted with ${colorOption.name} (overlapping)`}
              >
                {nestedElement}
                {isOutermost && (
                  <button
                    onClick={(e) => removeHighlight(highlight.id, e)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full text-xs transition-opacity duration-200 hover:bg-red-600 z-10 flex items-center justify-center shadow-lg"
                    style={{ fontSize: '10px', width: '18px', height: '18px', lineHeight: '1' }}
                  >
                    ×
                  </button>
                )}
              </mark>
            );
          });
          
          paragraphContent.push(nestedElement);
        }

        lastOffset = segmentEnd;
      });

      // Add any remaining text in the paragraph
      if (lastOffset < paragraphEnd) {
        const remainingText = sampleText.slice(lastOffset, paragraphEnd);
        paragraphContent.push(remainingText);
      }

      currentOffset = paragraphEnd + 2;

      return (
        <p key={paragraphIndex} className="mb-6 last:mb-0 leading-relaxed">
          {paragraphContent}
        </p>
      );
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      
      if (target.closest('.color-picker-popup')) {
        return;
      }
      
      setShowColorPicker(false);
      setSelectedRange(null);
    };

    if (showColorPicker) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showColorPicker]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!showColorPicker) {
          setSelectedRange(null);
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [showColorPicker]);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
            Smart Text Highlighter
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select any text to highlight it with beautiful colors. Now supports overlapping highlights - multiple colors can exist on the same text! Choose from traditional highlighter style or subtle modern colors.
        </p>
      </div>

      {/* Stats and Controls */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
            </span>
          </div>
          {highlights.length > 0 && (
            <div className="flex gap-2">
              {colorOptions.map(color => {
                const count = highlights.filter(h => h.color === color.id).length;
                return count > 0 ? (
                  <div key={color.id} className="flex items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded-full ${color.style === 'traditional' ? 'shadow-md' : ''}`}
                      style={{ 
                        backgroundColor: color.bgColor, 
                        border: `2px solid ${color.color}`,
                        boxShadow: color.style === 'traditional' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
                      }}
                    />
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
        
        {highlights.length > 0 && (
          <button
            onClick={clearAllHighlights}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Text Content */}
      <div className="relative">
        <div
          ref={textRef}
          className="prose prose-lg max-w-none text-gray-800 p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm cursor-text select-text"
          onMouseUp={handleTextSelection}
          style={{ userSelect: 'text' }}
        >
          {renderHighlightedText()}
        </div>

        {/* Color Picker Popup */}
        {showColorPicker && selectedRange && (
          <div
            className="color-picker-popup fixed z-50 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: pickerPosition.x,
              top: pickerPosition.y
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[280px]">
              <div className="text-xs font-medium text-gray-500 mb-3 text-center">
                Choose highlight style (overlapping supported)
              </div>
              <div className="grid grid-cols-2 gap-3">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.id}
                    onClick={() => handleColorSelect(colorOption)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 group ${
                      colorOption.style === 'traditional' 
                        ? 'border-yellow-300 hover:border-yellow-400 hover:shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    style={{ 
                      backgroundColor: colorOption.style === 'traditional' 
                        ? colorOption.bgColor + '60'
                        : colorOption.bgColor + '40' 
                    }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 group-hover:scale-110 transition-transform duration-200 ${
                        colorOption.style === 'traditional' ? 'shadow-md' : ''
                      }`}
                      style={{
                        backgroundColor: colorOption.bgColor,
                        borderColor: colorOption.color,
                        boxShadow: colorOption.style === 'traditional' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                      }}
                    />
                    <div className="text-left flex-1">
                      <div className={`text-sm font-medium ${colorOption.style === 'traditional' ? 'font-bold' : ''}`} style={{ color: colorOption.color }}>
                        {colorOption.name.split(' ')[0]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {colorOption.name.split(' ').slice(1).join(' ')}
                        {colorOption.style === 'traditional' && (
                          <span className="block text-yellow-600 font-medium">Classic Style</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400 text-center">
                  Selected: "{selectedRange.text.substring(0, 30)}{selectedRange.text.length > 30 ? '...' : ''}"
                </div>
              </div>
            </div>
            {/* Arrow */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"
              style={{ top: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5 text-yellow-600" />
          How to use:
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Select text</strong> with your mouse to see highlighting options</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Overlapping highlights</strong> are now supported - select inside existing highlights to add more colors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Traditional highlighter yellow</strong> mimics real highlighter pens with bold, prominent styling</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Hover over highlights</strong> to reveal the remove button for individual highlights</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TextHighlighter;