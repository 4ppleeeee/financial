# Implementation Plan - Break-even Decision Map

## Goal
Replace/Augment the existing 1D charts with a **2D Decision Boundary Chart** (盈亏平衡决策图).
This chart will plot `y` (Price Multiplier) vs `b` (Rent Yield) and draw the line where `T1 == T2`.

## Mathematical Model
We solve for the "Break-even Rent Yield (`b_equilibrium`)" for any given Price Multiplier (`y`):

**Condition**: `T1 (Buy) = T2 (Rent)`

Rearranging the formulas:
- Let `DebtCost = (1-m) * S * (24/25)`
- `T1 = S*y - DebtCost + S*b*(1+z)`
- `T2` is independent of `y` and `b`.

`S*b*(1+z) = T2 - (S*y - DebtCost)`
**`b = (T2 + DebtCost - S*y) / (S * (1+z))`**

## Proposed Visualization
### Component: `BuyVsRentCalculator.tsx`
- **New Chart**: Area Chart (or Line Chart with fill).
    - **X-Axis**: `y` (Price Coefficient, e.g., 0.9 - 1.3).
    - **Y-Axis**: `b` (Rent Yield, e.g., 0% - 5%).
    - **Line**: The calculated `b_equilibrium` for each `y`.
    - **Zones**:
        - **Above Line**: Buying Wins (Ideally? Wait, let's re-verify).
            - If `b` (Rent Income) is higher than break-even `b`, T1 (Buy) is *larger*. So Area Above = Buy Wins.
            - Area Below = Rent Wins.
    - **Current Position**: A distinct scatter point plotting the user's current settings `(y, b)`.

## Verification
- User inputs `y=1.0, b=0.015`. Chart shows a dot.
- If dot is above the line, T1 > T2.
- Check edge cases (e.g. extremely high price growth `y` should result in negative required `b`, meaning buy always wins).
