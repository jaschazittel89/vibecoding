// Simple test script to debug signup API
const testSignup = async () => {
  try {
    console.log('Testing signup API...')
    
    const response = await fetch('http://localhost:3003/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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