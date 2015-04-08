#fontoxml-ui-special-characters

## about prune-unsupported-characters.js
prune-unsupported-characters.js takes your specialCharacters.json and scrapes a list of supported code points for a given font from kreativekorps.com. It then regenerates and overwrites specialCharacters.json to exclude all code points not found in the font. In a nutshell; it serves to prune missing characters from the special characters modal.

To use:
```
node prune-unsupported-characters.js [path to specialCharacters.json] [font name]
```

For example
```
node prune-unsupported-characters.js /path/to/specialCharacters.json
node prune-unsupported-characters.js /path/to/code2001Characters.json Code2001
```

`[font name]` defaults to "Code2000"

prune-unsupported-characters.js overwrites the specified .json file if it exists. Use git to revert unwanted results.

## To integrate this package:

* Add this package as an add-on
* Create a toolbar button to the "default-special-character-insert" operation.

## To customize the character set:

* Generate a .json file as described above.
* Create an sxModule which depends on this package.
* In the sxModule, import the specialCharactersManager and call addCharacterSet, passing the parsed JSON:
```
specialCharactersManager.addCharacterSet('emoji', JSON.parse(emojiCharacterSetJSON));
```
* In the *same* sxModule, define an operation with a single step specifying the character set:
```
"steps": {
	"type": "operation/special-character-insert",
	"data": {
		"characterSet": "emoji"
	}
}
```

