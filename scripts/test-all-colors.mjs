#!/usr/bin/env node

/**
 * Test all 16 preset colors for WCAG contrast compliance
 */

const PRESET_COLORS = [
  { hex: '#1C1C1E', name: 'Negro' },
  { hex: '#2C2C2E', name: 'Carbón' },
  { hex: '#C4953A', name: 'Dorado' },
  { hex: '#D4A843', name: 'Oro Claro' },
  { hex: '#FF3B30', name: 'Rojo' },
  { hex: '#8B0000', name: 'Borgoña' },
  { hex: '#007AFF', name: 'Azul iOS' },
  { hex: '#0A84FF', name: 'Azul Brillante' },
  { hex: '#34C759', name: 'Verde' },
  { hex: '#30D158', name: 'Verde Menta' },
  { hex: '#AF52DE', name: 'Morado' },
  { hex: '#5856D6', name: 'Índigo' },
  { hex: '#FF9500', name: 'Naranja' },
  { hex: '#FF6B35', name: 'Coral' },
  { hex: '#5AC8FA', name: 'Celeste' },
  { hex: '#64D2FF', name: 'Aqua' },
];

function hexToRgbValues(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getContrastingTextColor(backgroundColor) {
  const { r, g, b } = hexToRgbValues(backgroundColor);
  const bgLuminance = getLuminance(r, g, b);
  const whiteLuminance = 1;
  const contrastWithWhite = getContrastRatio(bgLuminance, whiteLuminance);
  return contrastWithWhite >= 4.5 ? '#ffffff' : '#000000';
}

console.log('🎨 Testing all 16 preset colors for WCAG AA compliance (4.5:1)\n');
console.log('Color          | Hex     | Luminance | Contrast Text | Light BG | Dark BG | Status');
console.log('─'.repeat(90));

let allPass = true;

PRESET_COLORS.forEach((color) => {
  const { r, g, b } = hexToRgbValues(color.hex);
  const luminance = getLuminance(r, g, b);
  const contrastText = getContrastingTextColor(color.hex);

  // Test contrast with white (light mode background)
  const contrastWithWhite = getContrastRatio(luminance, 1);
  const lightBgPass = contrastWithWhite >= 4.5 ? '✅' : '⚠️';

  // Test contrast with black (dark mode background)
  const contrastWithBlack = getContrastRatio(luminance, 0);
  const darkBgPass = contrastWithBlack >= 4.5 ? '✅' : '⚠️';

  // Overall status
  const status = (contrastWithWhite >= 4.5 || contrastWithBlack >= 4.5) ? '✅ OK' : '❌ FAIL';

  if (status === '❌ FAIL') allPass = false;

  console.log(
    `${color.name.padEnd(14)} | ${color.hex} | ${luminance.toFixed(3).padStart(5)} | ${contrastText.padEnd(13)} | ${lightBgPass.padEnd(8)} | ${darkBgPass.padEnd(7)} | ${status}`
  );
});

console.log('─'.repeat(90));
console.log(`\n${allPass ? '✅ All colors pass WCAG AA!' : '⚠️  Some colors may need adjustment'}`);
console.log('\nNote: Colors with ⚠️ will be automatically adjusted by ThemeProvider for readability.');
