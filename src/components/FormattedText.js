import React from 'react';

const FormattedText = ({ text }) => {
  if (typeof text !== 'string') {
    console.warn('FormattedText received non-string input:', text);
    return null;
  }

  // Split the text into lines
  const lines = text.split('\n');

  return (
    <div className="whitespace-pre-wrap">
      {lines.map((line, index) => {
        // Check if the line is a header
        if (line.startsWith('###')) {
          return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
        }
        // Check if the line is a subheader
        if (line.startsWith('- **') && line.endsWith(':**')) {
          return <h4 key={index} className="text-lg font-semibold mt-3 mb-1">{line.replace(/[-*]/g, '').trim()}</h4>;
        }
        // Check if the line is a bullet point
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return <li key={index} className="ml-6">{line.replace(/^[•-]\s*/, '')}</li>;
        }
        // Regular text
        return <p key={index} className="mb-2">{line}</p>;
      })}
    </div>
  );
};

export default FormattedText;