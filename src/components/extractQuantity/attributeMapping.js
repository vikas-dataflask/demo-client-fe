// // attributeMapping.js
// const attributeMapping = {
//   HVAC: [
//     {
//       heading: "CEILING SUSPENDED UNIT",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW: Layer Name as an attribute
//         airflow: { label: "Airflow", unit: "CFM" },
//         quantity: { label: "Quantity", unit: "Nos" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "SPLIT UNIT",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         airflow: { label: "Airflow", unit: "CFM" },
//         quantity: { label: "Quantity", unit: "Nos" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "CASSETTE UNIT",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         airflow: { label: "Airflow", unit: "CFM" },
//         quantity: { label: "Quantity", unit: "Nos" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "OUTDOOR",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         airflow: { label: "Airflow", unit: "CFM" },
//         quantity: { label: "Quantity", unit: "Nos" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//   ],
//   ELECTRICAL: [
//     {
//       heading: "DISTRIBUTION BOARDS",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         ratedAmperage: { label: "Rated Amperage", unit: "A" },
//         numberOfPhases: { label: "Number of Phases", unit: "" },
//         enclosureType: { label: "Enclosure Type", unit: "" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "LED BATTEN",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         wattage: { label: "Wattage", unit: "W" },
//         length: { label: "Length", unit: "mm" },
//         lumenOutput: { label: "Lumen Output", unit: "lm" },
//         colorTemperature: { label: "Color Temperature", unit: "K" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "LED BULKHEAD",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         wattage: { label: "Wattage", unit: "W" },
//         ipRating: { label: "IP Rating", unit: "" },
//         beamAngle: { label: "Beam Angle", unit: "°" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//   ],
//   "FIRE FIGHTING": [
//     {
//       heading: "HYDRANT MAIN FIRE PUMP",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         capacityLPM: { label: "Capacity", unit: "LPM" },
//         rpm: { label: "RPM", unit: "" },
//         headMeters: { label: "Head", unit: "meters" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "JOCKEY PUMP",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         capacityLPM: { label: "Capacity", unit: "LPM" },
//         rpm: { label: "RPM", unit: "" },
//         headMeters: { label: "Head", unit: "meters" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "PORTABLE FIRE EXTINGUISHERS",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         capacityLPM: { label: "Capacity", unit: "LPM" },
//         rpm: { label: "RPM", unit: "" },
//         headMeters: { label: "Head", unit: "meters" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "Sprinkler Main Fire Pumps",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         capacityLPM: { label: "Capacity", unit: "LPM" },
//         rpm: { label: "RPM", unit: "" },
//         headMeters: { label: "Head", unit: "meters" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//   ],
//   PLUMBING: [
//     {
//       heading: "BUTTERFLY VALVE",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         diameterMM: { label: "Dia", unit: "mm" },
//         material: { label: "Material", unit: "" },
//         grade: { label: "Grade", unit: "" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//     {
//       heading: "NON RETURN VALVE",
//       attributes: {
//         layerName: { label: "Layer Name", unit: "" }, // NEW
//         diameterMM: { label: "Dia", unit: "mm" },
//         material: { label: "Material", unit: "" },
//         grade: { label: "Grade", unit: "" },
//         brand: { label: "Brand", unit: "" },
//       },
//     },
//   ],
// };

// export default attributeMapping;

