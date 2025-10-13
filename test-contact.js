const testContactAPI = async () => {
  const response = await fetch('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      category: 'general',
      message: 'This is a test message from the API test'
    })
  });

  const result = await response.json();
  console.log('API Response:', result);
};

testContactAPI().catch(console.error);