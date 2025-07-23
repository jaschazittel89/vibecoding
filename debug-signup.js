// Simple test script to debug signup API
const testSignup = async () => {
  try {
    console.log('Testing signup API...')
    
    const response = await fetch('http://localhost:3002/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123'
      }),
    })

    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (!response.ok) {
      console.error('Signup failed:', data)
    } else {
      console.log('Signup successful:', data)
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testSignup() 