const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.css', { cwd: process.cwd() });
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Attempt to match the TOC block strictly to get sections
    const tocRegex = /\/\*\s*[\r\n]+(?:\s*\*\s*=+[\r\n]+)?\s*\*\s*TABLE OF CONTENTS[\r\n]+\s*\*\s*=+[\r\n]+([\s\S]+?)\s*\*\s*=+[\r\n]+\s*\*\//;
    const tocMatch = content.match(tocRegex);
    if (!tocMatch) return;
    
    // Parse TOC sections
    const rawLines = tocMatch[1].split('\n');
    const sections = [];
    rawLines.forEach(line => {
        const clean = line.replace(/^\s*\*\s*/, '').trim();
        const m = clean.match(/^\d+\.\s+(.+)$/);
        if (m) {
            sections.push(m[1].trim());
        }
    });

    if (sections.length === 0) return;

    let newContent = content;
    
    sections.forEach((sectionName, idx) => {
        const num = idx + 1;
        // Looking for things like /* === Section Name === */
        // Escape sectionName for regex, avoiding JS template string literal issues
        const safeName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Match a block comment containing the sectionName (case-insensitive) surrounded by optional ='s or -'s
        // Must ensure we do not match the TOC line itself (which starts with "* N. Section Name")
        const regexStr = '\\/\\*\\s*[=\\-*]+\\s*' + safeName + '\\s*[=\\-*]+\\s*\\*\\/';
        const pattern = new RegExp(regexStr, 'gi');
        
        const replacement = `/* ============================================\n * ${num}. ${sectionName}\n * ============================================ */`;
        
        // Ensure we only replace section dividers, not single line regular comments or the TOC itself
        // Actually, to avoid the TOC, TOC headers don't have closing `*/` directly after the name.
        if (pattern.test(newContent)) {
            newContent = newContent.replace(pattern, replacement);
        }
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Formatted internal sections in ' + file);
    }
});
