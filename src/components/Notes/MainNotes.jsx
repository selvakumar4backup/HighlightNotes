// Notes.js
import React, { useState, useRef, useEffect,  } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Popper,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

import Placeholder from '@tiptap/extension-placeholder';
import CreateNoteButton from './CreateNoteButton'
import NoteList from './NoteList';
import NoteTabs from './MainNotesTabs';
import TakeNoteDialog from './TakeNoteDialog';
import HighlightDialog from './HighlightDialog';



const highlight_img = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 4.16667H12.5V2.5H14.1667V4.16667ZM12.5 12.5V17.5L14.4083 15.5917L16.325 17.5L17.5 16.325L15.5917 14.4167L17.5 12.5H12.5ZM15.8333 7.5H17.5V5.83333H15.8333V7.5ZM15.8333 10.8333H17.5V9.16667H15.8333V10.8333ZM9.16667 17.5H10.8333V15.8333H9.16667V17.5ZM5.83333 4.16667H7.5V2.5H5.83333V4.16667ZM2.5 14.1667H4.16667V12.5H2.5V14.1667ZM4.16667 17.5V15.8333H2.5C2.5 16.75 3.25 17.5 4.16667 17.5ZM15.8333 2.5V4.16667H17.5C17.5 3.25 16.75 2.5 15.8333 2.5ZM9.16667 4.16667H10.8333V2.5H9.16667V4.16667ZM2.5 7.5H4.16667V5.83333H2.5V7.5ZM5.83333 17.5H7.5V15.8333H5.83333V17.5ZM2.5 10.8333H4.16667V9.16667H2.5V10.8333ZM2.5 4.16667H4.16667V2.5C3.25 2.5 2.5 3.25 2.5 4.16667Z" fill="#707070" />
  </svg>
);

const selectedhilight_alt = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 4.16667H12.5V2.5H14.1667V4.16667ZM12.5 12.5V17.5L14.4083 15.5917L16.325 17.5L17.5 16.325L15.5917 14.4167L17.5 12.5H12.5ZM15.8333 7.5H17.5V5.83333H15.8333V7.5ZM15.8333 10.8333H17.5V9.16667H15.8333V10.8333ZM9.16667 17.5H10.8333V15.8333H9.16667V17.5ZM5.83333 4.16667H7.5V2.5H5.83333V4.16667ZM2.5 14.1667H4.16667V12.5H2.5V14.1667ZM4.16667 17.5V15.8333H2.5C2.5 16.75 3.25 17.5 4.16667 17.5ZM15.8333 2.5V4.16667H17.5C17.5 3.25 16.75 2.5 15.8333 2.5ZM9.16667 4.16667H10.8333V2.5H9.16667V4.16667ZM2.5 7.5H4.16667V5.83333H2.5V7.5ZM5.83333 17.5H7.5V15.8333H5.83333V17.5ZM2.5 10.8333H4.16667V9.16667H2.5V10.8333ZM2.5 4.16667H4.16667V2.5C3.25 2.5 2.5 3.25 2.5 4.16667Z" fill="#3942B0" />
  </svg>
);

const vector_img = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
    transform="scale(1.2) translate(1 1)"
    d="M0.444824 4.08333H9.61149V5.75H0.444824V4.08333ZM0.444824 2.41667H9.61149V0.75H0.444824V2.41667ZM0.444824 9.08333H6.27816V7.41667H0.444824V9.08333ZM12.9532 6.475L13.5448 5.88333C13.8698 5.55833 14.3948 5.55833 14.7198 5.88333L15.3115 6.475C15.6365 6.8 15.6365 7.325 15.3115 7.65L14.7198 8.24167L12.9532 6.475ZM12.3615 7.06667L7.94482 11.4833V13.25H9.71149L14.1282 8.83333L12.3615 7.06667Z" fill="#707070" />
  </svg>
);

