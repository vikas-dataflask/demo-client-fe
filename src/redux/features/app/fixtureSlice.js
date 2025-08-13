import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API base URL
const API_BASE = 'http://localhost:8000/api';

// Async thunks for API calls
export const generateFixtureId = createAsyncThunk(
  'fixture/generateId',
  async ({ zone, projectId, roomId, position }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/fixture/generate-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ zone, projectId, roomId, position })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to generate fixture ID');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createFixture = createAsyncThunk(
  'fixture/create',
  async (fixtureData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/fixture/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(fixtureData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create fixture');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProjectFixtures = createAsyncThunk(
  'fixture/getProjectFixtures',
  async ({ projectId, zone, roomId }, { rejectWithValue }) => {
    try {
      let url = `${API_BASE}/fixture/project/${projectId}`;
      const params = new URLSearchParams();
      if (zone) params.append('zone', zone);
      if (roomId) params.append('roomId', roomId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch fixtures');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkCreateFixtures = createAsyncThunk(
  'fixture/bulkCreate',
  async ({ fixtures, projectId, roomData }, { rejectWithValue }) => {
    try {
      console.log('📤 Redux bulkCreateFixtures request:', {
        url: `${API_BASE}/fixture/bulk-create`,
        fixturesCount: fixtures.length,
        projectId,
        hasRoomData: !!roomData
      });

      const response = await fetch(`${API_BASE}/fixture/bulk-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fixtures, projectId, roomData })
      });

      console.log('📥 Redux bulkCreateFixtures response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Redux bulkCreateFixtures error:', {
          status: response.status,
          data
        });
        return rejectWithValue(data.message || 'Failed to create fixtures');
      }

      console.log('✅ Redux bulkCreateFixtures success:', data);
      return data;
    } catch (error) {
      console.error('❌ Redux bulkCreateFixtures exception:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  fixtures: {}, // { fixtureId: fixtureData }
  fixturesByZone: {}, // { zone: [fixtures] }
  fixturesByRoom: {}, // { roomId: [fixtures] }
  projectFixtures: {}, // { projectId: { fixtures, fixturesByZone, total } }
  currentFixture: null,
  isLoading: false,
  error: null,
  lastGeneratedId: null,
  stats: {}
};

const fixtureSlice = createSlice({
  name: "fixture",
  initialState,
  reducers: {
    // Clear fixtures for a project
    clearProjectFixtures: (state, action) => {
      const { projectId } = action.payload;
      delete state.projectFixtures[projectId];
    },

    // Set current fixture
    setCurrentFixture: (state, action) => {
      state.currentFixture = action.payload;
    },

    // Clear current fixture
    clearCurrentFixture: (state) => {
      state.currentFixture = null;
    },

    // Add fixture to state
    addFixture: (state, action) => {
      const fixture = action.payload;
      state.fixtures[fixture.fixtureId] = fixture;
      
      // Update fixtures by zone
      if (!state.fixturesByZone[fixture.zone]) {
        state.fixturesByZone[fixture.zone] = [];
      }
      state.fixturesByZone[fixture.zone].push(fixture);
      
      // Update fixtures by room
      if (!state.fixturesByRoom[fixture.roomId]) {
        state.fixturesByRoom[fixture.roomId] = [];
      }
      state.fixturesByRoom[fixture.roomId].push(fixture);
    },

    // Update fixture
    updateFixture: (state, action) => {
      const { fixtureId, updates } = action.payload;
      if (state.fixtures[fixtureId]) {
        state.fixtures[fixtureId] = { ...state.fixtures[fixtureId], ...updates };
      }
    },

    // Remove fixture
    removeFixture: (state, action) => {
      const fixtureId = action.payload;
      const fixture = state.fixtures[fixtureId];
      
      if (fixture) {
        // Remove from fixtures
        delete state.fixtures[fixtureId];
        
        // Remove from fixtures by zone
        if (state.fixturesByZone[fixture.zone]) {
          state.fixturesByZone[fixture.zone] = state.fixturesByZone[fixture.zone]
            .filter(f => f.fixtureId !== fixtureId);
        }
        
        // Remove from fixtures by room
        if (state.fixturesByRoom[fixture.roomId]) {
          state.fixturesByRoom[fixture.roomId] = state.fixturesByRoom[fixture.roomId]
            .filter(f => f.fixtureId !== fixtureId);
        }
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Fixture ID
      .addCase(generateFixtureId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateFixtureId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastGeneratedId = action.payload.fixtureId;
        state.fixtures[action.payload.fixtureId] = action.payload.fixture;
      })
      .addCase(generateFixtureId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Fixture
      .addCase(createFixture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFixture.fulfilled, (state, action) => {
        state.isLoading = false;
        const fixture = action.payload.fixture;
        state.fixtures[fixture.fixtureId] = fixture;
        
        // Update fixtures by zone
        if (!state.fixturesByZone[fixture.zone]) {
          state.fixturesByZone[fixture.zone] = [];
        }
        state.fixturesByZone[fixture.zone].push(fixture);
        
        // Update fixtures by room
        if (!state.fixturesByRoom[fixture.roomId]) {
          state.fixturesByRoom[fixture.roomId] = [];
        }
        state.fixturesByRoom[fixture.roomId].push(fixture);
      })
      .addCase(createFixture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Project Fixtures
      .addCase(getProjectFixtures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectFixtures.fulfilled, (state, action) => {
        state.isLoading = false;
        const { fixtures, fixturesByZone, total } = action.payload;
        
        // Update fixtures
        fixtures.forEach(fixture => {
          state.fixtures[fixture.fixtureId] = fixture;
        });
        
        // Update project fixtures
        state.projectFixtures[action.meta.arg.projectId] = {
          fixtures,
          fixturesByZone,
          total
        };
      })
      .addCase(getProjectFixtures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Bulk Create Fixtures
      .addCase(bulkCreateFixtures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkCreateFixtures.fulfilled, (state, action) => {
        state.isLoading = false;
        const { createdFixtures } = action.payload;
        
        // Add all created fixtures to state
        createdFixtures.forEach(fixture => {
          state.fixtures[fixture.fixtureId] = fixture;
          
          // Update fixtures by zone
          if (!state.fixturesByZone[fixture.zone]) {
            state.fixturesByZone[fixture.zone] = [];
          }
          state.fixturesByZone[fixture.zone].push(fixture);
          
          // Update fixtures by room
          if (!state.fixturesByRoom[fixture.roomId]) {
            state.fixturesByRoom[fixture.roomId] = [];
          }
          state.fixturesByRoom[fixture.roomId].push(fixture);
        });
      })
      .addCase(bulkCreateFixtures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearProjectFixtures,
  setCurrentFixture,
  clearCurrentFixture,
  addFixture,
  updateFixture,
  removeFixture,
  clearError,
  setLoading
} = fixtureSlice.actions;

// Selectors
export const selectFixtures = (state) => state.fixture.fixtures;
export const selectFixturesByZone = (state) => state.fixture.fixturesByZone;
export const selectFixturesByRoom = (state) => state.fixture.fixturesByRoom;
export const selectProjectFixtures = (state, projectId) => state.fixture.projectFixtures[projectId];
export const selectCurrentFixture = (state) => state.fixture.currentFixture;
export const selectIsLoading = (state) => state.fixture.isLoading;
export const selectError = (state) => state.fixture.error;
export const selectLastGeneratedId = (state) => state.fixture.lastGeneratedId;

export default fixtureSlice.reducer; 