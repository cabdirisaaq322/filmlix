import fs from 'fs';

const path = 'C:/Users/Administrator/Desktop/filmflix/src/components/Top10Rankings.tsx';
let c = fs.readFileSync(path, 'utf8');

// Fix 3: Add absolute positioning to rank number so it appears behind the card
c = c.replace(
  'z-0 font-sans pointer-events-none\n                    transition-transform',
  'absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-0 font-sans pointer-events-none\n                    transition-transform'
);

fs.writeFileSync(path, c, 'utf8');
console.log('Done. Absolute positioning added:', c.includes('absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2'));