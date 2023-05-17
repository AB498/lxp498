import json
from spacy.cli import download
import spacy
import sys
import os
from contextlib import redirect_stdout

langs = {}

typesToTry = ['_core_web_sm', '_core_news_sm', '_core_web_md', '_core_news_md',
              '_core_web_lg', '_core_news_lg', '_core_web_trf', '_core_news_trf']


def get_model(ln):

    # Redirect stdout to /dev/null
    devnull = open(os.devnull, 'w')
    with redirect_stdout(devnull):
        for t in typesToTry:
            lng = ln+t
            try:
                nlp = spacy.load(lng)
                return nlp
            except:
                try:
                    spacy.util.get_lang_class(ln)
                    print("downloading "+lng)
                    download(lng)
                    nlp = spacy.load(lng)
                    return nlp
                except:
                    # throw error
                    pass
    raise Exception("Language not supported")


def get_from_dict(ln):
    try:
        if ln in langs:
            return langs[ln]
        else:
            nlp = get_model(ln)
            langs[ln] = nlp
            return nlp
    except:
        raise Exception("Language not supported")


print("ready")
while True:
    inputText = input()
    try:
        with open(inputText, 'r', encoding='utf-8') as f:
            inp = f.read()
        inp = inp.split(' ', 1)
        lang, text = inp
        try:
            nlp = get_from_dict(lang)
        except:
            print("error2 "+inputText)
            continue
        doc = nlp(text)
        # opt = (",".join([token.text for token in doc]))
        # with open(inputText, 'w', encoding='utf-8') as f:
        #     f.write(opt)
        # print([token.text for token in doc])
        with open(inputText, 'w', encoding='utf-8') as f:
            json.dump([token.text for token in doc], f, ensure_ascii=False)

        print("done "+inputText)
    except:
        print("error "+inputText)
        break
