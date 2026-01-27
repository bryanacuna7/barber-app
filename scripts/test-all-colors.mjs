#!/usr/bin/env node

/**
 * Test all 9 preset colors for WCAG contrast compliance
 */

const PRESET_COLORS = [
  { hex: '#27272A', name: 'Default' },
  { hex: '#334155', name: 'Slate' },
  { hex: '#B8860B', name: 'Gold' },
  { hex: '#DC143C', name: 'Crimson' },
  { hex: '#1E40AF', name: 'Navy' },
  { hex: '#047857', name: 'Forest' },
  { hex: '#8B5CF6', name: 'Plum' },
  { hex: '#D97706', name: 'Amber' },
  { hex: '#0D9488', name: 'Teal' },
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

console.log('🎨 Testing all 9 preset colors for WCAG AA compliance (4.5:1)\n');
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
