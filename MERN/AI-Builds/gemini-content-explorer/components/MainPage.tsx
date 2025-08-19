
import React, { useState } from 'react';
import type { User } from '../types';
import { Flow } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import FlowPage from './FlowPage';

interface MainPageProps {
  user: User;
  onLogout: () => void;
}

const flowConfigs = {
    [Flow.Tech]: { title: 'Technology Insights', categoryLabel: 'Category', topicLabel: 'Topic' },
    [Flow.Health]: { title: 'Health & Wellness Hub', categoryLabel: 'Area', topicLabel: 'Focus' },
    [Flow.Finance]: { title: 'Financial Strategies', categoryLabel: 'Domain', topicLabel: 'Instrument' },
};

const MainPage: React.FC<MainPageProps> = ({ user, onLogout }) => {
  const [activeFlow, setActiveFlow] = useState<Flow>(Flow.Tech);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeFlow={activeFlow} setActiveFlow={setActiveFlow} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 md:p-8">
            <FlowPage 
                key={activeFlow}
                flowType={activeFlow} 
                config={flowConfigs[activeFlow]}
            />
        </main>
      </div>
    </div>
  );
};

export default MainPage;
