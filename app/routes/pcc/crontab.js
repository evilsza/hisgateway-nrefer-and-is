"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
const his_ezhosp_1 = require("../../models/refer/his_ezhosp");
const his_thiades_1 = require("../../models/refer/his_thiades");
const his_hosxpv3_1 = require("../../models/refer/his_hosxpv3");
const his_hosxpv4_1 = require("../../models/refer/his_hosxpv4");
const his_jhcis_1 = require("../../models/refer/his_jhcis");
const his_md_1 = require("../../models/refer/his_md");
const his_kpstat_1 = require("../../models/refer/his_kpstat");
const his_mkhospital_1 = require("../../models/refer/his_mkhospital");
const his_1 = require("../../models/refer/his");
const his_nemo_1 = require("../../models/refer/his_nemo");
const his_pmk_1 = require("../../models/refer/his_pmk");
const his_mypcu_1 = require("../../models/refer/his_mypcu");
const his_hosxppcu_1 = require("../../models/refer/his_hosxppcu");
const hisProvider = process.env.HIS_PROVIDER;
let hisModel;
switch (hisProvider) {
    case 'ezhosp':
        hisModel = new his_ezhosp_1.HisEzhospModel();
        break;
    case 'thiades':
        hisModel = new his_thiades_1.HisThiadesModel();
        break;
    case 'hosxpv3':
        hisModel = new his_hosxpv3_1.HisHosxpv3Model();
        break;
    case 'hosxpv4':
        hisModel = new his_hosxpv4_1.HisHosxpv4Model();
        break;
    case 'hosxppcu':
        hisModel = new his_hosxppcu_1.HisHosxpPcuModel();
        break;
    case 'mkhospital':
        hisModel = new his_mkhospital_1.HisMkhospitalModel();
        break;
    case 'nemo':
    case 'nemo_refer':
        hisModel = new his_nemo_1.HisNemoModel();
        break;
    case 'ssb':
        break;
    case 'infod':
        break;
    case 'hi':
        break;
    case 'himpro':
        break;
    case 'jhcis':
        hisModel = new his_jhcis_1.HisJhcisModel();
        break;
    case 'hospitalos':
        break;
    case 'jhos':
        break;
    case 'pmk':
        hisModel = new his_pmk_1.HisPmkModel();
        break;
    case 'md':
        hisModel = new his_md_1.HisMdModel();
        break;
    case 'spdc':
    case 'kpstat':
        hisModel = new his_kpstat_1.HisKpstatModel();
        break;
    case 'mypcu':
        hisModel = new his_mypcu_1.HisMyPcuModel();
        break;
    default:
        hisModel = new his_1.HisModel();
}
const hcode = process.env.HOSPCODE;
const his = process.env.HIS_PROVIDER;
const resultText = 'sent_result.txt';
let sentContent = '';
let dcToken = '';
let reqToken = {};
let crontabConfig;
let apiVersion = '-';
function sendMoph(req, reply, db) {
    return __awaiter(this, void 0, void 0, function* () {
        const dateNow = moment().locale('th').format('YYYY-MM-DD');
        sentContent = moment().locale('th').format('YYYY-MM-DD HH:mm:ss') + ' data:' + dateNow + "\r\n";
        reqToken = yield getToken();
        if (reqToken && reqToken.statusCode === 200 && reqToken.token) {
            dcToken = reqToken.token;
            sentContent += `token ${reqToken.token}\r`;
        }
        else {
            console.log('get token error', reqToken.message);
            sentContent += `get token Error:` + JSON.stringify(reqToken) + `\r`;
            writeResult(resultText, sentContent);
            return false;
        }
        const hourNow = +moment().locale('th').get('hours');
        const minuteNow = +moment().locale('th').get('minutes');
        if ((hourNow == 1 || hourNow == 8 || hourNow == 12 || hourNow == 18 || hourNow == 22)
            && minuteNow - 1 < +process.env.NREFER_AUTO_SEND_EVERY_MINUTE) {
            const date = moment().locale('th').subtract(1, 'days').format('YYYY-MM-DD');
            yield getService(db, date);
        }
        else if (hourNow == 3 && minuteNow - 1 < +process.env.NREFER_AUTO_SEND_EVERY_MINUTE) {
            let oldDate = moment(dateNow).subtract(7, 'days').format('YYYY-MM-DD');
            while (oldDate < dateNow) {
                oldDate = moment(oldDate).add(1, 'days').format('YYYY-MM-DD');
            }
        }
        yield getService(db, "2020-09-18");
        const sendDataCenter = yield getService(db, dateNow);
        yield expireToken();
        return { sendDataCenter };
    });
}
function getService(db, date) {
    return __awaiter(this, void 0, void 0, function* () {
        let sentResult = {
            person: { success: 0, fail: 0 },
            address: { success: 0, fail: 0 },
            service: { success: 0, fail: 0 },
            diagnosisOpd: { success: 0, fail: 0 },
            drugOpd: { success: 0, fail: 0 },
        };
        const rows = yield hisModel.getService(db, 'date_serv', date, hcode);
        sentContent += '  - service = ' + rows.length + '\r';
        const d_update = moment().locale('th').format('YYYY-MM-DD HH:mm:ss');
        if (rows && rows.length) {
            sentResult.service.success = rows.length;
            for (const row of rows) {
                yield sendToApi('save-service', row);
                yield person(db, row.pid || row.PID, sentResult);
                yield getAddress(db, row.pid || row.PID, sentResult);
                yield getDiagnosisOpd(db, row.SEQ || row.seq, sentResult);
                yield getDrugOpd(db, row.SEQ || row.seq, sentResult);
            }
        }
        return sentResult;
    });
}
function person(db, pid, sentResult) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield hisModel.getPerson(db, 'hn', pid, hcode);
        sentContent += '  - person = ' + rows.length + '\r';
        if (rows && rows.length) {
            rows[0]['FNAME'] = rows[0].NAME || rows[0].name;
            const saveResult = yield sendToApi('save-person', rows[0]);
            if (saveResult.statusCode == 200) {
                sentResult.person.success += 1;
            }
            else {
                sentResult.person.fail += 1;
                console.log('save-person', rows[0].HN, saveResult.message);
            }
            sentContent += '    -- PID ' + rows[0].HN + ' ' + (saveResult.result || saveResult.message) + '\r';
        }
        return rows[0];
    });
}
function getAddress(db, pid, sentResult) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pid) {
            const rows = yield hisModel.getAddress(db, 'hn', pid, hcode);
            sentContent += '  - address = ' + (rows ? rows.length : 0) + '\r';
            if (rows && rows.length) {
                for (const row of rows) {
                    row.PID = row.PID || row.pid || row.HN || row.hn;
                    const saveResult = yield sendToApi('save-address', row);
                    if (saveResult.statusCode == 200) {
                        sentResult.address.success += 1;
                    }
                    else {
                        sentResult.address.fail += 1;
                        console.log('save address fail', row.PID, saveResult.message);
                    }
                    sentContent += '    -- PID ' + row.PID + ' ' + (saveResult.result || saveResult.message) + '\r';
                }
            }
            return rows;
        }
        else {
            console.log('Address error: not found HN');
            return [];
        }
    });
}
function getDiagnosisOpd(db, visitNo, sentResult) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield hisModel.getDiagnosisOpd(db, visitNo, hcode);
        if (rows && rows.length) {
            sentContent += '  - diagnosis_opd = ' + rows.length + '\r';
            const saveResult = yield sendToApi('save-diagnosis-opd', rows);
            sentContent += '    -- ' + visitNo + ' ' + JSON.stringify(saveResult) + '\r';
            if (saveResult.statusCode === 200) {
                sentResult.diagnosisOpd.success += rows.length;
            }
            else {
                sentResult.diagnosisOpd.fail += 1;
                console.log('save-diagnosis-opd', visitNo, saveResult.message);
            }
        }
        else {
            sentContent += '  - diagnosis_opd = 0\r';
        }
        return rows;
    });
}
function getDrugOpd(db, visitNo, sentResult) {
    return __awaiter(this, void 0, void 0, function* () {
        let opdDrug = [];
        const rows = yield hisModel.getDrugOpd(db, visitNo, hcode);
        if (rows && rows.length) {
            sentContent += '  - drug_opd = ' + rows.length + '\r';
            opdDrug = rows;
            const saveResult = yield sendToApi('save-drug-opd', rows);
            sentContent += '    -- ' + visitNo + ' ' + JSON.stringify(saveResult) + '\r';
            if (saveResult.statusCode == 200) {
                sentResult.drugOpd.success += rows.length;
            }
            else {
                console.log('drug opd error: vn ', visitNo, saveResult.message);
                sentResult.drugOpd.fail += 1;
            }
        }
        else {
            sentContent += '  - drug_opd = 0\r';
        }
        return opdDrug;
    });
}
function sendToApi(path, dataArray) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataSending = querystring.stringify({
            hospcode: hcode, data: JSON.stringify(dataArray),
            processPid: process.pid, dateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            sourceApiName: 'HIS-connect version ' + apiVersion
        });
        const options = {
            hostname: 'connect.moph.go.th',
            port: '',
            path: '/dc-api/data/' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + dcToken,
                'Content-Length': Buffer.byteLength(dataSending)
            },
            body: {
                hospcode: hcode, data: dataArray,
                processPid: process.pid, dateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                sourceApiName: 'HIS connect version',
                sourceApiVersion: apiVersion
            }
        };
        let ret = '';
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    ret += chunk;
                });
                res.on('end', () => {
                    console.log(ret);
                    const data = JSON.parse(ret);
                    resolve(data);
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.write(dataSending);
            req.end();
        });
    });
}
function getToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.NREFER_APIKEY || 'api-key';
        const secretKey = process.env.NREFER_SECRETKEY || 'secret-key';
        let url = process.env.NREFER_URL1;
        url += url.substr(-1, 1) === '/' ? '' : '/';
        const postData = querystring.stringify({
            apiKey: apiKey, secretKey: secretKey,
            sourceApiName: 'HIS Connect', apiVersion: apiVersion
        });
        const options = {
            hostname: 'connect.moph.go.th',
            port: '',
            path: '/dc-api/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        let ret = '';
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    ret += chunk;
                });
                res.on('end', () => {
                    const data = JSON.parse(ret);
                    resolve(data);
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.write(postData);
            req.end();
        });
    });
}
function expireToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            hostname: 'connect.moph.go.th',
            port: '',
            path: '/dc-api/token/expire/' + reqToken.sessionID,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${reqToken.token}`
            }
        };
        let ret = '';
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    ret += chunk;
                });
                res.on('end', () => {
                    const data = JSON.parse(ret);
                    resolve(data);
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    });
}
function writeResult(file, content) {
    return __awaiter(this, void 0, void 0, function* () {
        fs.writeFile(file, content, function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    console.log(err.message);
                }
                else {
                    let fileDesc;
                    yield fs.stat(resultText, (err, stat) => {
                        if (err) {
                            console.log(err.message);
                        }
                        else {
                            fileDesc = stat;
                        }
                    });
                }
            });
        });
    });
}
const router = (request, reply, dbConn, config = {}) => {
    crontabConfig = config;
    apiVersion = crontabConfig.version ? crontabConfig.version : '-';
    return sendMoph(request, reply, dbConn);
};
module.exports = router;
