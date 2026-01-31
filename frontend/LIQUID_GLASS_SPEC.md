# Liquid Glass Design System Specifications (v2026)

## 1. Material Definition

The "Liquid Glass" material is a composite shader/CSS effect designed to simulate high-index refraction glass (IOR 1.52).

### CSS Implementation (Tailwind & Custom Properties)

```css
:root {
  --color-glass-surface: rgba(22, 22, 24, 0.6);
  --color-glass-border: rgba(255, 255, 255, 0.08); /* Specular Edge */
  --ease-liquid: cubic-bezier(0.25, 0.8, 0.25, 1);
}

.liquid-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
  backdrop-filter: blur(30px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.2), /* Rim Light Top */
    inset 0 0 20px 0 rgba(0, 0, 0, 0.1), /* Inner Density */
    0 20px 40px -10px rgba(0, 0, 0, 0.5); /* Ambient Occlusion */
  border-radius: 24px;
}
```

### Physical Parameters
*   **IOR**: 1.52 (Simulated via `backdrop-filter: blur(30px)` and internal gradients).
*   **Surface**: G2 Continuous Curvature (simulated via `rounded-3xl` and sub-pixel antialiasing).
*   **Lighting**: Top-Left 45deg Specular (CSS `inset 0 1px 0 0 rgba(255,255,255,0.2)`).

## 2. Animation Physics

All animations utilize the "Liquid" easing curve which mimics viscous fluid dynamics.

```javascript
const transition = {
  duration: 0.8,
  ease: [0.25, 0.8, 0.25, 1] // The Liquid Curve
};
```

### Micro-Interactions
*   **Magnetic Buttons**: Buttons track cursor position within a 20px radius using Spring physics (`stiffness: 150`, `damping: 15`).
*   **Parallax**: Background layers move at 10-20% speed of scroll/mouse movement.

## 3. Component Examples

### Hero / Dashboard Card
Items utilize a "floating" state with a heavy drop shadow that expands on hover, simulating a lift towards the user (Z-axis movement).

```jsx
<motion.div 
    whileHover={{ y: -5, boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5)" }}
    className="liquid-card"
>
  ...content
</motion.div>
```

### Liquid Input
Inputs appear as "carved" negative space within the glass slab.

```css
.liquid-input {
  background: rgba(0, 0, 0, 0.2); /* Darker than surface */
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); /* Inner shadow for depth */
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

## 4. Color Space (P3)
The system defaults to sRGB but upgrades to P3 where supported.

```css
@media (color-gamut: p3) {
  :root {
    --color-accent-blue: color(display-p3 0.16 0.59 1); /* Electric Blue */
  }
}
```
