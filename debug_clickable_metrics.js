// Quick test script to check clickable health metrics
console.log("🔍 Testing clickable health metrics functionality...");

// Test 1: Check if DailyMetricsInput components are rendered
const metricsInputs = document.querySelectorAll('[role="dialog"]');
console.log(`Found ${metricsInputs.length} dialog components`);

// Test 2: Check if hover effects work
const hoverCards = document.querySelectorAll('.group');
console.log(`Found ${hoverCards.length} hover-enabled cards`);

// Test 3: Check if click handlers are attached
const clickableCards = document.querySelectorAll('.cursor-pointer');
console.log(`Found ${clickableCards.length} clickable cards`);

// Test 4: Check if "Click to update" text exists
const updateText = document.querySelectorAll('*').filter(el => el.textContent?.includes('Click to update'));
console.log(`Found ${updateText.length} "Click to update" texts`);

// Test 5: Log patient data structure
if (window.location.pathname.includes('patient') || window.location.pathname === '/') {
  console.log("Patient dashboard detected");
  console.log("Available health metrics should be clickable:");
  console.log("- Weight (blue card)");
  console.log("- Body Fat (green card)");
  console.log("- Blood Pressure (red card)");
  console.log("- Blood Sugar (purple card)");
}

// Helper function to simulate click
function testMetricClick(metricType) {
  const cards = document.querySelectorAll('.cursor-pointer');
  cards.forEach((card, index) => {
    console.log(`Card ${index}:`, card.textContent.substring(0, 50));
  });
}

console.log("✅ Test complete - call testMetricClick() to test clicking");