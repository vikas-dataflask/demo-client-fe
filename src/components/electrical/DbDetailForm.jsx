import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";

const DbDetailForm = () => {
  const zoneManagement = useSelector(
    (state) => state.circuiting.zoneManagement || []
  );
  const selectedZone = useSelector((state) => state.circuiting.selectedZone);
  const circuits = useSelector((state) => state.circuiting.circuits);
  const circuitMapping = useSelector(
    (state) => state.circuiting.circuitMapping
  );

  // ----- Lighting States -----
  const [selectedZoneForDB, setSelectedZoneForDB] = useState("");
  const [zoneSelected, setZoneSelected] = useState(false);

  const [dbs, setDbs] = useState([]); // Array of DBs being created
  const [currentDbName, setCurrentDbName] = useState("");
  const [currentDbLoad, setCurrentDbLoad] = useState("");
  const [currentDbLoadUnit, setCurrentDbLoadUnit] = useState("W");

  const [confirmedDbs, setConfirmedDbs] = useState(() => {
    try {
      const saved = localStorage.getItem("confirmedLightingDbs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [errors, setErrors] = useState({});

  const handleReload = () => {
    console.log("Reload clicked");
  };

  // Add a new DB to the current zone
  const handleAddDb = () => {
    const newErrors = {};
    if (!currentDbName.trim()) newErrors.dbName = "DB Name is required";
    if (!currentDbLoad) newErrors.dbLoad = "DB Load is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newDb = {
      id: `db_${Date.now()}`, // Unique ID for the DB
      name: currentDbName,
      load: currentDbLoad,
      loadUnit: currentDbLoadUnit,
      circuits: [], // Array to store assigned circuits
      zoneId: selectedZoneForDB,
      zoneName:
        zoneManagement.find((z) => z.id === selectedZoneForDB)?.name ||
        selectedZoneForDB,
    };

    setDbs((prev) => [...prev, newDb]);

    // Reset current DB form
    setCurrentDbName("");
    setCurrentDbLoad("");
    setCurrentDbLoadUnit("KW");
    setErrors({});
  };

  // Assign a circuit to a specific DB
  const handleAssignCircuit = (dbId, circuitId) => {
    if (!circuitId) return;

    setDbs((prev) =>
      prev.map((db) => {
        if (db.id === dbId) {
          return {
            ...db,
            circuits: [...db.circuits, circuitId],
          };
        }
        return db;
      })
    );
  };

  // Remove a circuit from a DB
  const handleRemoveCircuit = (dbId, circuitId) => {
    setDbs((prev) =>
      prev.map((db) => {
        if (db.id === dbId) {
          return {
            ...db,
            circuits: db.circuits.filter((c) => c !== circuitId),
          };
        }
        return db;
      })
    );
  };

  // Confirm all DBs for the zone
  const handleConfirmAllDBs = () => {
    if (dbs.length === 0) {
      setErrors({ general: "Please add at least one DB before confirming" });
      return;
    }

    const selectedZoneInfo = zoneManagement.find(
      (z) => z.id === selectedZoneForDB
    );
    const zoneRooms = selectedZoneInfo?.rooms || [];

    const finalDBs = dbs.map((db) => ({
      dbName: db.name,
      totalDbLoad: db.load,
      dbLoadUnit: db.loadUnit,
      zoneName: db.zoneName,
      zoneId: db.zoneId,
      rooms: zoneRooms,
      totalRooms: zoneRooms.length,
      assignedCircuits: db.circuits,
      circuitCount: db.circuits.length,
    }));

    setConfirmedDbs((prev) => {
      const updated = [...prev, ...finalDBs];
      localStorage.setItem("confirmedLightingDbs", JSON.stringify(updated));
      return updated;
    });

    // Reset everything
    setDbs([]);
    setSelectedZoneForDB("");
    setZoneSelected(false);
    setCurrentDbName("");
    setCurrentDbLoad("");
    setCurrentDbLoadUnit("KW");
    setErrors({});
  };

  // Get available circuits for a specific DB (circuits not assigned to any DB)
  const getAvailableCircuits = (currentDbId) => {
    if (!circuits || Object.keys(circuits).length === 0) return [];

    // Get all circuits assigned to any DB
    const allAssignedCircuits = dbs.flatMap((db) => db.circuits);

    // Filter out circuits that are already assigned
    return Object.values(circuits).filter(
      (circuit) =>
        !allAssignedCircuits.includes(circuit.circuitId) ||
        dbs
          .find((db) => db.id === currentDbId)
          ?.circuits.includes(circuit.circuitId)
    );
  };

  return (
    <div className="flex h-screen">
      {/* Lighting Section */}
      <div className="w-[400px] h-[90vh] bg-white border-r border-gray-300 p-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold text-black leading-none">
              Lighting DB Detail
            </h1>
            <p className="text-sm text-gray-400 mt-[2px]">
              Multi-DB Zone Management
            </p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={handleReload}
            type="button"
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Workflow Info */}
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
          <p>
            <strong>Workflow:</strong>
          </p>
          <p>
            1. Select Zone → 2. Create Multiple DBs → 3. Assign Circuits → 4.
            Confirm All
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Multiple DBs per zone. Each DB can have multiple circuits assigned.
          </p>
        </div>

        {/* General Error Display */}
        {errors.general && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800">
            <p>
              <strong>Error:</strong> {errors.general}
            </p>
          </div>
        )}

        {/* Confirmed DBs */}
        {confirmedDbs.length > 0 && (
          <div className="space-y-4 mt-4">
            {confirmedDbs.map((db, idx) => (
              <div
                key={idx}
                className="border border-green-400 bg-green-50 p-3 rounded-md"
              >
                <h2 className="text-[14px] font-semibold text-green-700 mb-2">
                  DB Saved: {db.dbName}
                </h2>
                <p>
                  <strong>Name:</strong> {db.dbName}
                </p>
                <p>
                  <strong>Total Load:</strong> {db.totalDbLoad} {db.dbLoadUnit}
                </p>
                <p>
                  <strong>Zone:</strong> {db.zoneName}
                </p>
                <p>
                  <strong>Total Rooms:</strong> {db.totalRooms}
                </p>
                {db.assignedCircuits && db.assignedCircuits.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p>
                      <strong>Assigned Circuits:</strong> {db.circuitCount}
                    </p>
                    <div className="text-xs text-green-600 mt-1">
                      {db.assignedCircuits.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Zone Selection First */}
        <div className="mt-3">
          <p className="text-sm text-black mb-1">Select Zone</p>
          {zoneManagement.length === 0 ? (
            <div className="w-[95%] p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <p>
                <strong>No zones available!</strong>
              </p>
              <p>
                Please create zones in the Circuiting Management section first.
              </p>
              <p>Zones are required to organize rooms for DB assignment.</p>
            </div>
          ) : (
            <select
              value={selectedZoneForDB}
              onChange={(e) => {
                setSelectedZoneForDB(e.target.value);
                setErrors((prev) => ({ ...prev, zone: "" }));
              }}
              className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
              aria-label="Select Zone for DB"
            >
              <option value="">Select Zone</option>
              {zoneManagement.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.rooms.length} rooms)
                </option>
              ))}
            </select>
          )}
          {errors.zone && (
            <p className="text-red-500 text-[11px] mb-2">{errors.zone}</p>
          )}
        </div>

        {/* Zone Details Display */}
        {selectedZoneForDB && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-[12px] font-semibold text-blue-800 mb-2">
              Zone Details:{" "}
              {zoneManagement.find((z) => z.id === selectedZoneForDB)?.name}
            </h4>
            <div className="text-[11px] text-blue-700 space-y-1">
              <div className="flex justify-between">
                <span>Total Circuits:</span>
                <span className="font-medium">
                  {Object.keys(circuits).length > 0
                    ? Object.keys(circuits).length
                    : "No circuits generated yet"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Rooms in Zone:</span>
                <span className="font-medium text-lg">
                  {zoneManagement.find((z) => z.id === selectedZoneForDB)?.rooms
                    .length || 0}
                </span>
              </div>
              {Object.keys(circuits).length > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <span className="font-medium">Circuit Details:</span>
                  <div className="mt-1 space-y-1">
                    {Object.values(circuits).map((circuit, index) => (
                      <div
                        key={index}
                        className="text-[10px] bg-blue-100 p-1 rounded"
                      >
                        <span className="font-medium">
                          Circuit {index + 1}:
                        </span>{" "}
                        {circuit.fixtures?.length || 0} fixtures,{" "}
                        {circuit.load || 0}W
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(circuits).length === 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="text-[10px] bg-yellow-100 p-2 rounded text-yellow-800">
                    <p>
                      <strong>⚠️ Warning:</strong>
                    </p>
                    <p>No circuits generated for this zone yet.</p>
                    <p>
                      Please generate circuits in Circuiting Management first.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DB Creation Form - Only show after zone is selected */}
        {selectedZoneForDB && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-[12px] font-medium text-gray-700 mb-3">
              Create New DB
            </h4>

            {/* DB Name */}
            <div className="mb-3">
              <p className="text-[11px] text-black mb-1">DB Name</p>
              <input
                type="text"
                value={currentDbName}
                onChange={(e) => {
                  setCurrentDbName(e.target.value);
                  setErrors((prev) => ({ ...prev, dbName: "" }));
                }}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-white"
                placeholder="Enter DB name"
                aria-label="DB Name input"
              />
              {errors.dbName && (
                <p className="text-red-500 text-[11px] mt-1">{errors.dbName}</p>
              )}
            </div>

            {/* DB Load */}
            <div className="mb-3">
              <p className="text-[11px] text-black mb-1">DB Load</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={currentDbLoad}
                  onChange={(e) => {
                    setCurrentDbLoad(e.target.value);
                    setErrors((prev) => ({ ...prev, dbLoad: "" }));
                  }}
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-white"
                  placeholder="Load value"
                  aria-label="DB Load input"
                />
                <select
                  value={currentDbLoadUnit}
                  onChange={(e) => setCurrentDbLoadUnit(e.target.value)}
                  className="w-20 border border-gray-200 rounded-md px-2 py-2 text-[13px] bg-white"
                  aria-label="DB Load Unit select"
                >
                  <option>W</option>
                  <option>KW</option>
                </select>
              </div>
              {errors.dbLoad && (
                <p className="text-red-500 text-[11px] mt-1">{errors.dbLoad}</p>
              )}
            </div>

            <button
              onClick={handleAddDb}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 text-[13px] rounded-md transition-colors"
              type="button"
            >
              Add DB
            </button>
          </div>
        )}

        {/* DBs Display - Show all created DBs for the zone */}
        {dbs.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-[12px] font-medium text-gray-700">
              Created DBs
            </h4>
            {dbs.map((db) => (
              <div
                key={db.id}
                className="p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[13px] font-medium text-gray-800">
                    {db.name}
                  </h5>
                  <span className="text-[11px] text-gray-600">
                    {db.load} {db.loadUnit}
                  </span>
                </div>

                {/* Circuit Assignment */}
                <div className="mb-3">
                  <p className="text-[11px] text-gray-600 mb-1">
                    Assign Circuits:
                  </p>
                  <select
                    onChange={(e) => handleAssignCircuit(db.id, e.target.value)}
                    className="w-full text-[11px] border border-gray-200 rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="">Select Circuit</option>
                    {getAvailableCircuits(db.id).map((circuit) => (
                      <option key={circuit.circuitId} value={circuit.circuitId}>
                        {circuit.displayName || circuit.circuitId} (
                        {circuit.fixtures?.length || 0} fixtures)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Circuits */}
                {db.circuits.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-600">
                      Assigned Circuits:
                    </p>
                    {db.circuits.map((circuitId) => {
                      const circuit = Object.values(circuits).find(
                        (c) => c.circuitId === circuitId
                      );
                      return (
                        <div
                          key={circuitId}
                          className="flex items-center justify-between text-[10px] bg-gray-100 p-1 rounded"
                        >
                          <span>{circuit?.displayName || circuitId}</span>
                          <button
                            onClick={() =>
                              handleRemoveCircuit(db.id, circuitId)
                            }
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Remove circuit"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confirm All DBs Button */}
        {dbs.length > 0 && (
          <div className="mt-4">
            <button
              onClick={handleConfirmAllDBs}
              className="w-full text-white bg-green-600 hover:bg-green-700 px-4 py-3 text-[14px] rounded-md font-medium"
              type="button"
            >
              Confirm All DBs ({dbs.length})
            </button>
          </div>
        )}
      </div>

      {/* Canvas Side */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default DbDetailForm;
