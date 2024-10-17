const { v4: uuidv4 } = require('uuid');

// In-memory database (replace this with a proper database in production)
let patients = [];
let medicalNotes = [];

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Successful preflight call.' }) };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;

  console.log(`Received ${method} request for ${path}`);

  try {
    if (path === '/patients' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(patients),
      };
    }

    if (path === '/patients' && method === 'POST') {
      console.log('Received POST request body:', event.body);
      const newPatient = JSON.parse(event.body);
      newPatient.id = uuidv4();
      newPatient.status = 'Active';
      newPatient.admissionDate = newPatient.admissionDate || new Date().toISOString();
      patients.push(newPatient);
      console.log('Added new patient:', newPatient);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newPatient),
      };
    }

    if (path.startsWith('/patients/') && method === 'PUT') {
      const id = path.split('/')[2];
      const updates = JSON.parse(event.body);
      const patientIndex = patients.findIndex(p => p.id === id);
      if (patientIndex !== -1) {
        patients[patientIndex] = { ...patients[patientIndex], ...updates };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(patients[patientIndex]),
        };
      }
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Patient not found' }),
      };
    }

    if (path === '/notes' && method === 'POST') {
      const newNote = JSON.parse(event.body);
      newNote.id = uuidv4();
      medicalNotes.push(newNote);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newNote),
      };
    }

    if (path.startsWith('/patients/') && path.endsWith('/notes') && method === 'GET') {
      const patientId = path.split('/')[2];
      const patientNotes = medicalNotes.filter(note => note.patientId === patientId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(patientNotes),
      };
    }

    console.log(`No matching route for ${method} ${path}`);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not Found' }),
    };
  } catch (error) {
    console.error('Server Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
    };
  }
};