// Debug script for testing procrastination logic
// Chạy trong browser console để test

console.log("🧪 Testing Procrastination Logic");

// Test data
const testEvent = {
  id: 'test',
  title: 'Test Task',
  type: 'deadline',
  estimatedTime: 8, // 8 hours estimated
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
};

// Test with different priorities
const priorities = ['high', 'medium', 'low'];
const expectedCoefficients = {
  high: 1.1,    // High priority = low procrastination
  medium: 1.8,  // Medium priority = average procrastination
  low: 2.5      // Low priority = high procrastination
};

console.log("📊 Expected Priority Coefficients:");
console.table(expectedCoefficients);

console.log("\n🧮 Calculation Logic:");
console.log("- Higher coefficient = More procrastination = Earlier realistic deadline");
console.log("- Priority LOW (2.5x) should suggest deadline EARLIEST");
console.log("- Priority HIGH (1.1x) should suggest deadline LATEST");

// Manual calculation example
const estimatedHours = 8;
priorities.forEach(priority => {
  const coefficient = expectedCoefficients[priority];
  const realisticHours = estimatedHours * coefficient;
  const bufferHours = realisticHours - estimatedHours;
  
  console.log(`\n${priority.toUpperCase()} Priority:`);
  console.log(`- Coefficient: ${coefficient}x`);
  console.log(`- Realistic time needed: ${realisticHours}h`);
  console.log(`- Buffer needed: ${bufferHours}h`);
  console.log(`- Realistic deadline: ${bufferHours}h EARLIER than official`);
});

console.log("\n✅ Expected Result Order (most early to latest):");
console.log("1. LOW priority (6h sớm hơn)");
console.log("2. MEDIUM priority (6.4h sớm hơn)"); 
console.log("3. HIGH priority (0.8h sớm hơn)");

// Clear localStorage to reset patterns
console.log("\n🗑️ Clearing localStorage to reset AI patterns...");
localStorage.removeItem('procrastination_patterns');
console.log("✅ Done! Now test with fresh AI patterns.");
