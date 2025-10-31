import React, { useState, useEffect, useRef } from 'react';
import { Play, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const API_URL = 'https://unstooping-prolongably-donnell.ngrok-free.dev';

export default function CodeEditor() {
  const [code, setCode] = useState(`# Write your Python code here
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`);
  const [output, setOutput] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState(null);

  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize Yjs + WebSocket
  useEffect(() => {
    ydocRef.current = new Y.Doc();
    providerRef.current = new WebsocketProvider(
      'wss://codeeditor-websocket.onrender.com', // WebSocket server
      'monaco-editor-room',
      ydocRef.current
    );

    return () => {
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    const yText = ydocRef.current.getText('monaco');

    if (bindingRef.current) bindingRef.current.destroy();
    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      providerRef.current.awareness
    );

    if (yText.length === 0) editor.setValue(code);
    else setCode(yText.toString());
  };

  // Poll for job result
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/result/${jobId}`);
        if (res.data.status === 'done') {
          setOutput(res.data.output);
          setIsLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        // This is the fix: We log the error but do not clear the interval.
        // This allows polling to continue even if ngrok causes a temporary error.
        console.error("Polling error:", err.message);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jobId]);


  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('🔄 Running...');

    try {
      const { data } = await axios.post(
        `${API_URL}/run-python`,
        { code },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setJobId(data.jobId);
    } catch (err) {
      setOutput(`✗ Submission Error:\n${err.message}`);
      setIsLoading(false);
    }
  };

  return (
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
            <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs`}>{code.length} characters</span>
          </div>
          <Editor
            height="100%"
            language="python"
            value={code}
            onChange={(v) => setCode(v || '')}
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
