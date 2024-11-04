import React, { useRef } from 'react';

function FileUpload({ onUpload }) {
  const fileInput = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = fileInput.current.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload PDF</h2>
      <div className="form-group">
        <input
          type="file"
          ref={fileInput}
          accept=".pdf"
          required
        />
      </div>
      <button type="submit">Upload</button>
    </form>
  );
}

export default FileUpload;