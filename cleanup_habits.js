const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function cleanup() {
    try {
        // Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in');

        // Get Habits
        const habitsRes = await axios.get(`${API_URL}/habits`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const habits = habitsRes.data;
        console.log(`Found ${habits.length} habits`);

        // Delete Habits
        for (const habit of habits) {
            await axios.delete(`${API_URL}/habits/${habit.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Deleted habit: ${habit.title}`);
        }
        console.log('Cleanup complete');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

cleanup();
