import jwt from 'jsonwebtoken';

// Test JWT token generation and verification
const JWT_SECRET = process.env.JWT_SECRET || "hire-mzansi-admin-secret-2024";

// Sample admin user data
const adminUser = {
  id: 1,
  email: "deniskasala17@gmail.com",
  name: "Denis Kasala",
  role: "admin",
  isAdmin: true
};

// Generate token
const token = jwt.sign(
  {
    userId: adminUser.id,
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    isAdmin: adminUser.isAdmin,
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

console.log('Generated token:', token);
console.log('JWT Secret:', JWT_SECRET);

// Verify token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded token:', decoded);
  
  // Check admin role
  if (decoded.role === 'admin' && decoded.isAdmin) {
    console.log('✓ Admin authentication successful');
  } else {
    console.log('✗ Admin authentication failed - role:', decoded.role, 'isAdmin:', decoded.isAdmin);
  }
} catch (error) {
  console.error('Token verification error:', error.message);
}