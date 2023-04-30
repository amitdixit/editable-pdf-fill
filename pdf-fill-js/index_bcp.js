// const { PDFDocument } = require("pdf-lib");
// const { readFile, writeFile } = require('fs/promises')

import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile } from 'fs/promises'
// const fetch = require('node-fetch');
import fetch from 'node-fetch';

async function createPdf(input, output) {
    try {

        const pdfDoc = await PDFDocument.load(await readFile(input));
        // const pdfDoc1 = await PDFDocument.load(await readFile(input),{ ignoreEncryption: true });


        //get required field names from the form

        // const fieldNames = pdfDoc.getForm().getFields().map(f => f.getName());
        // console.log({ fieldNames });

        // const form = pdfDoc.getForm();
        // const possibleFields = Array.from({ length: 111 }, (_, i) => i);

        // possibleFields.forEach(possibleField => {
        //     try {
        //         var textField = form.getTextField(`Text${possibleField}`);
        //         if (textField) {
        //             textField.setText(possibleField.toString());
        //         }

        //     } catch (err) {
        //         console.error(err);
        //     }
        // });

        const form = pdfDoc.getForm();
        // const fields = form.getFields();
        // fields.forEach(field => {
        //     const type = field.constructor.name;
        //     const name = field.getName();
        //     console.log(`${type}: ${name}`);
        // });
        // https://www.gstatic.com/webp/gallery/1.jpg
        const imageBytes = await fetch('http://127.0.0.1:5500/1.jpg').then((res) => res.arrayBuffer())

        const myImage = await pdfDoc.embedJpg(imageBytes)



        form.getButton('SelfImage').setImage(myImage);
        form.getTextField('ApplicantName').setText('AMIT KUMAR DIXIT');
        form.getCheckBox('IsMale').check();

        form.getTextField('Title').setText('Mr');
        form.getTextField('FirstName').setText('AMIT');
        form.getTextField('MiddleName').setText('KUMAR');
        form.getTextField('LastName').setText('DIXIT');
        form.flatten();

        const pdfBytes = await pdfDoc.save();

        await writeFile(output, pdfBytes);
        console.log('PDF Created')

    } catch (err) {
        console.error(err);
    }
}


createPdf('inputfile.pdf', 'outputfile.pdf')