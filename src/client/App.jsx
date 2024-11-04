import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import QueryForm from './components/QueryForm';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError('');
    setUploadStatus('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/ingest', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadStatus(`Successfully processed document into ${data.chunks} chunks`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = async (query) => {
    setIsLoading(true);
    setError('');
    setQueryResult('');

    try {
      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process query');
      }

      setQueryResult(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>RAG System</h1>
      
      <div className="card">
        <FileUpload onUpload={handleUpload} />
        {uploadStatus && <p className="success">{uploadStatus}</p>}
      </div>

      <div className="card">
        <QueryForm onSubmit={handleQuery} />
        {queryResult && (
          <div className="result">
            <h3>Answer:</h3>
            <p>{queryResult}</p>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default App;