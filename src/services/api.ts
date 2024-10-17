import axios from 'axios';
import { Patient, MedicalNote } from '../types';

const API_URL = '/.netlify/functions/api';

const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error setting up request:', error.message);
  }
  throw new Error(error.response?.data?.message || error.message || 'An unknown error occurred');
};

export const api = {
  async getPatients(): Promise<Patient[]> {
    try {
      const response = await axios.get(`${API_URL}/patients`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      console.log('Sending patient data:', patient);
      const response = await axios.post(`${API_URL}/patients`, patient);
      console.log('Response received:', response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const response = await axios.put(`${API_URL}/patients/${id}`, updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getMedicalNotes(patientId: string): Promise<MedicalNote[]> {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/notes`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addMedicalNote(note: Omit<MedicalNote, 'id'>): Promise<MedicalNote> {
    try {
      const response = await axios.post(`${API_URL}/notes`, note);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};