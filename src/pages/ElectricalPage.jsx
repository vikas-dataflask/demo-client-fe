import React, { useState } from "react";

// Content Components

import Dialux from "../components/electrical/DialuxForm";
import SidebarElectrical from "../components/electrical/SidebarElectrical";
import Layout from "../components/ProjectLayout";
import DbDetailForm from "../components/electrical/DbDetailForm";
import PowerDbDetailForm from "../components/electrical/PowerDbDetailForm";
import BreakerSizingForm from "../components/electrical/BreakerSizingForm";
import CableSizingForm from "../components/electrical/CableSizingForm";
import PowerForm from "../components/electrical/PowerForm";
import TraySizer from "../components/electrical/TraySizer";
import EarthmatCalculator from "../components/electrical/EarthmatCalculator";
import CircuitingControlPanel from "../components/electrical/CircuitingControlPanel";
import CircuitVisualizer from "../components/electrical/CircuitVisualizer";
import PowerCircuitingPage from "../components/electrical/PowerCircuitingPage";

export default function ElectricalPage() {
  const [activeSection, setActiveSection] = useState("dialux"); // Default

  const renderContent = () => {
    switch (activeSection) {
      case "dialux":
        return <Dialux />;
      case "power":
        return <PowerForm />;
      case "db-details":
        return <DbDetailForm />;
      case "power-db-details":
        return <PowerDbDetailForm />;
      case "breaker-sizing":
        return <BreakerSizingForm />;
      case "cable-size":
        return <CableSizingForm />;
      case "tray-size":
        return <TraySizer />;
      case "earthmat":
        return <EarthmatCalculator />;
      case "circuiting":
        return (
          <div className="flex-1 ">
            <div className="h-full">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Circuiting Management
              </h1>
              <div className="flex gap-4 h-[calc(100vh-120px)]">
                {/* Circuiting Control Panel - Fixed width of 440px */}
                <div className="w-[390px] flex-shrink-0">
                  <CircuitingControlPanel />
                </div>
                
                {/* Circuit Visualization - Takes remaining space */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden h-full">
                    <CircuitVisualizer />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "power-circuiting":
        return <PowerCircuitingPage />;

      default:
        return <Dialux />;
    }
  };

  return (
    <div className="bg-[#f8f9fb] h-screen flex flex-col">
      <Layout />
      <div className="flex overflow-hidden">
        <SidebarElectrical
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="flex-1 h-screen overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
