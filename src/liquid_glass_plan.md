# Implementation Plan - Liquid Glass Minecraft Dashboard

This plan outlines the steps to upgrade the Minecraft dashboard to a "Liquid Glass" aesthetic with a dynamic theme system and custom wallpaper management.

## 1. Visual Theory & Design Tokens
- Define **Liquid Glass** parameters:
    - `backdrop-filter: blur(40px) saturate(200%)`
    - `background: rgba(255, 255, 255, 0.05)` (adaptive)
    - `border: 1px solid rgba(255, 255, 255, 0.1)` (refraction stroke)
    - `box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
- Establish a **Design Token System** via CSS Variables:
    - `--glass-bg`, `--glass-blur`, `--glass-border`, `--glass-reflexion`.
    - `--accent-primary`, `--accent-secondary`.
    - `--font-heading`, `--font-body`.

## 2. Dynamic Theme System
- Implement themes in `themes.css`:
    - **Default (Glass)**: Deep blues and purples.
    - **Forest**: Organics, greens (#2D5A27), leaf patterns.
    - **Coder**: Matrix-style greens (#00FF41), monospace fonts, sharp corners.
    - **Magma**: Deep oranges (#FF4E00), high contrast.
- Themes will control global variables that components consume.

## 3. Wallpaper Management (Backend & Frontend)
- **Backend (`server.js`)**:
    - Add `/api/config/wallpaper` POST endpoint for uploads (using `multer`).
    - Store wallpaper path in `config.json`.
    - Serve uploaded images via static middleware.
- **Frontend (`WallpaperContext.jsx` or similar)**:
    - State management for background image.
    - Immediate update on upload.
    - Apply wallpaper to `body` background with CSS transitions.

## 4. UI Component Library
- Create/Update components in `src/components/common`:
    - `GlassButton`: Hover with gloss effect, click scaling.
    - `GlassInput`: Frosted focus state.
    - `GlassModal`: Smooth fade-in overlay with deep blur.
    - `GlassTabNav`: Underline indicators with glowing accents.

## 5. Integration
- Update `PluginManager`, `ServerProperties`, and `Dashboard` to use the new components.
- Polish micro-interactions (hover, transitions).

## 6. Polish
- Add "Physical Refractions" using `::before` overlays on panels.
- Fine-tune transition timings for "liquid" feel.
