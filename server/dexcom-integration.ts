import type { Patient, DexcomData, InsertDexcomData } from "@shared/schema";

export interface DexcomAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface DexcomGlucoseReading {
  value: number;
  trend: 'flat' | 'fortyFiveUp' | 'singleUp' | 'doubleUp' | 'fortyFiveDown' | 'singleDown' | 'doubleDown';
  trendRate: number;
  displayTime: string;
  systemTime: string;
}

export interface DexcomEGVResponse {
  egvs: DexcomGlucoseReading[];
}

export interface DexcomDataRange {
  start: {
    systemTime: string;
    displayTime: string;
  };
  end: {
    systemTime: string;
    displayTime: string;
  };
}

class DexcomService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.dexcom.com' 
    : 'https://sandbox-api.dexcom.com';
  
  private clientId = process.env.DEXCOM_CLIENT_ID;
  private clientSecret = process.env.DEXCOM_CLIENT_SECRET;
  private redirectUri = process.env.DEXCOM_REDIRECT_URI || 'http://localhost:5000/api/dexcom/callback';

  constructor() {
    if (!this.clientId || !this.clientSecret) {
      console.warn('Dexcom credentials not configured - running in demo mode');
    }
  }

  /**
   * Generate Dexcom OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId || 'demo',
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'offline_access',
      state
    });

    return `${this.baseUrl}/v2/oauth2/login?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<DexcomAuthResponse> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Dexcom credentials not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Dexcom token exchange failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<DexcomAuthResponse> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Dexcom credentials not configured');
    }

    const response = await fetch(`${this.baseUrl}/v2/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Dexcom token refresh failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get patient's glucose data range
   */
  async getDataRange(accessToken: string): Promise<DexcomDataRange> {
    const response = await fetch(`${this.baseUrl}/v3/users/self/dataRange`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Dexcom data range request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get estimated glucose values (EGVs) for a date range
   */
  async getGlucoseReadings(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<DexcomEGVResponse> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await fetch(`${this.baseUrl}/v2/users/self/egvs?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Dexcom EGV request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get latest glucose readings (last 24 hours)
   */
  async getLatestReadings(accessToken: string): Promise<DexcomEGVResponse> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    return this.getGlucoseReadings(accessToken, startDate, endDate);
  }

  /**
   * Convert Dexcom reading to our database format
   */
  convertToInsertData(reading: DexcomGlucoseReading, patientId: number): InsertDexcomData {
    return {
      patientId,
      glucoseValue: reading.value.toString(),
      timestamp: new Date(reading.systemTime),
      trend: reading.trend,
      trendRate: reading.trendRate.toString(),
      displayTime: new Date(reading.displayTime),
      systemTime: new Date(reading.systemTime),
    };
  }

  /**
   * Generate demo glucose data for testing
   */
  generateDemoData(patientId: number, hours: number = 24): InsertDexcomData[] {
    const readings: InsertDexcomData[] = [];
    const now = new Date();
    
    // Generate readings every 15 minutes for the specified hours
    for (let i = 0; i < hours * 4; i++) {
      const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
      
      // Generate realistic glucose values (80-200 mg/dL with some variation)
      const baseValue = 120 + Math.sin(i * 0.1) * 20; // Daily rhythm
      const noise = (Math.random() - 0.5) * 30; // Random variation
      const glucoseValue = Math.max(70, Math.min(250, baseValue + noise));
      
      // Determine trend based on recent changes
      let trend: string = 'flat';
      if (i > 0) {
        const prevReading = readings[i - 1];
        const change = glucoseValue - parseFloat(prevReading.glucoseValue);
        if (change > 5) trend = 'singleUp';
        else if (change > 15) trend = 'doubleUp';
        else if (change < -5) trend = 'singleDown';
        else if (change < -15) trend = 'doubleDown';
      }
      
      readings.push({
        patientId,
        glucoseValue: glucoseValue.toFixed(1),
        timestamp,
        trend,
        trendRate: (Math.random() - 0.5).toFixed(2),
        displayTime: timestamp,
        systemTime: timestamp,
      });
    }
    
    return readings.reverse(); // Return in chronological order
  }

  /**
   * Calculate glucose statistics from readings
   */
  calculateGlucoseStats(readings: DexcomData[]): {
    averageGlucose: number;
    timeInRange: number; // Percentage of readings in 70-180 mg/dL
    timeAboveRange: number; // Percentage > 180 mg/dL
    timeBelowRange: number; // Percentage < 70 mg/dL
    glucoseVariability: number; // Standard deviation
    latestReading: DexcomData | null;
  } {
    if (readings.length === 0) {
      return {
        averageGlucose: 0,
        timeInRange: 0,
        timeAboveRange: 0,
        timeBelowRange: 0,
        glucoseVariability: 0,
        latestReading: null,
      };
    }

    const values = readings.map(r => parseFloat(r.glucoseValue));
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const aboveRange = values.filter(v => v > 180).length;
    const belowRange = values.filter(v => v < 70).length;
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    const latestReading = readings.reduce((latest, current) => 
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );

    return {
      averageGlucose: Math.round(average),
      timeInRange: Math.round((inRange / readings.length) * 100),
      timeAboveRange: Math.round((aboveRange / readings.length) * 100),
      timeBelowRange: Math.round((belowRange / readings.length) * 100),
      glucoseVariability: Math.round(standardDeviation),
      latestReading,
    };
  }
}

export const dexcomService = new DexcomService();

// Demo function for when Dexcom is not configured
export function isDexcomConfigured(): boolean {
  return !!(process.env.DEXCOM_CLIENT_ID && process.env.DEXCOM_CLIENT_SECRET);
}