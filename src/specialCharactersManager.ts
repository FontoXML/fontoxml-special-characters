import Notifier from 'fontoxml-utils/src/Notifier';

import type { SpecialCharacterSetItem } from './types';

const KEY_NAME =
	`${window.location.host}|fontoxml-special-symbols|` +
	`recently-used-characters` +
	`-XqtFs2523dDYdsTeBGTDfc`;

/**
 * @remarks
 * This is the class definition of a singleton. Please do not import or instantiate
 * this class directly, instead use the {@link specialCharactersManager} instance
 * directly.
 *
 * Enables registration of custom character sets to be displayed in the “Insert
 * special character” modal. Registration can be done using the addCharacterSetPath
 * method. While we also provide a method for adding a character set directly into
 * the build, addCharacterSet, adding it via a path instead excludes it from
 * building into the main.js resulting in a faster initial load.
 *
 * @fontosdk
 */
export class SpecialCharactersManager {
	_characterSetByName: Object;

	_characterSetPathByName: Object;

	recentSymbolsChangedNotifier: Notifier;

	constructor() {
		this._characterSetByName = Object.create(null);
		this._characterSetPathByName = Object.create(null);

		this.recentSymbolsChangedNotifier = new Notifier();
	}

	/**
	 * @remarks
	 * Register the specified characterSet for use by the special-character-insert
	 * operation under the specified name.
	 *
	 * @fontosdk
	 *
	 * @param name         -
	 * @param characterSet -
	 */
	addCharacterSet(
		name: string,
		characterSet: SpecialCharacterSetItem[]
	): void {
		this._characterSetByName[name] = Promise.resolve(characterSet);
	}

	/**
	 * @remarks
	 * Register the specified file path used to fetch the characterSet under the
	 * specified name. Character sets should be placed in (a subfolder of) the assets
	 * folder. An example of this would be 'assets/character-sets/characterSet.json'.
	 * The character set should contain an Array of {@link SpecialCharacterSetItem} objects.
	 *
	 * @fontosdk
	 *
	 * @param name             -
	 * @param characterSetPath -
	 */
	addCharacterSetPath(name: string, characterSetPath: string): void {
		this._characterSetPathByName[name] = characterSetPath;
	}

	/**
	 * @remarks
	 * Retrieve the character set with the given name
	 *
	 * @param name -
	 */
	async getCharacterSet(name: string): Promise<SpecialCharacterSetItem[]> {
		const characterSet = this._characterSetByName[name];
		const characterSetPath = this._characterSetPathByName[name];
		if (!characterSet && !characterSetPath) {
			return Promise.reject(
				new Error(`Character set "${name}" does not exist.`)
			);
		}
		if (characterSet) {
			return characterSet;
		}
		this._characterSetByName[name] = fetch(characterSetPath)
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(
						`Failed to fetch character set: "${name}".`
					);
				}
				const fetchedCharacterSet = response.json();
				return fetchedCharacterSet;
			})
			.catch((_error) => {
				delete this._characterSetByName[name];
				throw new Error(`Failed to fetch character set: "${name}".`);
			});
		return this._characterSetByName[name];
	}

	/**
	 * @remarks
	 * This works synchronously and it is used to get recent symbols.
	 *
	 * @returns characterEntry
	 */
	getRecentSymbols(): SpecialCharacterSetItem[] {
		const data = window.localStorage.getItem(KEY_NAME);
		if (data) {
			try {
				return JSON.parse(data);
			} catch (error) {
				console.error(
					`Can not parse recent characters, got "${data}"`,
					error
				);
			}
		}
		return [];
	}

	/**
	 * @remarks
	 * When a user clicks a character, it is marked as recently used by this method.
	 *
	 * @param characterEntry -
	 */
	markAsRecentlyUsed(characterEntry: SpecialCharacterSetItem): void {
		const characterSet = this.getRecentSymbols() || [];
		const index = characterSet.findIndex(
			(character) => characterEntry.id === character.id
		);

		if (index > -1) {
			characterSet.splice(index, 1);
		}

		characterSet.unshift(characterEntry);

		this.addCharacterSet(this.recentlyUsedCharacterSetName, characterSet);
		window.localStorage.setItem(KEY_NAME, JSON.stringify(characterSet));

		this.recentSymbolsChangedNotifier.executeCallbacks();
	}

	/**
	 * @remarks
	 * Remove the characterSet together with the key.
	 */
	cleanStorage(): void {
		window.localStorage.removeItem(KEY_NAME);
	}
}

/**
 * @remarks
 * Please see {@link SpecialCharactersManager | the class definition} for more information on
 * available methods and properties.
 *
 * @fontosdk importable
 * @category Managers
 */
const specialCharactersManager = new SpecialCharactersManager();

export default specialCharactersManager;
