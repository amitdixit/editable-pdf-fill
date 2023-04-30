// const { PDFDocument } = require("pdf-lib");
// const { readFile, writeFile } = require('fs/promises')

import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile } from 'fs/promises'
// const fetch = require('node-fetch');
import fetch from 'node-fetch';
//import data from './data.json' assert { type: "json" };


async function createPdf(input, output) {
    try {
        //  console.log(data);
        const pdfDoc = await PDFDocument.load(await readFile(input));
        const form = pdfDoc.getForm();


        let rawdata = await readFile('./data-copy.json');
        let data = JSON.parse(rawdata);
        let templateValues = data.template_values;
        for (let x in templateValues) {
            try {
                if (x.startsWith("#i")) {
                    const image = await pdfDoc.embedJpg(Buffer.from(templateValues[x], 'base64'))
                    form.getButton(x).setImage(image)
                } else if (x.startsWith("#c") || x.startsWith("is")) {
                    if (templateValues[x].toUpperCase() == "YES" || templateValues[x].toUpperCase() == "Y") {
                        form.getCheckBox(x).check();
                    }
                } else {
                    if (form.getTextField(x)) {
                        form.getTextField(x).setText(templateValues[x]);
                    }
                }
            } catch (err) {

            }
        }

        let images = customer.templates[0].images;
        for (let x in images) {
            try {
                if (images[x] != null) {
                    const image = await pdfDoc.embedJpg(Buffer.from(images[x]["content"], 'base64'))
                    form.getButton(x).setImage(image)
                }
            } catch (err) {

            }
        }

        form.flatten();

        const pdfBytes = await pdfDoc.save();

        await writeFile(output, pdfBytes);
        console.log('PDF Created')

    } catch (err) {
        console.error(err);
    }
}



var start = new Date().getTime();
console.log(`Start TIme :${start}`)
await createPdf('inputfile.pdf', 'outputfile.pdf');

var end = new Date().getTime();
console.log(`End TIme :${end}`)
var time = end - start;
console.log(`Total TIme :${time / 1000}`)