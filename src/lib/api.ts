// src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Define types for API responses
interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: 'patient' | 'doctor';
    profileId: number | null;
  };
}

interface MessageResponse {
  message: string;
}

interface PatientProfileResponse {
  patient: {
    id: number;
    gender?: string;
    age?: number;
    height?: number;
    weight?: number;
    medical_conditions?: string[];
    medications?: string[];
    doctor_id?: number;
    created_at: string;
    updated_at: string;
  };
  devices: Array<{
    id: number;
    serial_number: string;
    firmware_version?: string;
    last_sync?: string;
    battery_level?: number;
    status?: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface SleepHistoryResponse {
  sleepHistory: Array<{
    id: number;
    date: string;
    sleep_duration?: number;
    sleep_quality?: number;
    ahi?: number;
    apnea_events?: number;
    hypopnea_events?: number;
    lowest_oxygen?: number;
    avg_oxygen?: number;
    severity?: string;
    analysis_status?: string;
    doctor_notes?: string;
    reviewed_at?: string;
    total_events?: number;
  }>;
}

interface SleepDetailsResponse {
  sleepData: {
    id: number;
    date: string;
    start_time: string;
    end_time?: string;
    sleep_duration?: number;
    sleep_quality?: number;
  };
  analysis: {
    id: number;
    ahi: number;
    apnea_events: number;
    hypopnea_events: number;
    lowest_oxygen?: number;
    avg_oxygen?: number;
    time_below90?: number;
    severity?: string;
    status: string;
    doctor_notes?: string;
    reviewed_at?: string;
  };
  events: Array<{
    id: number;
    type: 'apnea' | 'hypopnea' | 'normal';
    start_time: string;
    duration: number;
    oxygen_drop?: number;
    severity?: string;
    confidence?: number;
  }>;
}

interface DeviceResponse {
  device: {
    id: number;
    serial_number: string;
    firmware_version?: string;
    last_sync?: string;
    battery_level?: number;
    status?: string;
    created_at: string;
    updated_at: string;
  };
}

interface DoctorProfileResponse {
  doctor: {
    id: number;
    specialty?: string;
    license_number?: string;
    created_at: string;
    updated_at: string;
  };
}

interface PatientListResponse {
  patients: Array<{
    id: number;
    user_id: number;
    full_name: string;
    email: string;
    gender?: string;
    age?: number;
    height?: number;
    weight?: number;
    medical_conditions?: string[];
    medications?: string[];
    last_analysis_date?: string;
    last_ahi?: number;
    severity?: string;
  }>;
}

interface PatientDetailsResponse {
  patient: {
    id: number;
    user_id: number;
    full_name: string;
    email: string;
    gender?: string;
    age?: number;
    height?: number;
    weight?: number;
    medical_conditions?: string[];
    medications?: string[];
  };
  sleepHistory: Array<{
    id: number;
    date: string;
    sleep_duration?: number;
    sleep_quality?: number;
    ahi?: number;
    apnea_events?: number;
    hypopnea_events?: number;
    lowest_oxygen?: number;
    avg_oxygen?: number;
    severity?: string;
    analysis_status?: string;
    doctor_notes?: string;
    reviewed_at?: string;
    total_events?: number;
  }>;
}

interface PendingApprovalsResponse {
  pendingApprovals: Array<{
    id: number;
    ahi: number;
    apnea_events: number;
    hypopnea_events: number;
    lowest_oxygen?: number;
    avg_oxygen?: number;
    time_below90?: number;
    severity?: string;
    created_at: string;
    date: string;
    patient_id: number;
    patient_name: string;
    age?: number;
    gender?: string;
  }>;
}

interface SensorDataResponse {
  sensorData: Array<{
    id: number;
    timestamp: string;
    ecg?: number;
    oxygen?: number;
    thorax?: number;
    breathing?: number;
    heart_rate?: number;
    has_apnea_event: boolean;
  }>;
}

// User registration data type
interface RegistrationData {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

// Patient profile update data type
interface PatientProfileData {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  medical_conditions?: string[];
  medications?: string[];
}

// Doctor profile update data type
interface DoctorProfileData {
  specialty?: string;
  license_number?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token from local storage when available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Auth services
export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    register: async (userData: RegistrationData): Promise<MessageResponse> => {
      try {
        const response = await api.post<MessageResponse>('/auth/register', userData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getMe: async (): Promise<AuthResponse> => {
      try {
        const response = await api.get<AuthResponse>('/auth/me');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    changePassword: async (currentPassword: string, newPassword: string): Promise<MessageResponse> => {
      try {
        const response = await api.post<MessageResponse>('/auth/change-password', {
          currentPassword,
          newPassword
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  };

// Patient services
export const patientService = {
  getProfile: async (): Promise<PatientProfileResponse> => {
    try {
      const response = await api.get<PatientProfileResponse>('/patient/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateProfile: async (profileData: PatientProfileData): Promise<PatientProfileResponse> => {
    try {
      const response = await api.put<PatientProfileResponse>('/patient/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getSleepHistory: async (limit = 30, offset = 0): Promise<SleepHistoryResponse> => {
    try {
      const response = await api.get<SleepHistoryResponse>(`/patient/sleep-history?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getSleepDetails: async (sleepDataId: number): Promise<SleepDetailsResponse> => {
    try {
      const response = await api.get<SleepDetailsResponse>(`/patient/sleep-details/${sleepDataId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getDeviceStatus: async (deviceId: number): Promise<DeviceResponse> => {
    try {
      const response = await api.get<DeviceResponse>(`/patient/device/${deviceId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Doctor services
export const doctorService = {
  getProfile: async (): Promise<DoctorProfileResponse> => {
    try {
      const response = await api.get<DoctorProfileResponse>('/doctor/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateProfile: async (profileData: DoctorProfileData): Promise<DoctorProfileResponse> => {
    try {
      const response = await api.put<DoctorProfileResponse>('/doctor/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getPatients: async (): Promise<PatientListResponse> => {
    try {
      const response = await api.get<PatientListResponse>('/doctor/patients');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getPatientDetails: async (patientId: number): Promise<PatientDetailsResponse> => {
    try {
      const response = await api.get<PatientDetailsResponse>(`/doctor/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getPendingApprovals: async (): Promise<PendingApprovalsResponse> => {
    try {
      const response = await api.get<PendingApprovalsResponse>('/doctor/pending-approvals');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  approveAnalysis: async (analysisId: number, notes: string): Promise<MessageResponse> => {
    try {
      const response = await api.post<MessageResponse>(`/doctor/analysis/${analysisId}/approve`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  rejectAnalysis: async (analysisId: number, notes: string): Promise<MessageResponse> => {
    try {
      const response = await api.post<MessageResponse>(`/doctor/analysis/${analysisId}/reject`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Device data services
export const deviceDataService = {
  getSensorData: async (
    sleepDataId: number, 
    startTime?: string, 
    endTime?: string, 
    limit = 1000
  ): Promise<SensorDataResponse> => {
    try {
      let url = `/data/sensor-data/${sleepDataId}?limit=${limit}`;
      if (startTime) url += `&startTime=${startTime}`;
      if (endTime) url += `&endTime=${endTime}`;
      
      const response = await api.get<SensorDataResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;