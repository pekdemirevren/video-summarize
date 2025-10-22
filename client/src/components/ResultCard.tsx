import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, children }) => {
  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <div className="text-content/90 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;
