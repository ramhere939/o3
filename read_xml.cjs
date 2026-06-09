const fs = require('fs');
const xml2js = require('xml2js');

const xmlFile = './docx_temp/word/document.xml';
const xmlStr = fs.readFileSync(xmlFile, 'utf8');

xml2js.parseString(xmlStr, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }

    const document = result['w:document'];
    const body = document['w:body'][0];
    const paragraphs = body['w:p'];

    let fullText = '';

    if (paragraphs) {
        paragraphs.forEach(p => {
            const runs = p['w:r'];
            let pText = '';
            if (runs) {
                runs.forEach(r => {
                    const texts = r['w:t'];
                    if (texts) {
                        texts.forEach(t => {
                            if (typeof t === 'string') {
                                pText += t;
                            } else if (t._) {
                                pText += t._;
                            }
                        });
                    }
                });
            }
            fullText += pText + '\n';
        });
    }

    console.log(fullText);
});
