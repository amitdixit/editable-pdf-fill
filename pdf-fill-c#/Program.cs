using iText.Forms;
using iText.Forms.Fields;
using iText.IO.Image;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Annot;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Pdf.Xobject;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Diagnostics;

var stopwatch = new Stopwatch();

stopwatch.Start();
string pdfTemplate = $"{AppDomain.CurrentDomain.BaseDirectory}form1_unlocked.pdf";
CreatePdf("output_file.pdf", pdfTemplate);

stopwatch.Stop();

Console.WriteLine($"PDF Created {stopwatch.ElapsedMilliseconds}");

static void CreatePdf(string outputFile, string inputFile)
{
    // create clone page for each user in users
    using (var memoryStream = new MemoryStream())
    {
        dynamic data = JObject.Parse(File.ReadAllText($"{AppDomain.CurrentDomain.BaseDirectory}data.json"));
        PdfReader reader = new PdfReader(inputFile);
        PdfWriter writer = new PdfWriter(memoryStream);
        PdfDocument pdfDoc = new PdfDocument(reader, writer);
        PdfAcroForm form = PdfAcroForm.GetAcroForm(pdfDoc, true);
        var fields = form.GetFormFields();
        JObject converted = JsonConvert.DeserializeObject<JObject>(JsonConvert.SerializeObject(data.templates[0].template_values));

        foreach (KeyValuePair<string, JToken> keyValuePair in converted)
        {
            if (fields.TryGetValue(keyValuePair.Key, out PdfFormField value))
            {
                value.SetValue(keyValuePair.Value.ToString());
            }
        }
        //To Add the image to the PDF get the list of images
        JObject imageconverted = JsonConvert.DeserializeObject<JObject>(JsonConvert.SerializeObject(data.templates[0].images));
        foreach (KeyValuePair<string, JToken> keyValuePair in imageconverted)
        {
            if (keyValuePair.Value.HasValues)
            {
                PdfButtonFormField button = (PdfButtonFormField)form.GetField(keyValuePair.Key);
                if (button != null)
                {
                    string temp = Convert.ToString(keyValuePair.Value["content"]);

                    byte[] bytes = Convert.FromBase64String(temp);
                    ImageData img = ImageDataFactory.Create(bytes);
                    PdfImageXObject imgXObj = new PdfImageXObject(img);
                    IList<PdfWidgetAnnotation> widgets = button.GetWidgets();
                    foreach (PdfWidgetAnnotation widget in widgets)
                    {
                        Rectangle rectangle = widget.GetRectangle().ToRectangle();
                        PdfFormXObject xObject = new PdfFormXObject(rectangle);
                        PdfCanvas canvas = new PdfCanvas(xObject, pdfDoc);
                        canvas.AddXObjectWithTransformationMatrix(imgXObj, rectangle.GetWidth(), 0, 0, rectangle.GetHeight(), rectangle.GetLeft(), rectangle.GetBottom());
                        widget.SetNormalAppearance(xObject.GetPdfObject());
                    }
                }
            }
        }
        form.FlattenFields();
        pdfDoc.Close();
        byte[] b = memoryStream.ToArray();
        File.WriteAllBytes($"{AppDomain.CurrentDomain.BaseDirectory}{outputFile}", b);
    }
}

