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

## To integrate this package:

Add this package to the bootstrap en bower files.
Add a specialCharacters.json to the editors assets/configuration.
Add this json to the EditorConfiguration.js like so: this.specialCharacters = JSON.parse(specialCharactersJSON);

Add the following to your AppEditor:

// SPECIAL CHARACTERS
AppEditor.prototype.getCharacterSetByName = function(characterSetName) {
	var characterSet = this._editorConfiguration[characterSetName];
	if (!characterSet) {
		throw new Error("No characters set found for character set name: " + characterSetName);
	}

	return characterSet;
};

And as final step add the following operation to the editors operation.json:

"special-character-insert": {
	"label": "Special character",
	"description": "Insert a character that can not be easily inserted using your keyboard.",
	"icon": "keyboard-o",
	"flags": [
		"exclude-from-operations-list"
	],
	"steps": [
		{
			"type": "modal/SpecialCharacter",
			"options": {
				"templateUrl": "fontoxml-ui-special-characters/special-character-modal-template.html",
				"windowClass": "modal-lg"
			},
			"data": {
				"characterSet": "specialCharacters"
			}
		},
		{
			"type": "command/insertText"
		}
	]
},
