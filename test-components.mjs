#!/usr/bin/env node

import fs from 'fs';

console.log('🔍 Testing Component Structure and CTA Functionality...\n');

// Test function definitions in components
function testComponentFunctions(filePath, expectedFunctions) {
  console.log(`Testing ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let allFound = true;

  for (const func of expectedFunctions) {
    if (content.includes(func)) {
      console.log(`✅ Function found: ${func}`);
    } else {
      console.log(`❌ Function missing: ${func}`);
      allFound = false;
    }
  }

  return allFound;
}

// Test onClick handlers and event functions
function testOnClickHandlers(filePath, expectedHandlers) {
  console.log(`\nTesting onClick handlers in ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let allFound = true;

  for (const handler of expectedHandlers) {
    if (content.includes(handler)) {
      console.log(`✅ Handler found: ${handler}`);
    } else {
      console.log(`❌ Handler missing: ${handler}`);
      allFound = false;
    }
  }

  return allFound;
}

// Test Button component exports
console.log('1️⃣ Testing Button Component...');
const buttonPath = 'src/components/ui/Button/Button.jsx';
testComponentFunctions(buttonPath, [
  'onClick',
  'disabled',
  'loading',
  'variant',
  'const Button = (',
  'export default Button'
]);

// Test LoginForm
console.log('\n2️⃣ Testing LoginForm Component...');
const loginFormPath = 'src/features/auth/components/LoginForm.jsx';
testComponentFunctions(loginFormPath, [
  'handleSubmit',
  'handleInputChange',
  'onSwitchToRegister',
  'onSwitchToForgotPassword'
]);

testOnClickHandlers(loginFormPath, [
  'onClick={() =>',
  'onClick={',
  'onSubmit={handleSubmit}',
  'onChange={handleInputChange}'
]);

// Test RegisterForm
console.log('\n3️⃣ Testing RegisterForm Component...');
const registerFormPath = 'src/features/auth/components/RegisterForm.jsx';
testComponentFunctions(registerFormPath, [
  'handleSubmit',
  'handleInputChange',
  'onSwitchToLogin',
  'onRegistrationSuccess'
]);

// Test OnboardingFlow
console.log('\n4️⃣ Testing OnboardingFlow Component...');
const onboardingPath = 'src/features/onboarding/components/OnboardingFlow.jsx';
testComponentFunctions(onboardingPath, [
  'handleWelcomeContinue',
  'handleGoalsContinue',
  'handleOnboardingComplete',
  'handleBack'
]);

// Test WelcomeScreen
console.log('\n5️⃣ Testing WelcomeScreen Component...');
const welcomePath = 'src/features/onboarding/components/WelcomeScreen.jsx';
testOnClickHandlers(welcomePath, [
  'onClick={onContinue}',
  'onClick={() => onContinue'
]);

// Test GoalSelection
console.log('\n6️⃣ Testing GoalSelection Component...');
const goalPath = 'src/features/onboarding/components/GoalSelection.jsx';
testComponentFunctions(goalPath, [
  'handleGoalToggle',
  'handlePrimaryGoalSelect',
  'handleContinue'
]);

testOnClickHandlers(goalPath, [
  'onClick={() => handleGoalToggle',
  'onClick={handleContinue}',
  'onClick={() => setSelectedGoals'
]);

// Test ProfileSetup
console.log('\n7️⃣ Testing ProfileSetup Component...');
const profilePath = 'src/features/onboarding/components/ProfileSetup.jsx';
testComponentFunctions(profilePath, [
  'handleInputChange',
  'handleComplete',
  'calculateBMR',
  'calculateTDEE'
]);

console.log('\n🏁 Component Structure Test Complete!');