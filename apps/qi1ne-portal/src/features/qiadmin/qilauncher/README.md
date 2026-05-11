# QiLauncher

## Debug

# Debugging Blank Dashboard

## Quick Checks

1. **Open Browser Console (F12)**
   - Check for JavaScript errors
   - Check for network errors (CORS, 404s)
   - Look for TypeScript compilation errors

2. **Check Terminal**
   - Vite should show compilation status
   - Look for import errors or missing modules

3. **Common Issues:**

   **Issue: Tailwind classes not working**
   - Solution: Tailwind CDN added to index.html
   - Refresh page

   **Issue: Import errors**
   - Check: `apps/QiLauncher/src/App.tsx` imports
   - All components should be in `../components/` relative to `src/`

   **Issue: TypeScript errors**
   - Check: Browser console for TS errors
   - May need to restart Vite dev server

   **Issue: API connection errors**
   - Check: Backend running on `http://localhost:7130`
   - Check: CORS enabled in backend
   - Check: Browser Network tab for failed requests

4. **Test Minimal App**

   If still blank, try replacing `src/App.tsx` with:

   ```tsx
   export default function App() {
     return <div className="p-8 text-white bg-slate-900">Hello QiOS</div>;
   }
   ```

   If this works, the issue is in component imports or API calls.



---

