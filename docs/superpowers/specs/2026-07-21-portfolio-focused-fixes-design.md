# Portfolio Focused Fixes Design

## Goal

Prepare the existing portfolio for job applications by improving its development workflow, accessibility, responsive reliability, metadata, and image delivery without redesigning the page or changing its core visual identity.

## Scope

### Project tooling

- Add Vite as the local development and production build tool.
- Add `dev`, `build`, and `preview` npm scripts.
- Add a `.gitignore` covering dependencies, Vite output, local environment files, logs, and common editor or operating-system artifacts.
- Keep the current HTML, CSS, and JavaScript structure. Do not migrate to React or another UI framework.

### Navigation and accessibility

- Preserve native URL hashes while applying the sticky-header scroll offset.
- Make the active navigation item programmatically identifiable with `aria-current`.
- Ensure keyboard focus moves predictably when using the skip link or section navigation.
- Give icon-only controls accurate accessible names and state announcements.
- Maintain visible focus styles and minimum 44 by 44 pixel touch targets for interactive controls.

### Responsive behavior

- Remove horizontal overflow at supported mobile widths.
- Keep navigation, hero actions, project links, and footer controls usable without hover.
- Use stable wrapping and sizing rules so long labels and headings remain inside their containers.
- Preserve the existing desktop composition and visual hierarchy.

### Theme and metadata

- Default to the visitor's system theme when no saved preference exists, then persist explicit choices.
- Keep `color-scheme` and the browser theme color synchronized with the active theme.
- Add useful social metadata, image alt metadata, author metadata, and structured Person data using only known project information.
- Do not invent a canonical deployment URL. It can be added after the final public domain is known.

### Image delivery

- Identify oversized raster assets used by the page and create optimized WebP variants where they provide a meaningful saving.
- Use responsive image markup or source sizing where appropriate while retaining existing files as fallbacks.
- Preserve intrinsic width and height attributes to reduce layout shift.
- Keep the hero portrait eager and high priority; keep below-the-fold project and supporting images lazy-loaded.

### Visual restraint

- Reduce decorative blur, glass, and large soft shadows where several effects are stacked on one component.
- Preserve the established cool blue palette, typography, card layout, spacing rhythm, and overall composition.
- Keep motion subtle and retain the existing reduced-motion behavior.

## Behavior and Compatibility

- The entry page remains `/index.html` and works through Vite at `/`.
- Direct visits to section hashes such as `/#projects` land on the intended section without being hidden by the sticky header.
- The page remains usable with JavaScript unavailable; enhancements such as active navigation and theme persistence may degrade gracefully.
- Target current Chrome, Edge, Firefox, and Safari, plus common phone widths from 320 pixels upward.

## Verification

- Run a clean Vite production build.
- Check the page at desktop and mobile viewport sizes for overflow, overlap, missing images, and unreadable content.
- Exercise section navigation, URL hash updates, skip link, keyboard focus, theme switching, saved theme behavior, and reduced-motion behavior.
- Confirm there are no relevant console errors or Vite error overlays.
- Compare optimized image sizes with their originals and verify every referenced asset renders.

## Out of Scope

- A visual redesign, new sections, rewritten project content, contact form, analytics, CMS, framework migration, or deployment configuration.
