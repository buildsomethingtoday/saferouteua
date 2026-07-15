
import React from 'react';
import AlertsApiExplorer from '../components/AlertsApiExplorer';
import { useLanguageDetection } from '../hooks/useLanguageDetection';

const AlertsExplorer = () => {
  const language = useLanguageDetection();

  return (
    <div className="min-h-screen glass-backdrop p-4">
      <div className="max-w-6xl mx-auto">
        <AlertsApiExplorer language={language} />
      </div>
    </div>
  );
};

export default AlertsExplorer;
