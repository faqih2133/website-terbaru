// src/utils/testConnection.js
import pool from '../lib/database';

export const testDatabaseConnection = async () => {
  try {
    const [rows] = await pool.execute('SELECT 1 + 1 as result');
    console.log('✅ Database test successful:', rows[0].result);
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
};

// Test query untuk data NPK
export const testNPKData = async () => {
  try {
    const [users] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const [assessments] = await pool.execute('SELECT COUNT(*) as total FROM behavioral_assessments');
    const [calculations] = await pool.execute('SELECT COUNT(*) as total FROM npk_calculations');
    
    console.log('📊 Database Status:');
    console.log(`👥 Users: ${users[0].total}`);
    console.log(`📝 Assessments: ${assessments[0].total}`);
    console.log(`🧮 Calculations: ${calculations[0].total}`);
    
    return { users: users[0].total, assessments: assessments[0].total, calculations: calculations[0].total };
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
    return null;
  }
};