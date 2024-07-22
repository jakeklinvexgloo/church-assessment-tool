import React from 'react';

const FormattedText = ({ text }) => {
  if (typeof text !== 'string') {
    console.warn('FormattedText received non-string input:', text);
    return null;
  }

  const processBoldText = (line) => {
    const parts = line.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-indigo-700">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const lines = text.split('\n');

  return (
    <div className="text-gray-800">
      {lines.map((line, index) => {
        if (line.startsWith('###')) {
          return <h3 key={index} className="text-2xl font-bold text-indigo-800 mt-6 mb-4">{processBoldText(line.replace('###', '').trim())}</h3>;
        }
        if (line.startsWith('- **') && line.endsWith(':**')) {
          return <h4 key={index} className="text-xl font-semibold text-indigo-700 mt-4 mb-2">{processBoldText(line.replace(/[-*]/g, '').trim())}</h4>;
        }
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return <li key={index} className="ml-6 mb-2 text-gray-700">{processBoldText(line.replace(/^[•-]\s*/, ''))}</li>;
        }
        return <p key={index} className="mb-3 leading-relaxed">{processBoldText(line)}</p>;
      })}
    </div>
  );
};

export default FormattedText;