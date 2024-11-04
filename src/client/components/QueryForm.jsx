import React, { useState } from 'react';

function QueryForm({ onSubmit }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ask a Question</h2>
      <div className="form-group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your question here..."
          required
        />
      </div>
      <button type="submit">Ask</button>
    </form>
  );
}

export default QueryForm;