import React from 'react';
import { Flow } from '../types';
import TechIcon from './icons/TechIcon';
import HealthIcon from './icons/HealthIcon';
import FinanceIcon from './icons/FinanceIcon';

interface SidebarProps {
  activeFlow: Flow;
  setActiveFlow: (flow: Flow) => void;
}

interface SidebarButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    label: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ isActive, onClick, children, label }) => {
    const baseClasses = "relative flex items-center justify-center h-14 w-14 my-2 mx-auto text-primary rounded-3xl hover:rounded-xl transition-all duration-300 ease-linear cursor-pointer group";
    const activeClasses = "bg-primary rounded-xl text-white";
    const inactiveClasses = "bg-gray-200 hover:bg-primary hover:text-white";

    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
            <span className="absolute w-auto p-2 m-2 min-w-max left-20 rounded-md shadow-md text-white bg-gray-900 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100">
                {label}
            </span>
        </button>
    );
}

const Sidebar: React.FC<SidebarProps> = ({ activeFlow, setActiveFlow }) => {
  return (
    <div className="w-20 bg-sidebar-bg text-white flex flex-col items-center py-4 space-y-4 shadow-lg">
      <div className="text-secondary text-2xl font-bold">
        G
      </div>
       <div className="border-t border-gray-700 w-12 my-2"></div>
        <SidebarButton isActive={activeFlow === Flow.Tech} onClick={() => setActiveFlow(Flow.Tech)} label="Technology">
            <TechIcon />
        </SidebarButton>
        <SidebarButton isActive={activeFlow === Flow.Health} onClick={() => setActiveFlow(Flow.Health)} label="Health">
            <HealthIcon />
        </SidebarButton>
        <SidebarButton isActive={activeFlow === Flow.Finance} onClick={() => setActiveFlow(Flow.Finance)} label="Finance">
            <FinanceIcon />
        </SidebarButton>
    </div>
  );
};

export default Sidebar;
