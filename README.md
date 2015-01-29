#fontoxml-ui-special-characters

## about prune-unsupported-characters.js
prune-unsupported-characters.js takes your specialCharacters.json and scrapes a list of supported code points for a given font from kreativekorps.com. It then regenerates and overwrites specialCharacters.json to exclude all code points not found in the font. In a nutshell; it serves to prune missing characters from the special characters modal.

To use:
```
node prune-unsupported-characters.js [path to specialCharacters.json] [font name]
```

For example
```
node prune-unsupported-characters.js /home/fxitmuran/src/assets/configuration/specialCharacters.json
node prune-unsupported-characters.js /home/fxitmuran/src/assets/configuration/specialCharacters.json Code2001
```

`[font name]` defaults to "Code2000"

prune-unsupported-characters.js overwrites your actual specialCharacters.json. Use git to revert unwanted results.