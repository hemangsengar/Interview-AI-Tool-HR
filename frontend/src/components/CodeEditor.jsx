import { useState } from 'react'

const CodeEditor = ({ onSubmit, language = 'python' }) => {
  const [code, setCode] = useState('')

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code)
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-stone-700">
        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
          {language} workspace
        </span>
        <button
          onClick={handleSubmit}
          disabled={!code.trim()}
          className="px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 text-xs rounded transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          Submit Code
        </button>
      </div>
      
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 w-full p-4 font-mono text-sm bg-[#1e1e1e] text-stone-300 focus:outline-none resize-none border-none selection:bg-primary/30"
        placeholder={`// Write your ${language} code here...\n\nfunction solution() {\n  // Your code\n}`}
        spellCheck="false"
      />
    </div>
  )
}

export default CodeEditor
