
const SUPABASE_URL = 'https://fxjmgpoonjjduwkwoian.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4am1ncG9vbmpqZHV3a3dvaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDYwMzEsImV4cCI6MjA4MTQyMjAzMX0.d-hQ7kFtFqLdU3VehfF3qdjNTC-3RQ48j22rCED4CUk';

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vital_records?select=*&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Connection established.');
            console.log('Sample data:', data);
        } else {
            const error = await response.json();
            console.error('Failed to connect to Supabase:', response.status, error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

testConnection();
