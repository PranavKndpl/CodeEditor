import React, { useState, useEffect, useRef } from 'react';
import { Play, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const API_URL = 'https://unstooping-prolongably-donnell.ngrok-free.dev';

export default function CodeEditor() {
  const [defaultCode] = useState(`# Write your Python code here
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`);
  
  const [output, setOutput] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState(null);

  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const editorRef = useRef(null); 

  // Initialize Yjs + WebSocket
  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      'wss://codeeditor-websocket.onrender.com',
      'monaco-editor-room',
      ydoc
    );

    ydocRef.current = ydoc;
    providerRef.current = provider;

    // Fix for duplicate text on reload
    const syncHandler = () => {
      if (ydoc.getText('monaco').length === 0) {
        ydoc.getText('monaco').insert(0, defaultCode);
      }
    };
    
    provider.on('sync', syncHandler);

    return () => {
      provider.off('sync', syncHandler);
      provider.destroy();
      ydoc.destroy();
    };
  }, [defaultCode]); 

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    if (!ydocRef.current || !providerRef.current) return;
    const yText = ydocRef.current.getText('monaco');

    new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      providerRef.current.awareness
    );
  };

  // Poll for job result
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        // --- THIS IS THE NGROK FIX ---
        // We add the 'ngrok-skip-browser-warning' header
        const res = await axios.get(`${API_URL}/result/${jobId}`, {
          headers: {
            'ngrok-skip-browser-warning': '69420'
          }
        });

        if (res.data.status === 'done') {
          setOutput(res.data.output);
          setIsLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        // --- THIS IS THE NEW CATCH BLOCK ---
        // It will now show you the error in the output box
        console.error("Polling error:", err.message);
        setOutput(`✗ Polling Error:\n${err.message}\n\nIs ngrok running?`);
        setIsLoading(false);
        clearInterval(interval);
      }
    }, 1000); 

    return () => clearInterval(interval);
  }, [jobId]);


  const handleRunCode = async () => {
    if (!editorRef.current) return; 

    setIsLoading(true);
    setOutput('🔄 Running...');

    const currentCode = editorRef.current.getValue();

    try {
      const { data } = await axios.post(
        `${API_URL}/run-python`,
        { code: currentCode },
        { 
          headers: { 
            'Content-Type': 'application/json',
            // Add the skip header to the POST request too
            'ngrok-skip-browser-warning': '69420'
          } 
        }
      );
      
      console.log("Job created, ID:", data.jobId); // Proof for browser console
      setJobId(data.jobId);

    } catch (err) {
      setOutput(`✗ Submission Error:\n${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    // ... all your JSX ...
    // (No changes needed to the JSX part)
    <div className={`flex flex-col h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
        <h1 className={`${isDark ? 'text-white' : 'text-gray-900'} text-xl font-semibold`}>Code Editor</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={handleRunCode}
            disabled={isLoading}
            className={`flex items-center gap-2 ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg font-medium`}
          >
            <Play size={18} /> {isLoading ? 'Running...' : 'RUN'}
          </button>
        </div>
      </div>

      {/* Main editor/output */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Code editor */}
        <div className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} px-4 py-3 border-b flex items-center justify-between`}>
            <h2 className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-semibold tracking-wide`}>CODE</h2>
          </div>
          <Editor
            height="100%"
            language="python"
            onMount={handleEditorDidMount}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              tabSize: 4,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              scrollbar: { vertical: 'auto', horizontal: 'hidden', verticalScrollbarSize: 6 },
            }}
          />
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} px-4 py-3 border-b`}>
            <h2 className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-semibold tracking-wide`}>OUTPUT</h2>
          </div>
          <div className={`flex-1 ${isDark ? 'bg-gray-950' : 'bg-gray-50'} overflow-auto`}>
            <pre className={`${isDark ? 'text-gray-300' : 'text-gray-800'} p-4 font-mono text-sm whitespace-pre-wrap`}>
              {output || 'Click "RUN" to execute your code...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
