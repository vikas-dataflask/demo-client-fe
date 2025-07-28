import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { ReloadIcon } from "../../icons/ReloadIcon";
import {
  useAddHeatLoadMutation,
  useAddHeatLoadToDbMutation,
  useUpdateHeatLoadInDbMutation,
  useGetProjectListQuery,
  useGetHeatLoadAutofillQuery,
} from "../../redux/features/api/api";
import { setRoomHeatLoad } from "../../redux/features/app/heatLoadSlice";
import FloorPreview from "../shared/FloorPreview";

const defaultWall = { area: "", uValue: "", deltaT: "" };
const defaultWindow = { area: "", sc: "", shgf: "" };
const defaultPerson = { count: "", sensible: "", latent: "" };
const defaultEquipment = { power: "", diversity: "" };
const defaultRoof = { area: "", uValue: "", deltaT: "" };
const defaultLighting = { watts: "", cuf: "", llf: "" };
const defaultInfiltration = { ach: "", volume: "", deltaT: "", latent: "" };
const defaultSunGainComponent = {
  name: "",
  summerSunGain: "",
  monsoonSunGain: "",
  area: "",
  partGlassArea: "",
  cfm: "",
};

const HeatLoad = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams(); // Get projectId from URL parameters
  const [addHeatLoad, { isLoading }] = useAddHeatLoadMutation();
  const [addHeatLoadToDb] = useAddHeatLoadToDbMutation();
  const [updateHeatLoadInDb] = useUpdateHeatLoadInDbMutation();
  const { data: projectList, isLoading: isProjectLoading } =
    useGetProjectListQuery();
  const currentProjectId = projectId; // Use the projectId from URL

  const [formData, setFormData] = useState({
    room: "",
    area: "",
    areaUnit: "Sq. m.",
    height: "",
    heightUnit: "m",
    occupancy: "",
    occupancyUnit: "Nos",
    sensibleHeatOfPeople: "",
    sensibleHeatOfPeopleUnit: "W/Person",
    lightLoad: "",
    lightLoadUnit: "Watts",
    heatDissipation: "",
    heatDissipationUnit: "W",
    cfmSqft: "",
    cfmSqftUnit: "CFM/Sqft",
    cfmPerson: "",
    cfmPersonUnit: "CFM/Person",
    sensibleHeat: "",
    sensibleHeatUnit: "W",
    latentHeat: "",
    latentHeatUnit: "W",
    internalHeat: "",
    internalHeatUnit: "W",
    roomLatentHeat: "",
    roomLatentHeatUnit: "W",
    relativeHumidity: "",
    outsideDryBulb: "",
    // Summer conditions - now editable
    summerOutsideDb: "110",
    summerOutsideWb: "75",
    summerOutsideRh: "20",
    summerOutsideGrLb: "74.8",
    summerRoomDb: "75",
    summerRoomWb: "",
    summerRoomRh: "50",
    summerRoomGrLb: "65",
    // Monsoon conditions - now editable
    monsoonOutsideDb: "110",
    monsoonOutsideWb: "75",
    monsoonOutsideRh: "20",
    monsoonOutsideGrLb: "74.8",
    monsoonRoomDb: "75",
    monsoonRoomWb: "",
    monsoonRoomRh: "50",
    monsoonRoomGrLb: "65",
    // New fields for backend
    walls: [{ ...defaultWall }],
    windows: [{ ...defaultWindow }],
    roof: { ...defaultRoof },
    people: [{ ...defaultPerson }],
    equipment: [{ ...defaultEquipment }],
    lighting: { ...defaultLighting },
    infiltration: { ...defaultInfiltration },
    sunGainComponents: [{ ...defaultSunGainComponent }],
    safetyFactor: 1.15,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [roomDetailsOpen, setRoomDetailsOpen] = useState(true);
  const [sunGainOpen, setSunGainOpen] = useState(true);
  const [internalOpen, setInternalOpen] = useState(true);
  const [summerConditionsOpen, setSummerConditionsOpen] = useState(false);
  const [monsoonConditionsOpen, setMonsoonConditionsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { data: autofillData } = useGetHeatLoadAutofillQuery(
    { project_id: currentProjectId, room: formData.room },
    { skip: !currentProjectId || !formData.room }
  );

  const rooms = useSelector((state) => state.rooms);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "room") {
      const selectedRoom = rooms.find(
        (room) => room.name === value || room.id === value
      );
      if (selectedRoom) {
        setFormData((prev) => ({
          ...prev,
          room: value,
          area: selectedRoom.area || "",
          height: selectedRoom.roomHeight || "",
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers for dynamic arrays
  const handleArrayChange = (type, idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  };
  const handleAddArrayItem = (type, defaultObj) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { ...defaultObj }],
    }));
  };
  const handleRemoveArrayItem = (type, idx) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== idx),
    }));
  };
  const handleObjectChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  // Sun gain calculation handler
  const handleSunGainCalculate = () => {
    const sunGainComponents = formData.sunGainComponents.filter(
      (component) => component.name
    );

    if (sunGainComponents.length === 0) {
      setError("Please add at least one sun gain component with name");
      return;
    }

    if (!formData.area) {
      setError("Please enter room area for sun gain calculation");
      return;
    }

    // Get temperature differences from form data
    const summerTempDiff =
      Number(formData.summerOutsideDb) - Number(formData.summerRoomDb);
    const monsoonTempDiff =
      Number(formData.monsoonOutsideDb) - Number(formData.monsoonRoomDb);
    const TOTAL_CFM =
      Number(formData.area) * Number(formData.cfmSqft) +
      Number(formData.occupancy) * Number(formData.cfmPerson);

    // Constants for sun gain calculations
    const GLASS_CONSTANT = 0.56;
    const WALL_CONSTANT = 0.36;
    const PART_GLASS_CONSTANT = 1.13;
    const PART_WALL_CONSTANT = 0.32;
    const CEILING_CONSTANT = 0.38;
    const FLOOR_CONSTANT = 0.46;
    const INFILTRATION_CONSTANT = 1.08;
    const OUTSIDE_AIR_CONSTANT = 0.12;
    const OUTSIDE_AIR_DENSITY_CONSTANT = 1.08;

    const results = sunGainComponents.map((component) => {
      // Determine constant and calculation method based on component name
      const componentName = component.name.toLowerCase();
      let summerSunGain = 0;
      let monsoonSunGain = 0;
      let constant = WALL_CONSTANT; // default
      let calculationType = "standard";

      if (componentName.includes("part-glass")) {
        // Part-Glass calculation: area * (temp diff - 10) * 1.13
        constant = PART_GLASS_CONSTANT;
        calculationType = "part-glass";
        const partGlassArea = Number(component.area || formData.area);
        summerSunGain = partGlassArea * (summerTempDiff - 10) * constant;
        monsoonSunGain = partGlassArea * (monsoonTempDiff - 10) * constant;
      } else if (componentName.includes("part-wall")) {
        // Part-Wall calculation: (wall area - glass area) * (temp diff - 10) * 0.32
        constant = PART_WALL_CONSTANT;
        calculationType = "part-wall";
        const partWallArea = Number(component.area || formData.area);
        const partGlassArea = Number(component.partGlassArea || 0);
        const effectiveWallArea = partWallArea - partGlassArea;
        summerSunGain = effectiveWallArea * (summerTempDiff - 10) * constant;
        monsoonSunGain = effectiveWallArea * (monsoonTempDiff - 10) * constant;
      } else if (
        componentName.includes("glass") ||
        componentName.includes("window") ||
        componentName.includes("glazing")
      ) {
        // Standard glass calculation
        constant = GLASS_CONSTANT;
        summerSunGain =
          Number(component.summerSunGain || 0) *
          Number(formData.area) *
          constant;
        monsoonSunGain =
          Number(component.monsoonSunGain || 0) *
          Number(formData.area) *
          constant;
      } else if (
        componentName.includes("wall") &&
        !componentName.includes("part-wall")
      ) {
        // Standard wall calculation
        constant = WALL_CONSTANT;
        summerSunGain =
          Number(component.summerSunGain || 0) *
          Number(formData.area) *
          constant;
        monsoonSunGain =
          Number(component.monsoonSunGain || 0) *
          Number(formData.area) *
          constant;
        // Part-Glass calculation: area * (temp diff - 10) * 1.13
        constant = PART_GLASS_CONSTANT;
        calculationType = "part-glass";
        const partGlassArea = Number(component.area || formData.area);
        summerSunGain = partGlassArea * (summerTempDiff - 10) * constant;
        monsoonSunGain = partGlassArea * (monsoonTempDiff - 10) * constant;
      } else if (componentName.includes("part-wall")) {
        // Part-Wall calculation: (wall area - glass area) * (temp diff - 10) * 0.32
        constant = PART_WALL_CONSTANT;
        calculationType = "part-wall";
        const partWallArea = Number(component.area || formData.area);
        const partGlassArea = Number(component.partGlassArea || 0);
        const effectiveWallArea = partWallArea - partGlassArea;
        summerSunGain = effectiveWallArea * (summerTempDiff - 10) * constant;
        monsoonSunGain = effectiveWallArea * (monsoonTempDiff - 10) * constant;
      } else if (componentName.includes("ceiling")) {
        // Ceiling calculation: area * (temp diff - 10) * 0.38
        constant = CEILING_CONSTANT;
        calculationType = "ceiling";
        const ceilingArea = Number(component.area || formData.area);
        summerSunGain = ceilingArea * (summerTempDiff - 10) * constant;
        monsoonSunGain = ceilingArea * (monsoonTempDiff - 10) * constant;
      } else if (componentName.includes("floor")) {
        // Floor calculation: area * (temp diff - 10) * 0.46
        constant = FLOOR_CONSTANT;
        calculationType = "floor";
        const floorArea = Number(component.area || formData.area);
        summerSunGain = floorArea * (summerTempDiff - 10) * constant;
        monsoonSunGain = floorArea * (monsoonTempDiff - 10) * constant;
      } else if (componentName.includes("infiltration")) {
        // Infiltration calculation: area * temp diff * 1.08
        constant = INFILTRATION_CONSTANT;
        calculationType = "infiltration";
        const infiltrationArea = Number(component.area || formData.area);
        summerSunGain = infiltrationArea * summerTempDiff * constant;
        monsoonSunGain = infiltrationArea * monsoonTempDiff * constant;
      } else if (
        componentName.includes("outside air") ||
        componentName.includes("outside-air")
      ) {
        // Outside air calculation: CFM * temp diff * 0.12 * 1.08
        constant = OUTSIDE_AIR_CONSTANT * OUTSIDE_AIR_DENSITY_CONSTANT;
        calculationType = "outside-air";
        const componentCFM = Number(component.cfm || TOTAL_CFM);
        summerSunGain =
          componentCFM *
          summerTempDiff *
          OUTSIDE_AIR_CONSTANT *
          OUTSIDE_AIR_DENSITY_CONSTANT;
        monsoonSunGain =
          componentCFM *
          monsoonTempDiff *
          OUTSIDE_AIR_CONSTANT *
          OUTSIDE_AIR_DENSITY_CONSTANT;
      } else {
        // Default to standard wall calculation
        constant = WALL_CONSTANT;
        summerSunGain =
          Number(component.summerSunGain || 0) *
          Number(formData.area) *
          constant;
        monsoonSunGain =
          Number(component.monsoonSunGain || 0) *
          Number(formData.area) *
          constant;
      }

      return {
        name: component.name,
        summerSunGain: parseFloat(summerSunGain.toFixed(2)),
        monsoonSunGain: parseFloat(monsoonSunGain.toFixed(2)),
        constant: constant,
        calculationType: calculationType,
      };
    });

    const totalSummerSunGain = results.reduce(
      (sum, result) => sum + result.summerSunGain,
      0
    );
    const totalMonsoonSunGain = results.reduce(
      (sum, result) => sum + result.monsoonSunGain,
      0
    );

    // Store results in form data for later use
    setFormData((prev) => ({
      ...prev,
      sunGainResults: {
        components: results,
        totalSummerSunGain: parseFloat(totalSummerSunGain.toFixed(2)),
        totalMonsoonSunGain: parseFloat(totalMonsoonSunGain.toFixed(2)),
      },
    }));

    setError(null);
  };

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    try {
      // Define summer and monsoon condition objects using form data
      const summer = {
        outside_db: Number(formData.summerOutsideDb) || 110,
        room_db: Number(formData.summerRoomDb) || 75,
        outside_rh: Number(formData.summerOutsideRh) || 20,
        room_rh: Number(formData.summerRoomRh) || 50,
        outside_gr_lb: Number(formData.summerOutsideGrLb) || 74.8,
        room_gr_lb: Number(formData.summerRoomGrLb) || 65,
      };

      const monsoon = {
        outside_db: Number(formData.monsoonOutsideDb) || 110,
        room_db: Number(formData.monsoonRoomDb) || 75,
        outside_rh: Number(formData.monsoonOutsideRh) || 20,
        room_rh: Number(formData.monsoonRoomRh) || 50,
        outside_gr_lb: Number(formData.monsoonOutsideGrLb) || 74.8,
        room_gr_lb: Number(formData.monsoonRoomGrLb) || 65,
      };

      // Compose backend payload from frontend fields
      const payload = {
        summer,
        monsoon,
        area: Number(formData.area) || 0,
        height: Number(formData.height) || 0,
        people: Number(formData.occupancy) || 0,
        sensible_heat_people: Number(formData.sensibleHeatOfPeople) || 0,
        light: Number(formData.lightLoad) || 0,
        equipment: Number(formData.heatDissipation) || 0,
        cfm_sqft: Number(formData.cfmSqft) || 0,
        cfm_person: Number(formData.cfmPerson) || 0,
        latent_heat_people: Number(formData.latentHeat) || 0,
        internal_heat: Number(formData.internalHeat) || 0,
        sunGainComponents: formData.sunGainComponents
          .filter((component) => component.name)
          .map((component) => ({
            name: component.name,
            summerSunGain: Number(component.summerSunGain) || 0,
            monsoonSunGain: Number(component.monsoonSunGain) || 0,
            area: Number(component.area) || 0,
            partGlassArea: Number(component.partGlassArea) || 0,
            cfm: Number(component.cfm) || 0,
          })),
      };

      console.log("Sending payload to backend:", payload);

      // Call backend API
      const response = await addHeatLoad(payload).unwrap();

      if (response && response.success && response.data) {
        const resultData = response.data;
        setResult(resultData);

        // Auto-fill the calculated values back to the form
        if (resultData.summer) {
          setFormData((prev) => ({
            ...prev,
            sensibleHeat: resultData.summer.sensible_heat.toString(),
            latentHeat: resultData.summer.latent_heat.toString(),
            internalHeat: resultData.summer.internal_heat.toString(),
            roomLatentHeat: resultData.summer.room_latent_heat.toString(),
          }));
        }

        if (formData.room) {
          dispatch(
            setRoomHeatLoad({
              roomName: formData.room,
              result: resultData,
            })
          );
        }

        // Save or update data in database
        await saveOrUpdateHeatLoadData(resultData);
      } else {
        throw new Error(response?.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Heat load calculation error:", error);
      setError(
        error?.data?.message ||
          error?.message ||
          "Failed to calculate heat load"
      );
    }
  };

  // Helper function to save or update heatload data
  const saveOrUpdateHeatLoadData = async (resultData) => {
    try {
      // Check if data already exists for this room
      const hasExistingData = autofillData?.data?.input_data;

      if (hasExistingData) {
        console.log("Updating existing heatload data for room:", formData.room);
        // Update existing data
        await updateHeatLoadInDb({
          project_id: currentProjectId,
          room: formData.room,
          input_data: formData,
          result_data: resultData,
        });
        console.log("Heatload data updated successfully");
      } else {
        console.log("Saving new heatload data for room:", formData.room);
        // Save new data
        await addHeatLoadToDb({
          project_id: currentProjectId,
          input_data: formData,
          result_data: resultData,
        });
        console.log("Heatload data saved successfully");
      }
    } catch (error) {
      console.error("Error saving/updating heatload data:", error);
      // Don't throw error here to avoid breaking the calculation flow
      // Just log the error for debugging
    }
  };

  // Function to manually update existing data without recalculating
  const handleManualUpdate = async () => {
    if (!formData.room) {
      setError("Please select a room first");
      return;
    }

    if (!result) {
      setError("Please calculate heat load first");
      return;
    }

    try {
      console.log("Manually updating heatload data for room:", formData.room);
      await updateHeatLoadInDb({
        project_id: currentProjectId,
        room: formData.room,
        input_data: formData,
        result_data: result,
      });
      console.log("Heatload data manually updated successfully");
      setError(null);
    } catch (error) {
      console.error("Error manually updating heatload data:", error);
      setError("Failed to update heatload data");
    }
  };

  useEffect(() => {
    console.log("Autofill data received:", autofillData);
    if (autofillData?.data?.input_data) {
      console.log(
        "Setting form data with autofill:",
        autofillData.data.input_data
      );
      setFormData((prev) => ({
        ...prev,
        ...autofillData.data.input_data,
      }));
      setResult(autofillData.data.result_data);
    }
  }, [autofillData]);

  return (
    <div className="flex h-screen">
      <div className="bg-white px-4 pt-4 pb-6 border-r border-gray-200 w-[500px] font-sans text-[13px] overflow-hidden relative h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 sticky top-0 bg-white z-10 pb-3">
          <div>
            <h2 className="font-semibold text-[#1E1E1E] text-[14px] leading-none">
              Heat Load
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">No update yet</p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={() => window.location.reload()}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        <div className="border-b border-gray-200 mb-3" />

        {/* Room Details Accordion */}
        <div className="flex-1 overflow-y-auto pb-[80px] bg-white">
          <div>
            <button
              onClick={() => setRoomDetailsOpen(!roomDetailsOpen)}
              className="flex items-center gap-2 text-black font-medium mb-3"
            >
              <span className="text-xs">{roomDetailsOpen ? "▾" : "▸"}</span>{" "}
              Room Details
            </button>

            {roomDetailsOpen && (
              <div className="space-y-[14px]">
                {/* Section 1 */}
                <div className="border border-gray-200 rounded-[10px] p-[12px] bg-white space-y-[12px]">
                  <label className="text-[#444] block">Room</label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    className="w-full p-2 rounded-[8px] text-[13px] bg-gray-200"
                  >
                    <option value="">Select a Room</option>
                    {rooms.map((room, index) => (
                      <option key={room.id || index} value={room.name}>
                        {room.name}
                      </option>
                    ))}
                  </select>

                  {/* AREA FIELD */}
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">Area</label>
                    <div className="flex gap-2">
                      {formData.room ? (
                        <div className="w-2/3 p-2 rounded-[8px] text-[13px] bg-gray-200">
                          {formData.area}
                        </div>
                      ) : (
                        <input
                          type="number"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          placeholder="Area"
                          className="w-2/3 p-2 rounded-[8px] text-[13px] bg-gray-200"
                        />
                      )}
                      <select
                        name="areaUnit"
                        value={formData.areaUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px] text-[13px] bg-gray-200"
                      >
                        <option>Sq. m.</option>
                        <option>Sq. ft.</option>
                      </select>
                    </div>
                  </div>

                  {/* HEIGHT FIELD */}
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">Height</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Height"
                        className="w-2/3 p-2 rounded-[8px] text-[13px] bg-gray-200"
                      />
                      <select
                        name="heightUnit"
                        value={formData.heightUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px] text-[13px] bg-gray-200"
                      >
                        <option>m</option>
                        <option>ft</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="border border-gray-200 rounded-[10px] p-[12px] bg-white space-y-[12px]">
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">Occupancy</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="occupancy"
                        value={formData.occupancy}
                        onChange={handleChange}
                        placeholder="Occupancy"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="occupancyUnit"
                        value={formData.occupancyUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>Nos</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">
                      Sensible heat of People
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="sensibleHeatOfPeople"
                        value={formData.sensibleHeatOfPeople}
                        onChange={handleChange}
                        placeholder="Sensible heat of People"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="sensibleHeatOfPeopleUnit"
                        value={formData.sensibleHeatOfPeopleUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>X</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">Light Load</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="lightLoad"
                        value={formData.lightLoad}
                        onChange={handleChange}
                        placeholder="Light Load"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="lightLoadUnit"
                        value={formData.lightLoadUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>W</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">
                      Equipment Heat Dissipation
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="heatDissipation"
                        value={formData.heatDissipation}
                        onChange={handleChange}
                        placeholder="Heat Dissipation"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="heatDissipationUnit"
                        value={formData.heatDissipationUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>W</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="border border-gray-200 rounded-[10px] p-[12px] bg-white space-y-[12px]">
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">CFM per Sqft</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="cfmSqft"
                        value={formData.cfmSqft}
                        onChange={handleChange}
                        placeholder="CFM/Sqft"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="cfmSqftUnit"
                        value={formData.cfmSqftUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>CFM/Sqft</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">CFM per Person</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="cfmPerson"
                        value={formData.cfmPerson}
                        onChange={handleChange}
                        placeholder="CFM/Person"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="cfmPersonUnit"
                        value={formData.cfmPersonUnit}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>CFM/Person</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sun Gain Components Accordion */}
          <div className="mt-5">
            <button
              onClick={() => setSunGainOpen(!sunGainOpen)}
              className="flex items-center gap-2 text-black font-medium mb-3"
            >
              <span className="text-xs">{sunGainOpen ? "▾" : "▸"}</span> Sun
              Gain Components
            </button>

            {sunGainOpen && (
              <div className="space-y-[14px]">
                {/* Sun Gain Components List */}
                {formData.sunGainComponents.map((component, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-[10px] p-[12px] bg-white space-y-[12px]"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-[#444] font-medium">
                        Component {index + 1}
                      </h4>
                      {formData.sunGainComponents.length > 1 && (
                        <button
                          onClick={() =>
                            handleRemoveArrayItem("sunGainComponents", index)
                          }
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Component Name */}
                    <div className="space-y-[6px]">
                      <label className="text-[#444] block">
                        Component Name
                      </label>
                      <input
                        type="text"
                        value={component.name}
                        onChange={(e) =>
                          handleArrayChange(
                            "sunGainComponents",
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Window, Wall, Part-Glass, Ceiling, Floor, Infiltration, Outside Air"
                        className="w-full p-2 rounded-[8px] text-[13px] bg-gray-200"
                      />
                    </div>

                    {/* Component Area (for specific calculations) */}
                    <div className="space-y-[6px]">
                      <label className="text-[#444] block">
                        Component Area (optional)
                      </label>
                      <input
                        type="number"
                        value={component.area}
                        onChange={(e) =>
                          handleArrayChange(
                            "sunGainComponents",
                            index,
                            "area",
                            e.target.value
                          )
                        }
                        placeholder="Component Area (uses room area if empty)"
                        className="w-full p-2 rounded-[8px] text-[13px] bg-gray-200"
                      />
                    </div>

                    {/* Part Glass Area (for Part-Wall calculations) */}
                    {component.name.toLowerCase().includes("part-wall") && (
                      <div className="space-y-[6px]">
                        <label className="text-[#444] block">
                          Part Glass Area
                        </label>
                        <input
                          type="number"
                          value={component.partGlassArea}
                          onChange={(e) =>
                            handleArrayChange(
                              "sunGainComponents",
                              index,
                              "partGlassArea",
                              e.target.value
                            )
                          }
                          placeholder="Part Glass Area"
                          className="w-full p-2 rounded-[8px] text-[13px] bg-gray-200"
                        />
                      </div>
                    )}

                    {/* CFM (for Outside Air calculations) */}
                    {(component.name.toLowerCase().includes("outside air") ||
                      component.name.toLowerCase().includes("outside-air")) && (
                      <div className="space-y-[6px]">
                        <label className="text-[#444] block">
                          CFM (optional)
                        </label>
                        <input
                          type="number"
                          value={component.cfm}
                          onChange={(e) =>
                            handleArrayChange(
                              "sunGainComponents",
                              index,
                              "cfm",
                              e.target.value
                            )
                          }
                          placeholder="CFM (uses calculated CFM if empty)"
                          className="w-full p-2 rounded-[8px] text-[13px] bg-gray-200"
                        />
                      </div>
                    )}

                    {/* Summer Sun Gain (for standard calculations) */}
                    {!component.name.toLowerCase().includes("part-glass") &&
                      !component.name.toLowerCase().includes("part-wall") &&
                      !component.name.toLowerCase().includes("ceiling") &&
                      !component.name.toLowerCase().includes("floor") &&
                      !component.name.toLowerCase().includes("infiltration") &&
                      !component.name.toLowerCase().includes("outside air") &&
                      !component.name.toLowerCase().includes("outside-air") && (
                        <>
                          <div className="space-y-[6px]">
                            <label className="text-[#444] block">
                              Summer Sun Gain
                            </label>
                            <input
                              type="number"
                              value={component.summerSunGain}
                              onChange={(e) =>
                                handleArrayChange(
                                  "sunGainComponents",
                                  index,
                                  "summerSunGain",
                                  e.target.value
                                )
                              }
                              placeholder="Summer Sun Gain"
                              className="w-full p-2 rounded-[8px] text-[13px] bg-gray-200"
                            />
                          </div>

                          <div className="space-y-[6px]">
                            <label className="text-[#444] block">
                              Monsoon Sun Gain
                            </label>
                            <input
                              type="number"
                              value={component.monsoonSunGain}
                              onChange={(e) =>
                                handleArrayChange(
                                  "sunGainComponents",
                                  index,
                                  "monsoonSunGain",
                                  e.target.value
                                )
                              }
                              placeholder="Monsoon Sun Gain"
                              className="w-full p-2 rounded-[8px] text-[13px] bg-gray-200"
                            />
                          </div>
                        </>
                      )}
                  </div>
                ))}

                {/* Add Component Button */}
                <button
                  onClick={() =>
                    handleAddArrayItem(
                      "sunGainComponents",
                      defaultSunGainComponent
                    )
                  }
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-[10px] text-gray-500 hover:border-gray-400 hover:text-gray-600 transition"
                >
                  + Add Sun Gain Component
                </button>

                {/* Calculate Sun Gain Button */}
                <button
                  onClick={handleSunGainCalculate}
                  className="w-full py-2 bg-blue-600 text-white rounded-[10px] font-medium hover:bg-blue-700 transition"
                >
                  Calculate Sun Gain
                </button>

                {/* Sun Gain Results */}
                {formData.sunGainResults && (
                  <div className="border border-blue-200 rounded-[10px] p-[12px] bg-blue-50 space-y-[12px]">
                    <h4 className="text-blue-800 font-medium">
                      Sun Gain Results
                    </h4>

                    {/* Component Results */}
                    {formData.sunGainResults.components.map((result, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <div className="font-medium text-sm">{result.name}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                          <div>Summer: {result.summerSunGain} Btu/hr</div>
                          <div>Monsoon: {result.monsoonSunGain} Btu/hr</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Constant used: {result.constant} (
                          {result.constant === 0.56
                            ? "Glass"
                            : result.constant === 0.36
                            ? "Wall"
                            : result.constant === 1.13
                            ? "Part-Glass"
                            : result.constant === 0.32
                            ? "Part-Wall"
                            : result.constant === 0.38
                            ? "Ceiling"
                            : result.constant === 0.46
                            ? "Floor"
                            : result.constant === 1.08
                            ? "Infiltration"
                            : "Outside Air"}
                          )
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {result.calculationType}
                        </div>
                      </div>
                    ))}

                    {/* Total Results */}
                    <div className="border-t border-blue-200 pt-2">
                      <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                        <div className="bg-blue-100 p-2 rounded">
                          Total Summer:{" "}
                          {formData.sunGainResults.totalSummerSunGain} Btu/hr
                        </div>
                        <div className="bg-blue-100 p-2 rounded">
                          Total Monsoon:{" "}
                          {formData.sunGainResults.totalMonsoonSunGain} Btu/hr
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Additional Accordions */}
          <div className="mt-5 space-y-[10px]">
            {/* Internal Heat Accordion */}
            <div className="mt-4">
              <button
                onClick={() => setInternalOpen(!internalOpen)}
                className="flex items-center gap-2 text-black font-medium mb-3"
              >
                <span className="text-xs">{internalOpen ? "▾" : "▸"}</span>{" "}
                Internal Heat (People)
              </button>

              {internalOpen && (
                <div className="border border-gray-200 rounded-[10px] p-[12px] bg-white space-y-[12px]">
                  {/* Room Sensible Heat */}
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">
                      Room Sensible Heat
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="sensibleHeat"
                        value={formData.sensibleHeat || ""}
                        onChange={handleChange}
                        placeholder="Sensible Heat"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="sensibleHeatUnit"
                        value={formData.sensibleHeatUnit || "W"}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>W</option>
                      </select>
                    </div>
                  </div>

                  {/*  Latent Heat */}
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">Latent Heat</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="latentHeat"
                        value={formData.latentHeat || ""}
                        onChange={handleChange}
                        placeholder="Latent Heat"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="latentHeatUnit"
                        value={formData.latentHeatUnit || "W"}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>W</option>
                      </select>
                    </div>
                  </div>

                  {/* Internal Heat */}
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">Internal Heat</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="internalHeat"
                        value={formData.internalHeat || ""}
                        onChange={handleChange}
                        placeholder="Internal Heat"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="internalHeatUnit"
                        value={formData.internalHeatUnit || "W"}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>W</option>
                      </select>
                    </div>
                  </div>

                  {/* Room Latent Heat */}
                  <div className="space-y-[6px]">
                    <label className="text-[#444] block">
                      Room Latent Heat
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="roomLatentHeat"
                        value={formData.roomLatentHeat || ""}
                        onChange={handleChange}
                        placeholder="Room Latent Heat"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="roomLatentHeatUnit"
                        value={formData.roomLatentHeatUnit || "W"}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>W</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Summer accordian */}
            <div className="mt-4">
              <button
                onClick={() => setSummerConditionsOpen(!summerConditionsOpen)}
                className="flex items-center gap-2 text-black font-medium mb-3"
              >
                <span className="text-[16px]">
                  {summerConditionsOpen ? "▾" : "▸"}
                </span>
                <span className="text-[14px] font-medium">
                  Summer Conditions
                </span>
              </button>

              {summerConditionsOpen && (
                <div className="w-full">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 text-[13px] text-[#5B5B5B] font-medium bg-[#E4E4E4] w-full">
                    <div className="py-2 text-center border-r border-[#CFCFCF]">
                      DB (°F)
                    </div>
                    <div className="py-2 text-center border-r border-[#CFCFCF]">
                      WB (°F)
                    </div>
                    <div className="py-2 text-center border-r border-[#CFCFCF]">
                      % RH
                    </div>
                    <div className="py-2 text-center">GR/LB</div>
                  </div>

                  {/* Outside (OA) */}
                  <div className="mt-[14px] text-[13px] text-black">
                    Outside (OA)
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <input
                      type="number"
                      name="summerOutsideDb"
                      value={formData.summerOutsideDb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="summerOutsideWb"
                      value={formData.summerOutsideWb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="summerOutsideRh"
                      value={formData.summerOutsideRh}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="summerOutsideGrLb"
                      value={formData.summerOutsideGrLb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Room (RM) */}
                  <div className="mt-[14px] text-[13px] text-black">
                    Room (RM)
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <input
                      type="number"
                      name="summerRoomDb"
                      value={formData.summerRoomDb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="summerRoomWb"
                      value={formData.summerRoomWb}
                      onChange={handleChange}
                      placeholder="--"
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="summerRoomRh"
                      value={formData.summerRoomRh}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="summerRoomGrLb"
                      value={formData.summerRoomGrLb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Divider Line */}
                  <div className="h-[1px] bg-[#E4E4E4] my-[20px]" />

                  {/* Difference */}
                  <div className="text-[13px] text-black">Difference</div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      {Number(formData.summerOutsideDb) -
                        Number(formData.summerRoomDb)}
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      --
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      {Number(formData.summerOutsideRh) -
                        Number(formData.summerRoomRh)}
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      {(
                        Number(formData.summerOutsideGrLb) -
                        Number(formData.summerRoomGrLb)
                      ).toFixed(1)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Monsoon accordian */}
            <div className="mt-4">
              <button
                onClick={() => setMonsoonConditionsOpen(!monsoonConditionsOpen)}
                className="flex items-center gap-2 text-black font-medium mb-3"
              >
                <span className="text-[16px]">
                  {monsoonConditionsOpen ? "▾" : "▸"}
                </span>
                <span className="text-[14px] font-medium">
                  Monsoon Conditions
                </span>
              </button>

              {monsoonConditionsOpen && (
                <div className="w-full">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 text-[13px] text-[#5B5B5B] font-medium bg-[#E4E4E4] w-full">
                    <div className="py-2 text-center border-r border-[#CFCFCF]">
                      DB (°F)
                    </div>
                    <div className="py-2 text-center border-r border-[#CFCFCF]">
                      WB (°F)
                    </div>
                    <div className="py-2 text-center border-r border-[#CFCFCF]">
                      % RH
                    </div>
                    <div className="py-2 text-center">GR/LB</div>
                  </div>

                  {/* Outside (OA) */}
                  <div className="mt-[14px] text-[13px] text-black">
                    Outside (OA)
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <input
                      type="number"
                      name="monsoonOutsideDb"
                      value={formData.monsoonOutsideDb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="monsoonOutsideWb"
                      value={formData.monsoonOutsideWb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="monsoonOutsideRh"
                      value={formData.monsoonOutsideRh}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="monsoonOutsideGrLb"
                      value={formData.monsoonOutsideGrLb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Room (RM) */}
                  <div className="mt-[14px] text-[13px] text-black">
                    Room (RM)
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <input
                      type="number"
                      name="monsoonRoomDb"
                      value={formData.monsoonRoomDb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="monsoonRoomWb"
                      value={formData.monsoonRoomWb}
                      onChange={handleChange}
                      placeholder="--"
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="monsoonRoomRh"
                      value={formData.monsoonRoomRh}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="monsoonRoomGrLb"
                      value={formData.monsoonRoomGrLb}
                      onChange={handleChange}
                      className="bg-[#F2F2F2] text-center py-[6px] text-[14px] border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Divider Line */}
                  <div className="h-[1px] bg-[#E4E4E4] my-[20px]" />

                  {/* Difference */}
                  <div className="text-[13px] text-black">Difference</div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      {Number(formData.monsoonOutsideDb) -
                        Number(formData.monsoonRoomDb)}
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      --
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      {Number(formData.monsoonOutsideRh) -
                        Number(formData.monsoonRoomRh)}
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      {(
                        Number(formData.monsoonOutsideGrLb) -
                        Number(formData.monsoonRoomGrLb)
                      ).toFixed(1)}
                    </div>
                  </div>
                </div>
              )}
              {/* Result Display */}
              {result && (
                <div className="mt-6 p-4 border rounded bg-blue-50 text-blue-900 text-sm max-h-[400px] overflow-auto">
                  <h3 className="font-semibold mb-3">Heat Load Results</h3>

                  {/* Summer Results */}
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Summer Conditions
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Sensible Heat:</span>{" "}
                        {result.summer?.sensible_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Latent Heat:</span>{" "}
                        {result.summer?.latent_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Internal Heat:</span>{" "}
                        {result.summer?.internal_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Room Latent Heat:</span>{" "}
                        {result.summer?.room_latent_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Sun Gain Heat:</span>{" "}
                        {result.summer?.sun_gain_heat || 0} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Total Heat Load:</span>{" "}
                        {result.summer?.heatload_total} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">
                          Heat Load with Safety Factor:
                        </span>{" "}
                        {result.summer?.heatload_with_safety_factor} Btu/hr
                      </div>
                    </div>
                  </div>

                  {/* Monsoon Results */}
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Monsoon Conditions
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Sensible Heat:</span>{" "}
                        {result.monsoon?.sensible_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Latent Heat:</span>{" "}
                        {result.monsoon?.latent_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Internal Heat:</span>{" "}
                        {result.monsoon?.internal_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Room Latent Heat:</span>{" "}
                        {result.monsoon?.room_latent_heat} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Sun Gain Heat:</span>{" "}
                        {result.monsoon?.sun_gain_heat || 0} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Total Heat Load:</span>{" "}
                        {result.monsoon?.heatload_total} Btu/hr
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">
                          Heat Load with Safety Factor:
                        </span>{" "}
                        {result.monsoon?.heatload_with_safety_factor} Btu/hr
                      </div>
                    </div>
                  </div>

                  {/* Sun Gain Details */}
                  {result.sun_gain && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Sun Gain Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-100 p-2 rounded">
                          <span className="font-medium">
                            Total Summer Sun Gain:
                          </span>{" "}
                          {result.sun_gain.total_summer_sun_gain} Btu/hr
                        </div>
                        <div className="bg-blue-100 p-2 rounded">
                          <span className="font-medium">
                            Total Monsoon Sun Gain:
                          </span>{" "}
                          {result.sun_gain.total_monsoon_sun_gain} Btu/hr
                        </div>
                      </div>

                      {/* Component Results */}
                      {result.sun_gain.component_results &&
                        result.sun_gain.component_results.length > 0 && (
                          <div className="mt-2">
                            <h5 className="font-medium text-blue-700 mb-1">
                              Component Breakdown:
                            </h5>
                            {result.sun_gain.component_results.map(
                              (comp, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-50 p-2 rounded mb-1 text-xs"
                                >
                                  <div className="font-medium">{comp.name}</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      Summer: {comp.summerSunGain} Btu/hr
                                    </div>
                                    <div>
                                      Monsoon: {comp.monsoonSunGain} Btu/hr
                                    </div>
                                  </div>
                                  <div className="text-gray-600 mt-1">
                                    Constant: {comp.constant} (
                                    {comp.constant === 0.56
                                      ? "Glass"
                                      : comp.constant === 0.36
                                      ? "Wall"
                                      : comp.constant === 1.13
                                      ? "Part-Glass"
                                      : comp.constant === 0.32
                                      ? "Part-Wall"
                                      : comp.constant === 0.38
                                      ? "Ceiling"
                                      : comp.constant === 0.46
                                      ? "Floor"
                                      : comp.constant === 1.08
                                      ? "Infiltration"
                                      : "Outside Air"}
                                    )
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    Type: {comp.calculationType}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  )}

                  {/* Constants */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Constants Used
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">
                          Specific Heat of Air:
                        </span>{" "}
                        {result.constants?.specific_heat_of_air} kJ/kg·K
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Density of Air:</span>{" "}
                        {result.constants?.density_of_air} kg/m³
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Latent Heat Factor:</span>{" "}
                        {result.constants?.latent_heat_factor}
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <span className="font-medium">Safety Factor:</span>{" "}
                        {result.constants?.safety_factor}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced/Backend Fields Accordion */}
        </div>

        {/* Calculate and Update Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className={`w-full py-3 rounded-[10px] font-medium text-[14px] flex items-center justify-center ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#0083EE] text-white hover:bg-[#1C78DC] transition"
            }`}
          >
            {isLoading ? (
              <>
                <ReloadIcon className="w-[16px] h-[16px] stroke-white animate-spin mr-2" />
                Calculating...
              </>
            ) : (
              "Calculate"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-xs">
            {error}
          </div>
        )}
      </div>
      {/* Right: Floor Preview */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default HeatLoad;
