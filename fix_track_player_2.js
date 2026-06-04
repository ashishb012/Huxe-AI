const fs = require('fs');
const path = 'node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt';

let content = fs.readFileSync(path, 'utf8');

// Find all occurrences of `@ReactMethod\n    fun name(...) = scope.launch {`
// We will replace `= scope.launch {` with `{ scope.launch {`
// And we need to add `}` at the end of the method.

const lines = content.split('\n');
let insideScopeLaunch = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/fun\s+[a-zA-Z0-9_]+\(.*?\)\s*=\s*scope\.launch\s*\{/)) {
        lines[i] = line.replace(/=\s*scope\.launch\s*\{/, '{ scope.launch {');
        insideScopeLaunch = true;
        braceCount = 0;
        
        // Count braces
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
        continue;
    }
    
    if (insideScopeLaunch) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        // Because we changed `= scope.launch {` to `{ scope.launch {`
        // We added ONE extra `{` compared to the original code!
        // The original code had ONE `{` (for the scope.launch).
        // Our new code has TWO `{`.
        // The original code balances when braceCount drops to 0 (because it started with 1 `{`).
        // Wait, if I do `braceCount += ...`, for the FIRST line:
        // `{ scope.launch {` has TWO `{`. So braceCount = 2.
        // Then it processes subsequent lines.
        // The original file had ONE `{` and eventually ONE `}` to close it.
        // So the original file's braces would close when braceCount reaches 1 (since we started with 2 and the original file only provides 1 closing `}`).
        // Yes! When braceCount reaches 1, it means the original `scope.launch` has closed!
        
        if (braceCount === 1) {
            // This line contains the closing brace of the scope.launch block.
            // We need to add ONE MORE closing brace to close our new method block!
            lines[i] = line + ' }'; // Append closing brace to the end of the line
            insideScopeLaunch = false;
        }
    }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Successfully patched MusicModule.kt');
