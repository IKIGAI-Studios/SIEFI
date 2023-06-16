// Importar
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import RaleCop from '../models/raleCOPModel.js';
import RaleRcv from '../models/raleRCVModel.js';
import PDF  from 'pdfkit';
import ExcelJS from 'exceljs';
import  fs from 'fs';
import path from 'path';


// Variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Función para generar un informe
export async function generarInforme (req, res){

    // Actualizar en la base de datos 
    try{
      const nom_cred = req.body.nom_cred;
      const { type, folioSua, resultadosDiligencia } = req.body;

      // Se mando un sólo registro
      if(typeof nom_cred == 'string'){

        if (type == 'cop') {
            const resCop = await RaleCop.update(
                {
                    folioSua: folioSua,
                    res_dil: resultadosDiligencia,
                    cobrado: true
                },
                {
                    where: { nom_cred: nom_cred }
                }
                );

            } else if (type == 'rcv') {
                const resRcv = await RaleRcv.update(
                    {
                        folioSua: folioSua,
                        res_dil: resultadosDiligencia,
                        cobrado: true
                    },
                    {
                        where: { nom_cred: nom_cred }
                    }
                );
            }

        } else {
            // Se enviaron varios registros 
            for (let index = 0; index < nom_cred.length; index++) {

                const value = type[index];
                const nomCredValue = nom_cred[index];
                const folioSuaValue = folioSua[index];
                const resultadosDValue = resultadosDiligencia[index];
        
                if (value === 'cop') {
                    const resCop = await RaleCop.update(
                        {
                            folioSua: folioSuaValue,
                            res_dil: resultadosDValue,
                            cobrado: true
                        },
                        {
                            where: { nom_cred: nomCredValue }
                        }
                    );

                } else if (value === 'rcv') {
                    const resRcv = await RaleRcv.update(
                        {
                            folioSua: folioSuaValue,
                            res_dil: resultadosDValue,
                            cobrado: true
                        },
                        {
                            where: { nom_cred: nomCredValue }
                        }
                    );
                }
            }
        } 

    } catch (err){
        console.log("No se pudo cobrar",err);
    }


    // Crear la sesión del Usuario
    const { nombre, apellidos } = req.session.user;
    const { reg_pat, nom_cred, periodo, importe, folioSua, resultadosDiligencia } = req.body;

    //Variables
    var cellFormat;
    var filaFinal;
    var mergedCells = [];
    
    
    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Obtener el día, mes y año
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; 
    const year = currentDate.getFullYear();

    // Formatear la fecha en el formato deseado
    const formattedDate = `${year}-${month}-${day}`;
        
    // Ruta del archivo existente
    const filePath = 'src/assets/excel/INFORME_DIARIO_DE_EJECUTOR.xlsx';
    
    // Cargar el archivo existente
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Obtener la hoja de trabajo deseada
    const worksheet = workbook.getWorksheet('INFORME');
    
    // Modificar la información en las celdas mencionadas
    worksheet.getCell('G8').value = day;
    worksheet.getCell('I8').value = month;
    worksheet.getCell('K8').value = year;
    worksheet.getCell('F10').value = nombre + ' ' + apellidos;
    worksheet.getCell('E11').value = day;
    worksheet.getCell('G11').value = month;
    worksheet.getCell('I11').value = year;



    // Definir el formato de la celda
    cellFormat = {
        font: {
        size: 12
        },
        alignment: {
        vertical: 'middle',
        horizontal: 'center'
        },
        border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
        }, 
        height: 60
    };
    
    if (typeof reg_pat == 'string'){
        var celda;

        //Celda A17:
        celda = worksheet.getCell('A17');
        celda.value = reg_pat;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda B17
        celda = worksheet.getCell('B17');
        celda.value = nom_cred;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda C17
        celda = worksheet.getCell('C17');
        celda.value = periodo;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda D17
        celda = worksheet.getCell('D17');
        celda.value = importe;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda E17
        celda = worksheet.getCell('E17');
        celda.value = folioSua;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda F17
        celda = worksheet.getCell('F17');
        celda.value = resultadosDiligencia;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

    } else {
        
        // Insertar los valores en la columna A (Registro Patronal)
        reg_pat.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            worksheet.insertRow(fila);
            const celda = worksheet.getCell(`A${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna B (Crédito)
        nom_cred.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`B${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna C (Periodo)
        periodo.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`C${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna D (Importe)
        importe.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`D${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna E (Folio SUA)
        folioSua.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`E${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna F (Resultado de la diligencia)
        resultadosDiligencia.forEach((valor, indice) => {
            const fila = 16 + indice + 1;
            const celda = worksheet.getCell(`F${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        
        //     // Combinar y centrar si la celda no está en las celdas fusionadas previamente
        //     const mergeRange = `F${fila}:K${fila}`;
        //     const isAlreadyMerged = mergedCells.includes(mergeRange);
        //     if (!isAlreadyMerged) {
        //         worksheet.mergeCells(mergeRange);
        //         worksheet.getCell(`F${fila}`).alignment = {
        //             vertical: 'middle',
        //             horizontal: 'center',
        //         };
        //         // Registrar las celdas fusionadas en el array
        //         mergedCells.push(mergeRange);
        //     }
        });
    
    }
    
    // Generar el nombre del archivo con el nombre de usuario y fecha
    const fileName = `${nombre}_${formattedDate}_INFORME.xlsx`;
    const outputFilePath = `src/assets/excel/${fileName}`;
    
    // Guardar el archivo modificado
    await workbook.xlsx.writeFile(outputFilePath);
    
    console.log('Archivo modificado guardado:', outputFilePath);
    
    // Descargar el archivo modificado
    const fileContent = fs.readFileSync(outputFilePath);
    
    // Establecer las cabeceras de la respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar el archivo al cliente
    res.send(fileContent);
}



export async function generarGastos(req, res){
    console.log(req.body.reg_pat);
    
    // Crear la sesión del Usuario
    const { nombre, apellidos } = req.session.user;
    const { reg_pat, patron, type, nom_cred, periodo, provio, cobrado, gastos, tabulador, fechaPago, } = req.body;
    var cellFormat;
    let total = 0;

    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Obtener el día, mes y año
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; 
    const year = currentDate.getFullYear();

    // Formatear la fecha en el formato deseado
    const formattedDate = `${year}-${month}-${day}`;
        
    // Ruta del archivo existente
    const filePath = 'src/assets/excel/GASTOS_EJECUTOR.xlsx';
    
    // Cargar el archivo existente
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Obtener la hoja de trabajo deseada
    const worksheet = workbook.getWorksheet('GASTOS');


    //Modificar el contenido del documento
    // Definir el formato de la celda
    cellFormat = {
        font: {
        size: 12
        },
        alignment: {
        vertical: 'middle',
        horizontal: 'center'
        },
        border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
        }, 
        height: 60
    };
    
    if (typeof reg_pat == 'string'){
        var celda;

        //Celda A10:
        celda = worksheet.getCell('A10');
        celda.value = '1';
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda B10
        celda = worksheet.getCell('B10');
        celda.value = reg_pat;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda C10
        celda = worksheet.getCell('C10');
        celda.value = patron;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda D10
        celda = worksheet.getCell('D10');
        celda.value = type;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda E10
        celda = worksheet.getCell('E10');
        celda.value = provio;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda F10
        celda = worksheet.getCell('F10');
        celda.value = fechaPago;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda G10
        celda = worksheet.getCell('G10');
        celda.value = nom_cred;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda H10
        celda = worksheet.getCell('H10');
        celda.value = periodo;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda I10
        celda = worksheet.getCell('I10');
        celda.value = cobrado;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda J10
        celda = worksheet.getCell('J10');
        celda.value = gastos;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda K10
        celda = worksheet.getCell('K10');
        const I10 = worksheet.getCell('J10');
        const J10 = worksheet.getCell('J10');
        const suma = Number(I10.value) + Number(J10.value);
        celda.value = suma;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Celda L10
        celda = worksheet.getCell('L10');
        celda.value = tabulador;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

        //Nombre del ejecutor
        celda = reg_pat.length + 15;
        worksheet.getCell('B15').value = nombre + ' ' + apellidos;

        //Total
        celda = worksheet.getCell('L11');
        celda.value = tabulador;
        celda.font = cellFormat.font;
        celda.alignment = cellFormat.alignment;
        celda.border = cellFormat.border;

    } else {
        
        // Insertar los valores en la columna B (Registro Patronal)
        reg_pat.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            worksheet.insertRow(fila);
            const celda = worksheet.getCell(`B${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });
        
        // Insertar los valores en la columna C (Patron)
        patron.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`C${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna D (Rubro)
        type.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`D${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna E (Provio)
        provio.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`E${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna F (Fecha de pago)
        fechaPago.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`F${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna G (Crédito)
        nom_cred.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`G${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna H (Périodo)
        periodo.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`H${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna I (Cobrado)
        cobrado.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`I${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Insertar los valores en la columna J (Gastos)
        gastos.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`J${fila}`);
            celda.value = valor;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Llenar la columna A, con números consecutivos
        for (let i = 0; i < reg_pat.length; i++) {
            const fila = 10 + i;
            const celda = worksheet.getCell(`A${fila}`);
            celda.value = i + 1;
            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        }

    
        // Insertar los valores en la columna L (Tabulador) y sumar los valores numéricos
        tabulador.forEach((valor, indice) => {
            const fila = 9 + indice + 1;
            const celda = worksheet.getCell(`L${fila}`);
            celda.value = valor;

            // Verificar si el valor es numérico antes de sumarlo
            if (!isNaN(valor)) {
                total += Number(valor);
            }

            celda.font = cellFormat.font;
            celda.alignment = cellFormat.alignment;
            celda.border = cellFormat.border;
        });

        // Asignar el valor total a una celda específica
        const celdaTotal = reg_pat.length + 11;
        worksheet.getCell(`L${celdaTotal}`).value = total;


        //Llenar la columna K con la suma de I y J
        for (let i = 0; i < reg_pat.length; i++) {
            const fila = 10 + i;
            const celdaI = worksheet.getCell(`I${fila}`);
            const celdaJ = worksheet.getCell(`J${fila}`);
            const celdaK = worksheet.getCell(`K${fila}`);

            const suma = Number(celdaI.value) + Number(celdaJ.value);
            celdaK.value = suma;

            celdaK.font = cellFormat.font;
            celdaK.alignment = cellFormat.alignment;
            celdaK.border = cellFormat.border;
        }

        // Colocar el nombre del ejecutor 
        const celda = reg_pat.length + 15;
        worksheet.getCell(`B${celda}`).value = nombre + ' ' + apellidos;
    
}
    // Generar el nombre del archivo con el nombre de usuario y fecha
    const fileName = `${nombre}_${formattedDate}_GASTOS.xlsx`;
    const outputFilePath = `src/assets/excel/${fileName}`;
    
    // Guardar el archivo modificado
    await workbook.xlsx.writeFile(outputFilePath);
    
    console.log('Archivo modificado guardado:', outputFilePath);
    
    // Descargar el archivo modificado
    const fileContent = fs.readFileSync(outputFilePath);
    
    // Establecer las cabeceras de la respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar el archivo al cliente
    res.send(fileContent);
}