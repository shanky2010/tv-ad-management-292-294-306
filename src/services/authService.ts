
import { User, UserRole } from '@/types';
import { db, delay } from './mockDb';
import { mockLogin as loginMockOriginal, mockRegister as registerMock } from '@/data/mockData';

// Custom login implementation that also checks the db.users array
const loginMock = (email: string, password: string): User | null => {
  // First check the original mock users
  const originalUser = loginMockOriginal(email, password);
  if (originalUser) return originalUser;
  
  // Then check the dynamically added users (assuming password is "password" for simplicity)
  // In a real app, you would hash passwords and compare properly
  const dynamicUser = db.users.find(u => u.email === email);
  if (dynamicUser) {
    console.log('Found dynamically added user:', dynamicUser);
    return dynamicUser;
  }
  
  return null;
};

// Authentication
export const login = async (email: string, password: string): Promise<User | null> => {
  await delay(800); // Simulate network delay
  console.log(`Login attempt for email: ${email}`);
  const user = loginMock(email, password);
  console.log('Login result:', user);
  return user;
};

export const register = async (
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<User> => {
  await delay(1000); // Simulate network delay
  console.log(`Registration for email: ${email}, name: ${name}, role: ${role}`);
  const newUser = registerMock(email, password, name, role);
  
  // Check if user already exists to avoid duplicates
  const existingUser = db.users.find(u => u.email === email);
  if (!existingUser) {
    db.users.push(newUser);
    console.log('New user registered and added to db.users:', newUser);
    console.log('Current users in db:', db.users.map(u => ({ id: u.id, email: u.email })));
  } else {
    console.log('User already exists, not adding duplicate:', existingUser);
  }
  
  return newUser;
};
