import { useState } from 'react'

const CodeEditor = ({ onSubmit, language = 'python' }) => {
  const [code, setCode] = useState('')

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">Code Editor</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          {language}
        </span>
      </div>
      
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder={`// Write your ${language} code here...\n\nfunction solution() {\n  // Your code\n}`}
        spellCheck="false"
      />
      
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {code.length} characters
        </p>
        <button
          onClick={handleSubmit}
          disabled={!code.trim()}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Code
        </button>
      </div>
    </div>
  )
}

export default CodeEditor
