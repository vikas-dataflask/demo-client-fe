/**
 * Example Usage of CircuitingSummarySlice
 * 
 * This file demonstrates how to use the new circuitingSummarySlice
 * for permanently storing completed fixture labeling results.
 */

import { 
  saveZoneSummary, 
  clearZoneSummary, 
  clearAllSummaries,
  updateFixtureLabel,
  addFixtureLabel,
  selectCircuitingSummary,
  selectZoneSummary,
  selectTotalZones,
  selectTotalFixtures
} from './circuitingSummarySlice';

// Example 1: Save completed circuiting for Zone 1
const saveZone1Summary = (dispatch) => {
  const zone1Fixtures = [
    "Z1/C1/1R1",
    "Z1/C1/1Y1", 
    "Z1/C1/1B1",
    "Z1/C1/2R1",
    "Z1/C1/2Y1",
    "Z1/C1/2B1",
    "Z1/C1/3R1",
    "Z1/C1/3Y1",
    "Z1/C1/3B1",
    "Z1/C1/4R1",
    "Z1/C1/4Y1",
    "Z1/C1/4B1",
    "Z1/C2/1R1",
    "Z1/C2/1Y1",
    "Z1/C2/1B1"
  ];
  
  dispatch(saveZoneSummary({
    zoneId: "Z1",
    fixtures: zone1Fixtures
  }));
};

// Example 2: Save completed circuiting for Zone 2
const saveZone2Summary = (dispatch) => {
  const zone2Fixtures = [
    "Z2/C1/1R1",
    "Z2/C1/1Y1",
    "Z2/C1/1B1",
    "Z2/C1/2R1",
    "Z2/C1/2Y1",
    "Z2/C1/2B1"
  ];
  
  dispatch(saveZoneSummary({
    zoneId: "Z2", 
    fixtures: zone2Fixtures
  }));
};

// Example 3: Update a specific fixture label
const updateZone1Fixture = (dispatch) => {
  dispatch(updateFixtureLabel({
    zoneId: "Z1",
    fixtureIndex: 5, // 6th fixture (0-indexed)
    newLabel: "Z1/C1/2Y1-UPDATED"
  }));
};

// Example 4: Add a new fixture to an existing zone
const addFixtureToZone1 = (dispatch) => {
  dispatch(addFixtureLabel({
    zoneId: "Z1",
    fixtureLabel: "Z1/C2/1R1"
  }));
};

// Example 5: Clear a specific zone's summary
const clearZone1Summary = (dispatch) => {
  dispatch(clearZoneSummary({
    zoneId: "Z1"
  }));
};

// Example 6: Clear all summaries
const clearAllZoneSummaries = (dispatch) => {
  if (window.confirm('Are you sure you want to clear all summaries?')) {
    dispatch(clearAllSummaries());
  }
};

// Example 7: Using selectors in a React component
const ExampleComponent = () => {
  // Get all zone summaries
  const allSummaries = useSelector(selectCircuitingSummary);
  
  // Get specific zone summary
  const zone1Summary = useSelector(state => selectZoneSummary(state, "Z1"));
  
  // Get total counts
  const totalZones = useSelector(selectTotalZones);
  const totalFixtures = useSelector(selectTotalFixtures);
  
  return (
    <div>
      <h3>Circuiting Summary ({totalZones} zones, {totalFixtures} fixtures)</h3>
      
      {Object.entries(allSummaries).map(([zoneId, fixtures]) => (
        <div key={zoneId}>
          <h4>{zoneId} ({fixtures.length} fixtures)</h4>
          <ul>
            {fixtures.map((label, index) => (
              <li key={index}>{label}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Example 8: Integration with existing circuiting logic
const integrateWithCircuiting = (dispatch, selectedZone, fixtureLabels) => {
  // After completing circuiting for a zone, save to permanent summary
  const zoneMatch = selectedZone.id.match(/zone(\d+)/i);
  const zoneNumber = zoneMatch ? parseInt(zoneMatch[1]) : 1;
  const summaryZoneId = `Z${zoneNumber}`;
  
  dispatch(saveZoneSummary({
    zoneId: summaryZoneId,
    fixtures: fixtureLabels
  }));
  
  console.log(`✅ Saved ${fixtureLabels.length} fixtures to permanent summary for ${summaryZoneId}`);
};

export {
  saveZone1Summary,
  saveZone2Summary,
  updateZone1Fixture,
  addFixtureToZone1,
  clearZone1Summary,
  clearAllZoneSummaries,
  ExampleComponent,
  integrateWithCircuiting
};
