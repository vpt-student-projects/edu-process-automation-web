# Release checklist

## 1. Quality gates
- [ ] `npm run lint` passed
- [ ] `npm run type-check` passed
- [ ] `npm run build` passed
- [ ] CI workflow `CI` green

## 2. Performance
- [ ] Lighthouse CI report reviewed for:
  - [ ] `/`
  - [ ] `/journal`
  - [ ] `/groups`
  - [ ] `/schedule`
- [ ] No critical performance regression vs previous baseline

## 3. Accessibility
- [ ] Keyboard navigation checked on key flows
- [ ] Color contrast checked for new UI elements
- [ ] Focus states visible and consistent

## 4. Visual verification
- [ ] Main pages checked on desktop:
  - [ ] `/`
  - [ ] `/journal`
  - [ ] `/groups`
  - [ ] `/schedule`
- [ ] Main pages checked on mobile viewport
- [ ] No layout breakage in critical components

## 5. Runtime monitoring
- [ ] Client error endpoint `/api/monitoring/client-error` reachable
- [ ] Error boundary fallback screen validated manually
- [ ] Runtime error payloads appear in server logs (`[runtime-monitoring]`)
