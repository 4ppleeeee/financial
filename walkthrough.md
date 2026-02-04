# Financial Web Project Walkthrough

## Overview
I have successfully initialized your **Financial Web Project** using a robust configuration tailored for your environment.

### 🛠 Architecture
- **Framework**: React 18 + TypeScript (Stable & Modern).
- **Build Tool**: Vite 4 (Super fast, configured for Node 16 compatibility).
- **Styling**: Vanilla CSS with CSS Variables (Premium Dark Mode).

## Project Structure
Similar to Android Project Structure:
- `src/main.tsx` → **AndroidManifest / Entry Point**
- `src/App.tsx` → **MainActivity** (Your landing screen)
- `src/components/` → **Custom Views / Composables** (Reusable UI)
- `src/styles/` → **res/values/styles.xml** (Global theme & colors)

## Key Features Implemented
1.  **Premium Dark Theme**: Deep navy background with glassmorphism effects (`backdrop-filter: blur`).
2.  **Component Architecture**: Example `FundingCard` component demonstrating Props and clean separation of concerns.
3.  **Responsive Grid**: A dashboard layout that adapts to screen size automatically.

### 🧮 Buy vs Rent Calculator
Implements complex financial modeling to compare:
- **T1 (Buy)**: Asset appreciation + rental yield opportunity.
- **T2 (Rent)**: Investment returns on saved down payment + difference.

**Visualizations**:
- **Price Sensitivity**: How changing property values (`y`) affects the winner.
- **Yield Sensitivity**: How changing rent-to-value ratios (`b`) impacts the decision.


## How to Run
Open your terminal and navigate to the new location:

```bash
cd /Users/aatroxli/coding/financial
npm run dev
```

This will start a local server (usually `http://localhost:5173`). Open that URL in your browser to see the app.
