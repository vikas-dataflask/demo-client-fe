import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ReloadIcon } from "../../icons/ReloadIcon";
import {
  useAddHeatLoadMutation,
  useAddHeatLoadToDbMutation,
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

const HeatLoad = () => {
  const dispatch = useDispatch();
  const [addHeatLoad, { isLoading }] = useAddHeatLoadMutation();
  const [addHeatLoadToDb] = useAddHeatLoadToDbMutation();
  const { data: projectList, isLoading: isProjectLoading } =
    useGetProjectListQuery();
  const currentProjectId = projectList?.[0]?._id;

  const [formData, setFormData] = useState({
    room: "",
    area: "",
    areaUnit: "Sq. m.",
    height: "",
    heightUnit: "m",
    occupancy: "",
    occupancyUnit: "Nos",
    lightLoad: "",
    lightLoadUnit: "Watts",
    heatDissipation: "",
    heatDissipationUnit: "KW",
    cfmSqft: "",
    cfmSqftUnit: "CFM/Sqft",
    cfmPerson: "",
    cfmPersonUnit: "CFM/Person",
    sensibleHeat: "",
    sensibleHeatUnit: "KW",
    latentHeat: "",
    latentHeatUnit: "KW",
    relativeHumidity: "",
    outsideDryBulb: "",
    // New fields for backend
    walls: [{ ...defaultWall }],
    windows: [{ ...defaultWindow }],
    roof: { ...defaultRoof },
    people: [{ ...defaultPerson }],
    equipment: [{ ...defaultEquipment }],
    lighting: { ...defaultLighting },
    infiltration: { ...defaultInfiltration },
    safetyFactor: 1.15,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [roomDetailsOpen, setRoomDetailsOpen] = useState(true);
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

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    try {
      // Define summer and monsoon condition objects
      const summer = {
        outside_db: 110,
        room_db: 75,
        outside_rh: 20,
        room_rh: 50,
        outside_gr_lb: 74.8,
        room_gr_lb: 65,
      };

      const monsoon = {
        outside_db: 110,
        room_db: 75,
        outside_rh: 20,
        room_rh: 50,
        outside_gr_lb: 74.8,
        room_gr_lb: 65,
      };

      // Compose backend payload from frontend fields
      const payload = {
        summer,
        monsoon,
        area: Number(formData.area) || 0,
        height: Number(formData.height) || 0,
        people: Number(formData.occupancy) || 0,
        light: Number(formData.lightLoad) || 0,
        equipment: Number(formData.heatDissipation) || 0,
        cfm_sqft: Number(formData.cfmSqft) || 0,
        cfm_person: Number(formData.cfmPerson) || 0,
        sensible_heat_people: Number(formData.sensibleHeat) || 0,
        latent_heat_people: Number(formData.latentHeat) || 0,
      };

      console.log("Sending payload to backend:", payload);

      // Call backend API
      const response = await addHeatLoad(payload).unwrap();

      if (response && response.success && response.data) {
        const resultData = response.data;
        setResult(resultData);

        if (formData.room) {
          dispatch(
            setRoomHeatLoad({
              roomName: formData.room,
              result: resultData,
            })
          );
        }

        // Save formData + resultData to DB
        await addHeatLoadToDb({
          project_id: currentProjectId,
          input_data: formData,
          result_data: resultData,
        });
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

  useEffect(() => {
    if (autofillData?.input_data) {
      setFormData((prev) => ({
        ...prev,
        ...autofillData.input_data,
      }));
      setResult(autofillData.result_data);
    }
  }, [autofillData]);

  return (
    <div className="flex h-screen">
      <div className="bg-white px-4 pt-4 pb-6 border-r border-gray-200 w-[340px] font-sans text-[13px] overflow-hidden relative h-[92vh] overflow-y-auto flex flex-col">
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
                        <option>Watts</option>
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
                        <option>KW</option>
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
                        value={formData.sensibleHeatUnit || "KW"}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>KW</option>
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
                        name="latentHeat"
                        value={formData.latentHeat || ""}
                        onChange={handleChange}
                        placeholder="Latent Heat"
                        className="w-2/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      />
                      <select
                        name="latentHeatUnit"
                        value={formData.latentHeatUnit || "KW"}
                        onChange={handleChange}
                        className="w-1/3 p-2 rounded-[8px]  text-[13px] bg-gray-200"
                      >
                        <option>KW</option>
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
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      110
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      75
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      20
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      74.8
                    </div>
                  </div>

                  {/* Room (RM) */}
                  <div className="mt-[14px] text-[13px] text-black">
                    Room (RM)
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      75
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      --
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      50
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      65
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="h-[1px] bg-[#E4E4E4] my-[20px]" />

                  {/* Difference */}
                  <div className="text-[13px] text-black">Difference</div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      35
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      --
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      -30
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      9.8
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
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      110
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      75
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      20
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      74.8
                    </div>
                  </div>

                  {/* Room (RM) */}
                  <div className="mt-[14px] text-[13px] text-black">
                    Room (RM)
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      75
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      --
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      50
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      65
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="h-[1px] bg-[#E4E4E4] my-[20px]" />

                  {/* Difference */}
                  <div className="text-[13px] text-black">Difference</div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      35
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      --
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      -30
                    </div>
                    <div className="bg-[#F2F2F2] text-center py-[6px] text-[14px]">
                      9.8
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced/Backend Fields Accordion */}
        </div>

        {/* Calculate Button */}
        <div className="mt-auto pt-4 border-t border-gray-200">
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
        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 border rounded bg-blue-50 text-blue-900 text-sm max-h-[300px] overflow-auto">
            <h3 className="font-semibold mb-2">
              Heat Load Result (From Backend)
            </h3>

            <div>
              <b>Temperature Difference:</b>
              <pre className="bg-blue-100 rounded p-2 mt-1 text-xs overflow-auto">
                {JSON.stringify(result.temperature_difference, null, 2)}
              </pre>
            </div>

            <div className="mt-2">
              <b>Sensible Heat:</b>
              <pre className="bg-blue-100 rounded p-2 mt-1 text-xs overflow-auto">
                {JSON.stringify(result.sensible_heat, null, 2)}
              </pre>
            </div>

            <div className="mt-2">
              <b>Latent Heat:</b>
              <pre className="bg-blue-100 rounded p-2 mt-1 text-xs overflow-auto">
                {JSON.stringify(result.latent_heat, null, 2)}
              </pre>
            </div>

            <div className="mt-2">
              <b>Total Heat:</b>
              <pre className="bg-blue-100 rounded p-2 mt-1 text-xs overflow-auto">
                {JSON.stringify(result.total_heat, null, 2)}
              </pre>
            </div>

            <div className="mt-2">
              <b>Grand Total:</b>
              <pre className="bg-blue-100 rounded p-2 mt-1 text-xs overflow-auto">
                {JSON.stringify(result.grand_total, null, 2)}
              </pre>
            </div>
          </div>
        )}

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
