// Utility function to extract room data from AI responses
export const extractRoomsFromAIResponse = (aiResponse) => {
  if (!aiResponse || typeof aiResponse !== 'string') {
    return [];
  }

  console.log('🔍 Starting room extraction from AI response...');
  console.log('📝 AI Response length:', aiResponse.length);
  console.log('📝 AI Response preview:', aiResponse.substring(0, 200) + '...');

  const rooms = [];
  
  // Pattern 1: Main room categories with numbered instances (your specific format)
  // This pattern looks for the structure: "1. BEDROOM :" followed by bullet points
  const mainRoomPattern = /(\d+\.\s*)([A-Z\s]+)\s*:\s*\n\s*((?:[^1-9]*\d+\.\s*[A-Z\s]+[^1-9]*)*)/gs;
  let match;
  
  while ((match = mainRoomPattern.exec(aiResponse)) !== null) {
    const [, number, roomCategory, instancesText] = match;
    console.log('Found main room category:', roomCategory, 'with instances:', instancesText);
    
    // Extract individual instances from the bullet points
    const instancePattern = /•\s*([A-Z\s]+)\s*:-\s*([^•\n]+)/g;
    let instanceMatch;
    let instanceCount = 0;
    
    while ((instanceMatch = instancePattern.exec(instancesText)) !== null) {
      const [, instanceName, dimensions] = instanceMatch;
      instanceCount++;
      console.log('Found instance:', instanceName, 'with dimensions:', dimensions);
      
      const roomData = parseRoomDimensions(instanceName.trim(), dimensions);
      if (roomData) {
        rooms.push({
          id: `ai-${number.replace('.', '')}-${instanceCount}`,
          name: instanceName.trim(),
          category: roomCategory.trim(),
          ...roomData
        });
      }
    }
    
    // If no instances found, try to extract from the main category
    if (instanceCount === 0) {
      console.log('No instances found for category:', roomCategory, 'trying to extract from category line');
      // Look for dimensions in the main category line or after it
      const categoryDimensionsPattern = new RegExp(`${roomCategory.trim()}\\s*:\\s*([^•\\n]+)`, 'i');
      const categoryMatch = aiResponse.match(categoryDimensionsPattern);
      
      if (categoryMatch && categoryMatch[1]) {
        const roomData = parseRoomDimensions(roomCategory.trim(), categoryMatch[1]);
        if (roomData) {
          rooms.push({
            id: `ai-${number.replace('.', '')}`,
            name: roomCategory.trim(),
            category: roomCategory.trim(),
            ...roomData
          });
        }
      }
    }
  }

  // Pattern 1.5: Simplified pattern to catch the bullet points directly
  // This is the main pattern that should work for your format
  const simpleBulletPattern = /•\s*([A-Z\s]+)\s*:-\s*([^•\n]+)/g;
  let simpleMatch;
  
  while ((simpleMatch = simpleBulletPattern.exec(aiResponse)) !== null) {
    const [, instanceName, dimensions] = simpleMatch;
    console.log('Simple bullet match found:', instanceName, 'with dimensions:', dimensions);
    
    // Extract the base category from the instance name
    let category = '';
    if (instanceName.includes('BEDROOM')) category = 'BEDROOM';
    else if (instanceName.includes('DRAWING')) category = 'DRAWING';
    else if (instanceName.includes('TOILET')) category = 'TOILET';
    else if (instanceName.includes('STUDY')) category = 'STUDY';
    else if (instanceName.includes('BALCONY')) category = 'BALCONY';
    else if (instanceName.includes('DINING HALL')) category = 'DINING HALL';
    else if (instanceName.includes('KITCHEN')) category = 'KITCHEN';
    else if (instanceName.includes('LIFT')) category = 'LIFT';
    else if (instanceName.includes('LIFT LOBBY')) category = 'LIFT LOBBY';
    else if (instanceName.includes('FIRE REFUGE AREA')) category = 'FIRE REFUGE AREA';
    else if (instanceName.includes('PASSAGE')) category = 'PASSAGE';
    
    const roomData = parseRoomDimensions(instanceName.trim(), dimensions);
    if (roomData) {
      rooms.push({
        id: `ai-simple-${rooms.length + 1}`,
        name: instanceName.trim(),
        category: category,
        ...roomData
      });
    }
  }

  // Pattern 1.6: Most flexible pattern for your exact format
  // This handles the spacing and line breaks in your AI response
  const flexibleBulletPattern = /•\s*([A-Z\s]+)\s*:-\s*([^•\n\r]+)/g;
  let flexibleBulletMatch;
  
  // Debug: Check if bullet points exist in the response
  const bulletPointCount = (aiResponse.match(/•/g) || []).length;
  console.log('🔍 Found', bulletPointCount, 'bullet points (•) in the response');
  
  while ((flexibleBulletMatch = flexibleBulletPattern.exec(aiResponse)) !== null) {
    const [, instanceName, dimensions] = flexibleBulletMatch;
    console.log('✅ Flexible bullet match found:', instanceName, 'with dimensions:', dimensions);
    
    // Extract the base category from the instance name
    let category = '';
    if (instanceName.includes('BEDROOM')) category = 'BEDROOM';
    else if (instanceName.includes('DRAWING')) category = 'DRAWING';
    else if (instanceName.includes('TOILET')) category = 'TOILET';
    else if (instanceName.includes('STUDY')) category = 'STUDY';
    else if (instanceName.includes('BALCONY')) category = 'BALCONY';
    else if (instanceName.includes('DINING HALL')) category = 'DINING HALL';
    else if (instanceName.includes('KITCHEN')) category = 'KITCHEN';
    else if (instanceName.includes('LIFT')) category = 'LIFT';
    else if (instanceName.includes('LIFT LOBBY')) category = 'LIFT LOBBY';
    else if (instanceName.includes('FIRE REFUGE AREA')) category = 'FIRE REFUGE AREA';
    else if (instanceName.includes('PASSAGE')) category = 'PASSAGE';
    
    const roomData = parseRoomDimensions(instanceName.trim(), dimensions);
    if (roomData) {
      rooms.push({
        id: `ai-flexible-${rooms.length + 1}`,
        name: instanceName.trim(),
        category: category,
        ...roomData
      });
    }
  }

  // Pattern 1.6: Even simpler pattern - just look for bullet points anywhere
  // This should catch all bullet points regardless of context
  const allBulletPattern = /•\s*([^:]+):-\s*([^•\n]+)/g;
  let allBulletMatch;
  
  while ((allBulletMatch = allBulletPattern.exec(aiResponse)) !== null) {
    const [, instanceName, dimensions] = allBulletMatch;
    console.log('All bullet match found:', instanceName, 'with dimensions:', dimensions);
    
    // Extract the base category from the instance name
    let category = '';
    if (instanceName.includes('BEDROOM')) category = 'BEDROOM';
    else if (instanceName.includes('DRAWING')) category = 'DRAWING';
    else if (instanceName.includes('TOILET')) category = 'TOILET';
    else if (instanceName.includes('STUDY')) category = 'STUDY';
    else if (instanceName.includes('BALCONY')) category = 'BALCONY';
    else if (instanceName.includes('DINING HALL')) category = 'DINING HALL';
    else if (instanceName.includes('KITCHEN')) category = 'KITCHEN';
    else if (instanceName.includes('LIFT')) category = 'LIFT';
    else if (instanceName.includes('LIFT LOBBY')) category = 'LIFT LOBBY';
    else if (instanceName.includes('FIRE REFUGE AREA')) category = 'FIRE REFUGE AREA';
    else if (instanceName.includes('PASSAGE')) category = 'PASSAGE';
    
    const roomData = parseRoomDimensions(instanceName.trim(), dimensions);
    if (roomData) {
      rooms.push({
        id: `ai-all-bullet-${rooms.length + 1}`,
        name: instanceName.trim(),
        category: category,
        ...roomData
      });
    }
  }

  // Pattern 1.7: Most flexible pattern - look for any bullet-like character
  // This handles different bullet point characters and formats
  const anyBulletPattern = /[•\*\-]\s*([^:]+):-\s*([^•\*\-\n]+)/g;
  let anyBulletMatch;
  
  while ((anyBulletMatch = anyBulletPattern.exec(aiResponse)) !== null) {
    const [, instanceName, dimensions] = anyBulletMatch;
    console.log('Any bullet match found:', instanceName, 'with dimensions:', dimensions);
    
    // Extract the base category from the instance name
    let category = '';
    if (instanceName.includes('BEDROOM')) category = 'BEDROOM';
    else if (instanceName.includes('DRAWING')) category = 'DRAWING';
    else if (instanceName.includes('TOILET')) category = 'TOILET';
    else if (instanceName.includes('STUDY')) category = 'STUDY';
    else if (instanceName.includes('BALCONY')) category = 'BALCONY';
    else if (instanceName.includes('DINING HALL')) category = 'DINING HALL';
    else if (instanceName.includes('KITCHEN')) category = 'KITCHEN';
    else if (instanceName.includes('LIFT')) category = 'LIFT';
    else if (instanceName.includes('LIFT LOBBY')) category = 'LIFT LOBBY';
    else if (instanceName.includes('FIRE REFUGE AREA')) category = 'FIRE REFUGE AREA';
    else if (instanceName.includes('PASSAGE')) category = 'PASSAGE';
    
    const roomData = parseRoomDimensions(instanceName.trim(), dimensions);
    if (roomData) {
      rooms.push({
        id: `ai-any-bullet-${rooms.length + 1}`,
        name: instanceName.trim(),
        category: category,
        ...roomData
      });
    }
  }

  // Pattern 1.8: Handle rooms without bullet points (like BALCONY, FIRE REFUGE AREA, PASSAGE)
  // Look for numbered items followed by colon and dimensions
  const noBulletPattern = /(\d+\.\s*)([A-Z\s]+)\s*:\s*\n\s*([^•\n\r]+)/g;
  let noBulletMatch;
  
  while ((noBulletMatch = noBulletPattern.exec(aiResponse)) !== null) {
    const [, number, roomName, dimensions] = noBulletMatch;
    console.log('✅ No bullet match found:', roomName, 'with dimensions:', dimensions);
    
    const roomData = parseRoomDimensions(roomName.trim(), dimensions);
    if (roomData) {
      rooms.push({
        id: `ai-no-bullet-${number.replace('.', '')}`,
        name: roomName.trim(),
        category: roomName.trim(),
        ...roomData
      });
    }
  }

  // Pattern 1.9: Ultimate fallback - look for any text that matches room patterns
  // This should catch everything that was missed
  const ultimatePattern = /([A-Z\s]+)\s*:-\s*([^•\n\r]+)/g;
  let ultimateMatch;
  
  while ((ultimateMatch = ultimatePattern.exec(aiResponse)) !== null) {
    const [, instanceName, dimensions] = ultimateMatch;
    console.log('🎯 Ultimate pattern match found:', instanceName, 'with dimensions:', dimensions);
    
    // Skip if this looks like a category header (no number)
    if (!/\d/.test(instanceName)) {
      // Extract the base category from the instance name
      let category = '';
      if (instanceName.includes('BEDROOM')) category = 'BEDROOM';
      else if (instanceName.includes('DRAWING')) category = 'DRAWING';
      else if (instanceName.includes('TOILET')) category = 'TOILET';
      else if (instanceName.includes('STUDY')) category = 'STUDY';
      else if (instanceName.includes('BALCONY')) category = 'BALCONY';
      else if (instanceName.includes('DINING HALL')) category = 'DINING HALL';
      else if (instanceName.includes('KITCHEN')) category = 'KITCHEN';
      else if (instanceName.includes('LIFT')) category = 'LIFT';
      else if (instanceName.includes('LIFT LOBBY')) category = 'LIFT LOBBY';
      else if (instanceName.includes('FIRE REFUGE AREA')) category = 'FIRE REFUGE AREA';
      else if (instanceName.includes('PASSAGE')) category = 'PASSAGE';
      
      const roomData = parseRoomDimensions(instanceName.trim(), dimensions);
      if (roomData) {
        rooms.push({
          id: `ai-ultimate-${rooms.length + 1}`,
          name: instanceName.trim(),
          category: category,
          ...roomData
        });
      }
    }
  }

  // Pattern 1.10: Handle comma-separated dimensions and create individual instances
  // This pattern looks for "1. ROOMNAME - dimension1, dimension2, dimension3" format
  const commaSeparatedPattern = /(\d+\.\s*)([A-Z\s]+)\s*-\s*([^•\n\r]+)/g;
  let commaMatch;
  
  while ((commaMatch = commaSeparatedPattern.exec(aiResponse)) !== null) {
    const [, number, roomCategory, allDimensions] = commaMatch;
    console.log('🔍 Found comma-separated room:', roomCategory, 'with dimensions:', allDimensions);
    
    // Split dimensions by comma and clean them up
    const dimensionList = allDimensions.split(',').map(dim => dim.trim()).filter(dim => dim.length > 0);
    console.log('📏 Split dimensions:', dimensionList);
    
    // Create individual room instances for each dimension
    dimensionList.forEach((dimension, index) => {
      // Create a unique name for each instance
      const instanceName = `${roomCategory.trim()} ${index + 1}`;
      
      // Extract the base category
      let category = '';
      if (roomCategory.includes('BEDROOM')) category = 'BEDROOM';
      else if (roomCategory.includes('DRAWING')) category = 'DRAWING';
      else if (roomCategory.includes('TOILET')) category = 'TOILET';
      else if (roomCategory.includes('STUDY')) category = 'STUDY';
      else if (roomCategory.includes('BALCONY')) category = 'BALCONY';
      else if (roomCategory.includes('DINING HALL')) category = 'DINING HALL';
      else if (roomCategory.includes('KITCHEN')) category = 'KITCHEN';
      else if (roomCategory.includes('LIFT')) category = 'LIFT';
      else if (roomCategory.includes('LIFT LOBBY')) category = 'LIFT LOBBY';
      else if (roomCategory.includes('FIRE REFUGE AREA')) category = 'FIRE REFUGE AREA';
      else if (roomCategory.includes('PASSAGE')) category = 'PASSAGE';
      
      const roomData = parseRoomDimensions(instanceName, dimension);
      if (roomData) {
        console.log('✅ Created instance:', instanceName, 'with dimensions:', dimension);
        rooms.push({
          id: `ai-comma-${number.replace('.', '')}-${index + 1}`,
          name: instanceName,
          category: category,
          ...roomData
        });
      }
    });
  }

  // Pattern 1.11: Handle special cases with single dimensions (BALCONY, FIRE REFUGE AREA, PASSAGE)
  // These don't have multiple dimensions, so create single instances
  const specialCases = ['BALCONY', 'FIRE REFUGE AREA', 'PASSAGE'];
  specialCases.forEach(specialCase => {
    const specialPattern = new RegExp(`(\\d+\\.\\s*)(${specialCase.replace(/\s+/g, '\\s+')})\\s*-\\s*([^\\n\\r]+)`, 'g');
    let specialMatch;
    
    while ((specialMatch = specialPattern.exec(aiResponse)) !== null) {
      const [, number, roomName, dimensions] = specialMatch;
      console.log('🎯 Found special case:', roomName, 'with dimensions:', dimensions);
      
      const roomData = parseRoomDimensions(roomName, dimensions);
      if (roomData) {
        console.log('✅ Created special case instance:', roomName, 'with dimensions:', dimensions);
        rooms.push({
          id: `ai-special-${number.replace('.', '')}`,
          name: roomName.trim(),
          category: roomName.trim(),
          ...roomData
        });
      }
    }
  });



  // Pattern 2: Simple numbered list format "1. ROOMNAME - dimensions"
  // DISABLED: This was creating duplicate main categories
  // const numberedPattern = /(\d+\.\s*)([A-Z\s]+)\s*-\s*([^<>\n]+)/g;
  // while ((match = numberedPattern.exec(aiResponse)) !== null) {
  //   const [, number, roomName, dimensions] = match;
  //   const roomData = parseRoomDimensions(roomName.trim(), dimensions);
  //   if (roomData) {
  //     rooms.push({
  //       id: `ai-${number.replace('.', '')}`,
  //       name: roomName.trim(),
  //       category: roomName.trim(),
  //       ...roomData
  //     });
  //   }
  // }

  // Pattern 3: Bullet point format "• ROOMNAME: dimensions"
  // DISABLED: This was creating duplicate main categories
  // const bulletPattern = /([•\*]\s*)([A-Z\s]+)\s*:\s*([^<>\n]+)/g;
  // while ((match = bulletPattern.exec(aiResponse)) !== null) {
  //   const [, bullet, roomName, dimensions] = match;
  //   const roomData = parseRoomDimensions(roomName.trim(), dimensions);
  //   if (roomData) {
  //     rooms.push({
  //       id: `ai-bullet-${rooms.length + 1}`,
  //       name: roomName.trim(),
  //       category: roomName.trim(),
  //       ...roomData
  //       });
  //     }
  //   }

  // Pattern 4: Colon format "ROOMNAME: dimensions"
  // DISABLED: This was creating duplicate main categories
  // const colonPattern = /(^|\n)([A-Z\s]+)\s*:\s*([^<>\n]+)/g;
  // while ((match = colonPattern.exec(aiResponse)) !== null) {
  //   const [, newline, roomName, dimensions] = match;
  //   const roomData = parseRoomDimensions(roomName.trim(), dimensions);
  //   if (roomData) {
  //     rooms.push({
  //       id: `ai-colon-${rooms.length + 1}`,
  //       name: roomName.trim(),
  //       category: roomName.trim(),
  //       ...roomData
  //       });
  //     }
  //   }

  // Remove duplicates based on name and category
  const uniqueRooms = rooms.filter((room, index, self) => 
    index === self.findIndex(r => r.name === room.name && r.category === room.category)
  );
  
  // Filter out main categories (keep only numbered instances)
  const numberedRooms = uniqueRooms.filter(room => /\d/.test(room.name));
  
  console.log('Total rooms extracted:', rooms.length);
  console.log('Unique rooms after deduplication:', uniqueRooms.length);
  console.log('Numbered instances only:', numberedRooms.length);
  
  // Debug: Show what was extracted
  if (numberedRooms.length > 0) {
    console.log('Final room instances (numbered only):');
    numberedRooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.name} (Category: ${room.category}, Dimensions: ${room.dimensions})`);
    });
  }
  
  return numberedRooms;
};

// Helper function to parse room dimensions
const parseRoomDimensions = (roomName, dimensions) => {
  if (!dimensions || dimensions.trim() === '') {
    return null;
  }

  // Extract dimensions from various formats
  const dimensionPatterns = [
    // Format: "3650 X 3350" or "3650 x 3350"
    /(\d+(?:\.\d+)?)\s*[Xx]\s*(\d+(?:\.\d+)?)/g,
    // Format: "3650mm X 3350mm" or "3.65m X 3.35m"
    /(\d+(?:\.\d+)?)(?:mm|m|cm|ft|in)\s*[Xx]\s*(\d+(?:\.\d+)?)(?:mm|m|cm|ft|in)/gi,
    // Format: "1500 MM WIDE" or "1200 WIDE"
    /(\d+(?:\.\d+)?)\s*(?:MM\s*)?WIDE/gi,
    // Format: "ABOVE 60 M HEIGHT"
    /ABOVE\s*(\d+(?:\.\d+)?)\s*M\s*HEIGHT/gi
  ];

  let width = 0;
  let height = 0;
  let area = 0;
  let specialDimensions = '';

  // Try to find dimensions
  for (const pattern of dimensionPatterns) {
    const matches = [...dimensions.matchAll(pattern)];
    if (matches.length > 0) {
      for (const match of matches) {
        if (match[1] && match[2]) {
          // Standard width x height format
          const w = parseFloat(match[1]);
          const h = parseFloat(match[2]);
          if (w > 0 && h > 0) {
            width = Math.max(width, w);
            height = Math.max(height, h);
            area = width * height;
          }
        } else if (match[1]) {
          // Single dimension (like width or height)
          const dim = parseFloat(match[1]);
          if (dim > 0) {
            if (width === 0) {
              width = dim;
            } else if (height === 0) {
              height = dim;
            }
            area = width * height;
          }
        }
      }
      break;
    }
  }

  // If no standard dimensions found, store the original text
  if (width === 0 && height === 0) {
    specialDimensions = dimensions.trim();
  }

  return {
    width,
    height,
    area,
    specialDimensions,
    dimensions: dimensions.trim(),
    source: 'ai'
  };
};

// Function to convert AI room dimensions to meters (assuming mm if no unit specified)
export const convertAIDimensionsToMeters = (room) => {
  if (!room) return room;

  const convertToMeters = (value) => {
    // If value is very large (>1000), assume it's in mm
    if (value > 1000) {
      return value / 1000;
    }
    // If value is reasonable size (<100), assume it's already in meters
    if (value < 100) {
      return value;
    }
    // Default to mm conversion
    return value / 1000;
  };

  return {
    ...room,
    widthInMeters: room.width ? convertToMeters(room.width) : 0,
    heightInMeters: room.height ? convertToMeters(room.height) : 0,
    areaInSquareMeters: room.area ? (convertToMeters(room.width) * convertToMeters(room.height)) : 0
  };
};
