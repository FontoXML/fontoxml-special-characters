import uiManager from 'fontoxml-modular-ui/src/uiManager';

import specialCharactersManager from './specialCharactersManager';
import SpecialCharacterModal from './ui/SpecialCharacterModal';

export default function install(): void {
	uiManager.registerReactComponent(
		'SpecialCharacterModal',
		SpecialCharacterModal
	);

	specialCharactersManager.addCharacterSetPath(
		'default',
		'assets/character-sets/defaultCharacterSet.json'
	);
}
