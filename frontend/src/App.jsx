import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { chatCompletion } from './Test';
import { IndexPage } from './IndexPage';

import "preline/preline"

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');


  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const aiResponse = await chatCompletion({ prompt });
    setResponse(aiResponse);
  };

  return (
    <div>
    {/* <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Chat with AI</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Type your message here..."
            value={prompt}
            onChange={handlePromptChange}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </form>
        {response && (
          <div className="mt-4">
            <h2 className="font-bold">AI Response:</h2>
            <p className="text-gray-700 mt-2">{response}</p>
          </div>
        )}
      </div>      
    </div> */}
    <IndexPage />
    </div>
  );
}

export default App;
