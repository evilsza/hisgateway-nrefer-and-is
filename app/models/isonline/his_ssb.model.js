"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HisSsbModel = void 0;
const dbName = process.env.HIS_DB_NAME;
class HisSsbModel {
    getTableName(knex) {
        return knex
            .select('TABLE_NAME')
            .from('information_schema.tables')
            .where('TABLE_CATALOG', '=', dbName);
    }
    testConnect(db) {
        return db('VW_IS_PERSON').select('hn').limit(1);
    }
    getPerson(knex, columnName, searchText) {
        return knex
            .select()
            .from('VW_IS_PERSON')
            .where(columnName, "=", searchText);
    }
    getOpdService(knex, hn, date) {
        return knex
            .select()
            .from('VW_IS_SERVICE')
            .where('VW_IS_SERVICE.hn', "=", hn)
            .where('VW_IS_SERVICE.date', "=", date);
    }
    getDiagnosisOpd(knex, visitno) {
        return knex
            .select('vn as visitno', 'diag as diagcode', 'type as diag_type')
            .from('opd_dx')
            .where('vn', "=", visitno);
    }
    getProcedureOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('procedure_opd')
            .where(columnName, "=", searchNo);
    }
    getChargeOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('charge_opd')
            .where(columnName, "=", searchNo);
    }
    getDrugOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('drug_opd')
            .where(columnName, "=", searchNo);
    }
    getAdmission(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('admission')
            .where(columnName, "=", searchNo);
    }
    getDiagnosisIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('diagnosis_ipd')
            .where(columnName, "=", searchNo);
    }
    getProcedureIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('procedure_ipd')
            .where(columnName, "=", searchNo);
    }
    getChargeIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('charge_ipd')
            .where(columnName, "=", searchNo);
    }
    getDrugIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('drug_ipd')
            .where(columnName, "=", searchNo);
    }
    getAccident(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('accident')
            .where(columnName, "=", searchNo);
    }
    getAppointment(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('appointment')
            .where(columnName, "=", searchNo);
    }
    getData(knex, tableName, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from(tableName)
            .where(columnName, "=", searchNo)
            .limit(5000);
    }
}
exports.HisSsbModel = HisSsbModel;