// ***************************************
// attributeMapping.js
const attributeMapping = {
  HVAC: [
    {
      heading: "CEILING SUSPENDED UNIT",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW: Layer Name as an attribute
        airflow: { label: "Airflow", unit: "CFM" },
        coolingCapacity: { label: "Cooling Capacity", unit: "Tr" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "SPLIT UNIT",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        airflow: { label: "Airflow", unit: "CFM" },
        coolingCapacity: { label: "Cooling Capacity", unit: "Tr" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "CASSETTE UNIT",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        airflow: { label: "Airflow", unit: "CFM" },
        coolingCapacity: { label: "Cooling Capacity", unit: "Tr" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "OUTDOOR",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        airflow: { label: "Airflow", unit: "CFM" },
        coolingCapacity: { label: "Cooling Capacity", unit: "Tr" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "WALL MOUNTED HI-WALL UNITS",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        airflow: { label: "Airflow", unit: "CFM" },
        coolingCapacity: { label: "Cooling Capacity", unit: "Tr" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Y-Joints",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Remote controllers Corded",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Remote controllers Non-corded",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Central controller system",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Voltage Stablizer",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "KVA" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Refrigerant Piping",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" }, // Assuming piping is in meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Drain Piping",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" }, // Assuming piping is in meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Inline Fans",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        airflow: { label: "Airflow", unit: "CMH" },
        size: { label: "Size", unit: "mm" },
        rpm: { label: "RPM", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Propeller Fan",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        airflow: { label: "Airflow", unit: "CFM" },
        size: { label: "Size", unit: "mm" },
        rpm: { label: "RPM", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Exhaust Fans",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        airflow: { label: "Airflow", unit: "CFM" },
        size: { label: "Size", unit: "mm" },
        rpm: { label: "RPM", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Duct",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        gauge: { label: "Gauge", unit: "" },
        quantity: { label: "Quantity", unit: "Sqm" }, // Assuming duct is in square meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Grills with VCD",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Grills without VCD",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Diffusers with VCD",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Diffusers without VCD",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Fresh Air Louvers",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Air transfer door grill",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Motorized Fire Dampers",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Damper Actuator",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Insulation",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Sqm" }, // Assuming insulation is in square meters
        brand: { label: "Brand", unit: "" },
      },
    },
  ],
  ELECTRICAL: [
    {
      heading: "DISTRIBUTION BOARDS",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        ratedAmperage: { label: "Rated Amperage", unit: "A" },
        numberOfPhases: { label: "Number of Phases", unit: "" },
        enclosureType: { label: "Enclosure Type", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "LED BATTEN",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        wattage: { label: "Wattage", unit: "W" },
        length: { label: "Length", unit: "mm" },
        lumenOutput: { label: "Lumen Output", unit: "lm" },
        colorTemperature: { label: "Color Temperature", unit: "K" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "LED BULKHEAD",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        wattage: { label: "Wattage", unit: "W" },
        ipRating: { label: "IP Rating", unit: "" },
        beamAngle: { label: "Beam Angle", unit: "°" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Main Distribution Board (MDB)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Essential Power Panel (EPP)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Emergency lighting panel (EMLP)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Air-condition Distribution Board (ACDB)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Water Pump Panel (WPP)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Fire Pump Panel (FPP)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Passenger Amenities Panel (PAP)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Escalator Power Panel (ESPP)",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        busbarCapacity: { label: "Busbar Capacity", unit: "Amp" },
        ipRating: { label: "IP Rating", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "DG Set",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "kVA or KW" },
        voltage: { label: "Voltage", unit: "V" },
        speed: { label: "Speed", unit: "RPM" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "UPS System",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "kVA or KW" },
        voltage: { label: "Voltage", unit: "V" },
        type: { label: "Type", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "XLPE Power Cables",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        core: { label: "Core", unit: "Nos." },
        material: { label: "Material", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" }, // Assuming cables are in meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Cable trays",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mmxmmxmm" },
        material: { label: "Material", unit: "" },
        type: { label: "Type", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" }, // Assuming cable trays are in meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Conduits",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" }, // Assuming conduits are in meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Earthing Strips",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" }, // Assuming earthing strips are in meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Lightning Arresters",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Switches",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Sockets",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Communication Cables",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        voltage: { label: "Voltage", unit: "V" },
        core: { label: "Core", unit: "Nos." },
        material: { label: "Material", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" }, // Assuming cables are in meters
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Recessed LED Panel Lights",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "W" },
        voltage: { label: "Voltage", unit: "V" },
        lumen: { label: "Lumen", unit: "lm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "LED Downlights",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "W" },
        voltage: { label: "Voltage", unit: "V" },
        lumen: { label: "Lumen", unit: "lm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Wall-mounted LED Cylindrical Fixtures",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "W" },
        voltage: { label: "Voltage", unit: "V" },
        lumen: { label: "Lumen", unit: "lm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "LED Surface Mount Lights",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "W" },
        voltage: { label: "Voltage", unit: "V" },
        lumen: { label: "Lumen", unit: "lm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "LED Tube Light",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "W" },
        voltage: { label: "Voltage", unit: "V" },
        lumen: { label: "Lumen", unit: "lm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "LED Moisture-Proof Ceiling Lights",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "W" },
        voltage: { label: "Voltage", unit: "V" },
        lumen: { label: "Lumen", unit: "lm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "6A/10A 1-way Switch",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "6A/16A Socket with Switch",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "6A 2/3 Pin Socket",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "16A Power Socket with Indicator",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Industrial Socket with MCB",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "3-pin or 5-pin Industrial Socket",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "RJ45 CAT-6 Socket",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" }, // This might be an unusual attribute for a data socket
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "USB Charging Port",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Mushroom Push Button",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        ratedCurrent: { label: "Rated Current", unit: "Amp" },
        size: { label: "Size", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
  ],
  "FIRE FIGHTING": [
    {
      heading: "HYDRANT MAIN FIRE PUMP",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        capacityLPM: { label: "Capacity", unit: "LPM" },
        rpm: { label: "RPM", unit: "" },
        headMeters: { label: "Head", unit: "meters" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "JOCKEY PUMP",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        capacityLPM: { label: "Capacity", unit: "LPM" },
        rpm: { label: "RPM", unit: "" },
        headMeters: { label: "Head", unit: "meters" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "PORTABLE FIRE EXTINGUISHERS",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        capacityLPM: { label: "Capacity", unit: "LPM" }, // This might be a typo, usually capacity is in KG or L for extinguishers
        rpm: { label: "RPM", unit: "" }, // Not typical for extinguishers
        headMeters: { label: "Head", unit: "meters" }, // Not typical for extinguishers
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Sprinkler Main Fire Pumps",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        capacityLPM: { label: "Capacity", unit: "LPM" },
        rpm: { label: "RPM", unit: "" },
        headMeters: { label: "Head", unit: "meters" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Fire Hose Cabinet",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mmxmmxmm" },
        material: { label: "Material", unit: "" },
        landingValve: { label: "Landing Valve", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "External hydrants/landing valves",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mmxmmxmm" },
        material: { label: "Material", unit: "" },
        landingValve: { label: "Landing Valve", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Orifice plate",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Rubber expansion joint",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        pressure: { label: "Pressure", unit: "kg/Sqcm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Y-strainer",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Air release valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Digital Pressure Gauge",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        pressure: { label: "Pressure", unit: "kg/Sqcm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Butterfly valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Non Return valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Digital pressure switches",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        pressure: { label: "Pressure", unit: "kg/Sqcm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Pressure switches",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        pressure: { label: "Pressure", unit: "kg/Sqcm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Pressure vessels",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        pressure: { label: "Pressure", unit: "kg/Sqcm" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Four way fire brigade connection",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Fire brigade inlet connection",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Fire brigade draw out collecting",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "External GI Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "External DI Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "External CI Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "External MS Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Internal GI Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Internal DI Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Internal CI Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Internal MS Pipe",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Butterfly valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Non Return valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Motorized Flow Switch",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "PENDENT SPRINKLER",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "UPRIGHT SPRINKLER",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Flow Switch",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        size: { label: "Size", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Fire Extinguisher 4.5 kg. CO2 Type",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "kg" },
        type: { label: "Type", unit: "" },
        brand: { label: "Brand", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
      },
    },
    {
      heading: "Fire Extinguisher 9 liters water Co2 Type",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "Liters" },
        type: { label: "Type", unit: "" },
        brand: { label: "Brand", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
      },
    },
    {
      heading: "Fire Extinguisher 9 liters Mechanical Foam type",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "Liters" },
        type: { label: "Type", unit: "" },
        brand: { label: "Brand", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
      },
    },
    {
      heading: "Fire Extinguisher 22.5 kg. Capacity Co2 Type",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "kg" },
        type: { label: "Type", unit: "" },
        brand: { label: "Brand", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
      },
    },
  ],
  PLUMBING: [
    {
      heading: "BUTTERFLY VALVE",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        diameterMM: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "NON RETURN VALVE",
      attributes: {
        layerName: { label: "Layer Name", unit: "" }, // NEW
        diameterMM: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" }, // Added quantity
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "CPVC Pipes",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "uPVC Pipes",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "PPR Pipes",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Mtr" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Ball Valves",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Foot Valves",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Diaphragm Valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Gate Valves",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Pressure Relief Valves",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Flush valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Angle Valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Float Valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Bib Cock",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Pillar Cock",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Water Closets",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Wash Basin",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Showers",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Urinal",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Sink",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        type: { label: "Type", unit: "" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Water Meter",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Float Valve",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Gate Valves",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        diameter: { label: "Dia", unit: "mm" },
        material: { label: "Material", unit: "" },
        grade: { label: "Grade", unit: "" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
    {
      heading: "Submersible Pumps",
      attributes: {
        layerName: { label: "Layer Name", unit: "" },
        capacity: { label: "Capacity", unit: "LPM" },
        head: { label: "Head", unit: "meters" },
        quantity: { label: "Quantity", unit: "Nos" },
        brand: { label: "Brand", unit: "" },
      },
    },
  ],
};

export default attributeMapping;
