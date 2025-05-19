import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

// Hash a password - same as in auth.ts
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Compare passwords - same as in auth.ts
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
    
    // Compare hex strings
    const hashedHex = hashedBuf.toString('hex');
    const suppliedHex = suppliedBuf.toString('hex');
    
    console.log('Match result:', hashedHex === suppliedHex);
    
    // Use timing-safe compare for actual comparison
    return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

// Create a new password hash for a known password
async function main() {
  // Generate a fresh password hash
  const password = 'testpass123';
  const hashedPassword = await hashPassword(password);
  console.log('\nCreated new password hash:');
  console.log('Password:', password);
  console.log('Hash:', hashedPassword);
  
  // Test if we can verify it (should always work)
  console.log('\nVerifying the new hash:');
  const verifyResult = await comparePasswords(password, hashedPassword);
  console.log('Verification result:', verifyResult);
  
  // Test against the stored password
  const dbPassword = '5a43c4b4b6f6e4da1d2c4a2b919587a10f0eeda0375b6193cba01e7cae108378a8f76ff9b6ed9f39125097bd4d3ade6246479b2540261a1292e3be3d63390508.3cadae39433a0b56e436447ed4abb2dc';
  
  // Try different test passwords
  const testPasswords = [
    'password123',
    'admin123',
    'password',
    '123456',
    'testpassword'
  ];
  
  for (const testPassword of testPasswords) {
    console.log(`\nTesting '${testPassword}' against DB hash:`);
    const result = await comparePasswords(testPassword, dbPassword);
    console.log('Match result:', result);
  }
}

main().catch(console.error);