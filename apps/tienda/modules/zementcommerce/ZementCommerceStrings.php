<?php

/**
 * Textos de interfaz del módulo en los 8 idiomas de la tienda (español de usted).
 * Fuera de los catálogos de PrestaShop para no depender de la importación de traducciones.
 */

declare(strict_types=1);

final class ZementCommerceStrings
{
    private const STRINGS = [
        'es' => [
            'calculator' => 'Calcule la cantidad',
            'area' => 'Superficie (m²)',
            'coats' => 'Capas',
            'thickness' => 'Espesor (mm)',
            'margin' => 'Añadir un 10 % de margen',
            'needed' => 'Necesita aprox.',
            'useQuantity' => 'Usar esta cantidad',
            'note' => 'Cálculo orientativo con el consumo de la ficha técnica; el consumo real depende del soporte.',
            'system' => 'Complete su sistema',
            'systemArea' => 'Cantidades para su superficie',
            'current' => 'Este producto',
            'projects' => '¿Qué va a hacer?',
            'professionals' => 'Profesionales',
        ],
        'en' => [
            'calculator' => 'Calculate the quantity',
            'area' => 'Area (m²)',
            'coats' => 'Coats',
            'thickness' => 'Thickness (mm)',
            'margin' => 'Add a 10% margin',
            'needed' => 'You need approx.',
            'useQuantity' => 'Use this quantity',
            'note' => 'Estimate based on the consumption in the technical data sheet; actual consumption depends on the substrate.',
            'system' => 'Complete your system',
            'systemArea' => 'Quantities for your area',
            'current' => 'This product',
            'projects' => 'What are you planning?',
            'professionals' => 'Professionals',
        ],
        'de' => [
            'calculator' => 'Menge berechnen',
            'area' => 'Fläche (m²)',
            'coats' => 'Schichten',
            'thickness' => 'Schichtdicke (mm)',
            'margin' => '10 % Reserve hinzufügen',
            'needed' => 'Sie benötigen ca.',
            'useQuantity' => 'Diese Menge übernehmen',
            'note' => 'Richtwert nach dem Verbrauch im technischen Datenblatt; der tatsächliche Verbrauch hängt vom Untergrund ab.',
            'system' => 'Vervollständigen Sie Ihr System',
            'systemArea' => 'Mengen für Ihre Fläche',
            'current' => 'Dieses Produkt',
            'projects' => 'Was haben Sie vor?',
            'professionals' => 'Für Profis',
        ],
        'fr' => [
            'calculator' => 'Calculez la quantité',
            'area' => 'Surface (m²)',
            'coats' => 'Couches',
            'thickness' => 'Épaisseur (mm)',
            'margin' => 'Ajouter une marge de 10 %',
            'needed' => 'Il vous faut env.',
            'useQuantity' => 'Utiliser cette quantité',
            'note' => 'Estimation selon la consommation de la fiche technique ; la consommation réelle dépend du support.',
            'system' => 'Complétez votre système',
            'systemArea' => 'Quantités pour votre surface',
            'current' => 'Ce produit',
            'projects' => 'Quel est votre projet ?',
            'professionals' => 'Professionnels',
        ],
        'it' => [
            'calculator' => 'Calcoli la quantità',
            'area' => 'Superficie (m²)',
            'coats' => 'Mani',
            'thickness' => 'Spessore (mm)',
            'margin' => 'Aggiungere un margine del 10%',
            'needed' => 'Le servono circa',
            'useQuantity' => 'Usare questa quantità',
            'note' => 'Stima basata sul consumo della scheda tecnica; il consumo reale dipende dal supporto.',
            'system' => 'Completi il suo sistema',
            'systemArea' => 'Quantità per la sua superficie',
            'current' => 'Questo prodotto',
            'projects' => 'Che cosa deve realizzare?',
            'professionals' => 'Professionisti',
        ],
        'pl' => [
            'calculator' => 'Oblicz ilość',
            'area' => 'Powierzchnia (m²)',
            'coats' => 'Warstwy',
            'thickness' => 'Grubość (mm)',
            'margin' => 'Dodaj 10% zapasu',
            'needed' => 'Potrzeba ok.',
            'useQuantity' => 'Użyj tej ilości',
            'note' => 'Szacunek na podstawie zużycia z karty technicznej; rzeczywiste zużycie zależy od podłoża.',
            'system' => 'Uzupełnij swój system',
            'systemArea' => 'Ilości dla Twojej powierzchni',
            'current' => 'Ten produkt',
            'projects' => 'Co planujesz?',
            'professionals' => 'Dla profesjonalistów',
        ],
        'no' => [
            'calculator' => 'Beregn mengden',
            'area' => 'Areal (m²)',
            'coats' => 'Strøk',
            'thickness' => 'Tykkelse (mm)',
            'margin' => 'Legg til 10 % margin',
            'needed' => 'Du trenger ca.',
            'useQuantity' => 'Bruk denne mengden',
            'note' => 'Overslag basert på forbruket i det tekniske databladet; faktisk forbruk avhenger av underlaget.',
            'system' => 'Fullfør systemet ditt',
            'systemArea' => 'Mengder for ditt areal',
            'current' => 'Dette produktet',
            'projects' => 'Hva skal du gjøre?',
            'professionals' => 'Profesjonelle',
        ],
        'fi' => [
            'calculator' => 'Laske määrä',
            'area' => 'Pinta-ala (m²)',
            'coats' => 'Kerrokset',
            'thickness' => 'Paksuus (mm)',
            'margin' => 'Lisää 10 %:n varaus',
            'needed' => 'Tarvitset noin',
            'useQuantity' => 'Käytä tätä määrää',
            'note' => 'Arvio teknisen tuotekortin kulutuksen mukaan; todellinen kulutus riippuu alustasta.',
            'system' => 'Täydennä järjestelmäsi',
            'systemArea' => 'Määrät pinta-alallesi',
            'current' => 'Tämä tuote',
            'projects' => 'Mitä aiot tehdä?',
            'professionals' => 'Ammattilaisille',
        ],
    ];

    /** @return array<string, string> */
    public static function forLanguage(string $iso): array
    {
        return self::STRINGS[$iso] ?? self::STRINGS['en'];
    }
}
