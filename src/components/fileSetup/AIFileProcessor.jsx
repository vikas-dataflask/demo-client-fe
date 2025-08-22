import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, FileText, MessageCircle, Loader2, CheckCircle, AlertCircle, Sparkles, Zap, X, ChevronDown, Bot, User, FileUp, Copy, ExternalLink, Download, Trash2 } from 'lucide-react';
import { uploadFileToVedi, queryVedi, commonQueries, formatQueryResponse } from '../../api/vediApi';
import { useDispatch } from 'react-redux';
import { setAIRooms } from '../../redux/features/app/aiRoomDataSlice';
import { extractRoomsFromAIResponse } from '../../utils/aiRoomExtractor';

const AIFileProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [query, setQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [queryResponse, setQueryResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showAdvancedQueries, setShowAdvancedQueries] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Redux dispatch
  const dispatch = useDispatch();
  
  // Refs
  const chatMessagesRef = useRef(null);
  const mainContentRef = useRef(null);
  const fileInputRef = useRef(null);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Handle scroll events to show/hide scroll to bottom button
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100;
    setShowScrollToBottom(isScrolledUp);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  };

  // Function to format AI response with better structure
  const formatAIResponse = (response) => {
    if (!response) return '';
    
    // Enhanced room dimension formatting - detect and format multiple room instances
    // This needs to happen BEFORE HTML conversion to avoid conflicts
    let formatted = response;
    
    // Universal response formatting - convert any response to structured format
    formatted = formatResponseToStructured(formatted);
    
    // Convert line breaks to proper HTML with enhanced spacing
    formatted = formatted
      .replace(/\n\n\n\n/g, '</p><p>')  // Quadruple newlines become paragraph breaks
      .replace(/\n\n\n/g, '</p><p>')    // Triple newlines become paragraph breaks
      .replace(/\n\n/g, '</p><p>')      // Double newlines become paragraph breaks
      .replace(/\n/g, '<br>');          // Single newlines become line breaks
    
    // Add paragraph tags
    formatted = `<p>${formatted}</p>`;
    
    // Add extra spacing after room headers for better readability
    formatted = formatted.replace(/(\d+\.\s*[A-Z\s]+)/g, '<br><strong>$1</strong><br>');
    
    // Add spacing between room sections for better visual separation
    formatted = formatted.replace(/(\d+\.\s*[A-Z\s]+.*?)(?=\d+\.\s*[A-Z\s]+)/gs, '$1<br><br>');
    
    // Handle bullet points (basic markdown-like formatting)
    formatted = formatted.replace(/\*\s/g, '• ');
    formatted = formatted.replace(/\d+\.\s/g, (match) => `<span class="font-semibold text-blue-200">${match}</span>`);
    
    // Handle bold text (basic markdown)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text (basic markdown)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle measurements and numbers
    formatted = formatted.replace(/(\d+(?:\.\d+)?)\s*(m|cm|mm|ft|in|sq\s*m|sq\s*ft)/gi, 
      '<span class="font-mono bg-white/20 px-1 py-0.5 rounded text-xs">$1 $2</span>');
    
    return formatted;
  };

  // Universal function to convert any AI response to structured format
  const formatResponseToStructured = (response) => {
    let formatted = response;
    
    // Pattern 1: Numbered list format "1. ROOMNAME - dimensions"
    formatted = formatted.replace(/(\d+\.\s*)([A-Z\s]+)\s*-\s*([^<>\n]+)/g, (match, number, roomName, dimensions) => {
      return formatRoomDimensions(number, roomName, dimensions);
    });
    
    // Pattern 2: Bullet point format "• ROOMNAME: dimensions"
    formatted = formatted.replace(/([•\*]\s*)([A-Z\s]+)\s*:\s*([^<>\n]+)/g, (match, bullet, roomName, dimensions) => {
      return formatRoomDimensions(bullet, roomName, dimensions);
    });
    
    // Pattern 3: Colon format "ROOMNAME: dimensions"
    formatted = formatted.replace(/(^|\n)([A-Z\s]+)\s*:\s*([^<>\n]+)/g, (match, newline, roomName, dimensions) => {
      return formatRoomDimensions(newline, roomName, dimensions);
    });
    
    // Pattern 4: Simple list format "ROOMNAME - dimensions"
    formatted = formatted.replace(/(^|\n)([A-Z\s]+)\s*-\s*([^<>\n]+)/g, (match, newline, roomName, dimensions) => {
      return formatRoomDimensions(newline, roomName, dimensions);
    });
    
    return formatted;
  };

  // Helper function to format room dimensions consistently
  const formatRoomDimensions = (prefix, roomName, dimensions) => {
    // Split dimensions by comma and clean them up
    const dimensionList = dimensions.split(',').map(d => d.trim()).filter(d => d.length > 0);
    
    if (dimensionList.length > 1) {
      // Group duplicate dimensions and count them
      const dimensionCounts = {};
      dimensionList.forEach(dim => {
        const cleanDim = dim.replace(/^\s*-\s*/, '').trim(); // Remove leading dash if present
        dimensionCounts[cleanDim] = (dimensionCounts[cleanDim] || 0) + 1;
      });
      
      // Create unique dimensions with counts and better formatting
      const uniqueDimensions = Object.entries(dimensionCounts).map(([dim, count], index) => {
        if (count > 1) {
          return `\n   • ${roomName.trim()} ${index + 1} :- ${dim} (${count} instances)`;
        } else {
          return `\n   • ${roomName.trim()} ${index + 1} :- ${dim}`;
        }
      });
      
      // Check if prefix is a number (numbered list) or other format
      if (/^\d+\./.test(prefix)) {
        return `${prefix}${roomName.trim()}\n\n-\n${uniqueDimensions.join('')}`;
      } else {
        return `${prefix}${roomName.trim()}\n\n:\n${uniqueDimensions.join('')}`;
      }
    } else {
      // Single dimension - format consistently
      const cleanDim = dimensions.replace(/^\s*-\s*/, '').trim();
      if (/^\d+\./.test(prefix)) {
        return `${prefix}${roomName.trim()}\n\n-\n ${cleanDim}`;
      } else {
        return `${prefix}${roomName.trim()}\n\n:\n ${cleanDim}`;
      }
    }
  };

  // Function to copy response to clipboard
  const copyToClipboard = async (text, event) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show temporary success state
      const button = event.target.closest('button');
      if (button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '<CheckCircle className="w-3 h-3" />';
        button.className = 'p-1 bg-green-500/30 rounded hover:bg-green-500/40 transition-colors duration-200';
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.className = 'p-1 bg-white/20 rounded hover:bg-white/30 transition-colors duration-200';
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // File upload handler
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await uploadFileToVedi(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.status === 'success') {
        setUploadStatus({
          type: 'success',
          message: 'File processed successfully!',
          details: result
        });
        
        // Add to chat history
        setChatHistory(prev => [...prev, {
          type: 'system',
          message: `File "${selectedFile.name}" uploaded and processed successfully`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadStatus({
        type: 'error',
        message: 'Upload failed',
        details: error.message
      });
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Query handler
  const handleQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }

    // Check if a file has been uploaded first
    if (!selectedFile) {
      alert('Please upload a file first before asking questions. The AI needs a file to analyze.');
      return;
    }

    setIsQuerying(true);
    setQueryResponse('');

    try {
      const result = await queryVedi(query.trim());

      // Validate that we got a real response from the API
      if (!result || !result.response) {
        throw new Error('Invalid response from AI service');
      }

      // Check if response is not empty or just placeholder text
      if (result.response.trim() === '' || 
          result.response.toLowerCase().includes('placeholder') ||
          result.response.toLowerCase().includes('sample') ||
          result.response.toLowerCase().includes('dummy') ||
          result.response.toLowerCase().includes('test response')) {
        throw new Error('Received invalid or placeholder response from AI service');
      }

      setQueryResponse(formatQueryResponse(result.response));
      
      // Extract room data from AI response and store in Redux
      try {
        const extractedRooms = extractRoomsFromAIResponse(result.response);
        console.log('Raw AI response:', result.response);
        console.log('Extracted rooms from AI response:', extractedRooms);
        
        // Debug: Check if rooms are being extracted correctly
        if (extractedRooms.length > 0) {
          console.log('✅ Successfully extracted rooms:', extractedRooms.map(r => `${r.name} (${r.category})`));
          dispatch(setAIRooms(extractedRooms));
        } else {
          console.log('❌ No rooms extracted from AI response');
          // Try a simple test extraction
          const testResponse = "• BEDROOM 1 :- 3650 X 3350";
          const testRooms = extractRoomsFromAIResponse(testResponse);
          console.log('Test extraction result:', testRooms);
        }
      } catch (error) {
        console.error('Error extracting room data:', error);
      }
      
      // Add to chat history
      setChatHistory(prev => [...prev, 
        {
          type: 'user',
          message: query.trim(),
          timestamp: new Date().toLocaleTimeString()
        },
        {
          type: 'ai',
          message: result.response,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      
      setQuery(''); // Clear input after successful query
    } catch (error) {
      const errorMessage = error.message || 'Failed to get response from AI';
      setQueryResponse(`Error: ${errorMessage}`);
      
      // Add error to chat history
      setChatHistory(prev => [...prev, 
        {
          type: 'user',
          message: query.trim(),
          timestamp: new Date().toLocaleTimeString()
        },
        {
          type: 'system',
          message: `Error: ${errorMessage}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  // File selection handler
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.dxf', '.dwg'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Please select a valid file type: PDF, DXF, or DWG');
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  return (
    <div className="h-[92vh] w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header Section */}
        <div className="w-[400px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex-shrink-0 shadow-2xl relative overflow-hidden">
          <div className=" absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  AI File Processor
                </h1>
                <p className="text-sm opacity-95 font-light">
                  Transform your architectural drawings with AI-powered insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className=" w-[400px] flex-1 overflow-y-auto" ref={mainContentRef}>
          <div className="p-6 max-w-6xl mx-auto">
            {/* Enhanced File Upload Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-4 border-b border-slate-200 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <FileUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">File Upload</h2>
                  <p className="text-sm text-slate-600">Upload your architectural drawings for AI processing</p>
                </div>
              </div>
              
              <div className="p-6">
                {/* Enhanced File Input with Drag & Drop */}
                <div className="mb-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.dxf,.dwg"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  
                  {/* Drag & Drop Zone */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                      isDragOver 
                        ? 'border-indigo-400 bg-indigo-50 scale-105' 
                        : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-full transition-all duration-300 ${
                        isDragOver 
                          ? 'bg-indigo-100 scale-110' 
                          : 'bg-slate-100'
                      }`}>
                        <Upload className={`w-8 h-8 transition-colors duration-300 ${
                          isDragOver ? 'text-indigo-600' : 'text-slate-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-700 mb-1">
                          {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                        </p>
                        <p className="text-sm text-slate-500 mb-3">
                          or <span className="text-indigo-600 font-medium">browse files</span>
                        </p>
                        <p className="text-xs text-slate-400">Supported formats: PDF, DXF, DWG (Max 50MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced File Information */}
                {selectedFile && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-4 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900 text-sm">{selectedFile.name}</p>
                          <p className="text-blue-600 text-xs">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="p-2 bg-red-500 text-white rounded-lg transition-all duration-200 hover:bg-red-600 hover:scale-105 shadow-md hover:shadow-lg"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Upload Progress Bar */}
                    {isUploading && (
                      <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Upload Button */}
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className={`w-full rounded-xl px-6 py-4 text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                    selectedFile && !isUploading
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
                      : 'bg-gradient-to-r from-slate-400 to-slate-500 text-slate-200 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing File...</span>
                      <div className="ml-2 text-xs opacity-80">{uploadProgress}%</div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Process File with AI</span>
                    </>
                  )}
                </button>

                {/* Enhanced Upload Status */}
                {uploadStatus && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl mt-4 font-medium text-sm shadow-lg border animate-in slide-in-from-bottom-2 duration-500 ${
                    uploadStatus.type === 'success' 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-800 border-emerald-200' 
                      : 'bg-gradient-to-r from-red-50 to-pink-100 text-red-800 border-red-200'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      uploadStatus.type === 'success' 
                        ? 'bg-emerald-100' 
                        : 'bg-red-100'
                    }`}>
                      {uploadStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">{uploadStatus.message}</span>
                      {uploadStatus.details && (
                        <p className="text-xs opacity-70 mt-1">
                          {typeof uploadStatus.details === 'string' ? uploadStatus.details : 'File processed successfully'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced AI Query Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 ">
              <div className="bg-gradient-to-r from-slate-100 to-emerald-100 p-4 border-b border-slate-200 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">AI-Powered Questions</h2>
                  <p className="text-sm text-slate-600">Ask intelligent questions about your uploaded files</p>
                </div>
              </div>
              
              <div className="p-6">
                {/* Enhanced Quick Query Buttons */}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Quick Questions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {commonQueries.roomInfo.slice(0, 2).map((quickQuery, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!selectedFile) {
                            alert('Please upload a file first before asking questions. The AI needs a file to analyze.');
                            return;
                          }
                          setQuery(quickQuery);
                        }}
                        className={`text-left p-4 rounded-xl border transition-all duration-300 text-sm font-medium group ${
                          selectedFile
                            ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-200/50 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                        disabled={!selectedFile}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            selectedFile ? 'bg-purple-500 group-hover:scale-150' : 'bg-slate-400'
                          }`} />
                          <span className="leading-relaxed">{quickQuery}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Enhanced Advanced Queries Toggle */}
                  <button
                    onClick={() => setShowAdvancedQueries(!showAdvancedQueries)}
                    className="text-xs text-slate-600 hover:text-slate-800 cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-slate-100 flex items-center gap-1 font-medium"
                  >
                    {showAdvancedQueries ? 'Hide' : 'Show'} Advanced Questions
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showAdvancedQueries ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Enhanced Advanced Queries */}
                  {showAdvancedQueries && (
                    <div className="mt-3 flex flex-col gap-2">
                      {commonQueries.structuralInfo.slice(0, 1).map((advancedQuery, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (!selectedFile) {
                              alert('Please upload a file first before asking questions. The AI needs a file to analyze.');
                              return;
                            }
                            setQuery(advancedQuery);
                          }}
                          className={`text-left p-3 rounded-xl border transition-all duration-300 text-xs font-medium ${
                            selectedFile
                              ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200 hover:from-orange-100 hover:to-orange-200 hover:-translate-y-0.5 hover:shadow-md'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          }`}
                          disabled={!selectedFile}
                        >
                          {advancedQuery}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Query Input */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={selectedFile ? "Ask about room dimensions, areas, materials, or any other details..." : "Upload a file first to ask questions..."}
                      className={`w-full px-5 py-4 border-2 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:shadow-xl focus:ring-4 focus:ring-purple-100/50 ${
                        selectedFile 
                          ? 'border-slate-300 focus:border-purple-500 bg-white' 
                          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                      disabled={!selectedFile}
                    />
                    {selectedFile && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors duration-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleQuery}
                    disabled={!query.trim() || isQuerying || !selectedFile}
                    className={`rounded-xl px-6 py-4 text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-3 shadow-lg ${
                      selectedFile && query.trim() && !isQuerying
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
                        : 'bg-slate-400 text-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {isQuerying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Asking...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Ask AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* File Upload Required Message */}
                {!selectedFile && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FileUp className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">File Upload Required</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Please upload a PDF, DXF, or DWG file first to enable AI-powered questions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chat History Sidebar */}
      <div className="flex-1 bg-white/90 backdrop-blur-sm border-l border-slate-200 flex flex-col shadow-xl">
        {/* Enhanced Sidebar Header */}
        <div className="w-[1600px] bg-gradient-to-r from-slate-100 to-blue-100 p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Chat History</h3>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={() => setChatHistory([])}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-none rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer transition-all duration-300 hover:from-red-600 hover:to-pink-700 hover:shadow-lg hover:scale-105"
            >
              Clear All
            </button>
          )}
        </div>
        
        {/* Enhanced Chat Messages */}
        <div 
          ref={chatMessagesRef}
          className="flex-1 overflow-y-auto p-4 relative"
          onScroll={handleScroll}
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#cbd5e1 #f1f5f9',
            scrollbarGutter: 'stable'
          }}
        >

          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-6">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl mb-4 shadow-lg">
                <MessageCircle className="w-16 h-16 text-slate-400" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-slate-600">Start a Conversation</h4>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Upload a file and ask questions to begin your AI-powered analysis journey
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>AI Assistant ready to help</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {chatHistory.map((chat, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`p-4 rounded-xl w-[1580px] shadow-lg animate-in slide-in-from-bottom-2 duration-500 ${
                      chat.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white ml-auto hover:shadow-xl hover:shadow-blue-500/25' 
                        : chat.type === 'ai'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white mr-auto hover:shadow-xl hover:shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-slate-500 to-gray-600 text-white mx-auto text-center max-w-full'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                    {chat.type === 'user' ? (
                      <User className="w-3 h-3" />
                    ) : chat.type === 'ai' ? (
                      <Bot className="w-3 h-3" />
                    ) : (
                      <FileUp className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium opacity-80">
                      {chat.type === 'user' ? 'You' : chat.type === 'ai' ? 'AI Assistant' : 'System'}
                    </span>
                  </div>
                  <div 
                    className={`leading-relaxed mb-2 ${
                      chat.type === 'ai' ? 'text-sm space-y-2' : 'text-xs'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: chat.type === 'ai' ? formatAIResponse(chat.message) : chat.message
                    }}
                  />
                  {chat.type === 'ai' && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => copyToClipboard(chat.message, e)}
                        className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors duration-200"
                        title="Copy response"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <span className="text-xs opacity-60">AI Response</span>
                    </div>
                  )}
                  <div className="text-xs opacity-70">{chat.timestamp}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* Enhanced Scroll to Bottom Button */}
          {showScrollToBottom && chatHistory.length > 0 && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-full w-12 h-12 cursor-pointer transition-all duration-300 shadow-xl hover:scale-110 hover:shadow-2xl flex items-center justify-center z-10"
              title="Scroll to bottom"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Enhanced Sidebar Footer */}
        {chatHistory.length > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-t border-slate-200 text-center flex-shrink-0">
            <div className="bg-white/80 rounded-lg p-2 shadow-md">
              <span className="text-xs font-semibold text-slate-600">
                {chatHistory.length} message{chatHistory.length !== 1 ? 's' : ''} in conversation
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFileProcessor;
