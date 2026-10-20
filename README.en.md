```markdown
# Eat the Cat - Material 3 Edition

This project is a fork of [122440367/eatcat](https://github.com/122440367/eatcat). While preserving the core gameplay (a neo-concept rhythm game) and underlying logic, this version features a comprehensive **Material Design 3 (M3)** visual overhaul, UX optimizations, and internationalization (i18n).

## ✨ Key Changes & Features

### 1. UI & Visual Overhaul (Material 3)
- **Full M3 Design Implementation**: Adopted M3 color tokens, shape scales (capsule buttons, chips), and elevation shadows.
- **Auto Dark/Light Theme**: Implemented CSS `@media (prefers-color-scheme)` to automatically follow the system's dark or light mode.
  - **Dark Mode**: Deep space gray background with a lavender primary color, easy on the eyes.
  - **Light Mode**: Soft lavender-gray background with pure white translucent cards to create depth, avoiding harsh pure white screens.
- **Component Redesign**: Replaced legacy Bootstrap buttons with M3 variants (Filled, Tonal, Outlined, Chips). Upgraded input fields to Floating Label style and customized M3 Switches.

### 2. In-Game Visual Optimization
- **Grid & Lanes**: Note blocks now have a frosted glass texture. Alternating lanes have different opacities for better depth perception. Added a softer red border for miss-clicks.
- **Floating Timer Capsule**: The time limit text is now displayed inside a blurred, floating capsule, centered with a larger font size.
- **Instant Custom Image Update**: Fixed the bug where custom note images only took effect after a game restart.

### 3. Bug Fixes & UX Improvements
- **Fixed NaN Score Bug**: Fixed the calculation error that caused "survived NaN seconds" in the results screen if the player failed immediately without hitting any notes.
- **Fixed Screen Flickering**: Enabled GPU hardware acceleration (`will-change: transform`) and added a 30ms debounce in the touch event to prevent screen flickering and double-triggering during rapid taps.
- **Prevented Accidental Scrolls**: Locked global scrolling (`touch-action: manipulation`) to prevent the browser from zooming or scrolling while playing on mobile devices.
- **Fixed Refresh Button**: Fixed the dead "Refresh if bug occurs" button. It now correctly clears cookies and forces a page reload.

### 4. Internationalization (i18n)
- **Auto Language Detection**: Reads `navigator.language` to detect the player's system language.
- **Bilingual Support**: If the system language is English, all static UI texts, dynamic countdowns, and result screen comments (BPM, ratings, etc.) are seamlessly replaced with English. No manual toggle needed.

## 🚀 How to Play
You can access it directly via the GitHub Pages link, or clone this repository and open `index.html` in your browser.
