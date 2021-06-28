import uiManager from 'fontoxml-modular-ui/src/uiManager';
import SpecialCharacterModal from './ui/SpecialCharacterModal';
import specialCharactersManager from './specialCharactersManager';

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
