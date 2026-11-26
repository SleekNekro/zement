<?php

/**
 * Tienda en español tratando de usted. El paquete de idioma de PrestaShop mezcla tú y usted
 * («Infórmese», pero «Envíanos un email»): estas cadenas del escaparate pasan a usted.
 *
 * Formato: dominio de traducción (sin puntos, como en la tabla `translation`) => [original en
 * inglés => texto en español]. Lo aplica setup-settings.php (pnpm tienda:settings).
 * Para revisar si quedan cadenas que tutean: ver apps/tienda/config/README.md.
 */

declare(strict_types=1);

return [
    'ShopNotificationsError' => [
        'Some of the countries used in your cart are not available and cannot be used.' => 'Algunos de los países utilizados en su carrito no están disponibles y no se pueden usar.',
        'The password is missing: please enter your new password.' => 'Falta la contraseña: introduzca su nueva contraseña.',
        "You can't transform your account into a customer account, because a registered customer with the same email already exists." => 'No puede transformar su cuenta en una cuenta de cliente porque ya existe un cliente registrado con el mismo correo electrónico.',
    ],
    'ShopNotificationsWarning' => [
        'This product is not visible to your customers.' => 'Este producto no es visible para sus clientes.',
    ],
    'ShopThemeActions' => [
        'Delete your delivery address' => 'Eliminar su dirección de entrega',
        'Delete your invoice address' => 'Eliminar su dirección de facturación',
        'Edit your cart' => 'Editar su carrito',
        'Edit your delivery address' => 'Editar su dirección de entrega',
        'Edit your invoice address' => 'Editar su dirección de facturación',
        'Edit your shipping method' => 'Editar su modo de envío',
        'Send your message' => 'Enviar su mensaje',
    ],
    'ShopThemeCatalog' => [
        '%1s of these products are included in packs in your cart.' => '%1s de estos productos se incluyen en un pack dentro de su carrito.',
        'No matches were found for your search' => 'No se han encontrado coincidencias con su búsqueda',
        'Your cart contains %1s of these products and another %2s of these are included in packs in your cart.' => 'Su carrito contiene %1s de estos productos y otros %2s se incluyen en un pack dentro de su carrito.',
        'Please try other keywords to describe what you are looking for.' => 'Pruebe con otras palabras clave para describir lo que está buscando.',
    ],
    'ShopThemeCheckout' => [
        '%product_name% has been added to your cart.' => '%product_name% se ha añadido a su carrito.',
        'Added to your cart' => 'Añadido a su carrito',
        'Fill %voucherCode% code into the voucher field' => 'Introduzca el código %voucherCode% en el campo de cupones',
        'Write your comment...' => 'Escriba su comentario...',
        'You can also [1]download your invoice[/1].' => 'También puede [1]descargar su factura[/1].',
        "Please make sure you've chosen a [1]payment method[/1] and accepted the required condition(s)." => 'Asegúrese de haber elegido un [1]método de pago[/1] y de haber aceptado las condiciones obligatorias.',
        "Please make sure you've chosen a [1]payment method[/1]." => 'Asegúrese de haber elegido un [1]método de pago[/1].',
    ],
    'ShopThemeCustomeraccount' => [
        'Add a new address to your account.' => 'Añadir una nueva dirección a su cuenta.',
        'Enter a password between %s and %s characters' => 'Introduzca una contraseña de entre %s y %s caracteres',
        'Manage your addresses for billing and delivery to streamline your future orders.' => 'Gestione sus direcciones de facturación y entrega para agilizar sus próximos pedidos.',
        'Toggle your account links' => 'Mostrar/ocultar enlaces de su cuenta',
        'Update your personal information to keep your account details up to date.' => 'Actualice su información personal para mantener sus datos al día.',
        'View and manage your available vouchers and discount codes for use on your next purchase.' => 'Consulte y gestione sus vales y códigos de descuento disponibles para su próxima compra.',
        'Your password length is invalid' => 'La longitud de su contraseña no es válida',
    ],
    'ShopThemeGlobal' => [
        'Add another word or two. Uncommon words are better.' => 'Añada una o dos palabras más. Es mejor usar palabras poco habituales.',
        'Avoid dates and years that are associated with you' => 'Evite años y fechas que puedan asociarse con usted',
        'Avoid years that are associated with you' => 'Evite años que puedan asociarse con usted',
        'Avoid recent years' => 'Evite años recientes',
        'Avoid repeated words and characters' => 'Evite repetir palabras y caracteres',
        'Avoid sequences' => 'Evite secuencias',
        'Use a few words, avoid common phrases' => 'Use varias palabras y evite frases comunes',
        'Use a longer keyboard pattern with more turns' => 'Use un patrón de teclado más largo con más giros',
        'Send us a fax to: %fax%' => 'Envíenos un fax al: %fax%',
        'Send us an email to: %email%' => 'Envíenos un correo a: %email%',
        'Call us at: %phone%' => 'Llámenos al %phone%',
        'Call us: %phone%' => 'Llámenos: %phone%',
    ],
    'ModulesBannerShop' => [
        'Choose a file' => 'Seleccione un archivo',
    ],
    'ModulesBlockwishlistShop' => [
        'Return to your account' => 'Volver a su cuenta',
    ],
    'ModulesCheckpaymentShop' => [
        'You have chosen payment by check.' => 'Ha elegido pagar con cheque.',
    ],
    'ModulesEmailalertsShop' => [
        "Interested in this product? Click below and we will let you know when it's available for order." => '¿Le interesa este producto? Haga clic debajo y le avisaremos cuando esté disponible.',
        "Interested in this product? Drop us an email and we will let you know when it's available for order." => '¿Le interesa este producto? Envíenos un correo y le avisaremos cuando esté disponible.',
        'Manage your mail alerts to stay informed about product availability and updates.' => 'Gestione sus alertas por correo para estar informado de la disponibilidad de los productos y sus novedades.',
    ],
    'ModulesEmailsubscriptionShop' => [
        'Subscribe to our newsletter' => 'Suscríbase a nuestro boletín de noticias',
    ],
    'ModulesOnepagecheckoutShop' => [
        'Write your comment...' => 'Escriba su comentario...',
    ],
    'ModulesProductcommentsShop' => [
        'Title of your review' => 'Título de su reseña',
    ],
    'ModulesWirepaymentShop' => [
        'You have chosen payment by bank transfer.' => 'Ha elegido pagar por transferencia bancaria.',
    ],
];
