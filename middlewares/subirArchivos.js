import multer, { diskStorage } from "multer";

// Rutas por tipo
const TYPE = Object.freeze({
	header: "encabezado-reportes",
	footer: "footer-reportes",
});

// Filtro de subida
const MIME_EXTENSION = Object.freeze({
	"image/png": ".png",
});

/**
 * Sube un archivo de imagen al servidor para cambiar la plantilla de encabezado o pie de página.
 * @param {string} type - Tipo de subida para establecer la ruta. Debe ser 'header' o 'footer'.
 * @param {string} fieldName - Nombre del campo en el formulario donde se encuentra la imagen.
 * @returns {Function} - Función middleware de multer para manejar la subida del archivo.
 */
export const subirArchivo = (type, fieldName) => {
	const storage = diskStorage({
		destination: "src/imgs/",
		filename: (req, file, cb) => {
			cb(null, `${TYPE[type] + MIME_EXTENSION[file.mimetype]}`);
		},
	});

	// Guardar archivo
	return multer({
		storage: storage,
		fileFilter: (req, file, cb) => {
			if (!MIME_EXTENSION[file.mimetype]) {
				return cb(null, false);
			}
			cb(null, true);
		},
	}).single(fieldName);
};

export default subirArchivo;
