import de from './de';
import fi from './fi';
import fr from './fr';
import it from './it';
import no from './no';
import pl from './pl';
import type { ExtraLocale, Translation } from './types';

/** Traducciones de los idiomas añadidos a la web (los mismos que la tienda). */
const translations: Record<ExtraLocale, Translation> = { de, fr, it, pl, no, fi };

export default translations;
