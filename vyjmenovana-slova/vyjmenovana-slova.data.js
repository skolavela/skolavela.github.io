// Vyjmenovaná slova – data oddělená od logiky (použitelné i pro budoucí tisk).
// Seznamy jsou ze zadání; chytáky bez „kabina“ a bez „zima“ u M (patří k Z).
// „brzký“ je v přehledu, ale ne v kvízu: po Z v něm není i/y (písmeno před ý je k).
(function (root) {
'use strict';
var VS = {
  letters: ['B','L','M','P','S','V','Z'],
  prehled: {"B": {"vyjmenovane": ["být", "bydlit", "obyvatel", "byt", "příbytek", "nábytek", "dobytek", "obyčej", "bystrý", "bylina", "kobyla", "býk", "Přibyslav"], "pribuzne": ["bytost", "pobyt", "zbytek", "dobývat", "bydliště", "obydlí", "obyvatelstvo", "ubytovna", "nábytkový", "dobytčí", "obyčejný", "bystrost", "bystřina", "bylinka", "býložravec", "kobylka", "býček"]}, "L": {"vyjmenovane": ["slyšet", "mlýn", "blýskat se", "polykat", "plynout", "plýtvat", "vzlykat", "lysý", "lýtko", "lýko", "lyže", "pelyněk", "plyš"], "pribuzne": ["slýchat", "neslýchaný", "mlynář", "mlýnek", "blýskavý", "spolykat", "plynulý", "plyn", "plýtvání", "vzlyk", "lysina", "lyžař", "plyšový"]}, "M": {"vyjmenovane": ["my", "mýt", "myslit", "mýlit se", "hmyz", "myš", "hlemýžď", "mýtit", "zamykat", "smýkat", "dmýchat", "chmýří", "nachomýtnout se", "Litomyšl"], "pribuzne": ["umývat", "mýdlo", "myčka", "umyvadlo", "myšlenka", "smysl", "myslivec", "omyl", "mylný", "hmyzí", "myška", "mýtina", "odemykat", "smyk", "rozdmýchat"]}, "P": {"vyjmenovane": ["pýcha", "pytel", "pysk", "netopýr", "slepýš", "pyl", "kopyto", "klopýtat", "třpytit se", "zpytovat", "pykat", "pýr", "pýřit se", "čepýřit se"], "pribuzne": ["pyšný", "pytlík", "pytlák", "pyskatý", "pylový", "opylovat", "kopytník", "klopýtnout", "třpyt", "třpytivý", "zapýřit se", "načepýřený"]}, "S": {"vyjmenovane": ["syn", "sytý", "sýr", "syrový", "sychravý", "usychat", "sýkora", "sýček", "sysel", "syčet", "sypat"], "pribuzne": ["synovec", "nasytit", "sýrový", "syrovátka", "vysychat", "sýkorka", "sykot", "sypký", "posypat", "násyp"]}, "V": {"vyjmenovane": ["vy", "vysoký", "výt", "výskat", "zvykat", "žvýkat", "vydra", "výr", "vyžle", "povyk", "výheň"], "pribuzne": ["vykat", "výška", "Vysočina", "zavýt", "výskot", "zvyk", "obvyklý", "žvýkačka", "přežvýkavec", "výří", "povykovat"]}, "Z": {"vyjmenovane": ["brzy", "jazyk", "nazývat se", "Ruzyně"], "pribuzne": ["brzký", "jazýček", "jazykový", "ruzyňský"]}},
  words: [
    {"word": "být", "gap": 1, "answer": "ý", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "bydlit", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "obyvatel", "gap": 2, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "byt", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "příbytek", "gap": 4, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "nábytek", "gap": 3, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "dobytek", "gap": 3, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "obyčej", "gap": 2, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "bystrý", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "bylina", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "kobyla", "gap": 3, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "býk", "gap": 1, "answer": "ý", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "Přibyslav", "gap": 4, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"word": "slyšet", "gap": 2, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "mlýn", "gap": 2, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "blýskat se", "gap": 2, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "polykat", "gap": 3, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "plynout", "gap": 2, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "plýtvat", "gap": 2, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "vzlykat", "gap": 3, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "lysý", "gap": 1, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "lýtko", "gap": 1, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "lýko", "gap": 1, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "lyže", "gap": 1, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "pelyněk", "gap": 3, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "plyš", "gap": 2, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"word": "my", "gap": 1, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "mýt", "gap": 1, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "myslit", "gap": 1, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "mýlit se", "gap": 1, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "hmyz", "gap": 2, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "myš", "gap": 1, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "hlemýžď", "gap": 4, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "mýtit", "gap": 1, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "zamykat", "gap": 3, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "smýkat", "gap": 2, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "dmýchat", "gap": 2, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "chmýří", "gap": 3, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "nachomýtnout se", "gap": 6, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "Litomyšl", "gap": 5, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"word": "pýcha", "gap": 1, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "pytel", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "pysk", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "netopýr", "gap": 5, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "slepýš", "gap": 4, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "pyl", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "kopyto", "gap": 3, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "klopýtat", "gap": 4, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "třpytit se", "gap": 3, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "zpytovat", "gap": 2, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "pykat", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "pýr", "gap": 1, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "pýřit se", "gap": 1, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "čepýřit se", "gap": 3, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"word": "syn", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "sytý", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "sýr", "gap": 1, "answer": "ý", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "syrový", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "sychravý", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "usychat", "gap": 2, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "sýkora", "gap": 1, "answer": "ý", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "sýček", "gap": 1, "answer": "ý", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "sysel", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "syčet", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "sypat", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"word": "vy", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "vysoký", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "výt", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "výskat", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "zvykat", "gap": 2, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "žvýkat", "gap": 2, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "vydra", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "výr", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "vyžle", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "povyk", "gap": 3, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "výheň", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"word": "brzy", "gap": 3, "answer": "y", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"word": "jazyk", "gap": 3, "answer": "y", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"word": "nazývat se", "gap": 3, "answer": "ý", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"word": "Ruzyně", "gap": 3, "answer": "y", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"word": "bytost", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "root": "být", "why": "Příbuzné se slovem být (vyjmenované po B)."},
    {"word": "pobyt", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "root": "být", "why": "Příbuzné se slovem být (vyjmenované po B)."},
    {"word": "zbytek", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "root": "být", "why": "Příbuzné se slovem být (vyjmenované po B)."},
    {"word": "dobývat", "gap": 3, "answer": "ý", "letter": "B", "type": "pribuzne", "root": "být", "why": "Příbuzné se slovem být (vyjmenované po B)."},
    {"word": "bydliště", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "root": "bydlit", "why": "Příbuzné se slovem bydlit (vyjmenované po B)."},
    {"word": "obydlí", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "root": "bydlit", "why": "Příbuzné se slovem bydlit (vyjmenované po B)."},
    {"word": "obyvatelstvo", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "root": "obyvatel", "why": "Příbuzné se slovem obyvatel (vyjmenované po B)."},
    {"word": "ubytovna", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "root": "byt", "why": "Příbuzné se slovem byt (vyjmenované po B)."},
    {"word": "nábytkový", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "root": "nábytek", "why": "Příbuzné se slovem nábytek (vyjmenované po B)."},
    {"word": "dobytčí", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "root": "dobytek", "why": "Příbuzné se slovem dobytek (vyjmenované po B)."},
    {"word": "obyčejný", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "root": "obyčej", "why": "Příbuzné se slovem obyčej (vyjmenované po B)."},
    {"word": "bystrost", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "root": "bystrý", "why": "Příbuzné se slovem bystrý (vyjmenované po B)."},
    {"word": "bystřina", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "root": "bystrý", "why": "Příbuzné se slovem bystrý (vyjmenované po B)."},
    {"word": "bylinka", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "root": "bylina", "why": "Příbuzné se slovem bylina (vyjmenované po B)."},
    {"word": "býložravec", "gap": 1, "answer": "ý", "letter": "B", "type": "pribuzne", "root": "bylina", "why": "Příbuzné se slovem bylina (vyjmenované po B)."},
    {"word": "kobylka", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "root": "kobyla", "why": "Příbuzné se slovem kobyla (vyjmenované po B)."},
    {"word": "býček", "gap": 1, "answer": "ý", "letter": "B", "type": "pribuzne", "root": "býk", "why": "Příbuzné se slovem býk (vyjmenované po B)."},
    {"word": "slýchat", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "root": "slyšet", "why": "Příbuzné se slovem slyšet (vyjmenované po L)."},
    {"word": "neslýchaný", "gap": 4, "answer": "ý", "letter": "L", "type": "pribuzne", "root": "slyšet", "why": "Příbuzné se slovem slyšet (vyjmenované po L)."},
    {"word": "mlynář", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "root": "mlýn", "why": "Příbuzné se slovem mlýn (vyjmenované po L)."},
    {"word": "mlýnek", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "root": "mlýn", "why": "Příbuzné se slovem mlýn (vyjmenované po L)."},
    {"word": "blýskavý", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "root": "blýskat se", "why": "Příbuzné se slovem blýskat se (vyjmenované po L)."},
    {"word": "spolykat", "gap": 4, "answer": "y", "letter": "L", "type": "pribuzne", "root": "polykat", "why": "Příbuzné se slovem polykat (vyjmenované po L)."},
    {"word": "plynulý", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "root": "plynout", "why": "Příbuzné se slovem plynout (vyjmenované po L)."},
    {"word": "plyn", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "root": "plynout", "why": "Příbuzné se slovem plynout (vyjmenované po L)."},
    {"word": "plýtvání", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "root": "plýtvat", "why": "Příbuzné se slovem plýtvat (vyjmenované po L)."},
    {"word": "vzlyk", "gap": 3, "answer": "y", "letter": "L", "type": "pribuzne", "root": "vzlykat", "why": "Příbuzné se slovem vzlykat (vyjmenované po L)."},
    {"word": "lysina", "gap": 1, "answer": "y", "letter": "L", "type": "pribuzne", "root": "lysý", "why": "Příbuzné se slovem lysý (vyjmenované po L)."},
    {"word": "lyžař", "gap": 1, "answer": "y", "letter": "L", "type": "pribuzne", "root": "lyže", "why": "Příbuzné se slovem lyže (vyjmenované po L)."},
    {"word": "plyšový", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "root": "plyš", "why": "Příbuzné se slovem plyš (vyjmenované po L)."},
    {"word": "umývat", "gap": 2, "answer": "ý", "letter": "M", "type": "pribuzne", "root": "mýt", "why": "Příbuzné se slovem mýt (vyjmenované po M)."},
    {"word": "mýdlo", "gap": 1, "answer": "ý", "letter": "M", "type": "pribuzne", "root": "mýt", "why": "Příbuzné se slovem mýt (vyjmenované po M)."},
    {"word": "myčka", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "root": "mýt", "why": "Příbuzné se slovem mýt (vyjmenované po M)."},
    {"word": "umyvadlo", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "root": "mýt", "why": "Příbuzné se slovem mýt (vyjmenované po M)."},
    {"word": "myšlenka", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "root": "myslit", "why": "Příbuzné se slovem myslit (vyjmenované po M)."},
    {"word": "smysl", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "root": "myslit", "why": "Příbuzné se slovem myslit (vyjmenované po M)."},
    {"word": "myslivec", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "root": "myslit", "why": "Příbuzné se slovem myslit (vyjmenované po M)."},
    {"word": "omyl", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "root": "mýlit se", "why": "Příbuzné se slovem mýlit se (vyjmenované po M)."},
    {"word": "mylný", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "root": "mýlit se", "why": "Příbuzné se slovem mýlit se (vyjmenované po M)."},
    {"word": "hmyzí", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "root": "hmyz", "why": "Příbuzné se slovem hmyz (vyjmenované po M)."},
    {"word": "myška", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "root": "myš", "why": "Příbuzné se slovem myš (vyjmenované po M)."},
    {"word": "mýtina", "gap": 1, "answer": "ý", "letter": "M", "type": "pribuzne", "root": "mýtit", "why": "Příbuzné se slovem mýtit (vyjmenované po M)."},
    {"word": "odemykat", "gap": 4, "answer": "y", "letter": "M", "type": "pribuzne", "root": "zamykat", "why": "Příbuzné se slovem zamykat (vyjmenované po M)."},
    {"word": "smyk", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "root": "smýkat", "why": "Příbuzné se slovem smýkat (vyjmenované po M)."},
    {"word": "rozdmýchat", "gap": 5, "answer": "ý", "letter": "M", "type": "pribuzne", "root": "dmýchat", "why": "Příbuzné se slovem dmýchat (vyjmenované po M)."},
    {"word": "pyšný", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "root": "pýcha", "why": "Příbuzné se slovem pýcha (vyjmenované po P)."},
    {"word": "pytlík", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "root": "pytel", "why": "Příbuzné se slovem pytel (vyjmenované po P)."},
    {"word": "pytlák", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "root": "pytel", "why": "Příbuzné se slovem pytel (vyjmenované po P)."},
    {"word": "pyskatý", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "root": "pysk", "why": "Příbuzné se slovem pysk (vyjmenované po P)."},
    {"word": "pylový", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "root": "pyl", "why": "Příbuzné se slovem pyl (vyjmenované po P)."},
    {"word": "opylovat", "gap": 2, "answer": "y", "letter": "P", "type": "pribuzne", "root": "pyl", "why": "Příbuzné se slovem pyl (vyjmenované po P)."},
    {"word": "kopytník", "gap": 3, "answer": "y", "letter": "P", "type": "pribuzne", "root": "kopyto", "why": "Příbuzné se slovem kopyto (vyjmenované po P)."},
    {"word": "klopýtnout", "gap": 4, "answer": "ý", "letter": "P", "type": "pribuzne", "root": "klopýtat", "why": "Příbuzné se slovem klopýtat (vyjmenované po P)."},
    {"word": "třpyt", "gap": 3, "answer": "y", "letter": "P", "type": "pribuzne", "root": "třpytit se", "why": "Příbuzné se slovem třpytit se (vyjmenované po P)."},
    {"word": "třpytivý", "gap": 3, "answer": "y", "letter": "P", "type": "pribuzne", "root": "třpytit se", "why": "Příbuzné se slovem třpytit se (vyjmenované po P)."},
    {"word": "zapýřit se", "gap": 3, "answer": "ý", "letter": "P", "type": "pribuzne", "root": "pýřit se", "why": "Příbuzné se slovem pýřit se (vyjmenované po P)."},
    {"word": "načepýřený", "gap": 5, "answer": "ý", "letter": "P", "type": "pribuzne", "root": "čepýřit se", "why": "Příbuzné se slovem čepýřit se (vyjmenované po P)."},
    {"word": "synovec", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "root": "syn", "why": "Příbuzné se slovem syn (vyjmenované po S)."},
    {"word": "nasytit", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "root": "sytý", "why": "Příbuzné se slovem sytý (vyjmenované po S)."},
    {"word": "sýrový", "gap": 1, "answer": "ý", "letter": "S", "type": "pribuzne", "root": "sýr", "why": "Příbuzné se slovem sýr (vyjmenované po S)."},
    {"word": "syrovátka", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "root": "syrový", "why": "Příbuzné se slovem syrový (vyjmenované po S)."},
    {"word": "vysychat", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "root": "usychat", "why": "Příbuzné se slovem usychat (vyjmenované po S)."},
    {"word": "sýkorka", "gap": 1, "answer": "ý", "letter": "S", "type": "pribuzne", "root": "sýkora", "why": "Příbuzné se slovem sýkora (vyjmenované po S)."},
    {"word": "sykot", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "root": "syčet", "why": "Příbuzné se slovem syčet (vyjmenované po S)."},
    {"word": "sypký", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "root": "sypat", "why": "Příbuzné se slovem sypat (vyjmenované po S)."},
    {"word": "posypat", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "root": "sypat", "why": "Příbuzné se slovem sypat (vyjmenované po S)."},
    {"word": "násyp", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "root": "sypat", "why": "Příbuzné se slovem sypat (vyjmenované po S)."},
    {"word": "vykat", "gap": 1, "answer": "y", "letter": "V", "type": "pribuzne", "root": "vy", "why": "Příbuzné se slovem vy (vyjmenované po V)."},
    {"word": "výška", "gap": 1, "answer": "ý", "letter": "V", "type": "pribuzne", "root": "vysoký", "why": "Příbuzné se slovem vysoký (vyjmenované po V)."},
    {"word": "Vysočina", "gap": 1, "answer": "y", "letter": "V", "type": "pribuzne", "root": "vysoký", "why": "Příbuzné se slovem vysoký (vyjmenované po V)."},
    {"word": "zavýt", "gap": 3, "answer": "ý", "letter": "V", "type": "pribuzne", "root": "výt", "why": "Příbuzné se slovem výt (vyjmenované po V)."},
    {"word": "výskot", "gap": 1, "answer": "ý", "letter": "V", "type": "pribuzne", "root": "výskat", "why": "Příbuzné se slovem výskat (vyjmenované po V)."},
    {"word": "zvyk", "gap": 2, "answer": "y", "letter": "V", "type": "pribuzne", "root": "zvykat", "why": "Příbuzné se slovem zvykat (vyjmenované po V)."},
    {"word": "obvyklý", "gap": 3, "answer": "y", "letter": "V", "type": "pribuzne", "root": "zvykat", "why": "Příbuzné se slovem zvykat (vyjmenované po V)."},
    {"word": "žvýkačka", "gap": 2, "answer": "ý", "letter": "V", "type": "pribuzne", "root": "žvýkat", "why": "Příbuzné se slovem žvýkat (vyjmenované po V)."},
    {"word": "přežvýkavec", "gap": 5, "answer": "ý", "letter": "V", "type": "pribuzne", "root": "žvýkat", "why": "Příbuzné se slovem žvýkat (vyjmenované po V)."},
    {"word": "výří", "gap": 1, "answer": "ý", "letter": "V", "type": "pribuzne", "root": "výr", "why": "Příbuzné se slovem výr (vyjmenované po V)."},
    {"word": "povykovat", "gap": 3, "answer": "y", "letter": "V", "type": "pribuzne", "root": "povyk", "why": "Příbuzné se slovem povyk (vyjmenované po V)."},
    {"word": "jazýček", "gap": 3, "answer": "ý", "letter": "Z", "type": "pribuzne", "root": "jazyk", "why": "Příbuzné se slovem jazyk (vyjmenované po Z)."},
    {"word": "jazykový", "gap": 3, "answer": "y", "letter": "Z", "type": "pribuzne", "root": "jazyk", "why": "Příbuzné se slovem jazyk (vyjmenované po Z)."},
    {"word": "ruzyňský", "gap": 3, "answer": "y", "letter": "Z", "type": "pribuzne", "root": "Ruzyně", "why": "Příbuzné se slovem Ruzyně (vyjmenované po Z)."},
    {"word": "bílý", "gap": 1, "answer": "í", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "bída", "gap": 1, "answer": "í", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "bič", "gap": 1, "answer": "i", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "bitva", "gap": 1, "answer": "i", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "bít", "gap": 1, "answer": "í", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "obilí", "gap": 2, "answer": "i", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "lípa", "gap": 1, "answer": "í", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "list", "gap": 1, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "liška", "gap": 1, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "líný", "gap": 1, "answer": "í", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "lilie", "gap": 1, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "klíč", "gap": 2, "answer": "í", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "slib", "gap": 2, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "míč", "gap": 1, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "milý", "gap": 1, "answer": "i", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "mír", "gap": 1, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "mísa", "gap": 1, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "smích", "gap": 2, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "umírat", "gap": 2, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "pila", "gap": 1, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "pivo", "gap": 1, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "písnička", "gap": 1, "answer": "í", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "pít", "gap": 1, "answer": "í", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "opice", "gap": 2, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "špinavý", "gap": 2, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "síla", "gap": 1, "answer": "í", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "silnice", "gap": 1, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "sítko", "gap": 1, "answer": "í", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "sirotek", "gap": 1, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "osika", "gap": 2, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "prosit", "gap": 4, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "víla", "gap": 1, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "vidět", "gap": 1, "answer": "i", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "vítr", "gap": 1, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "vítat", "gap": 1, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "svíčka", "gap": 2, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "zvíře", "gap": 2, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "zima", "gap": 1, "answer": "i", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "zítra", "gap": 1, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "zívat", "gap": 1, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "zinek", "gap": 1, "answer": "i", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"word": "nazítří", "gap": 3, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"word": "vozík", "gap": 3, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."}
  ],
  sentences: [
    {"sentence": "Jednou chci být lékařem.", "target": "být", "gap": 1, "answer": "ý", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Chceme bydlit blízko školy.", "target": "bydlit", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Každý obyvatel má svůj dům.", "target": "obyvatel", "gap": 2, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Máme pěkný byt ve městě.", "target": "byt", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Lesní příbytek stál u potoka.", "target": "příbytek", "gap": 4, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Nový nábytek je ze dřeva.", "target": "nábytek", "gap": 3, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Na statku mají dobytek i koně.", "target": "dobytek", "gap": 3, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "To je starý český obyčej.", "target": "obyčej", "gap": 2, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Můj bratr je bystrý žák.", "target": "bystrý", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "V lese roste léčivá bylina.", "target": "bylina", "gap": 1, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Hnědá kobyla běží po louce.", "target": "kobyla", "gap": 3, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Velký býk stojí ve chlévě.", "target": "býk", "gap": 1, "answer": "ý", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Město Přibyslav leží u Sázavy.", "target": "Přibyslav", "gap": 4, "answer": "y", "letter": "B", "type": "vyjmenovane", "why": "Vyjmenované slovo po B."},
    {"sentence": "Můžeme slyšet zpěv ptáků.", "target": "slyšet", "gap": 2, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Starý mlýn stojí u řeky.", "target": "mlýn", "gap": 2, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Začalo blýskat se nad lesem.", "target": "blýskat se", "gap": 2, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Musíš pomalu polykat sousta jídla.", "target": "polykat", "gap": 3, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Řeka má plynout klidně dál.", "target": "plynout", "gap": 2, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Nesmíme plýtvat čistou vodou.", "target": "plýtvat", "gap": 2, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Malé dítě začalo vzlykat.", "target": "vzlykat", "gap": 3, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Děda je už dávno lysý.", "target": "lysý", "gap": 1, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Po běhu mě bolí lýtko.", "target": "lýtko", "gap": 1, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Má ve sklepě suché lýko.", "target": "lýko", "gap": 1, "answer": "ý", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "V zimě nosíme lyže na horách.", "target": "lyže", "gap": 1, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Na zahradě roste pelyněk.", "target": "pelyněk", "gap": 3, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "Kupujeme měkký plyš na hračky.", "target": "plyš", "gap": 2, "answer": "y", "letter": "L", "type": "vyjmenovane", "why": "Vyjmenované slovo po L."},
    {"sentence": "To uděláme my sami dnes.", "target": "my", "gap": 1, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Před jídlem musíš mýt ruce.", "target": "mýt", "gap": 1, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Musíme dobře myslit na úkol.", "target": "myslit", "gap": 1, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Nechci mýlit se v počtu.", "target": "mýlit se", "gap": 1, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "V trávě leze malý hmyz.", "target": "hmyz", "gap": 2, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "V koutě běhá šedá myš.", "target": "myš", "gap": 1, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Po dešti leze hlemýžď pomalu.", "target": "hlemýžď", "gap": 4, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "V lese budou mýtit stromy.", "target": "mýtit", "gap": 1, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Večer musíme zamykat dveře.", "target": "zamykat", "gap": 3, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Vítr může smýkat větve stromů.", "target": "smýkat", "gap": 2, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Kovář začal dmýchat do ohně.", "target": "dmýchat", "gap": 2, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Z pampelišky létá chmýří.", "target": "chmýří", "gap": 3, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Může nachomýtnout se ke hře.", "target": "nachomýtnout se", "gap": 6, "answer": "ý", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Město Litomyšl je velmi krásné.", "target": "Litomyšl", "gap": 5, "answer": "y", "letter": "M", "type": "vyjmenovane", "why": "Vyjmenované slovo po M."},
    {"sentence": "Velká pýcha mu ublížila.", "target": "pýcha", "gap": 1, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Těžký pytel leží ve sklepě.", "target": "pytel", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Kůň má měkký pysk.", "target": "pysk", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "V noci letí netopýr.", "target": "netopýr", "gap": 5, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "V trávě leží slepýš.", "target": "slepýš", "gap": 4, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Včely sbírají pyl z květů.", "target": "pyl", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Kůň má tvrdé kopyto.", "target": "kopyto", "gap": 3, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Po kamení můžeš klopýtat.", "target": "klopýtat", "gap": 4, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Rosa může třpytit se ráno.", "target": "třpytit se", "gap": 3, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Má zpytovat své svědomí.", "target": "zpytovat", "gap": 2, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Za chybu bude pykat.", "target": "pykat", "gap": 1, "answer": "y", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Na poli roste pýr hojně.", "target": "pýr", "gap": 1, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Začala pýřit se hanbou.", "target": "pýřit se", "gap": 1, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Kohout umí čepýřit se.", "target": "čepýřit se", "gap": 3, "answer": "ý", "letter": "P", "type": "vyjmenovane", "why": "Vyjmenované slovo po P."},
    {"sentence": "Náš syn chodí do školy.", "target": "syn", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Po obědě je už sytý.", "target": "sytý", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "K svačině máme čerstvý sýr.", "target": "sýr", "gap": 1, "answer": "ý", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Má rád syrový salát.", "target": "syrový", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Venku je sychravý den.", "target": "sychravý", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Květiny v truhlíku začínají usychat.", "target": "usychat", "gap": 2, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Na větvi sedí sýkora.", "target": "sýkora", "gap": 1, "answer": "ý", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "V noci volá sýček.", "target": "sýček", "gap": 1, "answer": "ý", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Na louce běhá sysel.", "target": "sysel", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Had v trávě začal syčet.", "target": "syčet", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "Bude sypat zrní slepicím.", "target": "sypat", "gap": 1, "answer": "y", "letter": "S", "type": "vyjmenovane", "why": "Vyjmenované slovo po S."},
    {"sentence": "To musíte udělat vy.", "target": "vy", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Na kopci roste vysoký strom.", "target": "vysoký", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Vlci začali výt na měsíc.", "target": "výt", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Děti budou výskat radostí.", "target": "výskat", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Musíme zvykat na pořádek.", "target": "zvykat", "gap": 2, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Jídlo máme žvýkat pomalu.", "target": "žvýkat", "gap": 2, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "U potoka žije vydra.", "target": "vydra", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "V lese houká výr.", "target": "výr", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Malé vyžle běhá po dvoře.", "target": "vyžle", "gap": 1, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Na dvoře je velký povyk.", "target": "povyk", "gap": 3, "answer": "y", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Kovář má horkou výheň.", "target": "výheň", "gap": 1, "answer": "ý", "letter": "V", "type": "vyjmenovane", "why": "Vyjmenované slovo po V."},
    {"sentence": "Ráno brzy vstaneme do školy.", "target": "brzy", "gap": 3, "answer": "y", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"sentence": "Ukaž mi svůj jazyk.", "target": "jazyk", "gap": 3, "answer": "y", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"sentence": "Budeme nazývat se kamarádi.", "target": "nazývat se", "gap": 3, "answer": "ý", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"sentence": "Praha má letiště Ruzyně.", "target": "Ruzyně", "gap": 3, "answer": "y", "letter": "Z", "type": "vyjmenovane", "why": "Vyjmenované slovo po Z."},
    {"sentence": "Člověk je živá bytost.", "target": "bytost", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem být (vyjmenované po B).", "root": "být"},
    {"sentence": "Náš pobyt u moře prospěl.", "target": "pobyt", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem být (vyjmenované po B).", "root": "být"},
    {"sentence": "Snědl jsem poslední zbytek chleba.", "target": "zbytek", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem být (vyjmenované po B).", "root": "být"},
    {"sentence": "Horníci budou dobývat uhlí.", "target": "dobývat", "gap": 3, "answer": "ý", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem být (vyjmenované po B).", "root": "být"},
    {"sentence": "Naše bydliště je blízko parku.", "target": "bydliště", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem bydlit (vyjmenované po B).", "root": "bydlit"},
    {"sentence": "Lesní obydlí je z klád.", "target": "obydlí", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem bydlit (vyjmenované po B).", "root": "bydlit"},
    {"sentence": "Místní obyvatelstvo stále roste.", "target": "obyvatelstvo", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem obyvatel (vyjmenované po B).", "root": "obyvatel"},
    {"sentence": "Výletní ubytovna stojí u lesa.", "target": "ubytovna", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem byt (vyjmenované po B).", "root": "byt"},
    {"sentence": "Koupili jsme nábytkový obchod.", "target": "nábytkový", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem nábytek (vyjmenované po B).", "root": "nábytek"},
    {"sentence": "Cesta vedla kolem dobytčí ohrady.", "target": "dobytčí", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem dobytek (vyjmenované po B).", "root": "dobytek"},
    {"sentence": "To je jen obyčejný kámen.", "target": "obyčejný", "gap": 2, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem obyčej (vyjmenované po B).", "root": "obyčej"},
    {"sentence": "Jeho bystrost nám velmi pomohla.", "target": "bystrost", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem bystrý (vyjmenované po B).", "root": "bystrý"},
    {"sentence": "Horská bystřina teče z kopce.", "target": "bystřina", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem bystrý (vyjmenované po B).", "root": "bystrý"},
    {"sentence": "Na louce roste bylinka.", "target": "bylinka", "gap": 1, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem bylina (vyjmenované po B).", "root": "bylina"},
    {"sentence": "Kráva je typický býložravec.", "target": "býložravec", "gap": 1, "answer": "ý", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem bylina (vyjmenované po B).", "root": "bylina"},
    {"sentence": "Na stéble sedí kobylka.", "target": "kobylka", "gap": 3, "answer": "y", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem kobyla (vyjmenované po B).", "root": "kobyla"},
    {"sentence": "Malý býček běhá po dvoře.", "target": "býček", "gap": 1, "answer": "ý", "letter": "B", "type": "pribuzne", "why": "Příbuzné se slovem býk (vyjmenované po B).", "root": "býk"},
    {"sentence": "Často slýchat písničky z rádia.", "target": "slýchat", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem slyšet (vyjmenované po L).", "root": "slyšet"},
    {"sentence": "To je neslýchaný výkon třídy.", "target": "neslýchaný", "gap": 4, "answer": "ý", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem slyšet (vyjmenované po L).", "root": "slyšet"},
    {"sentence": "Starý mlynář mele obilí.", "target": "mlynář", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem mlýn (vyjmenované po L).", "root": "mlýn"},
    {"sentence": "Na kávu používáme mlýnek.", "target": "mlýnek", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem mlýn (vyjmenované po L).", "root": "mlýn"},
    {"sentence": "Má blýskavý nový kabát.", "target": "blýskavý", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem blýskat se (vyjmenované po L).", "root": "blýskat se"},
    {"sentence": "Musíš spolykat celou tabletu.", "target": "spolykat", "gap": 4, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem polykat (vyjmenované po L).", "root": "polykat"},
    {"sentence": "Jeho běh je plynulý a rychlý.", "target": "plynulý", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem plynout (vyjmenované po L).", "root": "plynout"},
    {"sentence": "V kuchyni vaříme na plyn.", "target": "plyn", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem plynout (vyjmenované po L).", "root": "plynout"},
    {"sentence": "Každé plýtvání vodou je škoda.", "target": "plýtvání", "gap": 2, "answer": "ý", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem plýtvat (vyjmenované po L).", "root": "plýtvat"},
    {"sentence": "Ozval se tichý vzlyk.", "target": "vzlyk", "gap": 3, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem vzlykat (vyjmenované po L).", "root": "vzlykat"},
    {"sentence": "Je vidět lysina na temeni.", "target": "lysina", "gap": 1, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem lysý (vyjmenované po L).", "root": "lysý"},
    {"sentence": "Zkušený lyžař sjíždí kopec.", "target": "lyžař", "gap": 1, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem lyže (vyjmenované po L).", "root": "lyže"},
    {"sentence": "Dostala plyšový medvídek k svátku.", "target": "plyšový", "gap": 2, "answer": "y", "letter": "L", "type": "pribuzne", "why": "Příbuzné se slovem plyš (vyjmenované po L).", "root": "plyš"},
    {"sentence": "Musíme umývat ovoce před jídlem.", "target": "umývat", "gap": 2, "answer": "ý", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem mýt (vyjmenované po M).", "root": "mýt"},
    {"sentence": "U dřezu leží nové mýdlo.", "target": "mýdlo", "gap": 1, "answer": "ý", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem mýt (vyjmenované po M).", "root": "mýt"},
    {"sentence": "Nová myčka stojí v kuchyni.", "target": "myčka", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem mýt (vyjmenované po M).", "root": "mýt"},
    {"sentence": "V koupelně stojí umyvadlo.", "target": "umyvadlo", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem mýt (vyjmenované po M).", "root": "mýt"},
    {"sentence": "Napadla mě dobrá myšlenka.", "target": "myšlenka", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem myslit (vyjmenované po M).", "root": "myslit"},
    {"sentence": "Tenhle úkol má jasný smysl.", "target": "smysl", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem myslit (vyjmenované po M).", "root": "myslit"},
    {"sentence": "Ráno jde myslivec do lesa.", "target": "myslivec", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem myslit (vyjmenované po M).", "root": "myslit"},
    {"sentence": "To byl jen malý omyl.", "target": "omyl", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem mýlit se (vyjmenované po M).", "root": "mýlit se"},
    {"sentence": "Měl mylný odhad výsledku.", "target": "mylný", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem mýlit se (vyjmenované po M).", "root": "mýlit se"},
    {"sentence": "Prohlížíme hmyzí křídla pod lupou.", "target": "hmyzí", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem hmyz (vyjmenované po M).", "root": "hmyz"},
    {"sentence": "Malá myška běhá ve sklepě.", "target": "myška", "gap": 1, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem myš (vyjmenované po M).", "root": "myš"},
    {"sentence": "Je krásná mýtina v lese.", "target": "mýtina", "gap": 1, "answer": "ý", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem mýtit (vyjmenované po M).", "root": "mýtit"},
    {"sentence": "Ráno musíme odemykat školu.", "target": "odemykat", "gap": 4, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem zamykat (vyjmenované po M).", "root": "zamykat"},
    {"sentence": "Auto dostalo na ledě smyk.", "target": "smyk", "gap": 2, "answer": "y", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem smýkat (vyjmenované po M).", "root": "smýkat"},
    {"sentence": "Vítr může rozdmýchat oheň.", "target": "rozdmýchat", "gap": 5, "answer": "ý", "letter": "M", "type": "pribuzne", "why": "Příbuzné se slovem dmýchat (vyjmenované po M).", "root": "dmýchat"},
    {"sentence": "Je pyšný na svou práci.", "target": "pyšný", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem pýcha (vyjmenované po P).", "root": "pýcha"},
    {"sentence": "Malý pytlík leží na stole.", "target": "pytlík", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem pytel (vyjmenované po P).", "root": "pytel"},
    {"sentence": "Hajný viděl pytlák v lese.", "target": "pytlák", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem pytel (vyjmenované po P).", "root": "pytel"},
    {"sentence": "Ten kluk je trochu pyskatý.", "target": "pyskatý", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem pysk (vyjmenované po P).", "root": "pysk"},
    {"sentence": "Dnes je vysoký pylový nálet.", "target": "pylový", "gap": 1, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem pyl (vyjmenované po P).", "root": "pyl"},
    {"sentence": "Včely umí opylovat květy.", "target": "opylovat", "gap": 2, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem pyl (vyjmenované po P).", "root": "pyl"},
    {"sentence": "Kůň je typický kopytník.", "target": "kopytník", "gap": 3, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem kopyto (vyjmenované po P).", "root": "kopyto"},
    {"sentence": "Můžeš klopýtnout o kámen.", "target": "klopýtnout", "gap": 4, "answer": "ý", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem klopýtat (vyjmenované po P).", "root": "klopýtat"},
    {"sentence": "Na sněhu je krásný třpyt.", "target": "třpyt", "gap": 3, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem třpytit se (vyjmenované po P).", "root": "třpytit se"},
    {"sentence": "Má třpytivý zimní kabát.", "target": "třpytivý", "gap": 3, "answer": "y", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem třpytit se (vyjmenované po P).", "root": "třpytit se"},
    {"sentence": "Musela zapýřit se hanbou.", "target": "zapýřit se", "gap": 3, "answer": "ý", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem pýřit se (vyjmenované po P).", "root": "pýřit se"},
    {"sentence": "Kohout je celý načepýřený.", "target": "načepýřený", "gap": 5, "answer": "ý", "letter": "P", "type": "pribuzne", "why": "Příbuzné se slovem čepýřit se (vyjmenované po P).", "root": "čepýřit se"},
    {"sentence": "Náš synovec jde do školy.", "target": "synovec", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem syn (vyjmenované po S).", "root": "syn"},
    {"sentence": "Chléb může nasytit celou rodinu.", "target": "nasytit", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem sytý (vyjmenované po S).", "root": "sytý"},
    {"sentence": "Máme sýrový chleba k svačině.", "target": "sýrový", "gap": 1, "answer": "ý", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem sýr (vyjmenované po S).", "root": "sýr"},
    {"sentence": "Z mléka vzniká syrovátka.", "target": "syrovátka", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem syrový (vyjmenované po S).", "root": "syrový"},
    {"sentence": "Kaluž na cestě začíná vysychat.", "target": "vysychat", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem usychat (vyjmenované po S).", "root": "usychat"},
    {"sentence": "Na krmítku sedí sýkorka.", "target": "sýkorka", "gap": 1, "answer": "ý", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem sýkora (vyjmenované po S).", "root": "sýkora"},
    {"sentence": "Z trávy se ozval sykot.", "target": "sykot", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem syčet (vyjmenované po S).", "root": "syčet"},
    {"sentence": "Písek je suchý a sypký.", "target": "sypký", "gap": 1, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem sypat (vyjmenované po S).", "root": "sypat"},
    {"sentence": "Můžeme posypat dort cukrem.", "target": "posypat", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem sypat (vyjmenované po S).", "root": "sypat"},
    {"sentence": "Vedle trati je vysoký násyp.", "target": "násyp", "gap": 3, "answer": "y", "letter": "S", "type": "pribuzne", "why": "Příbuzné se slovem sypat (vyjmenované po S).", "root": "sypat"},
    {"sentence": "Ve škole se učíme vykat.", "target": "vykat", "gap": 1, "answer": "y", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem vy (vyjmenované po V).", "root": "vy"},
    {"sentence": "Jaká je výška našeho stromu?", "target": "výška", "gap": 1, "answer": "ý", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem vysoký (vyjmenované po V).", "root": "vysoký"},
    {"sentence": "Kraj Vysočina je velmi hezký.", "target": "Vysočina", "gap": 1, "answer": "y", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem vysoký (vyjmenované po V).", "root": "vysoký"},
    {"sentence": "Pes začal zavýt na měsíc.", "target": "zavýt", "gap": 3, "answer": "ý", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem výt (vyjmenované po V).", "root": "výt"},
    {"sentence": "Ozval se radostný výskot dětí.", "target": "výskot", "gap": 1, "answer": "ý", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem výskat (vyjmenované po V).", "root": "výskat"},
    {"sentence": "Čtení večer je dobrý zvyk.", "target": "zvyk", "gap": 2, "answer": "y", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem zvykat (vyjmenované po V).", "root": "zvykat"},
    {"sentence": "To je jeho obvyklý zvyk.", "target": "obvyklý", "gap": 3, "answer": "y", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem zvykat (vyjmenované po V).", "root": "zvykat"},
    {"sentence": "Do lavice nepatří žvýkačka.", "target": "žvýkačka", "gap": 2, "answer": "ý", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem žvýkat (vyjmenované po V).", "root": "žvýkat"},
    {"sentence": "Kráva je typický přežvýkavec.", "target": "přežvýkavec", "gap": 5, "answer": "ý", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem žvýkat (vyjmenované po V).", "root": "žvýkat"},
    {"sentence": "V dutině je výří hnízdo.", "target": "výří", "gap": 1, "answer": "ý", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem výr (vyjmenované po V).", "root": "výr"},
    {"sentence": "Děti začaly povykovat na dvoře.", "target": "povykovat", "gap": 3, "answer": "y", "letter": "V", "type": "pribuzne", "why": "Příbuzné se slovem povyk (vyjmenované po V).", "root": "povyk"},
    {"sentence": "U boty se zlomil jazýček.", "target": "jazýček", "gap": 3, "answer": "ý", "letter": "Z", "type": "pribuzne", "why": "Příbuzné se slovem jazyk (vyjmenované po Z).", "root": "jazyk"},
    {"sentence": "Máme jazykový koutek ve třídě.", "target": "jazykový", "gap": 3, "answer": "y", "letter": "Z", "type": "pribuzne", "why": "Příbuzné se slovem jazyk (vyjmenované po Z).", "root": "jazyk"},
    {"sentence": "Letadlo má ruzyňský směr.", "target": "ruzyňský", "gap": 3, "answer": "y", "letter": "Z", "type": "pribuzne", "why": "Příbuzné se slovem Ruzyně (vyjmenované po Z).", "root": "Ruzyně"},
    {"sentence": "Na louce běhá bílý kůň.", "target": "bílý", "gap": 1, "answer": "í", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Po neúrodě přišla velká bída.", "target": "bída", "gap": 1, "answer": "í", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Jezdec má v ruce bič.", "target": "bič", "gap": 1, "answer": "i", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Ve hře byla velká bitva.", "target": "bitva", "gap": 1, "answer": "i", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Nesmíš bít svého kamaráda.", "target": "bít", "gap": 1, "answer": "í", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Na poli zraje obilí.", "target": "obilí", "gap": 2, "answer": "i", "letter": "B", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Před školou roste stará lípa.", "target": "lípa", "gap": 1, "answer": "í", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Ze stromu spadl žlutý list.", "target": "list", "gap": 1, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "V lese běhá rezavá liška.", "target": "liška", "gap": 1, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Nesmíš být líný žák.", "target": "líný", "gap": 1, "answer": "í", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Na záhonu kvete bílá lilie.", "target": "lilie", "gap": 1, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Ztratil jsem klíč od domu.", "target": "klíč", "gap": 2, "answer": "í", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Dal mi slib a dodržel ho.", "target": "slib", "gap": 2, "answer": "i", "letter": "L", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Na hřišti skáče červený míč.", "target": "míč", "gap": 1, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Děda je velmi milý pán.", "target": "milý", "gap": 1, "answer": "i", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Všichni lidé chtějí mír.", "target": "mír", "gap": 1, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Na stole stojí plná mísa.", "target": "mísa", "gap": 1, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Ve třídě se ozval smích.", "target": "smích", "gap": 2, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Květina nesmí umírat žízní.", "target": "umírat", "gap": 2, "answer": "í", "letter": "M", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "V dílně leží ostrá pila.", "target": "pila", "gap": 1, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Tatínek večer pije pivo.", "target": "pivo", "gap": 1, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Zazněla veselá písnička ve třídě.", "target": "písnička", "gap": 1, "answer": "í", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Po běhu musíš pít vodu.", "target": "pít", "gap": 1, "answer": "í", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "V zoo skáče veselá opice.", "target": "opice", "gap": 2, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Po práci má špinavý kabát.", "target": "špinavý", "gap": 2, "answer": "i", "letter": "P", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Jeho síla je opravdu velká.", "target": "síla", "gap": 1, "answer": "í", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Nová silnice vede do města.", "target": "silnice", "gap": 1, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Přes sítko cedíme čaj.", "target": "sítko", "gap": 1, "answer": "í", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "V pohádce žil malý sirotek.", "target": "sirotek", "gap": 1, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "U potoka roste vysoká osika.", "target": "osika", "gap": 2, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Musíme prosit o odpuštění.", "target": "prosit", "gap": 4, "answer": "i", "letter": "S", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "V pohádce žije hodná víla.", "target": "víla", "gap": 1, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Z kopce můžeme vidět vesnici.", "target": "vidět", "gap": 1, "answer": "i", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Venku fouká silný vítr.", "target": "vítr", "gap": 1, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Budeme vítat hosty u dveří.", "target": "vítat", "gap": 1, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Na stole hoří malá svíčka.", "target": "svíčka", "gap": 2, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "V lese žije divoké zvíře.", "target": "zvíře", "gap": 2, "answer": "í", "letter": "V", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Letos je tuhá dlouhá zima.", "target": "zima", "gap": 1, "answer": "i", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Půjdeme zítra na výlet.", "target": "zítra", "gap": 1, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Večer začal zívat únavou.", "target": "zívat", "gap": 1, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Kýbl je z kovu zinek.", "target": "zinek", "gap": 1, "answer": "i", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se i."},
    {"sentence": "Výlet odložíme na nazítří.", "target": "nazítří", "gap": 3, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."},
    {"sentence": "Táta tlačí nákupní vozík.", "target": "vozík", "gap": 3, "answer": "í", "letter": "Z", "type": "chytak", "why": "Není příbuzné s žádným vyjmenovaným slovem, píše se í."}
  ],
  pairs: [
    {"sentence": "Chtěl bych ___ hasičem.", "options": ["být", "bít"], "answer": "být", "letter": "B", "why": "být = existovat, bít = tlouct."},
    {"sentence": "Nesmíš ___ psa.", "options": ["být", "bít"], "answer": "bít", "letter": "B", "why": "bít = tlouct, být = existovat."},
    {"sentence": "Včera ___ krásný den.", "options": ["byl", "bil"], "answer": "byl", "letter": "B", "why": "byl = od být (existovat), bil = od bít (tlouct)."},
    {"sentence": "Zvon na věži ___ poledne.", "options": ["byl", "bil"], "answer": "bil", "letter": "B", "why": "bil = od bít (tlouct), byl = od být (existovat)."},
    {"sentence": "Před jídlem si musíš ___ ruce.", "options": ["mýt", "mít"], "answer": "mýt", "letter": "M", "why": "mýt = umývat, mít = vlastnit."},
    {"sentence": "Chci ___ psa.", "options": ["mýt", "mít"], "answer": "mít", "letter": "M", "why": "mít = vlastnit, mýt = umývat."},
    {"sentence": "Včely sbírají ___.", "options": ["pyl", "pil"], "answer": "pyl", "letter": "P", "why": "pyl = jemný prášek z květů, pil = od pít."},
    {"sentence": "Táta ráno ___ kávu.", "options": ["pyl", "pil"], "answer": "pil", "letter": "P", "why": "pil = od pít, pyl = jemný prášek z květů."},
    {"sentence": "V lese houkal ___.", "options": ["výr", "vír"], "answer": "výr", "letter": "V", "why": "výr = sova, vír = točivý proud vody."},
    {"sentence": "Pod jezem se točil ___.", "options": ["výr", "vír"], "answer": "vír", "letter": "V", "why": "vír = točivý proud vody, výr = sova."},
    {"sentence": "Vlci začali ___.", "options": ["výt", "vít"], "answer": "výt", "letter": "V", "why": "výt = hlasitě kvílet, vít = pletením stáčet."},
    {"sentence": "Babička nás učila ___ věnečky.", "options": ["výt", "vít"], "answer": "vít", "letter": "V", "why": "vít = pletením stáčet, výt = hlasitě kvílet."}
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = VS;
else root.VS = VS;
})(typeof window !== 'undefined' ? window : globalThis);

/*
// KE KONTROLE
// Věty pro režim Věty (4–8 slov, cíl je vždy slovo ze seznamů zadání).
// Celkem 204 vět. Ke kontrole učitelem.
// být: Jednou chci být lékařem.
// bydlit: Chceme bydlit blízko školy.
// obyvatel: Každý obyvatel má svůj dům.
// byt: Máme pěkný byt ve městě.
// příbytek: Lesní příbytek stál u potoka.
// nábytek: Nový nábytek je ze dřeva.
// dobytek: Na statku mají dobytek i koně.
// obyčej: To je starý český obyčej.
// bystrý: Můj bratr je bystrý žák.
// bylina: V lese roste léčivá bylina.
// kobyla: Hnědá kobyla běží po louce.
// býk: Velký býk stojí ve chlévě.
// Přibyslav: Město Přibyslav leží u Sázavy.
// slyšet: Můžeme slyšet zpěv ptáků.
// mlýn: Starý mlýn stojí u řeky.
// blýskat se: Začalo blýskat se nad lesem.
// polykat: Musíš pomalu polykat sousta jídla.
// plynout: Řeka má plynout klidně dál.
// plýtvat: Nesmíme plýtvat čistou vodou.
// vzlykat: Malé dítě začalo vzlykat.
// lysý: Děda je už dávno lysý.
// lýtko: Po běhu mě bolí lýtko.
// lýko: Má ve sklepě suché lýko.
// lyže: V zimě nosíme lyže na horách.
// pelyněk: Na zahradě roste pelyněk.
// plyš: Kupujeme měkký plyš na hračky.
// my: To uděláme my sami dnes.
// mýt: Před jídlem musíš mýt ruce.
// myslit: Musíme dobře myslit na úkol.
// mýlit se: Nechci mýlit se v počtu.
// hmyz: V trávě leze malý hmyz.
// myš: V koutě běhá šedá myš.
// hlemýžď: Po dešti leze hlemýžď pomalu.
// mýtit: V lese budou mýtit stromy.
// zamykat: Večer musíme zamykat dveře.
// smýkat: Vítr může smýkat větve stromů.
// dmýchat: Kovář začal dmýchat do ohně.
// chmýří: Z pampelišky létá chmýří.
// nachomýtnout se: Může nachomýtnout se ke hře.
// Litomyšl: Město Litomyšl je velmi krásné.
// pýcha: Velká pýcha mu ublížila.
// pytel: Těžký pytel leží ve sklepě.
// pysk: Kůň má měkký pysk.
// netopýr: V noci letí netopýr.
// slepýš: V trávě leží slepýš.
// pyl: Včely sbírají pyl z květů.
// kopyto: Kůň má tvrdé kopyto.
// klopýtat: Po kamení můžeš klopýtat.
// třpytit se: Rosa může třpytit se ráno.
// zpytovat: Má zpytovat své svědomí.
// pykat: Za chybu bude pykat.
// pýr: Na poli roste pýr hojně.
// pýřit se: Začala pýřit se hanbou.
// čepýřit se: Kohout umí čepýřit se.
// syn: Náš syn chodí do školy.
// sytý: Po obědě je už sytý.
// sýr: K svačině máme čerstvý sýr.
// syrový: Má rád syrový salát.
// sychravý: Venku je sychravý den.
// usychat: Květiny v truhlíku začínají usychat.
// sýkora: Na větvi sedí sýkora.
// sýček: V noci volá sýček.
// sysel: Na louce běhá sysel.
// syčet: Had v trávě začal syčet.
// sypat: Bude sypat zrní slepicím.
// vy: To musíte udělat vy.
// vysoký: Na kopci roste vysoký strom.
// výt: Vlci začali výt na měsíc.
// výskat: Děti budou výskat radostí.
// zvykat: Musíme zvykat na pořádek.
// žvýkat: Jídlo máme žvýkat pomalu.
// vydra: U potoka žije vydra.
// výr: V lese houká výr.
// vyžle: Malé vyžle běhá po dvoře.
// povyk: Na dvoře je velký povyk.
// výheň: Kovář má horkou výheň.
// brzy: Ráno brzy vstaneme do školy.
// jazyk: Ukaž mi svůj jazyk.
// nazývat se: Budeme nazývat se kamarádi.
// Ruzyně: Praha má letiště Ruzyně.
// bytost: Člověk je živá bytost.
// pobyt: Náš pobyt u moře prospěl.
// zbytek: Snědl jsem poslední zbytek chleba.
// dobývat: Horníci budou dobývat uhlí.
// bydliště: Naše bydliště je blízko parku.
// obydlí: Lesní obydlí je z klád.
// obyvatelstvo: Místní obyvatelstvo stále roste.
// ubytovna: Výletní ubytovna stojí u lesa.
// nábytkový: Koupili jsme nábytkový obchod.
// dobytčí: Cesta vedla kolem dobytčí ohrady.
// obyčejný: To je jen obyčejný kámen.
// bystrost: Jeho bystrost nám velmi pomohla.
// bystřina: Horská bystřina teče z kopce.
// bylinka: Na louce roste bylinka.
// býložravec: Kráva je typický býložravec.
// kobylka: Na stéble sedí kobylka.
// býček: Malý býček běhá po dvoře.
// slýchat: Často slýchat písničky z rádia.
// neslýchaný: To je neslýchaný výkon třídy.
// mlynář: Starý mlynář mele obilí.
// mlýnek: Na kávu používáme mlýnek.
// blýskavý: Má blýskavý nový kabát.
// spolykat: Musíš spolykat celou tabletu.
// plynulý: Jeho běh je plynulý a rychlý.
// plyn: V kuchyni vaříme na plyn.
// plýtvání: Každé plýtvání vodou je škoda.
// vzlyk: Ozval se tichý vzlyk.
// lysina: Je vidět lysina na temeni.
// lyžař: Zkušený lyžař sjíždí kopec.
// plyšový: Dostala plyšový medvídek k svátku.
// umývat: Musíme umývat ovoce před jídlem.
// mýdlo: U dřezu leží nové mýdlo.
// myčka: Nová myčka stojí v kuchyni.
// umyvadlo: V koupelně stojí umyvadlo.
// myšlenka: Napadla mě dobrá myšlenka.
// smysl: Tenhle úkol má jasný smysl.
// myslivec: Ráno jde myslivec do lesa.
// omyl: To byl jen malý omyl.
// mylný: Měl mylný odhad výsledku.
// hmyzí: Prohlížíme hmyzí křídla pod lupou.
// myška: Malá myška běhá ve sklepě.
// mýtina: Je krásná mýtina v lese.
// odemykat: Ráno musíme odemykat školu.
// smyk: Auto dostalo na ledě smyk.
// rozdmýchat: Vítr může rozdmýchat oheň.
// pyšný: Je pyšný na svou práci.
// pytlík: Malý pytlík leží na stole.
// pytlák: Hajný viděl pytlák v lese.
// pyskatý: Ten kluk je trochu pyskatý.
// pylový: Dnes je vysoký pylový nálet.
// opylovat: Včely umí opylovat květy.
// kopytník: Kůň je typický kopytník.
// klopýtnout: Můžeš klopýtnout o kámen.
// třpyt: Na sněhu je krásný třpyt.
// třpytivý: Má třpytivý zimní kabát.
// zapýřit se: Musela zapýřit se hanbou.
// načepýřený: Kohout je celý načepýřený.
// synovec: Náš synovec jde do školy.
// nasytit: Chléb může nasytit celou rodinu.
// sýrový: Máme sýrový chleba k svačině.
// syrovátka: Z mléka vzniká syrovátka.
// vysychat: Kaluž na cestě začíná vysychat.
// sýkorka: Na krmítku sedí sýkorka.
// sykot: Z trávy se ozval sykot.
// sypký: Písek je suchý a sypký.
// posypat: Můžeme posypat dort cukrem.
// násyp: Vedle trati je vysoký násyp.
// vykat: Ve škole se učíme vykat.
// výška: Jaká je výška našeho stromu?
// Vysočina: Kraj Vysočina je velmi hezký.
// zavýt: Pes začal zavýt na měsíc.
// výskot: Ozval se radostný výskot dětí.
// zvyk: Čtení večer je dobrý zvyk.
// obvyklý: To je jeho obvyklý zvyk.
// žvýkačka: Do lavice nepatří žvýkačka.
// přežvýkavec: Kráva je typický přežvýkavec.
// výří: V dutině je výří hnízdo.
// povykovat: Děti začaly povykovat na dvoře.
// jazýček: U boty se zlomil jazýček.
// jazykový: Máme jazykový koutek ve třídě.
// ruzyňský: Letadlo má ruzyňský směr.
// bílý: Na louce běhá bílý kůň.
// bída: Po neúrodě přišla velká bída.
// bič: Jezdec má v ruce bič.
// bitva: Ve hře byla velká bitva.
// bít: Nesmíš bít svého kamaráda.
// obilí: Na poli zraje obilí.
// lípa: Před školou roste stará lípa.
// list: Ze stromu spadl žlutý list.
// liška: V lese běhá rezavá liška.
// líný: Nesmíš být líný žák.
// lilie: Na záhonu kvete bílá lilie.
// klíč: Ztratil jsem klíč od domu.
// slib: Dal mi slib a dodržel ho.
// míč: Na hřišti skáče červený míč.
// milý: Děda je velmi milý pán.
// mír: Všichni lidé chtějí mír.
// mísa: Na stole stojí plná mísa.
// smích: Ve třídě se ozval smích.
// umírat: Květina nesmí umírat žízní.
// pila: V dílně leží ostrá pila.
// pivo: Tatínek večer pije pivo.
// písnička: Zazněla veselá písnička ve třídě.
// pít: Po běhu musíš pít vodu.
// opice: V zoo skáče veselá opice.
// špinavý: Po práci má špinavý kabát.
// síla: Jeho síla je opravdu velká.
// silnice: Nová silnice vede do města.
// sítko: Přes sítko cedíme čaj.
// sirotek: V pohádce žil malý sirotek.
// osika: U potoka roste vysoká osika.
// prosit: Musíme prosit o odpuštění.
// víla: V pohádce žije hodná víla.
// vidět: Z kopce můžeme vidět vesnici.
// vítr: Venku fouká silný vítr.
// vítat: Budeme vítat hosty u dveří.
// svíčka: Na stole hoří malá svíčka.
// zvíře: V lese žije divoké zvíře.
// zima: Letos je tuhá dlouhá zima.
// zítra: Půjdeme zítra na výlet.
// zívat: Večer začal zívat únavou.
// zinek: Kýbl je z kovu zinek.
// nazítří: Výlet odložíme na nazítří.
// vozík: Táta tlačí nákupní vozík.
*/
