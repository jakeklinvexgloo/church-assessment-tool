import React from 'react';

const FormattedText = ({ text }) => {
  if (typeof text !== 'string') {
    console.warn('FormattedText received non-string input:', text);
    return null;
  }

  // Function to process inline bold text
  const processBoldText = (line) => {
    const parts = line.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Split the text into lines
  const lines = text.split('\n');

  return (
    <div className="whitespace-pre-wrap">
      {lines.map((line, index) => {
        // Check if the line is a header
        if (line.startsWith('###')) {
          return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{processBoldText(line.replace('###', '').trim())}</h3>;
        }
        // Check if the line is a subheader
        if (line.startsWith('- **') && line.endsWith(':**')) {
          return <h4 key={index} className="text-lg font-semibold mt-3 mb-1">{processBoldText(line.replace(/[-*]/g, '').trim())}</h4>;
        }
        // Check if the line is a bullet point
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return <li key={index} className="ml-6">{processBoldText(line.replace(/^[•-]\s*/, ''))}</li>;
        }
        // Regular text
        return <p key={index} className="mb-2">{processBoldText(line)}</p>;
      })}
    </div>
  );
};

export default FormattedText;