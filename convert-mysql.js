const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'routes');
const files = [
  'auth.js',
  'jobs.js',
  'kandidat.js',
  'match.js',
  'perusahaan.js',
  'ref.js',
];
const middlewareFiles = [
    path.join(__dirname, 'src', 'middleware', 'auth.js')
];

let changedCount = 0;

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Add crypto require if not present and UUID likely needed
  if (!content.includes("require('crypto')") && content.includes("uuid")) {
      // we'll handle require injection separately if needed, or just use require('crypto').randomUUID() inline
  }

  // 1. replace result = await pool.query with [rows] = await pool.query
  // We'll replace `const result = await pool.query` or `let result = await pool.query`
  content = content.replace(/(const|let)\s+result\s*=\s*await\s+pool\.query/g, 'const [rows] = await pool.query');
  content = content.replace(/(const|let)\s+existing\s*=\s*await\s+pool\.query/g, 'const [existingRows] = await pool.query');
  
  // existing.rows -> existingRows
  content = content.replace(/existing\.rows/g, 'existingRows');

  // result.rows -> rows
  content = content.replace(/result\.rows/g, 'rows');
  content = content.replace(/result\.rowCount/g, 'rows.length');

  // 2. pool.connect() -> pool.getConnection()
  content = content.replace(/pool\.connect\(\)/g, 'pool.getConnection()');
  // client.end() -> client.release()
  content = content.replace(/client\.end\(\)/g, 'client.release()');

  // 3. $1, $2, etc -> ?
  // carefully replace $\d+ with ? (only in strings/sql, but generally safe in JS if no other $ usage)
  content = content.replace(/\$\d+/g, '?');

  // 4. ON CONFLICT (id) DO UPDATE -> ON DUPLICATE KEY UPDATE
  content = content.replace(/ON\s+CONFLICT\s*\([^\)]+\)\s*DO\s+UPDATE/gi, 'ON DUPLICATE KEY UPDATE');

  // 5. ILIKE -> LIKE
  content = content.replace(/\bILIKE\b/gi, 'LIKE');

  // 6. json_agg -> JSON_ARRAYAGG
  content = content.replace(/\bjson_agg\b/g, 'JSON_ARRAYAGG');

  // 7. RETURNING block 
  // We need to handle this manually or via regex. 
  // Often it's `RETURNING *` or `RETURNING id, ...`
  // And generating UUID.
  // We will do a regex pass for the basic UUID logic, but this is complex for generic Regex!
  // Let's do a trick: we will just replace the specific INSERTs that have RETURNING.

  fs.writeFileSync(filePath, content, 'utf8');
  if (content !== original) {
    changedCount++;
    console.log('Updated:', filePath);
  }
}

files.forEach(f => processFile(path.join(dir, f)));
middlewareFiles.forEach(f => processFile(f));

console.log('Total files changed:', changedCount);