const selectedvector = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
    transform="scale(1.2) translate(1 1)"
    d="M0.444824 4.08333H9.61149V5.75H0.444824V4.08333ZM0.444824 2.41667H9.61149V0.75H0.444824V2.41667ZM0.444824 9.08333H6.27816V7.41667H0.444824V9.08333ZM12.9532 6.475L13.5448 5.88333C13.8698 5.55833 14.3948 5.55833 14.7198 5.88333L15.3115 6.475C15.6365 6.8 15.6365 7.325 15.3115 7.65L14.7198 8.24167L12.9532 6.475ZM12.3615 7.06667L7.94482 11.4833V13.25H9.71149L14.1282 8.83333L12.3615 7.06667Z" fill="#3942B0" />
  </svg>
);

const expandIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17V11H4.5V14.4375L14.4375 4.5H11V3H17V9H15.5V5.5625L5.5625 15.5H9V17H3Z" fill="#252525" />
  </svg>
);

const collapseIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.0625 18L2 16.9375L7.4375 11.5H4V10H10V16H8.5V12.5625L3.0625 18ZM10 10V4H11.5V7.4375L16.9375 2L18 3.0625L12.5625 8.5H16V10H10Z" fill="#252525" />
  </svg>
);

const righticon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 5V14H14V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H15L21 15V5C21 3.9 20.1 3 19 3ZM12 14H7V12H12V14ZM17 10H7V8H17V10Z" fill="#454545" />
  </svg>
);

const regionConfig = {
  instruction: {
    color: '#b84d84',
    tabs: ['Instructions'],
  },
  research: {
    color: '#67BC46',
    tabs: ['Parent Conflict', 'Parenting Time', 'Socioeconomic Status'],
  },
  evidence: {
    color: '#F89B1B ',
    tabs: ['Child Custody Form', 'Teacher Interview', 'Childs Crayon Drawing', 'Voicemail Messages'],
  },
  decision: {
    color: '#009FDA',
    tabs: ['Notes'],
  },
};


// Function to handle image paste
const handleImagePaste = (view, event, editor) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      event.preventDefault();
      const file = item.getAsFile();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        editor.chain().focus().setImage({ 
          src: imageUrl,
          alt: 'Pasted image',
          width: '80%',
          height: 'auto'
        }).run();
      };
      
      reader.readAsDataURL(file);
      return true;
    }
  }
  return false;
};

// TipTap Editor Component with image paste support
const Tiptap = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
     // ImageResize.configure(imageResizeConfig),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handlePaste: (view, event) => {
        return handleImagePaste(view, event, editor);
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.includes('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageUrl = e.target.result;
              editor.chain().focus().setImage({ src: imageUrl }).run();
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

// Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
        style={{ minHeight: '200px', padding: '8px' }}
      />
      <style jsx global>{`
        .resizable-image {
          position: relative;
          max-width: 100%;
          cursor: default;
          display: inline-block;
          line-height: 0;
        }
        .resizable-image .resize-trigger {
          position: absolute;
          right: -6px;
          bottom: -9px;
          opacity: 0;
          transition: 0.3s ease;
          width: 12px;
          height: 12px;
          border-radius: 100%;
          background: #4b5563;
          border: 2px solid white;
          cursor: nwse-resize;
        }
        .resizable-image:hover .resize-trigger {
          opacity: 1;
        }
      `}</style>
    </div>
  )
};


