import Notifier from 'fontoxml-utils/src/Notifier.js';

const KEY_NAME =
	window.location.host +
	'|fontoxml-special-symbols|' +
	'recently-used-characters' +
	'-XqtFs2523dDYdsTeBGTDfc';

/**
 * Enables registration of custom character sets to be displayed in the “Insert special character” modal.
 * Registration can be done using the addCharacterSetPath method. While we also provide a method for
 * adding a character set directly into the build, addCharacterSet, adding it via a path instead excludes
 * it from building into the main.js resulting in a faster initial load.
 *
 * @fontosdk
 * @category add-on/fontoxml-special-characters
 */
class SpecialCharactersManager {
	constructor() {
		this._characterSetByName = Object.create(null);
		this._characterSetPathByName = Object.create(null);

		this.recentSymbolsChangedNotifier = new Notifier();
	}

	/**
	 * Register the specified characterSet for use by the special-character-insert operation under the specified name.
	 *
	 * @fontosdk
	 *
	 * @param  {string}    name
	 * @param  {CharacterSetEntry[]}  characterSet
	 */
	addCharacterSet(name, characterSet) {
		this._characterSetByName[name] = Promise.resolve(characterSet);
	}

	/**
	 * Register the specified file path used to fetch the characterSet under the specified name.
	 * Character sets should be placed in (a subfolder of) the assets folder. An example of this would be
	 * 'assets/character-sets/characterSet.json'. The character set should contain an Array of
	 * {@link CharacterSetEntry} objects.
	 *
	 * @fontosdk
	 *
	 * @param  {string}  name
	 * @param  {string}  characterSetPath
	 */
	addCharacterSetPath(name, characterSetPath) {
		this._characterSetPathByName[name] = characterSetPath;
	}

	/**
	 * Retrieve the character set with the given name
	 *
	 * @param  {string}  name
	 *
	 * @return  {Promise<CharacterSetEntry[]>}
	 */
	getCharacterSet(name) {
		const characterSet = this._characterSetByName[name];
		const characterSetPath = this._characterSetPathByName[name];
		if (!characterSet && !characterSetPath) {
			return Promise.reject(new Error('Character set "' + name + '" does not exist.'));
		}
		if (characterSet) {
			return characterSet;
		}
		this._characterSetByName[name] = fetch(characterSetPath)
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to fetch character set: "' + name + '".');
				}
				const fetchedCharacterSet = response.json();
				return fetchedCharacterSet;
			})
			.catch(_error => {
				delete this._characterSetByName[name];
				throw new Error('Failed to fetch character set: "' + name + '".');
			});
		return this._characterSetByName[name];
	}

	/**
	 * This works synchronously and it is used to get recent symbols.
	 *
	 * @return  {CharacterSetEntry[]}  characterEntry
	 */
	getRecentSymbols() {
		const data = window.localStorage.getItem(KEY_NAME);
		if (data) {
			try {
				return JSON.parse(data);
			} catch (error) {
				console.error(`Can not parse recent characters, got "${data}"`, error);
			}
		}
		return [];
	}

	/**
	 * When a user clicks a character, it is marked as recently used by this method.
	 *
	 * @param  {CharacterSetEntry}  characterEntry
	 */
	markAsRecentlyUsed(characterEntry) {
		const characterSet = this.getRecentSymbols() || [];
		const index = characterSet.findIndex(character => characterEntry.id === character.id);

		if (index > -1) {
			characterSet.splice(index, 1);
		}

		characterSet.unshift(characterEntry);

		this.addCharacterSet(this.recentlyUsedCharacterSetName, characterSet);
		window.localStorage.setItem(KEY_NAME, JSON.stringify(characterSet));

		this.recentSymbolsChangedNotifier.executeCallbacks();
	}

	/**
	 * Remove the characterSet together with the key.
	 *
	 */
	cleanStorage() {
		window.localStorage.removeItem(KEY_NAME);
	}
}

export default new SpecialCharactersManager();

/**
 * A character set should be provided to {@link SpecialCharactersManager#addCharacterSet} as an
 * array of objects, each containing properties describing a character in the set.
 *
 * A fragment of an example character set is given below:
 *
 * ```json
 * [
 *     {
 *         "codePoints": [ "U+2669" ],
 *         "id": "U+2669"
 *     },
 *     {
 *         "codePoints": [ "U+266A" ],
 *         "id": "U+266A",
 *         "labels": [ "Unicode miscellaneous symbols" ],
 *         "name": "Eighth note"
 *     }
 * ]
 * ```
 *
 * @typedef   {Object}  CharacterSetEntry
 *
 * @fontosdk  members
 *
 * @property  {string[]}  codePoints    Unicode code points to insert when the character is inserted into the
 *                                      document, in order, encoded as strings starting with U+ followed by the
 *                                      hexadecimal representation of the code point.
 * @property  {string}    id            Unique identifier for the character.
 * @property  {string[]}  [labels]      List of categories under which the character should appear in the modal,
 *                                      each specified using the descriptive label for the category shown in the modal.
 * @property  {string}    [name]        Descriptive name for the character, displayed in the modal and as a tooltip content in the grid.
 */
