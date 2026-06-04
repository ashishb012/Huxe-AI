const fs = require('fs');
const path = 'node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt';

let content = fs.readFileSync(path, 'utf8');

// Replace all occurrences of `fun xyz(...) = scope.launch {` with `fun xyz(...) { scope.launch {`
// And we need to add the closing `}` at the end of the method!
// Actually, it's easier to just enforce the return type `Unit`:
// `fun xyz(...) = scope.launch {` -> `fun xyz(...): Unit { scope.launch {` No, that's invalid syntax.
// `fun xyz(...): Unit { scope.launch { ... } }` is valid, but we have to find the closing brace.
// Wait! We can just add `: Unit` and change `= scope.launch` to `{ scope.launch { ... } }`? No, finding the closing brace is hard.

// Alternatively, just do `fun xyz(...) { scope.launch {`
// Wait, if we do `fun xyz(...) { scope.launch { ... } }`, we have to append a `}` at the end of every such method block.
// Is there a simpler way?
// Yes! `fun xyz(...) { scope.launch { ... }.let {} }` No.
// How about keeping it as an expression body but returning Unit?
// `fun xyz(...) { scope.launch { ... } }`

// Let's look at the source. The methods end with `}`. We can just change:
// `fun someMethod(...) = scope.launch {` to `fun someMethod(...) { scope.launch {`
// AND then we need to add an extra `}` after the existing `}`.
// But we don't know where the existing `}` is.

// Let's use a simpler Kotlin trick.
// Can we just change the method signature to explicitly return Unit?
// In Kotlin, you CANNOT have an expression body returning Unit if the expression itself returns Job, UNLESS you cast it or do something else.
// But wait! `@ReactMethod` is just an annotation. We can wrap the whole method!
// Let's just use regex to find:
// `@ReactMethod\n\s*fun ([a-zA-Z0-9_]+)\((.*?)\)\s*=\s*scope\.launch\s*\{`
// We can change this to:
// `@ReactMethod\n    fun $1($2) { scope.launch {`
// And then we can just add a `}` before the next `@ReactMethod` or at the end of the file.

// Wait, even easier:
// We can replace `= scope.launch {` with { scope.launch {
// Then how do we balance the braces?
// Instead of `{ scope.launch {`, what if we do:
// `fun myMethod(...) { scope.launch { ... }; return }`

// Let's just parse the file properly or use a simple line-by-line approach.
const lines = content.split('\n');
let insideScopeLaunch = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we are starting a ReactMethod with = scope.launch
    if (line.match(/fun\s+\w+\(.*?\)\s*=\s*scope\.launch\s*\{/)) {
        lines[i] = line.replace(/=\s*scope\.launch\s*\{/, '{ scope.launch {');
        insideScopeLaunch = true;
        braceCount = 0;
        // Count braces in this line
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
        continue;
    }
    
    if (insideScopeLaunch) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        // If braceCount drops to 1, we hit the closing brace of the scope.launch!
        // Wait, if it drops to 0, it means the scope.launch { is closed.
        // Wait, the original had 1 brace `{`. So it closes when braceCount drops to 0!
        if (braceCount === 0) {
            lines[i] = line + '\n    }';
            insideScopeLaunch = false;
        }
    }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed MusicModule.kt');
