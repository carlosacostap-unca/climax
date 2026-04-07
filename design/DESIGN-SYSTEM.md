# Design System Documentation: Atmospheric Precision

## 1. Overview & Creative North Star
**The Creative North Star: "The Ethereal Observer"**

This design system moves away from the static, data-heavy "utility" feel of traditional weather apps. Instead, it treats the interface as a window. The goal is to evoke the feeling of looking through a high-end lens at the horizon. We achieve this through "Atmospheric Layering"—a technique where information isn't just placed on a screen, but suspended within a physical space.

To break the "template" look, we leverage **intentional asymmetry**. Primary weather data (like current temperature) should feel heroic and unconfined, while secondary widgets utilize varying heights and staggered placements to create a rhythmic, editorial flow. We replace rigid grids with "Breathing Zones," ensuring that even high-density data feels airy and effortless.

---

## 2. Colors: The Atmospheric Spectrum

Our palette is dynamic, shifting with the meteorology it represents. We use a sophisticated foundation of deep midnight blues and high-frequency cyans, accented by sun-drenched ambers.

### The "No-Line" Rule
**Borders are forbidden for sectioning.** To define boundaries, designers must use tonal shifts between surface containers. A `surface-container-low` card sitting on a `surface` background creates a sophisticated, soft-edge distinction that 1px lines cannot replicate.

### Surface Hierarchy & Nesting
Depth is built through "Stacking Tonalities." 
- **Base Layer:** `surface` (#030e22)
- **Primary Content Area:** `surface-container` (#0a1932)
- **Interactive Widgets:** `surface-container-high` (#101f3a)
- **Floating Elements/Tooltips:** `surface-container-highest` (#152543)

### The "Glass & Gradient" Rule
To achieve the "Airy" feel, any element that floats above the main scroll must utilize **Glassmorphism**. Use a background blur of 20px–40px combined with a semi-transparent `surface-variant` (#152543 at 60% opacity). Main CTAs should never be flat; apply a subtle linear gradient from `primary` (#40cef3) to `primary-container` (#04b5d9) to give the UI "soul" and a sense of movement.

---

## 3. Typography: Editorial Clarity

We pair the technical precision of **Inter** with the structural elegance of **Manrope**. This creates a hierarchy that feels both authoritative and approachable.

*   **Display (Manrope):** Used for primary temperature and major headlines. It is the "Hero" of the screen. High tracking (-2%) adds a premium, condensed feel.
*   **Headlines/Titles (Manrope):** Used for widget headers (e.g., "7-Day Forecast"). These provide the structural "bones" of the experience.
*   **Body & Labels (Inter):** Reserved for data points (wind speed, humidity) and descriptions. Inter’s high x-height ensures readability even at `label-sm` (0.6875rem) against complex atmospheric backgrounds.

**Identity Tip:** Use `display-lg` for current temperatures, but set it at a `primary` color value to make the most vital information vibrate against the `surface-dim` background.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "heavy" for a sky-focused app. We use **Ambient Light** principles.

*   **The Layering Principle:** Rather than shadows, use the "Step-Up" method. Place a `surface-container-lowest` card on a `surface-container-low` section to create a natural "lift" through contrast alone.
*   **Ambient Shadows:** If a card must float (e.g., a "Severe Weather Alert"), use a shadow with a 30px blur, 0% spread, and an opacity of 6%. The shadow color must be tinted with `on-surface` (#dce5ff), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` (#3d485f) at **15% opacity**. This creates a "suggestion" of a boundary without interrupting the visual flow.
*   **Glassmorphism Integration:** Use `surface-tint` (#40cef3) at 5% opacity within glass cards to "pull" the background color into the component, making the UI feel like one cohesive atmosphere.

---

## 5. Components: The Weather Kit

### Glass-Cards (The Signature Component)
*   **Style:** No border. Background blur: 32px. 
*   **Color:** `surface-container` at 70% opacity.
*   **Radius:** `xl` (1.5rem) for main cards; `lg` (1rem) for nested widgets.
*   **Layout:** Forbid dividers. Separate content using `1.5rem` of vertical white space or a shift to `surface-bright` for sub-sections.

### Weather Widgets (Data Viz)
*   **Dynamic Gauges:** Use `secondary` (#65e2fc) for "safe" ranges and `tertiary` (#ffc967) for sun/heat metrics.
*   **Sparklines:** 2px stroke width using `primary`. Use a `surface-variant` fill with a 10% opacity gradient underneath the line to provide volume.

### Buttons & Interaction
*   **Primary Action:** `primary` (#40cef3) background with `on-primary` (#00414f) text. Capsule shape (`full` roundedness).
*   **Secondary/Ghost:** No background. `outline` (#6b758e) "Ghost Border" at 20% opacity. Text in `on-surface`.
*   **Chips:** Use `surface-container-highest` for unselected and `primary-container` for selected. No borders.

### Input Fields (Location Search)
*   **Resting:** `surface-container-low` background, no border.
*   **Active:** A subtle glow using `primary` at 10% opacity, and a "Ghost Border" at 40% opacity.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a large widget on the left, two small ones stacked on the right).
*   **Do** use `tertiary` (#ffc967) sparingly as a "Golden Hour" highlight for sun-related data.
*   **Do** ensure all Glassmorphism components have a fallback solid color for low-power devices.
*   **Do** use `body-lg` for data labels to ensure high-legibility for users on the move.

### Don't:
*   **Don't** use 1px solid, 100% opaque lines to separate list items. Use white space.
*   **Don't** use pure black (#000000) for shadows; it kills the "Airy" feel. Use tinted shadows.
*   **Don't** cram too much data into one card. If it feels crowded, move it to a `surface-container-low` secondary page.
*   **Don't** use sharp corners. This system relies on the "Softness" of the atmosphere; always use at least `md` (0.75rem) radius.