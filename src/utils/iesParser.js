/**
 * Frontend IES Parser
 * Handles IES file parsing with backend integration and local fallback
 */

class FrontendIESParser {
  constructor() {
    this.API_BASE = 'http://localhost:8000/api';
  }

  /**
   * Parse IES file with backend integration
   * @param {File} file - The IES file to parse
   * @returns {Promise<Object>} Parsed IES data
   */
  async parseWithBackend(file) {
    try {
      console.log('🔍 Attempting backend IES parsing for:', file.name);

      const formData = new FormData();
      formData.append('ies_file', file);

      const response = await fetch(`${this.API_BASE}/ies/parse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Backend parsing failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend IES parsing successful:', result);

      return {
        success: true,
        data: result.data || result,
        source: 'backend'
      };

    } catch (error) {
      console.warn('⚠️ Backend IES parsing failed, falling back to local parsing:', error);
      
      // Fallback to local parsing
      return this.parseLocally(file);
    }
  }

  /**
   * Parse IES file locally (fallback method)
   * @param {File} file - The IES file to parse
   * @returns {Promise<Object>} Parsed IES data
   */
  async parseLocally(file) {
    try {
      console.log('🔍 Starting local IES parsing for:', file.name);

      const text = await this.readFileAsText(file);
      const lines = text.split(/\r?\n/);
      
      const parsedData = this.parseIESLines(lines);
      
      console.log('✅ Local IES parsing successful:', parsedData);

      return {
        success: true,
        data: parsedData,
        source: 'local',
        isLocalFallback: true
      };

    } catch (error) {
      console.error('❌ Local IES parsing failed:', error);
      throw new Error(`IES parsing failed: ${error.message}`);
    }
  }

  /**
   * Read file as text
   * @param {File} file - The file to read
   * @returns {Promise<string>} File content as text
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse IES file lines
   * @param {string[]} lines - The IES file lines
   * @returns {Object} Parsed IES data
   */
  parseIESLines(lines) {
    const data = {
      isValid: false,
      manufacturer: '',
      catalogNumber: '',
      lampType: '',
      lumens: 0,
      wattage: 0,
      maxCandela: 0,
      beamAngleH: 0,
      beamAngleV: 0,
      photometricType: 0,
      luminaireDimensions: {},
      candelaValues: [],
      errors: []
    };

    try {
      let lineIndex = 0;

      // Skip comments and find keyword line
      while (lineIndex < lines.length && !lines[lineIndex].trim().startsWith('IESNA:')) {
        lineIndex++;
      }

      if (lineIndex >= lines.length) {
        throw new Error('IESNA keyword not found');
      }

      // Parse keyword line
      const keywordLine = lines[lineIndex].trim();
      data.manufacturer = this.extractManufacturer(keywordLine);
      data.catalogNumber = this.extractCatalogNumber(keywordLine);

      lineIndex++;

      // Parse lamp data - try multiple approaches
      if (lineIndex < lines.length) {
        const lampData = lines[lineIndex].trim().split(/\s+/);
        console.log('🔍 Lamp data line:', lampData);
        
        // Try standard IES format first
        if (lampData.length >= 2) {
          data.lumens = parseFloat(lampData[1]) || 0;
          data.wattage = parseFloat(lampData[2]) || 0;
          console.log('✅ Standard format - Extracted lumens:', data.lumens, 'wattage:', data.wattage);
        } else {
          console.warn('⚠️ Insufficient lamp data:', lampData);
        }
        
        // If lumens is still 0, try alternative parsing
        if (data.lumens === 0) {
          console.log('🔍 Trying alternative lumens extraction...');
          
          // Look for lumens in the entire file content
          const fileContent = lines.join('\n');
          const lumensMatch = fileContent.match(/lumens?\s*[=:]\s*(\d+(?:\.\d+)?)/i);
          if (lumensMatch) {
            data.lumens = parseFloat(lumensMatch[1]) || 0;
            console.log('✅ Alternative extraction - Found lumens:', data.lumens);
          }
          
          // Look for wattage and estimate lumens if needed
          const wattageMatch = fileContent.match(/wattage?\s*[=:]\s*(\d+(?:\.\d+)?)/i);
          if (wattageMatch && data.lumens === 0) {
            const wattage = parseFloat(wattageMatch[1]) || 0;
            // Estimate lumens based on typical LED efficiency (100-150 lm/W)
            data.lumens = wattage * 120; // Conservative estimate
            data.wattage = wattage;
            console.log('✅ Estimated lumens from wattage:', data.lumens, 'from wattage:', wattage);
          }
        }
      }

      lineIndex++;

      // Parse photometric type
      if (lineIndex < lines.length) {
        data.photometricType = parseInt(lines[lineIndex].trim()) || 0;
      }

      lineIndex++;

      // Parse dimensions
      if (lineIndex < lines.length) {
        const dimData = lines[lineIndex].trim().split(/\s+/);
        if (dimData.length >= 3) {
          data.luminaireDimensions = {
            width: parseFloat(dimData[0]) || 0,
            length: parseFloat(dimData[1]) || 0,
            height: parseFloat(dimData[2]) || 0
          };
        }
      }

      lineIndex++;

      // Parse ballast factor and other parameters
      if (lineIndex < lines.length) {
        const ballastData = lines[lineIndex].trim().split(/\s+/);
        if (ballastData.length >= 1) {
          data.ballastFactor = parseFloat(ballastData[0]) || 1.0;
        }
      }

      lineIndex++;

      // Parse number of lamps
      if (lineIndex < lines.length) {
        data.numberOfLamps = parseInt(lines[lineIndex].trim()) || 1;
      }

      lineIndex++;

      // Parse candela multipliers
      if (lineIndex < lines.length) {
        data.candelaMultiplier = parseFloat(lines[lineIndex].trim()) || 1.0;
      }

      lineIndex++;

      // Parse vertical angles
      if (lineIndex < lines.length) {
        const vertData = lines[lineIndex].trim().split(/\s+/);
        data.verticalAngles = vertData.map(angle => parseFloat(angle) || 0);
      }

      lineIndex++;

      // Parse horizontal angles
      if (lineIndex < lines.length) {
        const horizData = lines[lineIndex].trim().split(/\s+/);
        data.horizontalAngles = horizData.map(angle => parseFloat(angle) || 0);
      }

      lineIndex++;

      // Parse candela values
      const candelaValues = [];
      while (lineIndex < lines.length) {
        const line = lines[lineIndex].trim();
        if (line === '') break;

        const values = line.split(/\s+/).map(val => parseFloat(val) || 0);
        candelaValues.push(...values);
        lineIndex++;
      }

      data.candelaValues = candelaValues;

      // Calculate derived values
      if (candelaValues.length > 0) {
        data.maxCandela = Math.max(...candelaValues);
        data.beamAngleH = this.calculateBeamAngle(data.horizontalAngles, candelaValues, 'horizontal');
        data.beamAngleV = this.calculateBeamAngle(data.verticalAngles, candelaValues, 'vertical');
      }

      data.isValid = true;

      // Final fallback: search for lumens in the entire file
      if (data.lumens === 0) {
        console.log('🔍 Final fallback: searching entire file for lumens...');
        const fileContent = lines.join('\n').toLowerCase();
        
        // Try various patterns for lumens
        const patterns = [
          /lumens?\s*[=:]\s*(\d+(?:\.\d+)?)/i,
          /(\d+(?:\.\d+)?)\s*lumens?/i,
          /total\s*lumens?\s*[=:]\s*(\d+(?:\.\d+)?)/i,
          /luminous\s*flux\s*[=:]\s*(\d+(?:\.\d+)?)/i
        ];
        
        for (const pattern of patterns) {
          const match = fileContent.match(pattern);
          if (match) {
            data.lumens = parseFloat(match[1]) || 0;
            console.log('✅ Final fallback - Found lumens:', data.lumens, 'using pattern:', pattern);
            break;
          }
        }
        
        // If still no lumens, use maxCandela as fallback
        if (data.lumens === 0 && data.maxCandela > 0) {
          data.lumens = data.maxCandela;
          console.log('✅ Using maxCandela as lumens fallback:', data.lumens);
        }
      }

    } catch (error) {
      data.errors.push(error.message);
      console.error('IES parsing error:', error);
    }

    return data;
  }

  /**
   * Extract manufacturer from keyword line
   * @param {string} keywordLine - The IESNA keyword line
   * @returns {string} Manufacturer name
   */
  extractManufacturer(keywordLine) {
    const match = keywordLine.match(/IESNA:LM-63-2002\s+\[(.*?)\]/);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract catalog number from keyword line
   * @param {string} keywordLine - The IESNA keyword line
   * @returns {string} Catalog number
   */
  extractCatalogNumber(keywordLine) {
    const parts = keywordLine.split(/\s+/);
    return parts.length > 2 ? parts[2] : '';
  }

  /**
   * Calculate beam angle from candela values
   * @param {number[]} angles - Array of angles
   * @param {number[]} candelaValues - Array of candela values
   * @param {string} direction - 'horizontal' or 'vertical'
   * @returns {number} Beam angle in degrees
   */
  calculateBeamAngle(angles, candelaValues, direction) {
    if (!angles || angles.length === 0 || !candelaValues || candelaValues.length === 0) {
      return 0;
    }

    const maxCandela = Math.max(...candelaValues);
    const threshold = maxCandela * 0.5; // 50% of maximum candela

    let minAngle = angles[0];
    let maxAngle = angles[angles.length - 1];

    // Find angles where candela exceeds threshold
    for (let i = 0; i < candelaValues.length; i++) {
      if (candelaValues[i] >= threshold) {
        minAngle = Math.min(minAngle, angles[i] || 0);
        maxAngle = Math.max(maxAngle, angles[i] || 0);
      }
    }

    return maxAngle - minAngle;
  }
}

export default FrontendIESParser; 