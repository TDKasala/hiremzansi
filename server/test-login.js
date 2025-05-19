import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

// Function to compare stored password hash with supplied password
async function comparePasswords(supplied, stored) {
  try {
    console.log('Comparing supplied password with stored hash');
    console.log('Supplied password:', supplied);
    console.log('Stored hash:', stored);
    
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format');
      return false;
    }

    const [hashed, salt] = stored.split('.');
    
    console.log('Extracted hash:', hashed);
    console.log('Extracted salt:', salt);
    
    if (!hashed || !salt) {
      console.error('Missing hash or salt component');
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    
    console.log('Hashed buffer length:', hashedBuf.length);
    console.log('Supplied buffer length:', suppliedBuf.length);
    
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error('Buffer length mismatch');
      return false;
    }
    
    // Convert buffers to hex strings for manual comparison
    const hashedHex = hashedBuf.toString('hex');
    const suppliedHex = suppliedBuf.toString('hex');
    
    console.log('Hashed hex:', hashedHex);
    console.log('Supplied hex:', suppliedHex);
    console.log('Passwords match:', hashedHex === suppliedHex);
    
    return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

// Test with the actual stored password from the database
const dbPassword = '5a43c4b4b6f6e4da1d2c4a2b919587a10f0eeda0375b6193cba01e7cae108378a8f76ff9b6ed9f39125097bd4d3ade6246479b2540261a1292e3be3d63390508.3cadae39433a0b56e436447ed4abb2dc';

// Try different test passwords
async function testPasswords() {
  const testPasswords = [
    'password123',
    'deniskasala',
    'admin123',
    'deniskasala123',
    'denis123'
  ];
  
  for (const password of testPasswords) {
    console.log('\n----- Testing password:', password, '-----');
    const result = await comparePasswords(password, dbPassword);
    console.log('Result:', result);
  }
}

testPasswords().catch(console.error);