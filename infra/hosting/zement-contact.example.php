<?php

// Copiar como zement-contact.php FUERA de la carpeta pública (un nivel por encima de la raíz web).
// Nunca subir claves reales al repositorio.
return [
    'CONTACT_ORIGIN' => '', // Origen exacto de la web, sin barra final (p. ej. https://www.dominio.com).
    'RESEND_API_KEY' => '',
    'CONTACT_FROM_EMAIL' => '', // Remitente verificado en Resend.
    'CONTACT_TO_EMAIL' => 'info@zement.es', // Buzón que recibe las consultas.
    'TURNSTILE_SECRET_KEY' => '',
    'TURNSTILE_ALLOWED_HOSTNAMES' => '', // Lista separada por comas, sin protocolo ni rutas.
    'ZEMENT_RELEASE_MODE' => 'preview', // 'public' solo en el lanzamiento autorizado.
];
