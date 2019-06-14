---
category: add-on/fontoxml-special-characters
---

# Special characters

This add-on provides a way to easily insert characters that may not be available using the normal keyboard.

## To integrate this package:

* Add this package as an add-on
* Create a toolbar button to the {@link default-special-character-insert} operation.

## To enable quickly inserting one of a preconfigured set of characters
You can use the {@link SymbolsGrid} UI component (configured with a character set, no more than a couple of tens).

```javascript
function renderDrop({ closeDrop, referenceRect }) {
	return (
		<Drop minWidth={referenceRect.width}>
			<SymbolsGrid
				characterSet="quick-access-characters"
				columns={6}
				onItemClick={closeDrop}
			/>
		</Drop>
	);
}

export default function MyQuickAccessSymbolsDropButton () {
	return (
		<ButtonWithDrop
			icon="keyboard-o"
			label="Symbol"
			renderDrop={renderDrop}
		/>
	);
}
```

As this reduced set of characters will be a subset of the full set of special characters, it is recommended to also
include a button in order to open the full special characters modal nearby. This can be done, for instance, by grouping
the grid together with a {@link FxOperationMenuItem} in a {@link Menu}, with a label such as "More special
characters".

## Additional character sets

This add-on provides a single "default" character set containing a large set of symbols. Additional character sets
may be defined by creating a package that depends on this add-on. In this package's install.js, use the
{@link SpecialCharactersManager#addCharacterset} method to register your character set.

```javascript
import specialCharactersManager from 'fontoxml-special-characters/src/specialCharactersManager.js';
import emojiCharacterSet from './emoji-character-set.json';

export default function install() {
	specialCharactersManager.addCharacterSet('emoji', emojiCharacterSet);
}
```

And then include a {@link SymbolsGrid} to directly access its characters, and / or define an operation to open the modal
for this character set using the {@link special-character-insert} operation.

```json
{
	"emoji-character-insert": {
		"label": "Insert emoji",
		"icon": "smile-o",
		"steps": {
			"type": "operation/special-character-insert",
			"data": {
				"characterSet": "emoji"
			}
		}
	}
}
```
