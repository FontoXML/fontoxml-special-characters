#fontoxml-special-characters

## To integrate this package:

* Add this package as an add-on
* Create a toolbar button to the "default-special-character-insert" operation.

## To enable quickly inserting one of a preconfigured set of characters
You can use the `ui-special-character-grid` directive (configured with a character set, no more than a couple of tens).

```
ui-drop(
	icon="keyboard-o"
	label="Special character")
	ui-special-character-grid(
		columns="8"
		character-set="quick-access")

	ui-menu-item(label="More special characters")
		fonto-operation(name="...")
```

Since the preconfigured set of character is a selection of special characters it is recommended to keep a button in
order to open the full special characters modal near. This ui-menu-item should be added (to the same ui-drop)
seperately. If this characterset is a superset of the quick-access selection, a label like "More special characters" is
recommended.

## To customize the character set:

* Generate a .json file as described below
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

## about prune-unsupported-characters.js
prune-unsupported-characters.js takes your specialCharacters.json and scrapes a list of supported code points for a
given font from kreativekorps.com. It then regenerates and overwrites specialCharacters.json to exclude all code points
not found in the font. In a nutshell; it serves to prune missing characters from the special characters modal.

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

