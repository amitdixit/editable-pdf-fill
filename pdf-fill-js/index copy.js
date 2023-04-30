const { PDFDocument } = require("pdf-lib");
const { readFile, writeFile } = require('fs/promises')
async function createPdf(input, output) {
    try {
        /*
                // Fetch JPEG image
                const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
                const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())
                // Fetch PNG image
                const pngUrl = 'https://pdf-lib.js.org/assets/minions_banana_alpha.png'
                const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer())
        
                // Embed the JPG image bytes and PNG image bytes
                const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
                const pngImage = await pdfDoc.embedPng(pngImageBytes)
        
                const signaturePdf = await fetch(
                    'https://github.com/Hopding/pdf-lib/files/5264763/with_signature.pdf',
                  ).then((res) => res.arrayBuffer());
        
        */

        const pdfDoc = await PDFDocument.load(await readFile(input));
        // const pdfDoc1 = await PDFDocument.load(await readFile(input),{ ignoreEncryption: true });

        //Removing the redundant file
        pdfDoc.removePage(0);
        pdfDoc.removePage(1);
        pdfDoc.removePage(1);
        pdfDoc.removePage(1);
        pdfDoc.removePage(1);

        //get required field names from the form

        const fieldNames = pdfDoc.getForm().getFields().map(f => f.getName());
        console.log({ fieldNames });

        const form = pdfDoc.getForm();
        const possibleFields = Array.from({ length: 111 }, (_, i) => i);

        possibleFields.forEach(possibleField => {
            try {
                var textField = form.getTextField(`Text${possibleField}`);
                if (textField) {
                    textField.setText(possibleField.toString());
                }

            } catch (err) {
                console.error(err);
            }
        });


        form.getTextField('Text2').setText('Amit Dixit');
        form.getCheckBox('Check Box7').check();

        /*
                const frm = pdfDoc.getForm();
                const fields = frm.getFields();
                fields.forEach(field => {
                    const type = field.constructor.name;
                    const name = field.getName();
                    if (type == 'PDFCheckBox') {
                        console.log(`${type}: ${name}`);
                        field.check();
                    } else {
                        field.setText(name);
                    }
                });
        
        */
        const pdfBytes = await pdfDoc.save();

        await writeFile(output, pdfBytes);
        console.log('PDF Created')
        //  download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");

    } catch (err) {
        console.error(err);
    }
}

createPdf('form1_unlocked.pdf', 'output.pdf')