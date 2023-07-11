import multer, { diskStorage } from "multer";

// Rutas por tipo
const TYPE = Object.freeze({
    header: 'encabezado-reportes',
    footer: 'footer-reportes'
});

// Filtro de subida
const MIME_EXTENSION = Object.freeze({
    'image/png': '.png'
});

/**
 * Subir un archivo tipo imagen a la carpeta en el servidor para 
 * el cambio de Plantilla (Encabezado y Pie de Página)
 * @param type Tipo de subida para establecer la ruta.
 * @param fieldName Nombre del campo en el formulario donde
 * se encuentra la imagen.
 */
export const subirArchivo = (type, fieldName) => {
    const storage = diskStorage({
        destination: 'src/imgs/',
        filename: (req, file, cb) => {
            cb(null, `${TYPE[type] + MIME_EXTENSION[file.mimetype]}`);
        }
    });

    // Guardar archivo
    return multer({ 
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (!MIME_EXTENSION[file.mimetype]) {
                return cb(null, false);
            }
            cb(null, true);
        }
    }).single(fieldName);
}

export default subirArchivo;