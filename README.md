# EZformfiller
Chrome App: EZ Form Filler
Download the app: https://chrome.google.com/webstore/detail/ez-form-filler/mclccdedllhhhlgepgaopcemkdgfapee

run as a web app here: https://reliablejared.github.io/EZformfiller/

# HOW TO USE:
see the exampleDocs folder for some samples.  Start with a pdf form, in the exampleDocs you'll see a 770.pdf form.  Fill out the form using this syntax SheetName%Cell, where SheetName%Cell is the location of the entry in your excel sheet that you would like to put into your pdf form.  Then SAVE your pdf, this is now your 'template'.  In the exampleDocs folder you'll see a doc 770_template.pdf.  Now run the EZformfiller app.  It will ask first for an excel sheet, then for a pdf template.  It will replace the SheetName%Cell syntax in your pdf template with the data from excel.  You'll then get a download link for the new form when it's done.  