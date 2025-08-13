import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Stage, Layer, Rect, Line, Circle, Text, Group } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
import EntityRender from "../../drawing/EntityRenderer";
import FloorPreview from "../shared/FloorPreview";

const CircuitVisualizer = () => {
  const dispatch = useDispatch();
  const rooms = useSelector((s) => s.newRooms?.rooms || []);
  const floor = useSelector((s) => s.floorPlan.rect);
  const lightsByRoom = useSelector((s) => s.lighting.lightsByRoom);
  
  // Circuiting state
  const {
    showPhaseOverlay,
    circuits,
    circuitMapping,
    phaseColors,
    selectedZone,
    zones
  } = useSelector((s) => s.circuiting);

  const [hoveredCircuit, setHoveredCircuit] = useState(null);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth - 410,
    height: window.innerHeight - 120
  });

  const { projectId } = useParams();
  const { data, isLoading, isError } = useGetProjectListByIdQuery(projectId);
  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth - 410,
        height: window.innerHeight - 120
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get circuit statistics
  const getCircuitStats = () => {
    const stats = {
      totalCircuits: Object.keys(circuits).length,
      totalFixtures: Object.keys(circuitMapping).length,
      phaseDistribution: {},
      circuitLoads: {}
    };

    Object.entries(circuits).forEach(([circuitId, circuit]) => {
      const circuitFixtures = Object.entries(circuitMapping).filter(([fixtureId, mappedCircuitId]) => 
        mappedCircuitId === circuitId
      ).length;
      
      stats.circuitLoads[circuitId] = circuitFixtures;
      
      if (circuit.phase) {
        stats.phaseDistribution[circuit.phase] = (stats.phaseDistribution[circuit.phase] || 0) + 1;
      }
    });

    return stats;
  };

  const stats = getCircuitStats();

  const handleCircuitHover = (circuitId) => {
    setHoveredCircuit(circuitId);
  };

  const handleCircuitClick = (circuitId) => {
    setSelectedCircuit(selectedCircuit === circuitId ? null : circuitId);
  };

  const getCircuitColor = (circuitId, baseColor) => {
    if (selectedCircuit === circuitId) return "#FF6B35";
    if (hoveredCircuit === circuitId) return "#4ECDC4";
    return baseColor;
  };

  // Generate fixture label in format: L1/C1/1R1
  const generateFixtureLabel = (fixture, circuitId, circuit, fixtureIndex) => {
    if (!circuitId || !circuit) return null;
    
    // Extract circuit number from circuitId (e.g., "CKT-zone-001" -> "C1")
    const circuitNumber = circuitId.split('-').pop();
    const circuitNum = parseInt(circuitNumber);
    
    // Light number (L1, L2, L3...)
    const lightNum = fixtureIndex + 1;
    
    // Circuit number (C1, C2, C3...)
    const circuitNumFormatted = `C${circuitNum}`;
    
    // Phase info (1R1, 2Y1, 3B1...)
    const phase = circuit.phase || 'R';
    const phaseLightNum = 1; // For now, always 1 as requested
    
    return `L${lightNum}/${circuitNumFormatted}/${phaseLightNum}${phase}${phaseLightNum}`;
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading circuit visualization...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <p className="text-red-600">Error loading project data</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with Statistics */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Circuit Visualization</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Circuits:</span>
              <span className="font-medium">{stats.totalCircuits}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Fixtures:</span>
              <span className="font-medium">{stats.totalFixtures}</span>
            </div>
            {showPhaseOverlay && Object.keys(stats.phaseDistribution).length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Phases:</span>
                {Object.entries(stats.phaseDistribution).map(([phase, count]) => (
                  <div key={phase} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: phaseColors[phase] }}
                    ></div>
                    <span className="text-xs">{phase}: {count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Always show FloorPreview with overlay */}
      <div className="flex-1 relative">
        {/* Info overlay */}
        <div className="absolute top-2 left-140 z-20 bg-white p-1 rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-1">
            {Object.keys(circuits).length === 0 ? "No circuits generated yet" : "Circuits generated"}
          </div>
          <div className="text-xs text-gray-500">
            {Object.keys(circuits).length === 0 
              ? "Use the Floor Preview below to place fixtures, then generate circuits from the control panel"
              : "Fixture labels show: Light/Circuit/Phase format (L1/C1/1R1)"
            }
          </div>
        </div>

        {/* Floor Preview - Always visible */}
        <FloorPreview 
          drawingMode={null}
          exitDrawingMode={() => {}}
          roomId={null}
          numberOfLights={null}
        />

        {/* Circuit Labels Overlay - Only when circuits exist */}
        {Object.keys(circuits).length > 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <Stage width={canvasSize.width} height={canvasSize.height}>
              <Layer>
                {/* Render fixture labels with circuit information */}
                {Object.entries(lightsByRoom).map(([rid, data]) => {
                  const lights = data?.lights;
                  if (!lights?.length) return null;

                  return (
                    <React.Fragment key={rid}>
                      {lights.map((light, i) => {
                        // Get circuit information for this fixture
                        const circuitId = circuitMapping[light.fixtureId || light.id];
                        const circuit = circuits[circuitId];
                        
                        if (!circuitId || !circuit) return null;

                        // Generate the fixture label
                        const fixtureLabel = generateFixtureLabel(light, circuitId, circuit, i);
                        
                        if (!fixtureLabel) return null;

                        // Determine fixture color based on circuit and phase overlay
                        let fixtureColor = "#4CAF50"; // Default green
                        let strokeColor = "black";
                        let strokeWidth = 1;

                        if (showPhaseOverlay && circuit.phase && phaseColors[circuit.phase]) {
                          fixtureColor = phaseColors[circuit.phase];
                          strokeColor = "#000000";
                          strokeWidth = 2;
                        } else if (circuitId) {
                          fixtureColor = getCircuitColor(circuitId, "#4CAF50");
                        }

                        return (
                          <Group 
                            key={`${rid}-${light.fixtureId || light.id || i}`}
                            onMouseEnter={() => handleCircuitHover(circuitId)}
                            onMouseLeave={() => handleCircuitHover(null)}
                            onClick={() => handleCircuitClick(circuitId)}
                          >
                            {/* Fixture circle */}
                            <Circle 
                              x={light.position?.x || light.x} 
                              y={light.position?.y || light.y} 
                              radius={8} 
                              fill={fixtureColor} 
                              stroke={strokeColor} 
                              strokeWidth={strokeWidth} 
                              opacity={0.8} 
                              shadowBlur={3} 
                              shadowColor="rgba(0,0,0,0.3)" 
                              shadowOffset={{ x: 1, y: 1 }} 
                            />
                            
                            {/* Fixture label */}
                            <Text 
                              x={(light.position?.x || light.x) - 30} 
                              y={(light.position?.y || light.y) - 35} 
                              text={fixtureLabel} 
                              fontSize={10} 
                              fill="#333" 
                              align="center" 
                              fontFamily="Arial" 
                              fontStyle="bold" 
                              stroke="white" 
                              strokeWidth={3}
                            />
                            <Text 
                              x={(light.position?.x || light.x) - 30} 
                              y={(light.position?.y || light.y) - 35} 
                              text={fixtureLabel} 
                              fontSize={10} 
                              fill="#333" 
                              align="center" 
                              fontFamily="Arial" 
                              fontStyle="bold" 
                            />
                          </Group>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Circuit Information Overlay */}
                {selectedCircuit && circuits[selectedCircuit] && (
                  <Group x={20} y={20}>
                    <Rect x={0} y={0} width={300} height={120} fill="rgba(255, 255, 255, 0.95)" stroke="#FF6B35" strokeWidth={2} cornerRadius={8} />
                    <Text x={10} y={10} text={`Circuit: ${selectedCircuit}`} fontSize={14} fontFamily="Arial" fontStyle="bold" fill="#FF6B35" />
                    <Text x={10} y={30} text={`Load: ${circuits[selectedCircuit].load || 0}W`} fontSize={12} fontFamily="Arial" />
                    <Text x={10} y={50} text={`Fixtures: ${circuits[selectedCircuit].fixtures?.length || 0}`} fontSize={12} fontFamily="Arial" />
                    {circuits[selectedCircuit].phase && (
                      <Text x={10} y={70} text={`Phase: ${circuits[selectedCircuit].phase}`} fontSize={12} fontFamily="Arial" />
                    )}
                    <Text x={10} y={90} text={`Zone: ${circuits[selectedCircuit].zone || 'Unknown'}`} fontSize={12} fontFamily="Arial" />
                    <Text x={10} y={110} text="Click to deselect" fontSize={10} fontFamily="Arial" fill="#666" />
                  </Group>
                )}

                {/* Phase Legend */}
                {showPhaseOverlay && (
                  <Group x={canvasSize.width - 150} y={20}>
                    <Rect x={0} y={0} width={130} height={100} fill="rgba(255, 255, 255, 0.9)" stroke="black" strokeWidth={1} cornerRadius={5} />
                    <Text x={10} y={10} text="Phase Colors" fontSize={12} fontFamily="Arial" fontStyle="bold" />
                    {Object.entries(phaseColors).map(([phase, color], index) => (
                      <Group key={phase} x={10} y={25 + index * 20}>
                        <Circle x={8} y={8} radius={6} fill={color} stroke="black" strokeWidth={1} />
                        <Text x={20} y={2} text={`Phase ${phase}`} fontSize={10} fontFamily="Arial" />
                      </Group>
                    ))}
                  </Group>
                )}
              </Layer>
            </Stage>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitVisualizer;