const Notes = ({ anchorEl, open, onClose, selectedSection, selectedSidebarTab, onNewNote }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const draggableRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [popupTabValue, setPopupTabValue] = useState(0);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [selectionNoteContent, setSelectionNoteContent] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);
  const sectionColor = regionConfig[selectedSection].color;

  const closeAllPopups = () => {
    setIsDialogOpen(false);
    setIsSelectionDialogOpen(false);
    setNoteContent('');
  };


  const handleOpenPopup = () => {
    setPopupTabValue(0);
    setIsSelectionDialogOpen(false);
    setSelectionNoteContent('');
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (open && draggableRef.current) {
      draggableRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    // Load notes from localStorage when component mounts
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error parsing notes from localStorage:', error);
      }
    }
  }, []);
  useEffect(() => {
    // console.log('Notes component mounted 1',popupTabValue);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAllPopups();
      }
    };
    setPopupTabValue(0);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDialogOpen, isSelectionDialogOpen]);

  useEffect(() => {
    // console.log('highlights');
  }, []);

  useEffect(() => {
    // console.log('Notes component mounted 2');

    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && selectedColor) {
        const newHighlight = {
          text: selectedText,
          color: selectedColor,
        };
        setHighlights((prev) => [...prev, newHighlight]);
        selection.removeAllRanges();
      }
    };
    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, [isDialogOpen, popupTabValue, selectedColor, selectedSection]);

  function isSelectionInMainContent() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;
    while (node) {
      if (node.nodeType === 1 && (node.id === 'main-content')) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  useEffect(() => {
    setSelectedColor(regionConfig[selectedSection].color);
  }, [selectedSection]);

  useEffect(() => {
    const handleTextSelection = (e) => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      // if (selectedSection === "instruction") {
      //   return;
      // }
      console.log('Text selected:', text, 'in section:', selectedSection);
      if (text && isSelectionInMainContent()) {
        setIsDialogOpen(false);
        setSelectionNoteContent(text);
        setSelectedColor(null);
        if (selection.rangeCount > 0) {
          setSelectedRange(selection.getRangeAt(0).cloneRange());
        } else {
          setSelectedRange(null);
        }
        setIsSelectionDialogOpen(true);
       // setTimeout(() => selection.removeAllRanges(), 0);
      }
    };
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [selectedSection]);

  useEffect(() => {
    // console.log('Notes component mounted 4');
    if (isDialogOpen) {
      setNoteContent('');
    }
  }, [isDialogOpen]);

  const handleSaveNote = (isTakeNote = false) => {
    console.log('Saving note:', isTakeNote);
    if (!noteContent.trim()) {
      alert('Note content cannot be empty!');
      return;
    }
    const newNote = {     
      content: noteContent,
      sectionColor: regionConfig[selectedSection]?.color || '#009FDA',
      timestamp: new Date().toISOString(),
      note_section: 1,
      note_type: isTakeNote ? 'Highlight Note' : 'Note',
      section: selectedSection,
      tab: selectedSidebarTab,
      highlightedText: selectionNoteContent
    };
    
    setNotes((prevNotes) => {
      const updatedNotes = [...prevNotes, newNote];
      localStorage.setItem('highlightedNotes', JSON.stringify(updatedNotes));
      return updatedNotes;
    });
    
    if (typeof onNewNote === 'function') {
      onNewNote();
    }

    setNoteContent('');
    setIsDialogOpen(false);
  };
  useEffect(() => {
  setSelectedColor(regionConfig[selectedSection].color);
}, [selectedSection]);

  // Render the main content area with notes
  useEffect(() => {
  // console.log('Notes component mounted 5');

  const storedHighlights = localStorage.getItem('highlightedNotes');

  try {
    const parsedHighlights = storedHighlights ? JSON.parse(storedHighlights) : [];

    // console.log('Parsed notes:', parsedNotes);
    // console.log('Parsed highlights:', parsedHighlights);

    const combined = [...parsedHighlights].map(note => ({
      ...note,
      timestamp: typeof note.timestamp === 'string'
        ? note.timestamp
        : new Date(note.timestamp).toLocaleString(),
    }));

    setNotes(combined);
  } catch (e) {
    console.error('Error parsing stored notes or highlights:', e);
  }
}, []);


  function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) {
      // fallback to a default color, e.g. transparent or gray
      return `rgba(0,0,0,${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return (
    <>
      <Popper open={open} anchorEl={anchorEl} placement="top-start" 
        sx={{ zIndex: 1000, width: '236px',p:0, }}
        modifiers={[{ name: 'offset', options: { offset: [-(anchorEl ? anchorEl.offsetLeft : 0), -40] } }]}
        role="dialog"
        aria-labelledby="notes-dialog-title"
      >
        <Paper 
        sx={{ width: 236, minHeight:188, maxHeight: 458,  border: '1px solid #DCDCDC', borderRadius: 2,
        display: 'flex', flexDirection: 'column',p: 0,boxSizing: 'border-box',}} >
          <Box sx={{
              width: 236,
              height: 116,
              maxHeight: 116,
              borderBottom: '1px solid #DCDCDC',
              px: 1.5,  // 12px horizontal padding
              py: 2,    // 16px vertical padding
              gap: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box', // IMPORTANT to keep padding inside total height
            }}
            role="tabpanel"
            id="tabpanel"
            aria-labelledby="notes-tab"
            hidden={tabValue !== 0}
            >

            <Box display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{width: '100%',
                  height: 24,
                  flexShrink: 0,}}
                  id="notes-dialog-Box"
                  >
              <Typography display="flex" alignItems="center"
                sx={{
                  minWidth: 0,
                  minHeight: 44,
                  textTransform: 'none',
                  flex: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: 16,
                  color: '#454545',
                  fontWeight: 500,
                }}
                id="notes-dialog-title"
                aria-label="My Notes"
                tabIndex={0} // Make it focusable
              >
                <span style={{  width: 24, height: 24, marginRight: 8, display: 'inline-flex', alignItems: 'center' }}>{righticon}</span> MY NOTES
              </Typography>
              <IconButton onClick={onClose} sx={{ ml: 1, p: '4px' ,color: '#454545',}}>
                <CloseIcon />
              </IconButton>
            </Box>
              <NoteTabs tabValue={tabValue} setTabValue={setTabValue} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center', // center horizontally
              width: '100%', // take full width of the Paper
              flexGrow: 1, // optional: fill available vertical space
            }}
          >
          
            <Box
              sx={{
                width: 212,
                maxHeight: 342,
                p: 0,
                // gap: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start', // you can use "center" if you want vertical centering too
                opacity: 1,
              }}
            >
            {tabValue !== 2 && (
                <CreateNoteButton handleOpenPopup={handleOpenPopup} />
            )}
            
            <NoteList notes={notes} tabValue={tabValue} />
            </Box>
          </Box>
        </Paper>
      </Popper>

      {isDialogOpen && (
        <TakeNoteDialog
          isDialogOpen={isDialogOpen}
          isExpanded={isExpanded}
          draggableRef={draggableRef}
          setIsDialogOpen={setIsDialogOpen}
          setIsExpanded={setIsExpanded}
          highlights={highlights}
          selectedSection={selectedSection}
          selectedSidebarTab={selectedSidebarTab}
          noteContent={noteContent}
          setNoteContent={setNoteContent}
          handleSaveNote={handleSaveNote}
          expandIcon={expandIcon}
          collapseIcon={collapseIcon}
          Tiptap={Tiptap}
          hexToRgba={hexToRgba}
        />
      )}

      {isSelectionDialogOpen && (
        <HighlightDialog
          isSelectionDialogOpen={isSelectionDialogOpen}
          draggableRef={draggableRef}
          popupTabValue={popupTabValue}
          setPopupTabValue={setPopupTabValue}
          highlights={notes}
          selectedSection={selectedSection}
          selectedSidebarTab={selectedSidebarTab}
          sectionColor={sectionColor}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectionNoteContent={selectionNoteContent}
          setSelectionNoteContent={setSelectionNoteContent}
          setNotes={setNotes}
          setIsSelectionDialogOpen={setIsSelectionDialogOpen}
          setIsExpanded={setIsExpanded}
          isExpanded={isExpanded}
          noteContent={noteContent}
          setNoteContent={setNoteContent}
          handleSaveNote={handleSaveNote}
          Tiptap={Tiptap}
          expandIcon={expandIcon}
          collapseIcon={collapseIcon}
          highlight_img={highlight_img}
          selectedhilight_alt={selectedhilight_alt}
          vector_img={vector_img}
          selectedvector={selectedvector}
          hexToRgba={hexToRgba}
          onNewNote={onNewNote}
          setIsDialogOpen={setIsDialogOpen}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
        />
      )}
    </>
  );
};

export default Notes;
